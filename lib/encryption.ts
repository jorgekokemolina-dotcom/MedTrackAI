import crypto from 'crypto';

/**
 * ==============================================================================
 * MÓDULO DE CIFRADO POR SOBRES (ENVELOPE ENCRYPTION) Y HASHING DE RUT
 * ==============================================================================
 * 
 * ⚠️ ADVERTENCIA CRÍTICA DE SEGURIDAD PARA PRODUCCIÓN:
 * La rotación de llaves, el almacenamiento de la llave maestra (KEK) en un KMS
 * dedicado (ej. Supabase Vault, AWS KMS o HashiCorp Vault) y la configuración
 * final de producción REQUIEREN REVISIÓN DE UN EXPERTO EN SEGURIDAD INFORMÁTICA
 * antes de cargar datos reales de pacientes.
 * 
 * ⚠️ ADVERTENCIA LEGAL Y ÉTICA:
 * Este sistema no debe recibir datos de pacientes reales hasta contar con:
 * (1) convenio firmado con el centro de salud piloto,
 * (2) aprobación del comité de ética,
 * (3) DUA (acuerdo de uso de datos) vigente, y
 * (4) una revisión de seguridad externa del cifrado y control de acceso.
 * ==============================================================================
 */

// ALGORITMO DE CIFRADO ESTÁNDAR REQUERIDO
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recomendado para AES-GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const DEK_LENGTH = 32; // 256 bits para AES-256

/**
 * Obtener la Llave Maestra (KEK) desde variables de entorno del servidor o KMS.
 * En producción esto se conecta con Supabase Vault / AWS KMS / GCP KMS.
 * NUNCA guardar esta llave en una tabla de BD ni en código versionado.
 */
function getMasterKey(): Buffer {
  const rawKey = process.env.ENCRYPTION_MASTER_KEY || process.env.KMS_MASTER_KEY;
  if (!rawKey) {
    // Clave de desarrollo por defecto (sólo para pruebas sintéticas locales/desarrollo)
    // En producción se fuerza la presencia de ENCRYPTION_MASTER_KEY
    const devFallbackKey = 'medtrack_dev_master_key_32bytes_sec!!';
    return crypto.createHash('sha256').update(devFallbackKey).digest();
  }
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Salt de instalación para el hash del RUT.
 */
function getRutSalt(): string {
  return process.env.RUT_SALT || 'medtrack_rut_salt_chile_2026_default';
}

/**
 * Cifrar la Llave de Datos (DEK) usando la Llave Maestra (KEK) -> Cifrado por Sobres
 */
function encryptDEK(dek: Buffer, kek: Buffer): { encryptedDEK: Buffer; dekIv: Buffer; dekAuthTag: Buffer } {
  const dekIv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, kek, dekIv, { authTagLength: AUTH_TAG_LENGTH });
  const encryptedDEK = Buffer.concat([cipher.update(dek), cipher.final()]);
  const dekAuthTag = cipher.getAuthTag();
  return { encryptedDEK, dekIv, dekAuthTag };
}

/**
 * Descifrar la Llave de Datos (DEK) usando la Llave Maestra (KEK)
 */
function decryptDEK(encryptedDEK: Buffer, kek: Buffer, dekIv: Buffer, dekAuthTag: Buffer): Buffer {
  const decipher = crypto.createDecipheriv(ALGORITHM, kek, dekIv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(dekAuthTag);
  return Buffer.concat([decipher.update(encryptedDEK), decipher.final()]);
}

/**
 * Cifra un texto sensible usando Cifrado por Sobres (Envelope Encryption) con AES-256-GCM.
 * Retorna un Buffer serializado con la estructura del sobre para ser guardado en campos BYTEA/TEXT de la BD.
 * 
 * Estructura del Envelope Buffer:
 * [Magic (2B)] [DEK IV (12B)] [DEK Tag (16B)] [DEK Encrypted Len (2B)] [DEK Encrypted (var)] [Data IV (12B)] [Data Tag (16B)] [Data Encrypted (var)]
 * 
 * EXCLUSIVO DEL SERVIDOR: NUNCA EJECUTAR EN EL CLIENTE.
 */
export function encryptField(plainText: string): Buffer {
  if (!plainText) return Buffer.alloc(0);

  const kek = getMasterKey();

  // 1. Generar DEK aleatoria de 256 bits para este campo
  const dek = crypto.randomBytes(DEK_LENGTH);

  // 2. Cifrar la DEK con la Llave Maestra (KEK)
  const { encryptedDEK, dekIv, dekAuthTag } = encryptDEK(dek, kek);

  // 3. Cifrar el dato plano con la DEK
  const dataIv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, dek, dataIv, { authTagLength: AUTH_TAG_LENGTH });
  const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const dataAuthTag = cipher.getAuthTag();

  // 4. Empaquetar todo en un Buffer de formato Envelope
  const dekEncLenBuf = Buffer.alloc(2);
  dekEncLenBuf.writeUInt16BE(encryptedDEK.length, 0);

  return Buffer.concat([
    Buffer.from([0x45, 0x4E]), // Header magic 'EN' (Envelope)
    dekIv,                     // 12 bytes
    dekAuthTag,                // 16 bytes
    dekEncLenBuf,              // 2 bytes
    encryptedDEK,              // N bytes
    dataIv,                    // 12 bytes
    dataAuthTag,               // 16 bytes
    encryptedData              // M bytes
  ]);
}

/**
 * Descifra un campo previamente cifrado por sobres con encryptField.
 * EXCLUSIVO DEL SERVIDOR: NUNCA EJECUTAR EN EL CLIENTE.
 */
export function decryptField(encryptedBuffer: Buffer | Uint8Array | string | null): string {
  if (!encryptedBuffer) return '';

  let buf: Buffer;
  if (typeof encryptedBuffer === 'string') {
    // PostgREST de Supabase devuelve campos bytea como string hex (ej. \x454E... o 454E...)
    const cleanHex = encryptedBuffer.startsWith('\\x') ? encryptedBuffer.slice(2) : encryptedBuffer;
    buf = Buffer.from(cleanHex, 'hex');
  } else {
    buf = Buffer.from(encryptedBuffer);
  }

  if (buf.length < 58) return '';

  const kek = getMasterKey();

  try {
    let offset = 0;

    // Verificar Header Magic 'EN'
    if (buf[0] !== 0x45 || buf[1] !== 0x4E) {
      throw new Error('Formato de sobre de cifrado no válido');
    }
    offset += 2;

    const dekIv = buf.subarray(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;

    const dekAuthTag = buf.subarray(offset, offset + AUTH_TAG_LENGTH);
    offset += AUTH_TAG_LENGTH;

    const dekEncLen = buf.readUInt16BE(offset);
    offset += 2;

    const encryptedDEK = buf.subarray(offset, offset + dekEncLen);
    offset += dekEncLen;

    const dataIv = buf.subarray(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;

    const dataAuthTag = buf.subarray(offset, offset + AUTH_TAG_LENGTH);
    offset += AUTH_TAG_LENGTH;

    const encryptedData = buf.subarray(offset);

    // 1. Descifrar DEK usando KEK
    const dek = decryptDEK(encryptedDEK, kek, dekIv, dekAuthTag);

    // 2. Descifrar el dato usando DEK
    const decipher = crypto.createDecipheriv(ALGORITHM, dek, dataIv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(dataAuthTag);
    const plainText = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return plainText.toString('utf8');
  } catch (error) {
    console.error('Error al descifrar campo sensible:', error);
    return '[DATO CIFRADO - ERROR AL DESCIFRAR]';
  }
}

/**
 * Genera el Hash con Salt para el RUT chileno (SHA-256 + Salt).
 * NUNCA guardar el RUT en texto plano.
 * Permite buscar e indexar sin exponer la identidad real.
 */
export function hashRut(rut: string): string {
  if (!rut) return '';
  // Limpiar RUT de puntos, guiones y espacios
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  const salt = getRutSalt();
  
  return crypto
    .createHash('sha256')
    .update(`${salt}:${cleanRut}`)
    .digest('hex');
}

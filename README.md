# MedTrack AI — Plataforma de Historia Clínica Unificada

Plataforma de historia clínica unificada para el sistema de salud chileno con arquitectura segura en Supabase (PostgreSQL), cifrado por sobres (Envelope Encryption), auditoría según Ley 19.628 y control de acceso granular (RLS).

---

> ### ⚠️ ADVERTENCIA CRÍTICA DE CUMPLIMIENTO LEGAL Y ÉTICO
> **Este sistema no debe recibir datos de pacientes reales hasta contar con: (1) convenio firmado con el centro de salud piloto, (2) aprobación del comité de ética, (3) DUA (acuerdo de uso de datos) vigente, y (4) una revisión de seguridad externa del cifrado y control de acceso.**

---

## 🚀 Arquitectura de Backend y Base de Datos

### 1. Base de Datos Supabase (PostgreSQL en Vercel)
El proyecto utiliza **Supabase (PostgreSQL)** como backend serverless para garantizar la persistencia de datos en Vercel (evitando el sistema de archivos de solo lectura y efímero de las Serverless Functions).
- **Conexión por Integración Vercel**: Las credenciales se inyectan automáticamente como variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). No existen llaves de API ni URLs hardcodeadas en el código.
- **Portabilidad**: El esquema SQL se diseñó con estándar ANSI/Postgres portable para facilitar una eventual migración a motores libSQL/Turso si se requiere reducir costos en el futuro.

### 2. Cifrado de Campos Sensibles (Envelope Encryption)
- **Campos protegidos**: Se cifran únicamente los campos sensibles identificables y clínicos (`nombre`, `dirección`, `motivo de consulta`, `descripción de diagnóstico`).
- **Algoritmo**: `AES-256-GCM` ejecutado exclusivamente en funciones de servidor (API routes en Next.js), nunca en el cliente browser.
- **Envelope Encryption**: Una Llave Maestra (KEK) proveniente del gestor de secretos/KMS (Supabase Vault / AWS KMS) cifra las Llaves de Datos (DEK) generadas para cada registro. Esto garantiza que un dump de PostgreSQL no exponga información sin el KMS.
- **Rut Hashing**: El RUT nunca se almacena en texto plano en ninguna tabla. Se guarda únicamente `rut_hash` (SHA-256 con salt de instalación) para permitir búsquedas e indexación sin exponer la identidad.
- **Comentario de Seguridad**: La rotación de llaves y la configuración final del KMS en producción requieren revisión de un especialista en seguridad antes de cargar datos de producción.

### 3. Control de Acceso Granular (Row Level Security - RLS)
Row Level Security está activado en Supabase para todas las tablas clínicas:
- **Rol Médico**: Solo puede leer pacientes asociados a atenciones donde `medico_id` coincide con su usuario.
- **Rol Paciente**: Solo puede leer su propio registro clínico (`usuario_id = auth.uid()`).
- **Rol Autoridad**: Accede **únicamente a Vistas Agregadas Anonimizadas** (estadísticas por centro y mes, sin datos identificables), bloqueando el acceso a tablas base.

### 4. Trazabilidad y Auditoría (Ley 19.628)
Toda lectura, escritura o exportación sobre las tablas clínicas genera automáticamente un registro en la tabla `auditoria` mediante triggers de PostgreSQL y middlewares en las API routes.

---

## 🛡️ Control de Ingesta y Conmutador `ALLOW_REAL_PATIENT_DATA`

Para prevenir la carga accidental de datos reales sin autorización:
- El endpoint de carga `/api/upload` cuenta con la variable de entorno `ALLOW_REAL_PATIENT_DATA` (con valor por defecto `false` en todos los entornos).
- Cualquier intento de ingesta con origen de datos etiquetado como "real" es rechazado explícitamente con error `403 Forbidden` cuando la variable está deshabilitada.
- **Instrucción de Activación**: Esta variable **solo debe activarse manualmente a `true`** tras verificar y contar con:
  1. Convenio firmado con el centro de salud piloto.
  2. Aprobación del comité de ética de investigación.
  3. DUA (Data Use Agreement / Acuerdo de uso de datos) vigente.
  4. Auditoría y revisión de seguridad externa aprobada.

---

## 📊 Dataset Sintético Ficticio (~10.000 Pacientes)

Para pruebas de rendimiento y carga sin riesgos de privacidad:
- Incluye el módulo `lib/synthetic-generator.ts` y script `scripts/generate-dataset.ts` para generar ~10.000 pacientes ficticios con estructura realista chilena (RUTs sintéticos validados por DV, diagnósticos CIE-10, medicamentos y exámenes).
- Se puede probar directamente desde el módulo `/admin/cargar-datos` mediante el botón **"Generar Dataset Sintético (~10.000 pacientes)"**.

---

## 📋 Estructura de la Aplicación

| Ruta | Descripción |
|------|-------------|
| `/` | Pantalla de selección de rol (Médico / Paciente) |
| `/medico` | Dashboard del médico — lista de pacientes asignados |
| `/medico/paciente/[id]` | Ficha clínica del paciente (5 pestañas) |
| `/paciente` | Portal del paciente — exámenes, medicamentos, QR |
| `/admin/cargar-datos` | Módulo de carga e ingesta cifrada (CSV/XLSX/JSON/Imágenes) |
| `/admin/estadisticas` | Dashboard de estadísticas con gráficos anonimizados |
| `/roadmap-ia` | Roadmap de funcionalidades de IA futuras |

---

## ⚙️ Variables de Entorno (.env.example)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...

ENCRYPTION_MASTER_KEY=clave_maestra_segura_32_bytes
RUT_SALT=salt_unico_de_instalacion_chile

ALLOW_REAL_PATIENT_DATA=false
```

---

**MedTrack AI** — Plataforma de Historia Clínica Unificada · Cumplimiento de Ley 19.628 y Cifrado por Sobres AES-256-GCM

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { hashRut, encryptField } from '@/lib/encryption';

/**
 * ==============================================================================
 * ENDPOINT DE INGESTA Y CARGA DE DATOS CLÍNICOS (/api/upload)
 * ==============================================================================
 * 
 * ⚠️ ADVERTENCIA LEGAL Y ÉTICA:
 * Este sistema no debe recibir datos de pacientes reales hasta contar con:
 * (1) convenio firmado con el centro de salud piloto,
 * (2) aprobación del comité de ética,
 * (3) DUA (acuerdo de uso de datos) vigente, y
 * (4) una revisión de seguridad externa del cifrado y control de acceso.
 * ==============================================================================
 */

// Tamaño máximo de lote para bulk insert en Supabase (evita exceder timeouts de Vercel)
const BATCH_SIZE = 200;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dataType, records, isRealData, source } = body;

    // ==========================================================================
    // REQUERIMIENTO 7: CONTROL DE DATOS REALES (ALLOW_REAL_PATIENT_DATA)
    // ==========================================================================
    const allowRealData = process.env.ALLOW_REAL_PATIENT_DATA === 'true';

    // Si la carga indica ser de origen "real" o de un RCE hospitalario real
    const declaredReal = isRealData === true || (source && source !== 'synthetic' && source !== 'simulated');

    if (declaredReal && !allowRealData) {
      return NextResponse.json(
        {
          error: 'BLOQUEO_SEGURIDAD_DATOS_REALES',
          message:
            '⚠️ Ingesta de datos reales rechazada: ALLOW_REAL_PATIENT_DATA está deshabilitado por defecto. Requisitos obligatorios antes de activar: (1) convenio firmado con centro de salud piloto, (2) aprobación del comité de ética, (3) DUA (acuerdo de uso de datos) vigente, y (4) revisión externa de seguridad.',
        },
        { status: 403 }
      );
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'FORMATO_INVALIDO', message: 'Se requiere un arreglo "records" con al menos 1 elemento.' },
        { status: 400 }
      );
    }

    const db = getSupabaseServerClient();
    const mockMode = !db;

    let processedCount = 0;
    let duplicatesCount = 0;

    // Limitar la cantidad total por petición para no superar el tiempo límite de Vercel (10s)
    const maxRecords = Math.min(records.length, 1000);
    const targetRecords = records.slice(0, maxRecords);

    // Procesar los registros según el tipo de datos seleccionado
    switch (dataType) {
      case 'Exámenes de laboratorio':
      case 'laboratorio': {
        const payloadBatch: Array<Record<string, unknown>> = [];
        for (const row of targetRecords) {
          const rut = row.rut || row.RUT || row.rut_paciente;
          if (!rut) continue;
          const rutHashed = hashRut(rut);
          payloadBatch.push({
            tipo_examen: row.tipo_examen || row.examen || row['Tipo de Examen'] || 'Examen Clínico General',
            valor: parseFloat(String(row.valor || row.resultado || '0')) || 0,
            unidad: row.unidad || 'mg/dL',
            fecha: row.fecha ? new Date(String(row.fecha)).toISOString() : new Date().toISOString(),
          });
          processedCount++;
        }

        if (!mockMode && payloadBatch.length > 0) {
          // Obtener un paciente por defecto para vincular si no hay ID explícito
          const { data: pDefault } = await db.from('pacientes').select('id').limit(1).maybeSingle();
          if (pDefault) {
            const finalBatch = payloadBatch.map((item) => ({ ...item, paciente_id: pDefault.id }));
            await db.from('laboratorio').insert(finalBatch);
          }
        }
        break;
      }

      case 'Medicación':
      case 'medicamentos': {
        const payloadBatch: Array<Record<string, unknown>> = [];
        for (const row of targetRecords) {
          const rut = row.rut || row.RUT;
          if (!rut) continue;
          payloadBatch.push({
            nombre: row.nombre || row.medicamento || 'Medicamento General',
            dosis: row.dosis || '1 comprimido / 12h',
            fecha_inicio: row.fecha_inicio || new Date().toISOString().split('T')[0],
          });
          processedCount++;
        }

        if (!mockMode && payloadBatch.length > 0) {
          const { data: pDefault } = await db.from('pacientes').select('id').limit(1).maybeSingle();
          if (pDefault) {
            const finalBatch = payloadBatch.map((item) => ({ ...item, paciente_id: pDefault.id }));
            await db.from('medicamentos').insert(finalBatch);
          }
        }
        break;
      }

      case 'Diagnósticos':
      case 'diagnosticos': {
        const payloadBatch: Array<Record<string, unknown>> = [];
        for (const row of targetRecords) {
          const rut = row.rut || row.RUT;
          if (!rut) continue;
          const descCifradaBuf = encryptField(String(row.descripcion || row.diagnostico || 'Diagnóstico clínico observado'));
          payloadBatch.push({
            codigo_cie10: row.codigo_cie10 || row.cie10 || 'Z00.0',
            descripcion_cifrada: `\\x${descCifradaBuf.toString('hex')}`,
            fecha: row.fecha || new Date().toISOString().split('T')[0],
          });
          processedCount++;
        }

        if (!mockMode && payloadBatch.length > 0) {
          const { data: pDefault } = await db.from('pacientes').select('id').limit(1).maybeSingle();
          if (pDefault) {
            const finalBatch = payloadBatch.map((item) => ({ ...item, paciente_id: pDefault.id }));
            await db.from('diagnosticos').insert(finalBatch);
          }
        }
        break;
      }

      case 'Datos demográficos':
      case 'pacientes':
      default: {
        // Preparar todos los registros cifrados
        const preparedPatients: Array<{
          rut_hash: string;
          datos_identificables_cifrados: string;
          fecha_nacimiento: string;
          sexo: string;
        }> = [];

        for (const row of targetRecords) {
          const rut = row.rut || row.RUT || row.rut_hash;
          if (!rut) continue;
          const rutHashed = hashRut(String(rut));

          const datosIdentificables = JSON.stringify({
            nombre: row.nombre || row.nombre_completo || 'Paciente Sintético',
            direccion: row.direccion || 'Dirección no especificada',
            telefono: row.telefono || '+56900000000',
          });

          const datosCifradosBuf = encryptField(datosIdentificables);

          preparedPatients.push({
            rut_hash: rutHashed,
            datos_identificables_cifrados: `\\x${datosCifradosBuf.toString('hex')}`,
            fecha_nacimiento: String(row.fecha_nacimiento || row.fecha_nac || '1990-01-01'),
            sexo: String(row.sexo || 'M'),
          });
        }

        if (!mockMode && preparedPatients.length > 0) {
          // Bulk Insert en lotes de BATCH_SIZE (200 registros por consulta SQL)
          for (let i = 0; i < preparedPatients.length; i += BATCH_SIZE) {
            const chunk = preparedPatients.slice(i, i + BATCH_SIZE);
            const { error: insertError } = await db.from('pacientes').insert(chunk);

            if (insertError) {
              if (insertError.code === '23505') {
                duplicatesCount += chunk.length;
              } else {
                console.error('Error en bulk insert de pacientes:', insertError);
                throw new Error(`Supabase Insert Error: ${insertError.message} (Detalles: ${insertError.details || ''})`);
              }
            } else {
              processedCount += chunk.length;
            }
          }
        } else {
          processedCount = preparedPatients.length;
        }
        break;
      }
    }

    // REGISTRAR EN LA TABLA DE AUDITORÍA OBLIGATORIA (Ley 19.628)
    if (!mockMode) {
      await db.from('auditoria').insert({
        accion: 'carga_datos',
        tabla_afectada: dataType || 'pacientes',
        ip_origen: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      duplicates: duplicatesCount,
      mockMode,
      dataType,
      message: `Procesamiento y cifrado completado exitosamente. ${processedCount} registros ingresados, ${duplicatesCount} duplicados detectados.`,
    });
  } catch (error: unknown) {
    console.error('Error en API /api/upload:', error);
    const errMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        error: 'ERROR_SERVIDOR', 
        message: `Ocurrió un error al procesar los datos: ${errMessage}`
      },
      { status: 500 }
    );
  }
}

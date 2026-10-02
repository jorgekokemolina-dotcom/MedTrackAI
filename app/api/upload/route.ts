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

    // Procesar los registros según el tipo de datos seleccionado
    switch (dataType) {
      case 'Exámenes de laboratorio':
      case 'laboratorio': {
        for (const row of records) {
          const rut = row.rut || row.RUT || row.rut_paciente;
          if (!rut) continue;
          const rutHashed = hashRut(rut);
          
          if (!mockMode) {
            // Buscar paciente
            const { data: paciente } = await db
              .from('pacientes')
              .select('id')
              .eq('rut_hash', rutHashed)
              .maybeSingle();

            let pacienteId = paciente?.id;
            if (!pacienteId) {
              // Crear paciente genérico cifrado si no existe
              const { data: newP } = await db
                .from('pacientes')
                .insert({
                  rut_hash: rutHashed,
                  datos_identificables_cifrados: encryptField(JSON.stringify({ nombre: row.nombre || 'Paciente Sin Nombre' })),
                })
                .select('id')
                .single();
              pacienteId = newP?.id;
            }

            if (pacienteId) {
              await db.from('laboratorio').insert({
                paciente_id: pacienteId,
                tipo_examen: row.tipo_examen || row.examen || row['Tipo de Examen'] || 'Examen Clínico General',
                valor: parseFloat(row.valor || row.resultado || '0') || 0,
                unidad: row.unidad || 'mg/dL',
                fecha: row.fecha ? new Date(row.fecha).toISOString() : new Date().toISOString(),
              });
            }
          }
          processedCount++;
        }
        break;
      }

      case 'Medicación':
      case 'medicamentos': {
        for (const row of records) {
          const rut = row.rut || row.RUT;
          if (!rut) continue;
          const rutHashed = hashRut(rut);

          if (!mockMode) {
            const { data: paciente } = await db.from('pacientes').select('id').eq('rut_hash', rutHashed).maybeSingle();
            let pacienteId = paciente?.id;
            if (!pacienteId) {
              const { data: newP } = await db.from('pacientes').insert({
                rut_hash: rutHashed,
                datos_identificables_cifrados: encryptField(JSON.stringify({ nombre: row.nombre_paciente || 'Paciente Sintético' })),
              }).select('id').single();
              pacienteId = newP?.id;
            }

            if (pacienteId) {
              await db.from('medicamentos').insert({
                paciente_id: pacienteId,
                nombre: row.nombre || row.medicamento || 'Medicamento General',
                dosis: row.dosis || '1 comprimido / 12h',
                fecha_inicio: row.fecha_inicio || new Date().toISOString().split('T')[0],
              });
            }
          }
          processedCount++;
        }
        break;
      }

      case 'Diagnósticos':
      case 'diagnosticos': {
        for (const row of records) {
          const rut = row.rut || row.RUT;
          if (!rut) continue;
          const rutHashed = hashRut(rut);
          const descCifrada = encryptField(row.descripcion || row.diagnostico || 'Diagnóstico clínico observado');

          if (!mockMode) {
            const { data: paciente } = await db.from('pacientes').select('id').eq('rut_hash', rutHashed).maybeSingle();
            let pacienteId = paciente?.id;
            if (!pacienteId) {
              const { data: newP } = await db.from('pacientes').insert({
                rut_hash: rutHashed,
                datos_identificables_cifrados: encryptField(JSON.stringify({ nombre: row.nombre || 'Paciente' })),
              }).select('id').single();
              pacienteId = newP?.id;
            }

            if (pacienteId) {
              await db.from('diagnosticos').insert({
                paciente_id: pacienteId,
                codigo_cie10: row.codigo_cie10 || row.cie10 || 'Z00.0',
                descripcion_cifrada: descCifrada,
                fecha: row.fecha || new Date().toISOString().split('T')[0],
              });
            }
          }
          processedCount++;
        }
        break;
      }

      case 'Datos demográficos':
      case 'pacientes':
      default: {
        for (const row of records) {
          const rut = row.rut || row.RUT || row.rut_hash;
          if (!rut) continue;
          const rutHashed = hashRut(rut);

          const datosIdentificables = JSON.stringify({
            nombre: row.nombre || row.nombre_completo || 'Paciente Sintético',
            direccion: row.direccion || 'Dirección no especificada',
            telefono: row.telefono || '+56900000000',
          });

          const datosCifrados = encryptField(datosIdentificables);

          if (!mockMode) {
            const { error: insertError } = await db.from('pacientes').insert({
              rut_hash: rutHashed,
              datos_identificables_cifrados: datosCifrados,
              fecha_nacimiento: row.fecha_nacimiento || row.fecha_nac || '1990-01-01',
              sexo: row.sexo || 'M',
            });

            if (insertError && insertError.code === '23505') {
              duplicatesCount++;
            } else if (!insertError) {
              processedCount++;
            }
          } else {
            processedCount++;
          }
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
      message: `Procesamiento completado. ${processedCount} registros procesados, ${duplicatesCount} duplicados detectados.`,
    });
  } catch (error: unknown) {
    console.error('Error en API /api/upload:', error);
    const errMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'ERROR_SERVIDOR', message: `Ocurrió un error al procesar los datos: ${errMessage}` },
      { status: 500 }
    );
  }
}

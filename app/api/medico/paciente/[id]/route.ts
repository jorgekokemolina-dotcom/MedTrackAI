import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { decryptField } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getSupabaseServerClient();
    if (!db) {
      return NextResponse.json({ error: 'DB no configurada' }, { status: 500 });
    }

    const { data: p, error } = await db
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !p) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    let nombre = 'Paciente Anónimo';
    let direccion = '';
    let telefono = '';

    if (p.datos_identificables_cifrados) {
      try {
        const rawString = decryptField(p.datos_identificables_cifrados);
        const parsed = JSON.parse(rawString);
        nombre = parsed.nombre || nombre;
        direccion = parsed.direccion || direccion;
        telefono = parsed.telefono || telefono;
      } catch (e) {
        console.warn('No se pudo descifrar paciente', p.id);
      }
    }

    const edad = p.fecha_nacimiento
      ? new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear()
      : 0;

    const patientDecrypted = {
      id: p.id,
      nombre,
      rut: 'Anonimizado (' + p.rut_hash.substring(0, 8) + '...)',
      edad,
      sexo: p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : p.sexo,
      grupoSanguineo: 'O+',
      prevision: 'Fonasa',
      direccion,
      comuna: 'Santiago',
      telefono,
      diagnosticosActivos: ['Demostración Médica'],
      alergias: [],
      contactoEmergencia: 'Sin registro',
      signosVitales: {
        presionArterial: '120/80',
        frecuenciaCardiaca: 72,
        temperatura: 36.5,
        saturacionO2: 98,
        peso: 70,
        talla: 170,
        imc: 24.2
      }
    };

    return NextResponse.json({
      success: true,
      paciente: patientDecrypted
    });
  } catch (error: unknown) {
    console.error('Error al obtener paciente:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

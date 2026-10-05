import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { decryptField } from '@/lib/encryption';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getSupabaseServerClient();
    if (!db) {
      return NextResponse.json({ error: 'Falta configuración de DB' }, { status: 500 });
    }

    const { data: pacientesDb, error } = await db
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    const pacientesDecifrados = pacientesDb.map((p) => {
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

      return {
        id: p.id,
        nombre,
        rut: 'Anonimizado (' + p.rut_hash.substring(0, 8) + '...)',
        edad,
        sexo: p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : p.sexo,
        diagnosticosActivos: ['Demostración Médica']
      };
    });

    return NextResponse.json({
      success: true,
      pacientes: pacientesDecifrados
    });
  } catch (error: unknown) {
    console.error('Error al obtener pacientes:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

import { getSupabaseServerClient } from "@/lib/supabase";
import { decryptField } from "@/lib/encryption";
import PatientClient from "./PatientClient";
import { notFound } from "next/navigation";

// No usamos generateStaticParams porque los IDs vienen dinámicamente de Supabase
export const dynamic = 'force-dynamic';

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Obtener paciente desde base de datos
  const db = getSupabaseServerClient();
  if (!db) return <div>Error: DB no configurada</div>;

  const { data: p, error } = await db
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !p) {
    notFound();
  }

  // Descifrar información paciente
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
    grupoSanguineo: 'O+', // Mock
    prevision: 'Fonasa', // Mock
    direccion,
    comuna: 'Santiago', // Mock
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

  return <PatientClient initialData={patientDecrypted} id={id} />;
}

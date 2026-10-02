import { getSupabaseServerClient, getSupabaseClient } from './supabase';

/**
 * Módulo de conexión a la base de datos principal (Supabase / PostgreSQL).
 * 
 * ⚠️ ADVERTENCIA DE SEGURIDAD:
 * Este sistema no debe recibir datos de pacientes reales hasta contar con:
 * (1) convenio firmado con el centro de salud piloto,
 * (2) aprobación del comité de ética,
 * (3) DUA (acuerdo de uso de datos) vigente, y
 * (4) una revisión de seguridad externa del cifrado y control de acceso.
 */

export { getSupabaseClient, getSupabaseServerClient };

/**
 * Función utilitaria para obtener el cliente de base de datos listo para consultas en el servidor.
 */
export function getDb() {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error(
      'No se pudo inicializar la conexión a la base de datos Supabase. Verifique que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configurados en Vercel/.env.local.'
    );
  }
  return client;
}

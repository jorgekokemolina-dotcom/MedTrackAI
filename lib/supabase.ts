import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ==============================================================================
// CLIENTE SUPABASE CENTRALIZADO (BASADO EXCLUSIVAMENTE EN VARIABLES DE ENTORNO)
// ==============================================================================
// NINGUNA LLAVE DE API NI URL ESTÁ HARDCODEADA EN ESTE CÓDIGO.
// En Vercel, estas variables son inyectadas automáticamente por la integración
// del Marketplace de Supabase o se configuran en Environment Variables.
// ==============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Cliente Supabase de uso público (respetando Row Level Security - RLS).
 * Retorna null si las variables de entorno no se han configurado aún.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas.');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Cliente Supabase para el Servidor (API Routes de Next.js) con Service Role.
 * Usado exclusivamente en el backend para operaciones administrativas cifradas y auditoría.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    console.warn('[Supabase] Variables de entorno de servidor de Supabase no configuradas.');
    return null;
  }
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

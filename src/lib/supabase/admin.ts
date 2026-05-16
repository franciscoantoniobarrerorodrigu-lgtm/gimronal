import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Usa la SERVICE_ROLE_KEY de Supabase. Si no existe localmente, usa la ANON_KEY con un warning.
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY no está definida. Las operaciones del adminClient podrían fallar por políticas RLS.')
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase variables faltantes en el entorno para el cliente Admin.')
  }

  // Se crea un cliente nativo (no-SSR) con la llave de servicio que tiene el poder de saltar el RLS.
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  )
}

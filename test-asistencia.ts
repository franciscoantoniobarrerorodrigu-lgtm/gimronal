import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const hoyStr = "2026-05-10"
  const startOfDay = `${hoyStr}T00:00:00.000Z`
  const endOfDay = `${hoyStr}T23:59:59.999Z`

  let query = supabase
    .from('asistencia')
    .select('*')
    .gte('fecha_hora_entrada', startOfDay)
    .lte('fecha_hora_entrada', endOfDay)

  const { data, error } = await query
  console.log("Data:", data)
  console.log("Error:", error)
}

test()

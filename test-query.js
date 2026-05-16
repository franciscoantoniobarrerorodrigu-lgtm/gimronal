require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const hoyStr = new Date().toISOString().split('T')[0]; // simple test
  console.log("hoyStr", hoyStr);

  const startOfDay = `${hoyStr}T00:00:00.000Z`
  const endOfDay = `${hoyStr}T23:59:59.999Z`

  const { data, error } = await supabase
    .from('asistencia')
    .select(`
      *,
      clientes (
        nombre,
        numero_documento
      )
    `)
    .gte('fecha_hora_entrada', startOfDay)
    .lte('fecha_hora_entrada', endOfDay);

  console.log("Data:", data);
  console.log("Error:", error);
}

test();

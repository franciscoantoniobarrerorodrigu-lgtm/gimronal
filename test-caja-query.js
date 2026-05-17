require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing active boxes...");
  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .eq('estado', 'abierta');

  console.log("Active Boxes:", data);
  console.log("Error:", error);

  if (data && data.length > 0) {
    const box = data[0];
    const opts = { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }
    const fechaAperturaStr = box.fecha_apertura
      ? new Intl.DateTimeFormat('es-CO', opts).format(new Date(box.fecha_apertura))
      : ''
    const hoyStr = new Intl.DateTimeFormat('es-CO', opts).format(new Date())
    console.log("fechaAperturaStr:", fechaAperturaStr);
    console.log("hoyStr:", hoyStr);
  }
}

test();

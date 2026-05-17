require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing gyms query...");
  const { data, error } = await supabase
    .from('gimnasios')
    .select('id, nombre, activo, vencimiento_licencia');

  console.log("Gyms:", data);
  console.log("Error:", error);
}

test();

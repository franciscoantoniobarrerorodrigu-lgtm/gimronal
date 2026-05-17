require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing products query...");
  const { data: productos, error: pError } = await supabase
    .from('productos')
    .select('*')
    .limit(5);

  console.log("Products Count:", productos ? productos.length : 0);
  console.log("Products Error:", pError);

  console.log("\nTesting sales query with nested product...");
  const { data: ventas, error: vError } = await supabase
    .from('ventas')
    .select('total, producto_id, cantidad, productos(nombre)')
    .limit(5);

  console.log("Sales Count:", ventas ? ventas.length : 0);
  console.log("Sales Error:", vError);
  if (ventas && ventas.length > 0) {
    console.log("Sample sale row:", JSON.stringify(ventas[0], null, 2));
  }
}

test();

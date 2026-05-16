import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getColombiaISOString } from '@/lib/date-utils';

export const dynamic = 'force-dynamic'; // Ensure this route is evaluated dynamically

export async function GET(request: Request) {
  // Verificar que la solicitud proviene del Cron de Vercel
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    // Usamos el service_role_key para poder actualizar registros sin contexto de usuario autenticado
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar todas las asistencias que no tengan fecha_hora_salida
    const { data: asistenciasAbiertas, error: errorFetch } = await supabaseAdmin
      .from('asistencia')
      .select('id')
      .is('fecha_hora_salida', null);

    if (errorFetch) {
      console.error('Error fetching open attendances for cron:', errorFetch);
      return NextResponse.json({ success: false, error: errorFetch.message }, { status: 500 });
    }

    if (!asistenciasAbiertas || asistenciasAbiertas.length === 0) {
      return NextResponse.json({ success: true, message: 'No open attendances found. Nothing to close.' });
    }

    const idsToClose = asistenciasAbiertas.map((a) => a.id);
    const timeOfExit = getColombiaISOString();

    // Actualizar todas las sesiones abiertas marcando la salida a esta hora
    const { error: errorUpdate } = await supabaseAdmin
      .from('asistencia')
      .update({ fecha_hora_salida: timeOfExit })
      .in('id', idsToClose);

    if (errorUpdate) {
      console.error('Error closing attendances in cron:', errorUpdate);
      return NextResponse.json({ success: false, error: errorUpdate.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully closed ${idsToClose.length} attendance sessions.`,
      closedIds: idsToClose
    });

  } catch (error: any) {
    console.error('Unexpected error in checkout cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

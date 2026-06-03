import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getColombiaISOString } from '@/lib/date-utils';

export const dynamic = 'force-dynamic'; // Ensure this route is evaluated dynamically

export async function GET(request: Request) {
  // Verificar que la solicitud proviene del Cron de Vercel
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET no está configurado para /api/cron/checkout.');
    return new Response('Cron secret not configured', {
      status: 500,
    });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    // Usamos el service_role_key para poder actualizar registros sin contexto de usuario autenticado
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar todas las asistencias que no tengan fecha_hora_salida, incluyendo nombre de cliente y entrada
    const { data: asistenciasAbiertas, error: errorFetch } = await supabaseAdmin
      .from('asistencia')
      .select(`
        id,
        fecha_hora_entrada,
        clientes (
          nombre
        )
      `)
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

    // Enviar notificaciones de salida por correo en segundo plano
    try {
      const { sendExitNotification } = await import('@/lib/mail');
      const formatHora = (isoStr: string) => {
        try {
          return new Date(isoStr).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
        } catch { return isoStr; }
      };

      for (const asist of asistenciasAbiertas) {
        try {
          const clienteNombre = (asist as any).clientes?.nombre || 'Cliente Desconocido';
          const horaEntradaStr = asist.fecha_hora_entrada || '';
          
          let duracion = 'N/A';
          if (horaEntradaStr) {
            const entrada = new Date(horaEntradaStr);
            const salida = new Date(timeOfExit);
            const diffMs = salida.getTime() - entrada.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const horas = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            duracion = horas > 0 ? `${horas}h ${mins}min` : `${mins} min`;
          }

          await sendExitNotification({
            cliente: clienteNombre,
            horaEntrada: formatHora(horaEntradaStr),
            horaSalida: formatHora(timeOfExit),
            duracion
          });
        } catch (mailErr) {
          console.error(`Error sending email for auto-checkout id ${asist.id}:`, mailErr);
        }
      }
    } catch (importErr) {
      console.error('Error importing sendExitNotification in cron:', importErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully closed ${idsToClose.length} attendance sessions and sent email notifications.`,
      closedIds: idsToClose
    });

  } catch (error: any) {
    console.error('Unexpected error in checkout cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

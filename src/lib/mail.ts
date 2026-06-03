import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder');
}


export async function sendPaymentNotification(pagoData: {
  cliente: string;
  monto: number;
  concepto: string;
  metodo: string;
  vencimiento?: string;
  diasRestantes?: number;
}) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'gymcontrol.notifications@gmail.com';

    const result = await getResend().emails.send({
      from: 'GymControl <onboarding@resend.dev>',
      to: adminEmail,
      subject: `🔔 Nuevo Pago Recibido - ${pagoData.monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">¡Nuevo Pago Registrado!</h2>
          <hr />
          <p><strong>Cliente:</strong> ${pagoData.cliente}</p>
          <p><strong>Concepto:</strong> ${pagoData.concepto}</p>
          <p><strong>Monto:</strong> ${pagoData.monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
          <p><strong>Método de Pago:</strong> ${pagoData.metodo}</p>
          ${pagoData.vencimiento ? `<p><strong>Nueva Fecha de Vencimiento:</strong> ${pagoData.vencimiento}</p>` : ''}
          ${pagoData.diasRestantes !== undefined ? `<p><strong>📅 Días Disponibles:</strong> ${pagoData.diasRestantes} días</p>` : ''}
          <p><strong>Fecha Registro:</strong> ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
          <hr />
          <p style="font-size: 12px; color: #666; text-align: center;">Este es un correo automático de GymControl.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend API Error (Payment):', result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Network/Sending Error:', error);
    return { success: false, error };
  }
}

export async function sendAttendanceNotification(asistenciaData: {
  cliente: string;
  plan: string;
  vencimiento: string;
  diasRestantes: number;
}) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'gymcontrol.notifications@gmail.com';

    const result = await getResend().emails.send({
      from: 'GymControl <onboarding@resend.dev>',
      to: adminEmail,
      subject: `✅ Nuevo Ingreso - ${asistenciaData.cliente}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">¡Ingreso Registrado!</h2>
          <hr />
          <p><strong>Cliente:</strong> ${asistenciaData.cliente}</p>
          <p><strong>Plan Activo:</strong> ${asistenciaData.plan}</p>
          <p><strong>Fecha de Vencimiento:</strong> ${asistenciaData.vencimiento}</p>
          <p><strong>📅 Días Restantes:</strong> ${asistenciaData.diasRestantes} días</p>
          <p><strong>Hora de Ingreso:</strong> ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
          <hr />
          <p style="font-size: 12px; color: #666; text-align: center;">Este es un correo automático de GymControl.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend API Error (Attendance):', result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Network/Sending Error:', error);
    return { success: false, error };
  }
}

export async function sendExitNotification(exitData: {
  cliente: string;
  horaEntrada: string;
  horaSalida: string;
  duracion: string;
}) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'gymcontrol.notifications@gmail.com';

    const result = await getResend().emails.send({
      from: 'GymControl <onboarding@resend.dev>',
      to: adminEmail,
      subject: `🚪 Salida Registrada - ${exitData.cliente}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f59e0b; text-align: center;">Salida Registrada</h2>
          <hr />
          <p><strong>Cliente:</strong> ${exitData.cliente}</p>
          <p><strong>Hora de Entrada:</strong> ${exitData.horaEntrada}</p>
          <p><strong>Hora de Salida:</strong> ${exitData.horaSalida}</p>
          <p><strong>⏱️ Duración de Sesión:</strong> ${exitData.duracion}</p>
          <hr />
          <p style="font-size: 12px; color: #666; text-align: center;">Este es un correo automático de GymControl.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend API Error (Exit):', result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Network/Sending Error:', error);
    return { success: false, error };
  }
}

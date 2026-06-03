import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad | GymControl',
  description: 'Política de Privacidad y Tratamiento de Datos de GymControl',
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-primary/30 selection:text-white">
      {/* Background elements */}
      <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <Link 
          href="/"
          className="inline-flex items-center text-zinc-500 hover:text-primary transition-colors mb-8 font-medium uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Link>

        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight">
              Política de <span className="text-primary">Privacidad</span>
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Última actualización: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-12 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">1. Información que Recopilamos</h2>
            <p className="mb-4 text-zinc-400">En GymControl, recopilamos la información estrictamente necesaria para ofrecer un servicio de gestión integral a centros deportivos y gimnasios. Esta información incluye:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li><strong>Datos de Identificación:</strong> Nombre completo, documento de identidad.</li>
              <li><strong>Datos de Contacto:</strong> Correo electrónico, número de teléfono (WhatsApp).</li>
              <li><strong>Datos de Salud/Físicos (Opcional):</strong> Peso, altura, índice de masa corporal y otros datos ingresados en módulos de valoración física o nutricional.</li>
              <li><strong>Datos de Uso:</strong> Registro de asistencia, pagos y uso del sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">2. Uso de la Información</h2>
            <p className="mb-4 text-zinc-400">La información recopilada es utilizada para los siguientes propósitos:</p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
              <li>Permitir el acceso y uso de la plataforma tanto para administradores como para socios.</li>
              <li>Procesar pagos y membresías.</li>
              <li>Enviar notificaciones operativas (ej. recordatorios de pago, asistencia, planes nutricionales).</li>
              <li>Mejorar y optimizar la experiencia de uso de nuestro SaaS.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">3. Protección de los Datos</h2>
            <p className="text-zinc-400">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra accesos no autorizados, alteración, divulgación o destrucción. Nuestro sistema utiliza cifrado en tránsito y en reposo para la información sensible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">4. Compartir Información</h2>
            <p className="text-zinc-400">
              GymControl <strong>no</strong> vende, alquila ni comparte su información personal con terceros para fines comerciales. La información solo se comparte entre el gimnasio y sus respectivos socios, y con proveedores de servicios de infraestructura estrictamente necesarios para el funcionamiento de la plataforma (como alojamiento en la nube o envío de correos).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">5. Sus Derechos</h2>
            <p className="text-zinc-400">
              Como usuario, usted tiene el derecho a acceder, rectificar o eliminar sus datos personales. Si es un socio de un gimnasio, deberá dirigir estas solicitudes inicialmente a la administración de su centro deportivo. Para usuarios del sistema, puede contactarnos directamente a través de los canales de soporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">6. Contacto</h2>
            <p className="text-zinc-400">
              Si tiene alguna pregunta sobre esta Política de Privacidad o el tratamiento de sus datos, por favor contáctenos a través de los canales de soporte integrados en la plataforma o al administrador de su gimnasio.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">
            GymControl &copy; {new Date().getFullYear()} - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

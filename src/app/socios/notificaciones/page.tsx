import { redirect } from 'next/navigation'
import { getPortalData, getClientNotificaciones } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, Bell, Calendar, MessageSquare, Mail, Smartphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

const tipoIcon: Record<string, { icon: any; color: string; bg: string }> = {
  vencimiento: { icon: Calendar, color: 'text-red-400', bg: 'bg-red-500/10' },
  cumpleanos: { icon: Bell, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  pago: { icon: Mail, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  soporte: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
}

export default async function NotificacionesPage() {
  const data = await getPortalData()
  if (!data) redirect('/login')

  const res = await getClientNotificaciones()
  const notificaciones = res.success && res.data ? res.data : []

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Notificaciones</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Historial de comunicaciones</p>
        </div>
      </header>

      {notificaciones.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[50vh]">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
            <Bell className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-xl font-black text-white">Sin Notificaciones</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            No tienes notificaciones aún. Aquí aparecerán los mensajes importantes del gimnasio.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notificaciones.map((notif: any) => {
            const tipo = tipoIcon[notif.tipo] || { icon: Bell, color: 'text-zinc-400', bg: 'bg-white/5' }
            const Icon = tipo.icon
            return (
              <div
                key={notif.id}
                className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-xl transition-all duration-300 hover:bg-white/[0.07] hover:border-primary/20"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${tipo.bg} rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${tipo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-white leading-snug break-words">{notif.mensaje}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notif.canal && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {notif.canal === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                            {notif.canal}
                          </span>
                        )}
                        {notif.estado_envio && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            notif.estado_envio === 'enviado' ? 'text-emerald-400' :
                            notif.estado_envio === 'pendiente' ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {notif.estado_envio}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-bold">
                      {notif.created_at ? new Date(notif.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

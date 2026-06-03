import Link from 'next/link'
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock, QrCode, RefreshCw } from 'lucide-react'
import ComprarPlanModal from './ComprarPlanModal'

interface PortalMembership {
  fecha_fin?: string | null
}

interface NextActionCardProps {
  diasRestantes: number
  membresia: PortalMembership | null
  ultimaMembresia?: PortalMembership | null
  yaAsistioHoy: boolean
  asistenciaAbierta?: boolean
  asistenciaSemanal: Array<{ dia: string; asistio: boolean }>
}

export default function NextActionCard({
  diasRestantes,
  membresia,
  ultimaMembresia,
  yaAsistioHoy,
  asistenciaAbierta = false,
  asistenciaSemanal,
}: NextActionCardProps) {
  const entrenamientosSemana = asistenciaSemanal.filter((dia) => dia.asistio).length
  const vencimiento = membresia?.fecha_fin ? new Date(`${membresia.fecha_fin}T12:00:00`) : null
  const vencimientoTexto = vencimiento
    ? vencimiento.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    : 'Sin fecha'

  if (!membresia) {
    if (ultimaMembresia && ultimaMembresia.fecha_fin) {
      const vencidaDate = new Date(`${ultimaMembresia.fecha_fin}T12:00:00`)
      const vencidaTexto = vencidaDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
      return (
        <section className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-950/25 p-4 shadow-xl shadow-red-500/5 backdrop-blur-xl md:p-5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/40 to-transparent" />
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
                <AlertTriangle className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300/80">Acción recomendada</p>
                <h2 className="mt-1 text-xl font-black text-white">Membresía vencida</h2>
                <p className="mt-1 text-sm font-medium text-zinc-400">Tu membresía venció el <strong>{vencidaTexto}</strong>. Adquiere o renueva tu plan para poder registrar tus entradas al gimnasio.</p>
              </div>
            </div>
          </div>
          <ComprarPlanModal />
        </section>
      )
    }

    return (
      <section className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-950/25 p-4 shadow-xl shadow-red-500/5 backdrop-blur-xl md:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/40 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300">
              <AlertTriangle className="size-6" />
            </div>
              <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300/80">Acción recomendada</p>
              <h2 className="mt-1 text-xl font-black text-white">No tienes membresía activa</h2>
              <p className="mt-1 text-sm font-medium text-zinc-400">Adquiere o renueva tu membresía para poder registrar tus entradas al gimnasio.</p>
            </div>
          </div>
        </div>
        <ComprarPlanModal />
      </section>
    )
  }

  if (diasRestantes <= 5) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/25 p-4 shadow-xl shadow-amber-500/5 backdrop-blur-xl md:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <RefreshCw className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300/80">Acción recomendada</p>
              <h2 className="mt-1 text-xl font-black text-white">Renueva antes del {vencimientoTexto}</h2>
              <p className="mt-1 text-sm font-medium text-zinc-400">
                Te {diasRestantes === 1 ? 'queda 1 día' : `quedan ${diasRestantes} días`}. Evita pausas en tu racha y clases.
              </p>
            </div>
          </div>
          <Link href="/socios/pagos" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 text-sm font-black text-amber-100 transition hover:bg-amber-500/15">
            Ver pagos <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    )
  }

  if (asistenciaAbierta) {
    return (
      <section id="qr" className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-950/25 p-4 shadow-xl shadow-orange-500/5 backdrop-blur-xl md:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
              <Clock className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300/80">Sesión activa</p>
              <h2 className="mt-1 text-xl font-black text-white">Registra tu salida al terminar</h2>
              <p className="mt-1 text-sm font-medium text-zinc-400">Escanea el QR de nuevo para cerrar tu entrenamiento.</p>
            </div>
          </div>
          <Link href="/socios#qr" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 text-sm font-black text-orange-100 transition hover:bg-orange-500/15">
            Abrir QR <QrCode className="size-4" />
          </Link>
        </div>
      </section>
    )
  }

  if (!yaAsistioHoy) {
    return (
      <section id="qr" className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-4 shadow-xl shadow-primary/5 backdrop-blur-xl md:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/15 text-primary">
              <QrCode className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Acción recomendada</p>
              <h2 className="mt-1 text-xl font-black text-white">Registra tu entrada de hoy</h2>
              <p className="mt-1 text-sm font-medium text-zinc-400">Llevas {entrenamientosSemana}/7 días esta semana. Hoy puede sumar.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/25 p-4 shadow-xl shadow-emerald-500/5 backdrop-blur-xl md:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <CheckCircle2 className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/80">Buen trabajo</p>
            <h2 className="mt-1 text-xl font-black text-white">Entrenamiento registrado</h2>
            <p className="mt-1 text-sm font-medium text-zinc-400">Puedes revisar clases, progreso o tus pagos mientras mantienes el ritmo.</p>
          </div>
        </div>
        <Link href="/socios/horarios" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-black text-white transition hover:bg-white/10">
          Ver clases <CalendarDays className="size-4" />
        </Link>
      </div>
    </section>
  )
}

import { Activity, CalendarCheck, Star } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface MembershipSummary {
  fecha_fin?: string | null
  planes?: {
    nombre?: string | null
  } | null
}

interface MembershipStatsGridProps {
  membresia: MembershipSummary | null
  dias_restantes: number
  asistencias_mes: number
  yaAsistioHoy: boolean
  asistencias_totales: number
}

export default function MembershipStatsGrid({
  membresia,
  dias_restantes,
  asistencias_mes,
  yaAsistioHoy,
  asistencias_totales
}: MembershipStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
      
      {/* Membresía Premium Card */}
      <Link href="/socios/pagos" className="group relative col-span-2 block min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.07] md:col-span-1 md:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70" />
        <div className="absolute right-3 top-3 rounded-xl border border-primary/15 bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
          <Activity className="size-5 text-primary" />
        </div>
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 md:mb-4">Tu Membresía</p>
        {membresia ? (
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="pr-12">
              <h3 className="text-xl font-black leading-tight text-white md:text-2xl">{membresia.planes?.nombre || 'Plan Estándar'}</h3>
              <span className="mt-2 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">Activa</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-3 md:p-4">
              <div className="flex min-w-0 flex-col">
                <span className={`text-2xl font-black md:text-3xl ${dias_restantes <= 5 ? (dias_restantes <= 2 ? 'text-red-400' : 'text-amber-400') : 'text-primary'}`}>{dias_restantes}</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500">Días Restantes</span>
              </div>
              <div className="mx-2 h-10 w-px shrink-0 bg-white/10" />
              <div className="flex min-w-0 flex-col items-end">
                <span className="truncate text-right text-sm font-bold text-zinc-300">
                  {membresia.fecha_fin ? format(new Date(membresia.fecha_fin + 'T12:00:00'), "dd MMM", { locale: es }) : 'N/A'}
                </span>
                <span className="text-right text-[10px] font-bold uppercase tracking-tighter text-zinc-500">Vencimiento</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-sm font-medium text-zinc-500">Sin membresía activa</div>
        )}
      </Link>

      {/* Asistencia Mes Card */}
      <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.07] md:p-5">
        <div className="absolute right-3 top-3 rounded-xl border border-primary/15 bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
          <CalendarCheck className="size-5 text-primary" />
        </div>
        <p className="mb-3 pr-10 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 md:mb-4">Este Mes</p>
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-black leading-none text-white md:text-5xl">{asistencias_mes}</span>
          <span className="text-xs font-bold text-zinc-500 md:text-sm">entrenamientos</span>
        </div>
        <div className="mt-3 rounded-xl border border-primary/10 bg-primary/5 p-3 md:mt-4">
          <p className="text-xs font-medium leading-relaxed text-primary/80">
            {yaAsistioHoy ? '✓ Ya registraste tu esfuerzo hoy.' : '⚡ Aún no has registrado tu entrada.'}
          </p>
        </div>
      </div>

      {/* Total Histórico Card */}
      <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.07] md:p-5">
        <div className="absolute right-3 top-3 rounded-xl border border-primary/15 bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
          <Star className="size-5 text-primary" />
        </div>
        <p className="mb-3 pr-10 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 md:mb-4">Impacto Total</p>
        <div className="flex flex-col gap-1">
          <span className="text-4xl font-black leading-none text-white md:text-5xl">{asistencias_totales}</span>
          <span className="text-xs font-bold text-zinc-500 md:text-sm">sesiones</span>
        </div>
        <p className="mt-3 text-xs font-medium leading-relaxed text-zinc-500 md:mt-4">
          Cada sesión cuenta en tu transformación. ¡Sigue así!
        </p>
      </div>

    </div>
  )
}

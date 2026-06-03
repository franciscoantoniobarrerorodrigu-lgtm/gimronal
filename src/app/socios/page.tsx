import { redirect } from 'next/navigation'
import { getPortalData } from '@/lib/supabase/actions/portal'
import { Dumbbell, CalendarDays, Activity, ChevronRight, CreditCard, Apple, ShoppingBag, Bell, User, Heart, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'

// Components
import ClientLogoutButton from './ClientLogoutButton'
import ClientPasswordDialog from './ClientPasswordDialog'
import ClientRefreshIndicator from './ClientRefreshIndicator'
import HistorialRecienteClient from './HistorialRecienteClient'
import { InactiveGymGuard } from '@/components/layout/InactiveGymGuard'

// New Refactored Components
import DashboardWrapper from './components/DashboardWrapper'
import MembershipStatsGrid from './components/MembershipStatsGrid'
import AchievementsGrid from './components/AchievementsGrid'
import ClientNotifications from './components/ClientNotifications'
import FloatingQRButton from './components/FloatingQRButton'
import MobileSociosNav from './components/MobileSociosNav'
import NextActionCard from './components/NextActionCard'

export const dynamic = 'force-dynamic'

type PortalLogro = { desbloqueado: boolean }
type PortalAsistencia = { fecha_hora_salida?: string | null }
type AsistenciaSemanaDia = { dia: string; asistio: boolean }

// Dynamic motivational messages
function getMensajeMotivacional(streak: number, yaAsistioHoy: boolean, hora: number, nivel: number): string {
  if (yaAsistioHoy && streak >= 5) return `🔥 ¡${streak} días seguidos! Eres una máquina imparable.`
  if (yaAsistioHoy) return '✅ Ya entrenaste hoy. Descansa, tu cuerpo lo merece.'
  if (streak >= 7) return `🔥 ¡Racha de ${streak} días! No la pierdas, ve hoy.`
  if (streak >= 3) return `💪 ${streak} días seguidos. ¡Sigue construyendo el hábito!`
  if (hora < 10) return '🌅 Buenos días. La mañana es perfecta para entrenar.'
  if (hora < 14) return '☀️ Mediodía con energía. ¡Es hora de romperla!'
  if (hora < 18) return '💪 Tarde de guerrero. El gym te espera.'
  if (hora < 22) return '🌙 Sesión nocturna. Los mejores entrenan cuando otros descansan.'
  if (nivel >= 10) return '⚡ Tu nivel lo demuestra: la constancia paga.'
  return 'Tu disciplina es el motor de tus resultados.'
}

export default async function PortalDashboard() {
  const data = await getPortalData()

  if (!data) {
    redirect('/login')
  }

  const {
    nombre,
    membresia,
    dias_restantes,
    yaAsistioHoy,
    asistencias_mes,
    asistencias_totales,
    asistencias_recientes,
    gamificacion,
    es_cumpleanos,
    streak,
    asistencia_semanal,
    logros,
    gimnasio_activo,
    vencimiento_licencia,
    ultima_membresia
  } = data

  const todayStr = new Date().toISOString().split('T')[0]
  const vencimientoStr = vencimiento_licencia ? new Date(vencimiento_licencia).toISOString().split('T')[0] : null
  const isLicenseExpired = vencimientoStr ? vencimientoStr <= todayStr : false
  const shouldBlock = !gimnasio_activo || isLicenseExpired

  if (shouldBlock) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <InactiveGymGuard 
          gymName={data.gimnasio_nombre} 
          type={isLicenseExpired ? 'expired' : 'inactive'} 
        />
      </div>
    )
  }

  const firstName = nombre.split(' ')[0]
  // Use local timezone (America/Bogota = UTC-5) instead of server UTC
  const horaActual = parseInt(
    new Intl.DateTimeFormat('es', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Bogota',
    }).format(new Date())
  )
  const mensajeMotivacional = getMensajeMotivacional(streak, yaAsistioHoy, horaActual, gamificacion.nivel)
  const logrosTyped = logros as PortalLogro[]
  const asistenciasRecientesTyped = asistencias_recientes as PortalAsistencia[]
  const asistenciaSemanalTyped = asistencia_semanal as AsistenciaSemanaDia[]
  const logrosDesbloqueados = logrosTyped.filter((logro) => logro.desbloqueado).length
  const asistenciaAbierta = asistenciasRecientesTyped.some((asistencia) => !asistencia.fecha_hora_salida)
  const secondaryActions = [
    { href: '/socios/horarios', title: 'Clases', description: 'Reserva tu cupo', icon: CalendarDays },
    { href: '/socios/pagos', title: 'Pagos', description: 'Recibos y renovaciones', icon: CreditCard },
    { href: '/socios/perfil', title: 'Perfil', description: 'Datos personales', icon: User },
    { href: '/socios/progreso', title: 'Progreso', description: 'Medidas y peso', icon: Activity },
    { href: '/socios/valoraciones', title: 'Valoraciones', description: 'Evaluaciones físicas', icon: Heart },
    { href: '/socios/plan-nutricional', title: 'Nutrición', description: 'Plan alimenticio', icon: Apple },
    { href: '/socios/compras', title: 'Compras', description: 'Productos adquiridos', icon: ShoppingBag },
    { href: '/socios/notificaciones', title: 'Historial de avisos', description: 'Comunicaciones', icon: Bell },
    { href: '/socios/contacto', title: 'Soporte', description: 'Contacto del gym', icon: MessageSquare },
  ]

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))] pt-3 animate-in fade-in duration-700 sm:gap-5 sm:px-4 sm:pt-4 md:gap-8 md:px-8 md:pb-10 md:pt-8">
      <FloatingQRButton hasMembresia={!!membresia} />
      {/* Navegación móvil con QR */}
      <MobileSociosNav hasMembresia={!!membresia} />

      {/* Header Premium */}
      <header className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
        {/* Superior en móvil: Logo + Nombre + Notificaciones */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary text-black shadow-lg shadow-primary/20 sm:size-12">
              <Dumbbell className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="line-clamp-2 text-base font-black uppercase italic leading-none tracking-tight text-white sm:text-2xl">{data.gimnasio_nombre}</h1>
              <p className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.24em] text-primary/80 sm:block">Portal del Atleta • Power System</p>
              <p className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 sm:hidden">
                <Sparkles className="size-3 text-primary" />
                Socio premium
              </p>
            </div>
          </div>
          <div className="flex shrink-0 sm:hidden">
            <ClientNotifications />
          </div>
        </div>

        {/* Inferior en móvil: Acciones */}
        <div className="flex shrink-0 items-center justify-between gap-1 border-t border-white/5 pt-3 sm:justify-end sm:border-0 sm:pt-0 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
              <ClientRefreshIndicator />
              <div className="hidden sm:block">
                <ClientNotifications />
              </div>
            </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ClientPasswordDialog />
            <ClientLogoutButton />
          </div>
        </div>
      </header>

      {/* Birthday Banner */}
      {es_cumpleanos && (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-orange-500 via-primary to-rose-500 p-4 shadow-2xl shadow-primary/10 animate-in slide-in-from-top fade-in duration-1000 sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22),transparent_42%,rgba(0,0,0,0.18))]" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-2xl shadow-inner backdrop-blur-md sm:size-14 sm:rounded-2xl sm:text-3xl">
                🎂
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">¡Feliz Cumpleaños, {firstName}!</h2>
                <p className="text-sm font-medium leading-relaxed text-white/90">Que hoy sea un día lleno de energía, logros y mucha felicidad. ¡Gracias por ser parte de la familia!</p>
              </div>
            </div>
            <div className="hidden md:block text-5xl">
              🎉
            </div>
          </div>
        </div>
      )}

      {/* Hero + Avatar Selector (client wrapper for instant photo updates) */}
      <DashboardWrapper
        firstName={firstName}
        mensajeMotivacional={mensajeMotivacional}
        streak={streak}
        gamificacion={gamificacion}
        membresia={membresia}
        genero={data.genero}
        avatarTheme={data.avatar_theme ?? 'default'}
        fotoUrl={data.foto_url}
        nivel={gamificacion.nivel}
        totalAsistencias={asistencias_totales}
      />

      <NextActionCard
        diasRestantes={dias_restantes}
        membresia={membresia}
        ultimaMembresia={ultima_membresia}
        yaAsistioHoy={yaAsistioHoy}
        asistenciaAbierta={asistenciaAbierta}
        asistenciaSemanal={asistenciaSemanalTyped}
      />

      <section className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">Mi zona de socio</p>
            <h2 className="mt-1 text-lg font-black text-white sm:text-xl">Accesos rápidos</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">{secondaryActions.length} opciones</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
          {secondaryActions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group relative flex min-h-[112px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/10 sm:min-h-32 sm:p-4"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-black">
                    <Icon className="size-5" />
                  </span>
                  <ChevronRight className="size-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div className="min-w-0 pt-3 sm:pt-4">
                  <h3 className="truncate text-sm font-black leading-tight text-white">{action.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Weekly Mini Chart */}
      <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 backdrop-blur-xl md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">Últimos 7 Días</p>
            <p className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-black text-zinc-500">{asistenciaSemanalTyped.filter((dia) => dia.asistio).length}/7 días</p>
          </div>
          <div className="flex items-end justify-between gap-1.5 md:gap-2">
            {asistenciaSemanalTyped.map((dia, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-full rounded-xl transition-all duration-500 ${
                  dia.asistio 
                    ? 'h-10 bg-gradient-to-t from-primary to-primary/60 shadow-lg shadow-primary/20 md:h-12'
                    : 'h-4 border border-white/5 bg-white/5 md:h-5'
                }`} style={{ animationDelay: `${i * 100}ms` }} />
                <span className={`text-[10px] font-black uppercase ${dia.asistio ? 'text-primary' : 'text-zinc-600'}`}>
                  {dia.dia}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid Refactored */}
      <MembershipStatsGrid
        membresia={membresia}
        dias_restantes={dias_restantes}
        asistencias_mes={asistencias_mes}
        yaAsistioHoy={yaAsistioHoy}
        asistencias_totales={asistencias_totales}
      />

      {/* Achievements Grid Refactored */}
      <AchievementsGrid
        logros={logros}
        logrosDesbloqueados={logrosDesbloqueados}
      />

      {/* Historial Reciente Premium (Interactivo) */}
      <HistorialRecienteClient asistencias={asistencias_recientes} />

      <footer className="py-6 md:py-8 text-center border-t border-white/5 px-4 overflow-hidden">
        <p className="text-[10px] sm:text-xs text-zinc-600 font-bold uppercase tracking-widest sm:tracking-[0.3em] break-words">
          {data.gimnasio_nombre} &copy; {new Date().getFullYear()} - El poder de tu disciplina
        </p>
      </footer>
    </div>
  )
}

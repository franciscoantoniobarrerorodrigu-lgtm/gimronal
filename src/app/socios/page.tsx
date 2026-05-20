import { redirect } from 'next/navigation'
import { getPortalData } from '@/lib/supabase/actions/portal'
import { Dumbbell, CalendarDays, Activity, CalendarCheck, LogOut, User, Trophy, Star, History, Flame, Medal, AlertTriangle, ChevronRight, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInColombiaTime } from '@/lib/date-utils'
import ClientLogoutButton from './ClientLogoutButton'
import ClientPasswordDialog from './ClientPasswordDialog'
import ClientRefreshIndicator from './ClientRefreshIndicator'
import QRScanner from './QRScanner'
import AvatarEvolutivo from '@/components/dashboard/AvatarEvolutivo'
import AvatarSelector from './AvatarSelector'
import Link from 'next/link'
import HistorialRecienteClient from './HistorialRecienteClient'
import { InactiveGymGuard } from '@/components/layout/InactiveGymGuard'

export const dynamic = 'force-dynamic'

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
    vencimiento_licencia
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
  const horaActual = new Date().getHours()
  const mensajeMotivacional = getMensajeMotivacional(streak, yaAsistioHoy, horaActual, gamificacion.nivel)
  const logrosDesbloqueados = logros.filter((l: any) => l.desbloqueado).length

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 md:space-y-8 animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <Dumbbell className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-none uppercase italic break-words">{data.gimnasio_nombre}</h1>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest sm:tracking-[0.2em] font-bold text-primary/80 mt-1 break-words">Portal del Atleta • Power System</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <ClientRefreshIndicator />
          <AvatarSelector currentTheme={data.avatar_theme} />
          <ClientPasswordDialog />
          <ClientLogoutButton />
        </div>
      </header>

      {/* QR Scanner Action (Movido arriba para mayor accesibilidad) */}
      <div className="animate-in slide-in-from-top duration-500 delay-100">
        <QRScanner />
      </div>


      {/* Membership Expiry Alert */}
      {membresia && dias_restantes <= 5 && dias_restantes > 0 && (
        <div className={`animate-in slide-in-from-top fade-in duration-500 relative overflow-hidden rounded-2xl p-4 border shadow-lg ${
          dias_restantes <= 2 
            ? 'bg-red-950/50 border-red-500/30 shadow-red-500/10' 
            : 'bg-amber-950/50 border-amber-500/30 shadow-amber-500/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${dias_restantes <= 2 ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${dias_restantes <= 2 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${dias_restantes <= 2 ? 'text-red-300' : 'text-amber-300'}`}>
                {dias_restantes <= 2 ? '⚠️ ¡Tu membresía vence muy pronto!' : '📅 Tu membresía está por vencer'}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Te {dias_restantes === 1 ? 'queda 1 día' : `quedan ${dias_restantes} días`}. Renueva en recepción para no perder tu racha.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Banner */}
      {es_cumpleanos && (
        <div className="animate-in slide-in-from-top fade-in duration-1000 relative overflow-hidden bg-gradient-to-r from-orange-500 via-primary to-rose-500 rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/30">
                🎂
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">¡Feliz Cumpleaños, {firstName}!</h2>
                <p className="text-white/90 text-sm font-medium">Que hoy sea un día lleno de energía, logros y mucha felicidad. ¡Gracias por ser parte de la familia!</p>
              </div>
            </div>
            <div className="hidden md:block text-5xl">
              🎉
            </div>
          </div>
        </div>
      )}

      {/* Hero Section — Optimized for mobile */}
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-zinc-900 to-black border border-white/5 p-6 md:p-12 shadow-inner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="space-y-3 md:space-y-4 flex-1 min-w-0">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter break-words">
              ¡Hola, <span className="text-primary break-all">{firstName}</span>! 👋
            </h2>
            <p className="text-zinc-400 text-base md:text-lg max-w-md leading-relaxed break-words">
              {mensajeMotivacional}
            </p>

            {/* Streak Badge */}
            {streak > 0 && (
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-black text-orange-300">Racha: {streak} {streak === 1 ? 'día' : 'días'}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 md:gap-4 pt-2 w-full max-w-md">
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Badge className={`border py-1 md:py-1.5 px-3 md:px-4 text-xs md:text-sm font-black backdrop-blur-md shadow-lg ${gamificacion.liga.bg} ${gamificacion.liga.color} ${gamificacion.liga.border}`}>
                  {gamificacion.liga.icon} {gamificacion.liga.nombre} • Nivel {gamificacion.nivel}
                </Badge>
                {membresia && (
                  <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 py-1 md:py-1.5 px-3 md:px-4 text-xs md:text-sm font-bold backdrop-blur-md shadow-sm">
                    Socio Activo
                  </Badge>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full space-y-2 bg-black/20 p-3 md:p-3.5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <span className="break-words">Tu Lealtad (Meses)</span>
                  <span className={`break-words ${gamificacion.faltan > 0 ? 'text-primary' : 'text-zinc-500'}`}>
                    {gamificacion.nivel === 100 ? 'RANGO MÁXIMO' : `${gamificacion.faltan} asis. para Nivel ${gamificacion.nivel + 1}`}
                  </span>
                </div>
                <div className="h-2 md:h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${gamificacion.liga.bg.replace('/20', '')}`} 
                    style={{ width: `${gamificacion.progreso}%`, backgroundColor: 'currentColor' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Evolutivo — Smaller on mobile */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <AvatarEvolutivo 
              nivel={gamificacion.nivel} 
              genero={data.genero} 
              avatarTheme={data.avatar_theme}
              className="md:mr-8 scale-75 md:scale-100 origin-center" 
            />
          </div>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
        <Link href="/socios/horarios" className="group relative flex items-center justify-between bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 md:p-5 hover:bg-primary/20 transition-all duration-300 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-300 shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white leading-tight break-words">Horarios & Entrenadores</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5 break-words">Consulta los horarios de los tutores</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-colors shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/socios/progreso" className="group relative flex items-center justify-between bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 md:p-5 hover:bg-primary/20 transition-all duration-300 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-300 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white leading-tight break-words">Mi Progreso Físico</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5 break-words">Controla tus medidas y peso corporal</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-colors shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/socios/pagos" className="group relative flex items-center justify-between bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 md:p-5 hover:bg-primary/20 transition-all duration-300 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-300 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white leading-tight break-words">Historial de Pagos</h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5 break-words">Verifica tus recibos y facturas</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-colors shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Weekly Mini Chart */}
      <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-lg min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Últimos 7 Días</p>
            <p className="text-xs text-zinc-600">{asistencia_semanal.filter((d: any) => d.asistio).length}/7 días</p>
          </div>
          <div className="flex items-end justify-between gap-1.5 md:gap-2">
            {asistencia_semanal.map((dia: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-full rounded-xl transition-all duration-500 ${
                  dia.asistio 
                    ? 'bg-gradient-to-t from-primary to-primary/60 h-10 md:h-12 shadow-lg shadow-primary/20' 
                    : 'bg-white/5 h-4 md:h-5 border border-white/5'
                }`} style={{ animationDelay: `${i * 100}ms` }} />
                <span className={`text-[10px] font-bold ${dia.asistio ? 'text-primary' : 'text-zinc-600'}`}>
                  {dia.dia}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid — Staggered animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Membresía Premium Card */}
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-[400ms] group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-primary/30 min-w-0">
          <div className="absolute top-4 right-4 p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 md:mb-4">Tu Membresía</p>
          {membresia ? (
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-xl md:text-2xl font-black text-white">{membresia.planes?.nombre || 'Plan Estándar'}</h3>
              <div className="flex items-center justify-between p-3 md:p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex flex-col min-w-0">
                  <span className={`text-2xl md:text-3xl font-black break-words ${dias_restantes <= 5 ? (dias_restantes <= 2 ? 'text-red-400' : 'text-amber-400') : 'text-primary'}`}>{dias_restantes}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter break-words">Días Restantes</span>
                </div>
                <div className="h-10 w-px bg-white/10 shrink-0 mx-2" />
                <div className="flex flex-col items-end min-w-0">
                  <span className="text-sm font-bold text-zinc-300 break-words text-right">
                    {membresia.fecha_fin ? format(new Date(membresia.fecha_fin + 'T12:00:00'), "dd MMM", { locale: es }) : 'N/A'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter break-words text-right">Vencimiento</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-zinc-500 font-medium">Sin membresía activa</div>
          )}
        </div>

        {/* Asistencia Mes Card */}
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-[550ms] group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-primary/30 min-w-0">
          <div className="absolute top-4 right-4 p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <CalendarCheck className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 md:mb-4">Este Mes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-white">{asistencias_mes}</span>
            <span className="text-base md:text-lg font-bold text-zinc-500">entrenamientos</span>
          </div>
          <div className="mt-3 md:mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-xs text-primary/80 font-medium">
              {yaAsistioHoy ? '✓ Ya registraste tu esfuerzo hoy.' : '⚡ Aún no has registrado tu entrada.'}
            </p>
          </div>
        </div>

        {/* Total Histórico Card */}
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-[700ms] group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-primary/30 min-w-0">
          <div className="absolute top-4 right-4 p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 md:mb-4">Impacto Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-white">{asistencias_totales}</span>
            <span className="text-base md:text-lg font-bold text-zinc-500">sesiones</span>
          </div>
          <p className="mt-3 md:mt-4 text-xs text-zinc-500 font-medium leading-relaxed">
            Cada sesión cuenta en tu transformación. ¡Sigue así!
          </p>
        </div>

      </div>

      {/* Logros / Medallas — Rediseñado para Claridad y Estilo */}
      <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-[800ms]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Mis Medallas</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{logrosDesbloqueados} de {logros.length} Desbloqueadas</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {logros.map((logro: any) => {
              const icons: Record<string, any> = {
                'primera_semana': Star,
                'constancia': Dumbbell,
                'centurion': Trophy,
                'madrugador': Flame,
                'nocturno': Activity,
                'iron_man': Activity,
                'veterano': Medal,
                'leyenda': Trophy
              }
              const IconComp = icons[logro.id] || Medal

              return (
                <div 
                  key={logro.id}
                  className={`group relative flex flex-col items-center p-5 rounded-3xl border transition-all duration-500 ${
                    logro.desbloqueado
                      ? 'bg-gradient-to-b from-white/[0.08] to-transparent border-primary/40 shadow-lg shadow-primary/10'
                      : 'bg-black/40 border-white/5 opacity-80'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={`relative mb-4 p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${
                    logro.desbloqueado 
                      ? 'bg-primary/20 text-primary shadow-xl shadow-primary/20' 
                      : 'bg-zinc-900 text-zinc-700'
                  }`}>
                    {logro.desbloqueado ? (
                      <IconComp className="w-8 h-8 md:w-10 md:h-10" />
                    ) : (
                      <div className="relative">
                        <IconComp className="w-8 h-8 md:w-10 md:h-10 grayscale" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Star className="w-4 h-4 text-zinc-800 fill-zinc-800" />
                        </div>
                      </div>
                    )}
                    
                    {/* Status Dot */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                      logro.desbloqueado ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'
                    }`} />
                  </div>

                  <h4 className={`text-xs md:text-sm font-black text-center mb-1 uppercase tracking-wider ${
                    logro.desbloqueado ? 'text-white' : 'text-zinc-500'
                  }`}>
                    {logro.nombre}
                  </h4>
                  
                  <p className={`text-[9px] md:text-[10px] text-center font-bold uppercase tracking-tighter leading-tight ${
                    logro.desbloqueado ? 'text-primary/70' : 'text-zinc-700'
                  }`}>
                    {logro.descripcion}
                  </p>

                  {!logro.desbloqueado && (
                    <div className="mt-3 px-2 py-0.5 rounded-full bg-zinc-800/50 border border-white/5">
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Bloqueado</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Historial Reciente Premium (Interactivo) */}
      <HistorialRecienteClient asistencias={asistencias_recientes} />

      <footer className="py-6 md:py-8 text-center border-t border-white/5 px-4 overflow-hidden">
        <p className="text-[10px] sm:text-xs text-zinc-600 font-bold uppercase tracking-widest sm:tracking-[0.3em] break-words">
          GymControl &copy; {new Date().getFullYear()} - El poder de tu disciplina
        </p>
      </footer>
    </div>
  )
}

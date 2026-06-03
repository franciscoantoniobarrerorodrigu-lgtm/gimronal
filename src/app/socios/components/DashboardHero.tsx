import { Badge } from '@/components/ui/badge'
import { Flame, ShieldCheck, Sparkles } from 'lucide-react'
import AvatarEvolutivo from '@/components/dashboard/AvatarEvolutivo'

interface DashboardHeroProps {
  firstName: string
  mensajeMotivacional: string
  streak: number
  gamificacion: {
    nivel: number
    faltan: number
    progreso: number
    liga: {
      bg: string
      color: string
      border: string
      icon: string
      nombre: string
    }
  }
  membresia: unknown
  genero: string | null
  avatarTheme: string | null
  fotoUrl?: string | null
}

export default function DashboardHero({
  firstName,
  mensajeMotivacional,
  streak,
  gamificacion,
  membresia,
  genero,
  avatarTheme,
  fotoUrl
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,90,0,0.18),rgba(20,20,22,0.96)_36%,rgba(0,0,0,0.98))] p-4 shadow-2xl shadow-black/30 sm:p-6 md:p-8 lg:p-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_65%_at_80%_0%,rgba(255,255,255,0.10),transparent_55%)]" />

      <div className="relative z-10 grid gap-5 md:grid-cols-[minmax(0,1fr)_300px] md:items-center lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <Sparkles className="size-3" />
              Modo atleta
            </span>
            {Boolean(membresia) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                <ShieldCheck className="size-3" />
                Activo
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Bienvenido de vuelta</p>
            <h2 className="text-3xl font-black leading-[0.95] tracking-tight text-white sm:text-4xl md:text-5xl">
              Hola, <span className="text-primary">{firstName}</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-zinc-400 sm:text-base md:text-lg">
              {mensajeMotivacional}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:max-w-xl">
            <div className="flex flex-wrap gap-2">
              <Badge className={`h-auto border px-3 py-1.5 text-[11px] font-black shadow-lg backdrop-blur-md sm:text-xs ${gamificacion.liga.bg} ${gamificacion.liga.color} ${gamificacion.liga.border}`}>
                {gamificacion.liga.icon} {gamificacion.liga.nombre} • Nivel {gamificacion.nivel}
              </Badge>
              {streak > 0 && (
                <Badge variant="outline" className="h-auto border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[11px] font-black text-orange-300 sm:text-xs">
                  <Flame className="size-3.5 text-orange-400" />
                  Racha {streak} {streak === 1 ? 'día' : 'días'}
                </Badge>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm sm:p-4">
              <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                <span>Progreso de nivel</span>
                <span className={gamificacion.faltan > 0 ? 'text-primary' : 'text-zinc-400'}>
                  {gamificacion.nivel === 100 ? 'RANGO MÁXIMO' : `${gamificacion.faltan} asis. para nivel ${gamificacion.nivel + 1}`}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-white/5 bg-black/60 shadow-inner">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${gamificacion.liga.color}`}
                  style={{ width: `${gamificacion.progreso}%`, backgroundColor: 'currentColor' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center md:justify-end">
          <AvatarEvolutivo
            nivel={gamificacion.nivel}
            genero={genero || undefined}
            avatarTheme={avatarTheme || undefined}
            fotoUrl={fotoUrl}
            compact
            className="max-w-[245px] origin-center sm:max-w-[270px]"
          />
        </div>
      </div>
    </div>
  )
}

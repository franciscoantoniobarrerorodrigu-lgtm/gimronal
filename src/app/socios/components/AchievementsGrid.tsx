import type { ComponentType } from 'react'
import { Trophy, Star, Dumbbell, Flame, Activity, Medal } from 'lucide-react'

export interface Logro {
  id: string
  nombre: string
  descripcion: string
  desbloqueado: boolean
  icon?: string
}

interface AchievementsGridProps {
  logros: Logro[]
  logrosDesbloqueados: number
}

const ACHIEVEMENT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'primera_semana': Star,
  'constancia': Dumbbell,
  'centurion': Trophy,
  'madrugador': Flame,
  'nocturno': Activity,
  'iron_man': Activity,
  'veterano': Medal,
  'leyenda': Trophy
}

export default function AchievementsGrid({ logros, logrosDesbloqueados }: AchievementsGridProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-[800ms]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 shadow-lg shadow-amber-500/5 sm:size-12 sm:rounded-2xl">
              <Trophy className="size-5 text-amber-400 sm:size-6" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black uppercase italic tracking-tight text-white sm:text-xl">Mis Medallas</h3>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{logrosDesbloqueados} de {logros.length} Desbloqueadas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 md:gap-4">
          {logros.map((logro) => {
            const IconComp = ACHIEVEMENT_ICONS[logro.id] || Medal

            return (
              <div 
                key={logro.id}
                className={`group relative flex min-h-[154px] flex-col items-center rounded-2xl border p-3 text-center transition-all duration-500 sm:min-h-[176px] sm:p-4 ${
                  logro.desbloqueado
                    ? 'bg-gradient-to-b from-white/[0.08] to-transparent border-primary/40 shadow-lg shadow-primary/10'
                    : 'bg-black/40 border-white/5 opacity-80'
                }`}
              >
                {/* Badge Icon */}
                <div className={`relative mb-3 rounded-xl p-3 transition-transform duration-500 group-hover:scale-105 sm:mb-4 sm:rounded-2xl ${
                  logro.desbloqueado 
                    ? 'bg-primary/20 text-primary shadow-xl shadow-primary/20' 
                    : 'bg-zinc-900 text-zinc-700'
                }`}>
                  {logro.desbloqueado ? (
                    <IconComp className="size-8 md:size-9" />
                  ) : (
                    <div className="relative">
                      <IconComp className="size-8 grayscale md:size-9" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Star className="size-4 fill-zinc-800 text-zinc-800 drop-shadow-md" />
                      </div>
                    </div>
                  )}
                  
                  {/* Status Dot */}
                  <div className={`absolute -right-1 -top-1 size-3 rounded-full border-2 border-zinc-900 ${
                    logro.desbloqueado ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'
                  }`} />
                </div>

                <h4 className={`mb-1 line-clamp-2 text-xs font-black uppercase tracking-wide md:text-sm ${
                  logro.desbloqueado ? 'text-white' : 'text-zinc-500'
                }`}>
                  {logro.nombre}
                </h4>
                
                <p className={`line-clamp-2 text-[9px] font-bold uppercase leading-tight tracking-tighter md:text-[10px] ${
                  logro.desbloqueado ? 'text-primary/70' : 'text-zinc-700'
                }`}>
                  {logro.descripcion}
                </p>

                {!logro.desbloqueado && (
                  <div className="mt-auto rounded-full border border-white/5 bg-zinc-800/50 px-2 py-0.5">
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Bloqueado</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

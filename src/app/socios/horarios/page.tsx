import { redirect } from 'next/navigation'
import { getPortalData, getClientEntrenadores, getClientClases } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, Calendar as CalendarIcon, Dumbbell, Clock, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientHorariosPage() {
  const data = await getPortalData()
  if (!data) redirect('/login')

  const entrenadores = await getClientEntrenadores() || []

  let clases: any[] = []
  try {
    const result = await getClientClases()
    clases = result.success && result.data ? result.data : []
  } catch (e) {
    console.error('Error fetching clases:', e)
  }

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  
  // Sort classes by time
  const sortedClases = [...clases].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))

  // Format time helper
  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const [hour, minute] = timeStr.split(':')
    const h = parseInt(hour, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHour = h % 12 || 12
    return `${formattedHour.toString().padStart(2, '0')}:${minute} ${ampm}`
  }

  const parseDisponibilidad = (str: string | null) => {
    if (!str) return null
    try {
      if (str.startsWith('[')) {
        return JSON.parse(str)
      }
    } catch(e) {}
    return str
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-6">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Horarios y Disponibilidad</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Entrenadores y Clases Grupales</p>
        </div>
      </header>

      {entrenadores.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Disponibilidad de Entrenadores</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entrenadores.map(entrenador => (
              <div key={entrenador.id} className="relative group overflow-hidden bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:border-primary/30 hover:bg-white/[0.02]">
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {entrenador.foto_url ? (
                        <img src={entrenador.foto_url} alt={entrenador.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <Dumbbell className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight">{entrenador.nombre}</h3>
                      <div className="text-xs text-primary/80 font-bold">{entrenador.especialidad || 'Entrenador'}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs font-bold text-zinc-400 space-y-1.5 mt-1 border-t border-white/5 pt-3">
                    {(() => {
                      const parsed = parseDisponibilidad(entrenador.horario_disponibilidad)
                      if (!parsed) {
                        return (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>Horario no especificado</span>
                          </div>
                        )
                      }
                      
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        return (
                          <div className="space-y-1.5">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Turnos Programados</div>
                            {parsed.map((shift, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white/5 px-2.5 py-2 rounded-lg border border-white/5">
                                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                <span className="w-20 font-black text-white">{shift.dia}</span>
                                <Clock className="w-3 h-3 text-primary/60 ml-auto" />
                                <span>{formatTime(shift.inicio)} - {formatTime(shift.fin)}</span>
                              </div>
                            ))}
                          </div>
                        )
                      }

                      return (
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="whitespace-pre-line leading-relaxed">{parsed}</span>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:gap-8">
        {dias.map(dia => {
          const clasesDia = sortedClases.filter(c => c.dia_semana === dia)
          if (clasesDia.length === 0) return null

          return (
            <div key={dia} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">{dia}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clasesDia.map(clase => (
                  <div key={clase.id} className="relative group overflow-hidden bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:border-primary/30 hover:bg-white/[0.02]">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Dumbbell className="w-16 h-16 rotate-12" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-base font-black text-white tracking-tight">{clase.nombre}</h3>
                        {clase.color && (
                          <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: clase.color }} />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{formatTime(clase.hora_inicio)} {clase.hora_fin ? `- ${formatTime(clase.hora_fin)}` : ''}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>Entrenador: <span className="text-zinc-200">{clase.entrenadores?.nombre || 'Sin asignar'}</span></span>
                        </div>
                        
                        {clase.sala && (
                          <div className="mt-3 inline-block px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                            Sala: {clase.sala}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}


      </div>
    </div>
  )
}


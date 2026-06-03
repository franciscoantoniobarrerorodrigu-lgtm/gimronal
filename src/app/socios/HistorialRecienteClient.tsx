'use client'

import { useState, useMemo } from 'react'
import { CalendarDays, History, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInColombiaTime } from '@/lib/date-utils'
import { Card } from '@/components/ui/card'

export default function HistorialRecienteClient({ asistencias }: { asistencias: any[] }) {
  const [filtroMes, setFiltroMes] = useState<string>('') // Formato: YYYY-MM

  // Extraer meses únicos para el filtro
  const mesesDisponibles = useMemo(() => {
    const meses = new Set<string>()
    asistencias.forEach(a => {
      if (a.fecha_hora_entrada) {
        meses.add(a.fecha_hora_entrada.substring(0, 7)) // YYYY-MM
      }
    })
    return Array.from(meses).sort((a, b) => b.localeCompare(a)) // Más reciente primero
  }, [asistencias])

  const asistenciasFiltradas = useMemo(() => {
    if (!filtroMes) return asistencias.slice(0, 10) // Por defecto muestra hasta 10 recientes
    return asistencias.filter(a => a.fecha_hora_entrada?.startsWith(filtroMes))
  }, [asistencias, filtroMes])

  return (
    <Card glass className="animate-in-fade-up overflow-hidden">
      <div className="p-5 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 md:p-3 bg-zinc-900 rounded-2xl border border-white/10 shadow-lg">
            <History className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-white">Actividad Reciente</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">Tus registros de sala</p>
          </div>
        </div>
        
        {/* Filtro de Mes - Native select for better mobile UX */}
        <div className="flex-shrink-0 relative w-full sm:w-auto">
          <select 
            className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white font-bold focus:ring-2 focus:ring-primary/50 outline-none appearance-none transition-all hover:bg-white/5"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="" className="bg-zinc-900 text-white">Últimos 10 registros</option>
            {mesesDisponibles.map(mes => {
              const [y, m] = mes.split('-')
              const date = new Date(parseInt(y), parseInt(m) - 1, 15) // Día 15 para evitar problemas de zona horaria
              const mesTexto = format(date, 'MMMM yyyy', { locale: es })
              return (
                <option key={mes} value={mes} className="bg-zinc-900 text-white">
                  {mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1)}
                </option>
              )
            })}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-8 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
        {asistenciasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {asistenciasFiltradas.map((asis: any) => {
              // Get day of week
              const diaStr = asis.fecha_hora_entrada 
                ? format(new Date(asis.fecha_hora_entrada), 'EEE', { locale: es }).toUpperCase()
                : ''
              
              let duracionTexto = ''
              if (asis.fecha_hora_entrada && asis.fecha_hora_salida) {
                const start = new Date(asis.fecha_hora_entrada)
                const end = new Date(asis.fecha_hora_salida)
                const diffMins = Math.floor((end.getTime() - start.getTime()) / 60000)
                if (diffMins > 0) {
                  const h = Math.floor(diffMins / 60)
                  const m = diffMins % 60
                  duracionTexto = h > 0 ? `${h}h ${m}m` : `${m}m`
                } else {
                  duracionTexto = '< 1m'
                }
              }

              return (
                <div key={asis.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-3 md:gap-4 mb-3 sm:mb-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="block text-base md:text-lg font-black text-white capitalize line-clamp-2">
                          {asis.fecha_hora_entrada ? formatInColombiaTime(asis.fecha_hora_entrada, 'date') : 'Fecha desconocida'}
                        </span>
                        {diaStr && (
                          <span className="text-[9px] font-black text-primary/60 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 shrink-0">
                            {diaStr}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate block">Sesión Registrada</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 md:gap-8 mt-2 sm:mt-0">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Entrada</span>
                      <span className="text-sm font-mono font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 shadow-sm shadow-primary/5">
                        {asis.fecha_hora_entrada ? formatInColombiaTime(asis.fecha_hora_entrada, 'time') : '--:--'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Salida</span>
                      {asis.fecha_hora_salida ? (
                        <span className="text-sm font-mono font-black text-zinc-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                          {formatInColombiaTime(asis.fecha_hora_salida, 'time')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 animate-pulse tracking-tight">
                          ENTRENANDO
                        </span>
                      )}
                    </div>
                    {duracionTexto && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Duración</span>
                        <span className="text-sm font-mono font-black text-primary/80 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                          ⏱ {duracionTexto}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-zinc-700" />
            </div>
            <div>
              <p className="text-xl font-black text-zinc-600">Sin actividad en este mes</p>
              <p className="text-sm text-zinc-500">Intenta seleccionar otro filtro para ver tu historial.</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

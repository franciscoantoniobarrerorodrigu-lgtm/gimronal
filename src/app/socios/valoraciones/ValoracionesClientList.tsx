'use client'

import { useState } from 'react'
import { Calendar, User, Activity, Ruler, Scale, Weight, Heart } from 'lucide-react'

const VALORACIONES_PER_PAGE = 5

export function ValoracionesClientList({ valoraciones }: { valoraciones: any[] }) {
  const [page, setPage] = useState(1)
  
  const totalPages = Math.ceil(valoraciones.length / VALORACIONES_PER_PAGE)
  const paginated = valoraciones.slice((page - 1) * VALORACIONES_PER_PAGE, page * VALORACIONES_PER_PAGE)

  return (
    <div className="grid gap-6">
      {paginated.map((val: any) => (
        <div
          key={val.id}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {val.fecha ? new Date(val.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : '—'}
                </h3>
                {(val as any).entrenadores?.nombre && (
                  <p className="text-xs font-bold text-primary/80 flex items-center gap-1">
                    <User className="w-3 h-3" /> {(val as any).entrenadores.nombre}
                  </p>
                )}
              </div>
            </div>
            {val.condicion_general && (
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Condición: {val.condicion_general}/10
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Peso', value: val.peso, unit: 'kg', icon: Scale },
              { label: 'Estatura', value: val.estatura, unit: 'cm', icon: Ruler },
              { label: 'IMC', value: val.imc, unit: '', icon: Weight },
              { label: '% Grasa', value: val.porcentaje_grasa, unit: '%', icon: Activity },
              { label: 'Masa Muscular', value: val.masa_muscular, unit: 'kg', icon: Weight },
              { label: '% Agua', value: val.porcentaje_agua, unit: '%', icon: Activity },
              { label: 'Cintura', value: val.medida_cintura, unit: 'cm', icon: Ruler },
              { label: 'Cadera', value: val.medida_cadera, unit: 'cm', icon: Ruler },
              { label: 'Pecho', value: val.medida_pecho, unit: 'cm', icon: Ruler },
              { label: 'Brazo Der.', value: val.medida_brazo_der, unit: 'cm', icon: Ruler },
              { label: 'Brazo Izq.', value: val.medida_brazo_izq, unit: 'cm', icon: Ruler },
              { label: 'Muslo Der.', value: val.medida_muslo_der, unit: 'cm', icon: Ruler },
              { label: 'Muslo Izq.', value: val.medida_muslo_izq, unit: 'cm', icon: Ruler },
              { label: 'Pantorrilla', value: val.medida_pantorrilla, unit: 'cm', icon: Ruler },
              { label: 'Tensión Arterial', value: val.tension_arterial, unit: '', icon: Heart },
              { label: 'Frec. Cardíaca', value: val.frecuencia_cardiaca, unit: 'bpm', icon: Heart },
            ].map((item) => {
              if (item.value == null) return null
              return (
                <div key={item.label} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{item.label}</p>
                  <p className="text-lg font-black text-white">
                    {item.value}
                    {item.unit && <span className="text-xs font-bold text-zinc-600 ml-1">{item.unit}</span>}
                  </p>
                </div>
              )
            })}
          </div>

          {val.observaciones && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Observaciones</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{val.observaciones}</p>
            </div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs font-bold text-zinc-500">
            Página <span className="text-white">{page}</span> de <span className="text-white">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

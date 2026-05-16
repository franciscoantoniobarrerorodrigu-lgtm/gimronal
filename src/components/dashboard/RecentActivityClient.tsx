'use client'

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Asistencia {
  id: string
  clienteNombre: string
  fecha: string
  fechaSalida: string | null
}

interface RecentActivityClientProps {
  initialAsistencias: Asistencia[]
}

export function RecentActivityClient({ initialAsistencias }: RecentActivityClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // 3 rows of 2 columns

  const totalPages = Math.ceil(initialAsistencias.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAsistencias = initialAsistencias.slice(startIndex, startIndex + itemsPerPage)

  if (initialAsistencias.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500 italic text-[11px] font-medium">
        Sin actividad reciente.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[220px]">
        {paginatedAsistencias.map((asist) => (
          <div 
            key={asist.id} 
            className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/60 transition-all group animate-in fade-in duration-300"
          >
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center font-black text-[11px] text-zinc-300 border border-white/10 group-hover:border-primary/50 transition-colors">
                {asist.clienteNombre.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-[12px] font-bold text-zinc-100 truncate group-hover:text-primary transition-colors">
                  {asist.clienteNombre}
                </p>
                <p className="text-[11px] text-zinc-500 font-medium">
                  {formatDistanceToNow(new Date(asist.fecha), { addSuffix: true, locale: es })}
                </p>
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 text-[11px] font-black rounded-full shrink-0 ml-4 border",
              asist.fechaSalida 
                ? "text-zinc-500 bg-zinc-800/50 border-zinc-700/50" 
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 animate-pulse"
            )}>
              {asist.fechaSalida ? 'Salida' : 'En sala'}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-zinc-900/50 border-white/10 hover:bg-zinc-800 text-zinc-400"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-zinc-900/50 border-white/10 hover:bg-zinc-800 text-zinc-400"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

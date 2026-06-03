'use client'

import { useState } from 'react'
import { Package, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCOP } from '@/lib/format-utils'

const COMPRAS_PER_PAGE = 10

export function ComprasClientList({ compras }: { compras: any[] }) {
  const [page, setPage] = useState(1)
  
  const totalPages = Math.ceil(compras.length / COMPRAS_PER_PAGE)
  const paginated = compras.slice((page - 1) * COMPRAS_PER_PAGE, page * COMPRAS_PER_PAGE)

  return (
    <div className="grid gap-4">
      {paginated.map((compra: any) => (
        <div
          key={compra.id}
          className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-xl transition-all duration-300 hover:bg-white/[0.07] hover:border-primary/20"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                <Package className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">
                  {(compra as any).productos?.nombre || 'Producto'}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary/60" />
                    {compra.created_at ? new Date(compra.created_at).toLocaleDateString('es-CO') : '—'}
                  </span>
                  {(compra as any).productos?.categoria && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-primary/60" />
                      {(compra as any).productos.categoria}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col justify-between md:items-end gap-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
              <span className="text-xs font-bold text-zinc-500">
                Cant: <span className="text-white">{compra.cantidad}</span>
              </span>
              <p className="text-xl font-black text-white">{formatCOP(compra.total)}</p>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mt-2">
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

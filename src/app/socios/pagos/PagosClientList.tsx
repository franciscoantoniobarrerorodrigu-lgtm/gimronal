'use client'

import { useState } from 'react'
import { Calendar, FileText, ExternalLink, Receipt } from 'lucide-react'
import { formatCOP, formatDate } from '@/lib/format-utils'

const PAGOS_PER_PAGE = 10

export function PagosClientList({ pagos }: { pagos: any[] }) {
  const [page, setPage] = useState(1)
  
  const totalPages = Math.ceil(pagos.length / PAGOS_PER_PAGE)
  const paginated = pagos.slice((page - 1) * PAGOS_PER_PAGE, page * PAGOS_PER_PAGE)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white uppercase tracking-wider italic">Listado de Recibos</h2>
      
      <div className="grid gap-4">
        {paginated.map((pago: any) => {
          const hasDetails = pago.subtotal || pago.iva_monto
          return (
            <div
              key={pago.id}
              className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-xl transition-all duration-300 hover:bg-white/[0.07] hover:border-primary/20"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Concept and Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                    <Receipt className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white">{pago.concepto || 'Membresía / Plan'}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary/60" />
                        {formatDate(pago.fecha_pago)}
                      </span>
                      {pago.recibo_numero && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-primary/60" />
                          Recibo: <span className="text-zinc-300">{pago.recibo_numero}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method and Amount */}
                <div className="flex flex-row md:flex-col justify-between md:items-end gap-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] uppercase font-bold tracking-widest text-zinc-400">
                      {pago.metodo_pago || 'No especificado'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white leading-none">
                    {formatCOP(pago.monto)}
                  </p>
                </div>

              </div>

              {/* Tax and Invoice Subsections */}
              {(hasDetails || pago.factus_url) && (
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Subtotal & IVA breakdown if registered */}
                  <div className="flex gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    {pago.subtotal && (
                      <span>Subtotal: <span className="text-zinc-300">{formatCOP(pago.subtotal)}</span></span>
                    )}
                    {pago.iva_monto && (
                      <span>
                        IVA ({pago.iva_porcentaje ? `${pago.iva_porcentaje}%` : 'Incl.'}):{' '}
                        <span className="text-zinc-300">{formatCOP(pago.iva_monto)}</span>
                      </span>
                    )}
                  </div>

                  {/* Electronic Invoice Factus URL */}
                  {pago.factus_url && (
                    <a
                      href={pago.factus_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-xl text-xs font-black text-primary transition-all duration-300 shadow-md shadow-primary/5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Factura Electrónica DIAN
                    </a>
                  )}

                </div>
              )}

            </div>
          )
        })}
      </div>

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

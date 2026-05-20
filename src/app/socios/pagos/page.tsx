import { redirect } from 'next/navigation'
import { getPortalData, getClientPagos } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, CreditCard, DollarSign, Calendar, FileText, ExternalLink, Receipt, HelpCircle } from 'lucide-react'
import { formatCOP, formatDate } from '@/lib/format-utils'

export const dynamic = 'force-dynamic'

export default async function ClientPagosPage() {
  const portalData = await getPortalData()
  if (!portalData) redirect('/login')

  const res = await getClientPagos()
  const pagos = res.success && res.data ? res.data : []

  // Metrics calculations
  const totalInvertido = pagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0)
  const ultimoPago = pagos.length > 0 ? pagos[0] : null

  // Get unique payment methods
  const metodosPago = Array.from(new Set(pagos.map((p) => p.metodo_pago).filter(Boolean)))

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Historial de Pagos</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Tus transacciones y facturación electrónica</p>
        </div>
      </header>

      {pagos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[50vh]">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
            <Receipt className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-xl font-black text-white">Sin Pagos Registrados</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            Aún no se han registrado transacciones asociadas a tu cuenta de socio.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Invertido</p>
                <p className="text-2xl font-black text-white">{formatCOP(totalInvertido)}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                <Calendar className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Último Pago</p>
                <p className="text-base font-black text-white truncate">
                  {ultimoPago ? formatDate(ultimoPago.fecha_pago) : '—'}
                </p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">
                  {ultimoPago ? formatCOP(ultimoPago.monto) : ''}
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Métodos Utilizados</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {metodosPago.map((metodo) => (
                    <span
                      key={metodo}
                      className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] uppercase font-bold text-zinc-300"
                    >
                      {metodo}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* List of Payments */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider italic">Listado de Recibos</h2>
            
            <div className="grid gap-4">
              {pagos.map((pago) => {
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
          </div>
        </>
      )}

    </div>
  )
}

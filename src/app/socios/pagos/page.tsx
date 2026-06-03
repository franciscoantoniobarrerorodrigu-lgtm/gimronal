import { redirect } from 'next/navigation'
import { getPortalData, getClientPagos } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, CreditCard, DollarSign, Calendar, FileText, ExternalLink, Receipt, HelpCircle } from 'lucide-react'
import { formatCOP, formatDate } from '@/lib/format-utils'
import { PagosClientList } from './PagosClientList'

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
          <PagosClientList pagos={pagos} />
        </>
      )}

    </div>
  )
}

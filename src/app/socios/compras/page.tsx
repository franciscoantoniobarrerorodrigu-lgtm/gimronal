import { redirect } from 'next/navigation'
import { getPortalData, getClientCompras } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, ShoppingBag, Package, Calendar, DollarSign, Tag } from 'lucide-react'
import { formatCOP } from '@/lib/format-utils'
import { ComprasClientList } from './ComprasClientList'

export const dynamic = 'force-dynamic'

export default async function ComprasPage() {
  const data = await getPortalData()
  if (!data) redirect('/login')

  const res = await getClientCompras()
  const compras = res.success && res.data ? res.data : []

  const totalGastado = compras.reduce((acc: number, c: any) => acc + (Number(c.total) || 0), 0)
  const totalProductos = compras.reduce((acc: number, c: any) => acc + (Number(c.cantidad) || 0), 0)

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Mis Compras</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Historial de productos adquiridos</p>
        </div>
      </header>

      {compras.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[50vh]">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
            <ShoppingBag className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-xl font-black text-white">Sin Compras Registradas</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            Aún no has realizado compras en el gimnasio. Visita la recepción para conocer los productos disponibles.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Gastado</p>
                <p className="text-2xl font-black text-white">{formatCOP(totalGastado)}</p>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Productos</p>
                <p className="text-2xl font-black text-white">{totalProductos}</p>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Transacciones</p>
                <p className="text-2xl font-black text-white">{compras.length}</p>
              </div>
            </div>
          </div>

          <ComprasClientList compras={compras} />
        </>
      )}
    </div>
  )
}

import { redirect } from 'next/navigation'
import { getPortalData, getClientMedidas } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ProgresoClient from './ProgresoClient'

export const dynamic = 'force-dynamic'

export default async function ProgresoPage() {
  const data = await getPortalData()
  if (!data) redirect('/login')

  const res = await getClientMedidas()
  const medidas = res.success && res.data ? res.data : []

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Mi Progreso Físico</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Evolución Corporal y Medidas</p>
        </div>
      </header>

      <ProgresoClient medidas={medidas} />
    </div>
  )
}

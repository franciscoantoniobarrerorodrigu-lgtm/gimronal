import { redirect } from 'next/navigation'
import { getPortalData, getClientValoraciones } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, Activity, Calendar, User, Heart, Ruler, Scale, Weight } from 'lucide-react'
import { ValoracionesClientList } from './ValoracionesClientList'

export const dynamic = 'force-dynamic'

export default async function ValoracionesPage() {
  const data = await getPortalData()
  if (!data) redirect('/login')

  const res = await getClientValoraciones()
  const valoraciones = res.success && res.data ? res.data : []

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Valoraciones Físicas</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Evaluaciones realizadas por tus entrenadores</p>
        </div>
      </header>

      {valoraciones.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[50vh]">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
            <Activity className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-xl font-black text-white">Sin Valoraciones Registradas</h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-4">
            Aún no tienes evaluaciones físicas registradas. Solicita a tu entrenador que realice una valoración completa.
          </p>
          <Link
            href="/socios/horarios"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors"
          >
            Ver Entrenadores
          </Link>
        </div>
      ) : (
        <ValoracionesClientList valoraciones={valoraciones} />
      )}
    </div>
  )
}

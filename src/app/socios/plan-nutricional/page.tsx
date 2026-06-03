import { redirect } from 'next/navigation'
import { getPortalData, getClientPlanNutricional, getClientMedidas } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, Apple, Dumbbell, AlertTriangle, Utensils, Clock, User, Calendar } from 'lucide-react'
import NutritionAIChat from './NutritionAIChat'

export const dynamic = 'force-dynamic'

export default async function PlanNutricionalPage() {
  const data = await getPortalData()
  if (!data) redirect('/login')

  const res = await getClientPlanNutricional()
  const plan = res.success && res.data ? res.data : null

  let edad = null
  if ((data as any).fecha_nacimiento) {
    const birthDate = new Date((data as any).fecha_nacimiento)
    const today = new Date()
    edad = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      edad--
    }
  }

  const resMedidas = await getClientMedidas()
  const medidas = resMedidas.success && resMedidas.data ? resMedidas.data : []
  const lastMedida = medidas.length > 0 ? medidas[medidas.length - 1] : null

  const initialData = {
    nombre: (data as any).primer_nombre || (data as any).nombres || (data as any).nombre || null,
    edad: edad,
    peso: lastMedida?.peso || null,
    altura: lastMedida?.estatura || null,
  }


  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Plan Nutricional</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Recomendaciones alimenticias personalizadas</p>
        </div>
      </header>

      {!plan ? (
        <NutritionAIChat initialData={initialData} />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Utensils className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Resumen Nutricional</h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {plan.numero_comidas || 0} comidas al día
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Calorías', value: plan.calorias_diarias, unit: 'kcal', icon: Flame },
                { label: 'Proteínas', value: plan.proteinas_g, unit: 'g', icon: Dumbbell },
                { label: 'Carbohidratos', value: plan.carbohidratos_g, unit: 'g', icon: Zap },
                { label: 'Grasas', value: plan.grasas_g, unit: 'g', icon: Droplet },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="w-5 h-5 text-primary/60" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-white">
                      {item.value ?? '—'}
                      <span className="text-xs font-bold text-zinc-600 ml-1">{item.unit}</span>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {plan.entrenador_id && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Creado por</p>
                <p className="text-base font-black text-white">
                  {(plan as any).entrenadores?.nombre || 'Entrenador'}
                </p>
                {(plan as any).entrenadores?.especialidad && (
                  <p className="text-xs font-bold text-primary/80">
                    {(plan as any).entrenadores.especialidad}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-zinc-600 font-bold uppercase">Fecha</p>
                <p className="text-sm font-bold text-white">
                  {plan.created_at ? new Date(plan.created_at).toLocaleDateString('es-CO') : '—'}
                </p>
              </div>
            </div>
          )}

          {plan.horario_comidas && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Horario de Comidas</h2>
              </div>
              <div className="space-y-3">
                {(typeof plan.horario_comidas === 'string'
                  ? JSON.parse(plan.horario_comidas)
                  : plan.horario_comidas || []
                ).map((item: any, idx: number) => (
                  <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white">{item.hora || item.nombre || `Comida ${idx + 1}`}</p>
                      {item.alimentos && (
                        <p className="text-xs text-zinc-400 mt-0.5">{item.alimentos}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.alimentos_recomendados && (
            <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Alimentos Recomendados
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{plan.alimentos_recomendados}</p>
            </div>
          )}

          {plan.alimentos_evitar && (
            <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-red-400">✗</span> Alimentos a Evitar
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{plan.alimentos_evitar}</p>
            </div>
          )}

          {plan.observaciones && (
            <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Observaciones
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{plan.observaciones}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Flame({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function Droplet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}

import { redirect } from 'next/navigation'
import { getPortalData } from '@/lib/supabase/actions/portal'
import Link from 'next/link'
import { ChevronLeft, User, Phone, Mail, MapPin, Heart, Shield } from 'lucide-react'
import PerfilClient from './PerfilClient'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const data = await getPortalData()
  if (!data) redirect('/login')

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Mi Perfil</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Información personal y contacto</p>
        </div>
      </header>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Datos Personales</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Nombre Completo</p>
              <p className="text-base font-black text-white">{data.nombre}</p>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Documento</p>
              <p className="text-base font-black text-white">{data.tipo_documento} {data.numero_documento}</p>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Fecha de Nacimiento</p>
              <p className="text-base font-black text-white">
                {data.fecha_nacimiento ? new Date(data.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-CO', {
                  year: 'numeric', month: 'long', day: 'numeric'
                }) : '—'}
              </p>
            </div>
            {data.genero && (
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Género</p>
                <p className="text-base font-black text-white capitalize">{data.genero}</p>
              </div>
            )}
          </div>
        </div>

        <PerfilClient cliente={data} />
      </div>
    </div>
  )
}

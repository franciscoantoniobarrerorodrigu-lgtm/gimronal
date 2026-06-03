'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Heart, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { updateClientProfile } from '@/lib/supabase/actions/portal'

interface PerfilClientProps {
  cliente: {
    telefono?: string | null
    email?: string | null
    direccion?: string | null
    ciudad?: string | null
    contacto_emergencia_nombre?: string | null
    contacto_emergencia_telefono?: string | null
  }
}

export default function PerfilClient({ cliente }: PerfilClientProps) {
  const [form, setForm] = useState({
    telefono: cliente.telefono || '',
    email: cliente.email || '',
    direccion: cliente.direccion || '',
    ciudad: cliente.ciudad || '',
    contacto_emergencia_nombre: cliente.contacto_emergencia_nombre || '',
    contacto_emergencia_telefono: cliente.contacto_emergencia_telefono || '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await updateClientProfile(form)
    if (res.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setErrorMsg(res.error || 'Error al actualizar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-black text-white uppercase tracking-wider">Editar Información</h2>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Phone className="w-3 h-3" /> Teléfono
          </label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Mail className="w-3 h-3" /> Correo Electrónico
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <MapPin className="w-3 h-3" /> Dirección
          </label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <MapPin className="w-3 h-3" /> Ciudad
          </label>
          <input
            type="text"
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="border-t border-white/5 pt-5 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" /> Contacto de Emergencia
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nombre</label>
            <input
              type="text"
              value={form.contacto_emergencia_nombre}
              onChange={(e) => setForm({ ...form, contacto_emergencia_nombre: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Teléfono de Emergencia</label>
            <input
              type="tel"
              value={form.contacto_emergencia_telefono}
              onChange={(e) => setForm({ ...form, contacto_emergencia_telefono: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Perfil actualizado correctamente
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
        >
          {status === 'loading' ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </form>
  )
}

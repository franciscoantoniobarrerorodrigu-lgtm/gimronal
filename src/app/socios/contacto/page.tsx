'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, MessageSquare, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { enviarMensajeContacto } from '@/lib/supabase/actions/portal'

const asuntos = [
  { value: 'consulta', label: 'Consulta General' },
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'problema', label: 'Reportar un Problema' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'renovacion', label: 'Renovación de Membresía' },
  { value: 'otro', label: 'Otro' },
]

export default function ContactoPage() {
  const router = useRouter()
  const [asunto, setAsunto] = useState('consulta')
  const [mensaje, setMensaje] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mensaje.trim()) return

    setStatus('loading')
    const res = await enviarMensajeContacto(asunto, mensaje.trim())
    if (res.success) {
      setStatus('success')
      setMensaje('')
      setTimeout(() => setStatus('idle'), 4000)
    } else {
      setStatus('error')
      setErrorMsg(res.error || 'Error al enviar el mensaje')
    }
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-2">
        <Link href="/socios" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">Contacto & Soporte</h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-bold text-primary/80">Estamos aquí para ayudarte</p>
        </div>
      </header>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Envíanos un Mensaje</h2>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-black text-white">¡Mensaje Enviado!</h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                Te contactaremos pronto. Mientras tanto, revisa tus notificaciones para más información.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Asunto</label>
                <select
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  {asuntos.map((a) => (
                    <option key={a.value} value={a.value} className="bg-zinc-900">{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Mensaje</label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-zinc-600"
                  required
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !mensaje.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Información de Contacto</h3>
            </div>
            <div className="space-y-3 text-sm text-zinc-400 font-bold">
              <p>Puedes contactarnos directamente en recepción para:</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Renovación de membresía
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Compra de productos en el gym
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Agendar valoración física con entrenador
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Solicitar plan nutricional personalizado
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Reportar inconvenientes con tu acceso
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 via-zinc-900 to-black border border-primary/20 rounded-[2rem] p-6 md:p-8 shadow-xl">
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Horario de Atención</h3>
            <p className="text-sm text-zinc-300 font-bold">
              Estaremos encantados de atenderte en nuestro horario de funcionamiento habitual.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle2, Loader2 } from 'lucide-react'
import { solicitarRenovacionMembresia } from '@/lib/supabase/actions/portal'

interface RenovarMembresiaButtonProps {
  compact?: boolean
}

export default function RenovarMembresiaButton({ compact = false }: RenovarMembresiaButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleRenovar() {
    setStatus('loading')
    const res = await solicitarRenovacionMembresia()
    if (res.success) {
      setStatus('success')
      setMessage(res.message || 'Solicitud enviada')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } else {
      setStatus('error')
      setMessage(res.error || 'Error al solicitar renovación')
    }
  }

  return (
    <div>
      <button
        onClick={handleRenovar}
        disabled={status === 'loading'}
        className={
          compact
            ? 'group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary px-4 text-sm font-black text-black shadow-lg shadow-primary/15 transition-all duration-300 hover:bg-primary/90 disabled:opacity-70'
            : 'group relative flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-4 text-left shadow-lg shadow-primary/5 transition-all duration-300 hover:bg-primary/20 md:p-5'
        }
      >
        {compact ? (
          <>
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {status === 'loading' ? 'Enviando...' : status === 'success' ? 'Solicitud enviada' : 'Solicitar renovación'}
          </>
        ) : (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/20 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-black">
                {status === 'loading' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <RefreshCw className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-base font-black leading-tight text-white">Renovar Membresía</h3>
                <p className="mt-0.5 break-words text-xs font-medium text-zinc-400">
                  {status === 'success'
                    ? 'Solicitud enviada exitosamente'
                    : status === 'error'
                      ? message
                      : 'Solicita la renovación de tu plan'}
                </p>
              </div>
            </div>
            <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:bg-white group-hover:text-black">
              <RefreshCw className="h-4 w-4" />
            </div>
          </>
        )}
      </button>

      {status === 'success' && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {message}
        </div>
      )}
    </div>
  )
}

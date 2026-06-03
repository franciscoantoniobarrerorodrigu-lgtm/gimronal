'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { inscribirClase, cancelarInscripcionClase } from '@/lib/supabase/actions/portal'

interface InscripcionClaseClientProps {
  claseId: string
  estaInscrito: boolean
  inscripcionId?: string
  cupoMaximo: number | null
  inscritosActuales: number
}

export default function InscripcionClaseClient({
  claseId,
  estaInscrito,
  inscripcionId,
  cupoMaximo,
  inscritosActuales,
}: InscripcionClaseClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleInscribir() {
    setLoading(true)
    setError('')
    const res = await inscribirClase(claseId)
    if (res.success) {
      router.refresh()
    } else {
      setError(res.error || 'Error al inscribirse')
    }
    setLoading(false)
  }

  async function handleCancelar() {
    if (!inscripcionId) return
    setLoading(true)
    setError('')
    const res = await cancelarInscripcionClase(inscripcionId)
    if (res.success) {
      router.refresh()
    } else {
      setError(res.error || 'Error al cancelar')
    }
    setLoading(false)
  }

  const cupoLleno = cupoMaximo != null && inscritosActuales >= cupoMaximo

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 mb-2">
        <Users className="w-3.5 h-3.5 text-primary" />
        <span>{inscritosActuales}{cupoMaximo ? ` / ${cupoMaximo}` : ''} inscritos</span>
        {cupoLleno && !estaInscrito && (
          <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider ml-1">(LLENO)</span>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-400 font-bold mb-2">{error}</p>
      )}

      {estaInscrito ? (
        <button
          onClick={handleCancelar}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-xs font-black text-red-400 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          Cancelar Inscripción
        </button>
      ) : (
        <button
          onClick={handleInscribir}
          disabled={loading || cupoLleno}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-xl text-xs font-black text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          {cupoLleno ? 'Sin cupo' : 'Inscribirme'}
        </button>
      )}
    </div>
  )
}

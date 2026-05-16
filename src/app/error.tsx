'use client'
 
import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Application Error:', error)
  }, [error])
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full glass-card p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
        
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">Algo salió mal</h2>
          <p className="text-sm text-zinc-400 font-medium">
            Ha ocurrido un error inesperado al procesar tu solicitud. 
            Hemos registrado el problema para solucionarlo.
          </p>
        </div>

        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-left overflow-auto max-h-32">
          <p className="text-[10px] text-red-400/80 font-mono break-words">
            {error.message || 'Error de procesamiento interno'}
          </p>
        </div>
 
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={() => reset()} 
            className="flex-1 bg-white text-black hover:bg-zinc-200"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300">
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

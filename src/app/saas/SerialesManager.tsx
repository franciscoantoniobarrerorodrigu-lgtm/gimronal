'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Key, Plus, Copy, Check, Hash, Calendar, ShieldCheck, Zap, Sparkles, Ban } from 'lucide-react'
import { createSerial, getSerials } from '@/lib/supabase/actions/licencias'
import { toast } from 'sonner'

export function SerialesManager() {
  const [serials, setSerials] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchSerials = async () => {
    setLoading(true)
    const result = await getSerials()
    if (result.success) {
      setSerials(result.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSerials()
  }, [])

  const handleCreateSerial = async (dias: number) => {
    setGenerating(dias)
    const result = await createSerial(dias)
    if (result.success) {
      toast.success(`Serial de ${dias} días generado con éxito`)
      fetchSerials()
    } else {
      toast.error('Error al generar serial: ' + result.error)
    }
    setGenerating(null)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Serial copiado al portapapeles')
  }

  return (
    <Card className="bg-card/30 backdrop-blur-md border-border/50 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Key className="w-32 h-32 rotate-12" />
      </div>

      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-7 relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Key className="w-6 h-6 text-blue-500" />
            </div>
            Gestión de Seriales
          </CardTitle>
          <CardDescription className="text-base">Genera códigos de activación de alta seguridad para las licencias.</CardDescription>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleCreateSerial(30)}
            disabled={generating !== null}
            className="bg-blue-500/5 border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all duration-300 font-bold"
          >
            {generating === 30 ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                30 DÍAS
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                + 30 DÍAS
              </div>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => handleCreateSerial(180)}
            disabled={generating !== null}
            className="bg-indigo-500/5 border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all duration-300 font-bold"
          >
            {generating === 180 ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                6 MESES
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                + 6 MESES
              </div>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => handleCreateSerial(365)}
            disabled={generating !== null}
            className="bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all duration-300 font-bold"
          >
            {generating === 365 ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                1 AÑO
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                + 1 AÑO
              </div>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-5">Serial de Activación</th>
                  <th className="px-6 py-5 text-center">Duración</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Destino</th>
                  <th className="px-6 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Sincronizando bóveda de seriales...</p>
                      </div>
                    </td>
                  </tr>
                ) : serials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      No se han generado seriales aún. Utiliza los botones superiores.
                    </td>
                  </tr>
                ) : (
                  serials.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.03] transition-colors group/row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Hash className="w-4 h-4 text-blue-500" />
                          </div>
                          <code className="font-mono text-base font-black tracking-wider text-blue-400">
                            {s.serial}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-zinc-300">{s.dias} Días</span>
                      </td>
                      <td className="px-6 py-4">
                        {s.usado ? (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-zinc-500 bg-zinc-500/10 px-2 py-1 rounded-md border border-zinc-500/20 w-fit">
                            <Ban className="w-3 h-3" />
                            Canjeado
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 w-fit">
                            <Check className="w-3 h-3" />
                            Disponible
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {s.gimnasios?.nombre ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="font-medium text-blue-100">{s.gimnasios.nombre}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!s.usado && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => copyToClipboard(s.serial, s.id)}
                            className="h-10 w-10 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20"
                          >
                            {copiedId === s.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

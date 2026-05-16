'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Info, 
  Lock 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCOP } from '@/lib/format-utils'

// --- MODAL: REGISTRAR MOVIMIENTO ---
interface RegistrarMovimientoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cajaId: string
  onSuccess: () => void
  registrarMovimiento: (mov: any) => Promise<any>
}

export const RegistrarMovimientoModal = ({ 
  open, 
  onOpenChange, 
  cajaId, 
  onSuccess,
  registrarMovimiento 
}: RegistrarMovimientoModalProps) => {
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('egreso')
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto || !concepto) return
    
    setLoading(true)
    const res = await registrarMovimiento({
      caja_id: cajaId,
      tipo,
      monto: Number(monto),
      concepto,
      metodo_pago: 'efectivo'
    })
    
    if (res.success) {
      onSuccess()
      onOpenChange(false)
      setMonto('')
      setConcepto('')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-zinc-800 p-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
        <div className={cn(
          "p-6 pb-2 bg-gradient-to-br transition-colors duration-500",
          tipo === 'ingreso' ? "from-emerald-500/10 to-transparent" : "from-rose-500/10 to-transparent"
        )}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-2">
              <div className={cn(
                "w-2 h-8 rounded-full",
                tipo === 'ingreso' ? "bg-emerald-600" : "bg-rose-600"
              )} />
              Registrar {tipo === 'ingreso' ? 'Entrada' : 'Salida'}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs font-medium uppercase tracking-widest ml-4">
              Movimientos manuales de efectivo
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('ingreso')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest",
                  tipo === 'ingreso' 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" 
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
                )}
              >
                <ArrowUpRight className="w-4 h-4" />
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setTipo('egreso')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest",
                  tipo === 'egreso' 
                    ? "bg-rose-500/10 border-rose-500/50 text-rose-500" 
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
                )}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Egreso
              </button>
            </div>

            <div className="space-y-2.5">
              <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Concepto / Descripción</Label>
              <Input 
                placeholder="Ej: Compra de papelería, Venta de agua..." 
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                required
                className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 focus:ring-orange-500/20 h-12 text-zinc-100"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Monto en Efectivo (COP)</Label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-700 group-focus-within:text-orange-500 transition-colors">$</span>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 focus:ring-orange-500/20 h-14 pl-10 text-2xl font-black text-zinc-100"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              className={cn(
                "w-full h-14 text-lg font-black uppercase italic tracking-tighter gap-2 transition-all",
                tipo === 'ingreso' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              )} 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (tipo === 'ingreso' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />)}
              Guardar Movimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- MODAL: CERRAR CAJA ---
interface CerrarCajaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cajaId: string
  onSuccess: () => void
  cerrarCaja: (id: string, monto: number, obs: string) => Promise<any>
  montoEsperado: number
}

export const CerrarCajaModal = ({ 
  open, 
  onOpenChange, 
  cajaId, 
  onSuccess,
  cerrarCaja,
  montoEsperado
}: CerrarCajaModalProps) => {
  const [loading, setLoading] = useState(false)
  const [montoReal, setMontoReal] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!montoReal) return
    
    setLoading(true)
    const res = await cerrarCaja(cajaId, Number(montoReal), observaciones)
    if (res.success) {
      onSuccess()
      onOpenChange(false)
    }
    setLoading(false)
  }

  const diferencia = Number(montoReal || 0) - montoEsperado

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-zinc-800 p-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
        <div className="p-6 pb-2 bg-gradient-to-br from-rose-500/10 to-transparent">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-2">
              <div className="w-2 h-8 bg-rose-600 rounded-full" />
              Cierre de Caja
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs font-medium uppercase tracking-widest ml-4">
              Finalizar turno y cuadrar efectivo
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
          <div className="space-y-6">
            {/* Info Box */}
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Saldo Esperado (Sistema)</p>
                <p className="text-xl font-black text-zinc-100">
                  {formatCOP(montoEsperado)}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Efectivo en Caja (Conteo Físico)</Label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-700 group-focus-within:text-rose-500 transition-colors">$</span>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={montoReal}
                  onChange={(e) => setMontoReal(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-800 focus:border-rose-500/50 focus:ring-rose-500/20 h-14 pl-10 text-2xl font-black text-zinc-100"
                />
              </div>
            </div>

            {montoReal && (
              <div className={cn(
                "p-4 rounded-2xl border flex items-center justify-between animate-in zoom-in duration-300",
                diferencia === 0 
                  ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-500" 
                  : "bg-rose-500/5 border-rose-500/30 text-rose-500"
              )}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Diferencia / Cuadre</p>
                  <p className="text-xl font-black">
                    {diferencia === 0 ? '¡CAJA CUADRADA!' : formatCOP(diferencia)}
                  </p>
                </div>
                <Info className="w-5 h-5 opacity-40" />
              </div>
            )}

            <div className="space-y-2.5">
              <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Observaciones</Label>
              <Textarea 
                placeholder="¿Alguna novedad con el dinero?" 
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-24 text-zinc-100"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-lg font-black uppercase italic tracking-tighter shadow-xl shadow-rose-900/20" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Lock className="w-6 h-6 mr-2" />}
              CONFIRMAR CIERRE FINAL
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

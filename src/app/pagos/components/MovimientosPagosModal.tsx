'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { 
  ArrowRightLeft, 
  Loader2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  User,
  Banknote,
  Search,
  Receipt,
  CreditCard
} from 'lucide-react'
import { getPagos } from '@/lib/supabase/actions/pagos'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCOP } from '@/lib/format-utils'

interface MovimientosPagosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MovimientosPagosModal({ open, onOpenChange }: MovimientosPagosModalProps) {
  const [loading, setLoading] = useState(true)
  const [pagos, setPagos] = useState<any[]>([])
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    if (open) {
      cargarPagos()
    }
  }, [open])

  const cargarPagos = async () => {
    setLoading(true)
    const data = await getPagos()
    setPagos(data)
    setLoading(false)
  }


  const pagosFiltrados = pagos.filter(p => 
    p.clientes?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.concepto?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.recibo_numero?.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-[#0a0a0a] border-primary/20 shadow-[0_0_50px_-12px_rgba(255,90,0,0.3)]">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/10 px-8 py-6 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2 tracking-tighter">
                <Receipt className="w-6 h-6" />
                HISTORIAL DE PAGOS
              </DialogTitle>
              <DialogDescription className="text-primary/60 font-medium">
                Auditoría detallada de membresías y recibos
              </DialogDescription>
            </div>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
            <Input 
              placeholder="Buscar por socio, concepto o recibo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="bg-black/40 border-primary/10 pl-10 h-11 rounded-xl text-primary focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Sincronizando recibos...</p>
            </div>
          ) : pagosFiltrados.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-primary/5 border border-primary/10">
                <Banknote className="w-10 h-10 text-primary/20" />
              </div>
              <div>
                <p className="text-lg font-black text-zinc-100 uppercase tracking-tight">Sin Registros</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">No se encontraron pagos con los criterios actuales</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pagosFiltrados.map((pago) => (
                <div 
                  key={pago.id}
                  className="group relative p-4 rounded-2xl bg-zinc-950/50 border border-zinc-900 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* ICONO METODO */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                      pago.metodo_pago === 'efectivo' 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                        : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                    )}>
                      {pago.metodo_pago === 'efectivo' ? <Banknote className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                    </div>

                    {/* INFO PRINCIPAL */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                          {pago.concepto}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {format(new Date(pago.fecha_pago), "dd MMM, hh:mm a", { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm font-black text-zinc-100 uppercase tracking-tight truncate">
                        {pago.clientes?.nombre || 'Cliente Desconocido'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-600" />
                          <span className="text-[10px] font-bold text-zinc-500">ID: {pago.clientes?.numero_documento}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[8px] h-4 border-zinc-800 text-zinc-500 uppercase px-1">
                            {pago.metodo_pago}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* MONTO */}
                    <div className="text-right">
                      <p className="text-lg font-black text-zinc-100 tracking-tighter">
                        {formatCOP(pago.monto)}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Total
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-950/80 border-t border-primary/10 flex justify-between items-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Auditoría de ingresos activada
          </p>
          <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] tracking-widest">
            GymControl Ledger
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}

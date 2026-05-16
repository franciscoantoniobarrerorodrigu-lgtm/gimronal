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
  Package,
  User,
  Banknote,
  Search
} from 'lucide-react'
import { getMovimientosInventario } from '@/lib/supabase/actions/inventario'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCOP } from '@/lib/format-utils'

interface MovimientosInventarioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MovimientosInventarioModal({ open, onOpenChange }: MovimientosInventarioModalProps) {
  const [loading, setLoading] = useState(true)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    if (open) {
      cargarMovimientos()
    }
  }, [open])

  const cargarMovimientos = async () => {
    setLoading(true)
    const res = await getMovimientosInventario()
    if (res.success) {
      setMovimientos(res.data || [])
    }
    setLoading(false)
  }


  const movimientosFiltrados = movimientos.filter(m => 
    m.productos?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    m.concepto?.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-[#0a0a0a] border-primary/20 shadow-[0_0_50px_-12px_rgba(255,90,0,0.3)]">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/10 px-8 py-6 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2 tracking-tighter">
                <ArrowRightLeft className="w-6 h-6" />
                HISTORIAL DE MOVIMIENTOS
              </DialogTitle>
              <DialogDescription className="text-primary/60 font-medium">
                Seguimiento de ventas y cambios en el stock
              </DialogDescription>
            </div>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
            <Input 
              placeholder="Filtrar por producto o concepto..."
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
              <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Cargando movimientos...</p>
            </div>
          ) : movimientosFiltrados.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 rounded-full bg-primary/5 border border-primary/10">
                <Package className="w-10 h-10 text-primary/20" />
              </div>
              <div>
                <p className="text-lg font-black text-zinc-100 uppercase tracking-tight">Sin Movimientos</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">No se han registrado ventas recientemente</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {movimientosFiltrados.map((mov) => (
                <div 
                  key={mov.id}
                  className="group relative p-4 rounded-2xl bg-zinc-950/50 border border-zinc-900 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* ICONO TIPO */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                      <ArrowDownCircle className="w-6 h-6" />
                    </div>

                    {/* INFO PRINCIPAL */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">VENTA DE PRODUCTO</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {format(new Date(mov.created_at), "dd MMM, hh:mm a", { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm font-black text-zinc-100 uppercase tracking-tight truncate">
                        {mov.productos?.nombre || 'Producto Eliminado'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-zinc-600" />
                          <span className="text-[10px] font-bold text-zinc-500">CANTIDAD: {mov.cantidad}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Banknote className="w-3 h-3 text-emerald-600/50" />
                          <span className="text-[10px] font-bold text-emerald-600/70 uppercase">{mov.metodo_pago}</span>
                        </div>
                      </div>
                    </div>

                    {/* MONTO */}
                    <div className="text-right">
                      <p className="text-lg font-black text-zinc-100 tracking-tighter">
                        {formatCOP(mov.total)}
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
            Mostrando los últimos {movimientosFiltrados.length} registros
          </p>
          <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] tracking-widest">
            GymControl Ledger
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}

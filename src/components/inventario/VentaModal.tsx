'use client'

import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, Loader2, Banknote, Check, X, Package, Wallet, User, Search, Receipt } from 'lucide-react'
import { registrarVenta } from '@/lib/supabase/actions/inventario'
import { showPremiumToast } from '@/lib/notifications'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { getClientes } from '@/lib/supabase/actions/clientes'
import { Badge } from '@/components/ui/badge'

interface VentaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: any
  onSuccess: () => void
}

export function VentaModal({ open, onOpenChange, producto, onSuccess }: VentaModalProps) {
  const [cantidad, setCantidad] = useState<number | string>(1)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [montoRecibido, setMontoRecibido] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [clienteQuery, setClienteQuery] = useState('')
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null)
  const [showClienteResults, setShowClienteResults] = useState(false)

  const cantidadNum = Number(cantidad) || 0
  const subtotal = (producto?.precio_venta || 0) * cantidadNum
  
  // IVA calculation
  const aplicaIva = producto?.aplica_iva !== false
  const ivaPorcentaje = aplicaIva ? (Number(producto?.iva_porcentaje) || 19) : 0
  const ivaMonto = aplicaIva ? Math.round(subtotal * (ivaPorcentaje / 100)) : 0
  const total = subtotal + ivaMonto

  const montoRecibidoNum = Number(montoRecibido.replace(/\D/g, '')) || 0

  const cambio = useMemo(() => {
    return Math.max(0, montoRecibidoNum - total)
  }, [montoRecibidoNum, total])

  const cargarClientes = async () => {
    setLoadingClientes(true)
    const res = await getClientes()
    if (res.success) setClientes(res.data || [])
    setLoadingClientes(false)
  }

  React.useEffect(() => {
    if (open) {
      cargarClientes()
      setSelectedCliente(null)
      setClienteQuery('')
      setMontoRecibido('')
      setCantidad(1)
    }
  }, [open])

  const filteredClientes = useMemo(() => {
    if (!clienteQuery.trim()) return []
    const q = clienteQuery.toLowerCase()
    return clientes.filter(c => 
      c.nombre?.toLowerCase().includes(q) || 
      c.numero_documento?.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [clienteQuery, clientes])

  if (!producto) return null

  const handleVenta = async () => {
    if (cantidadNum > producto.stock) {
      return showPremiumToast.error('Stock Insuficiente', 'No hay suficiente stock disponible')
    }
    if (cantidadNum <= 0) {
      return showPremiumToast.error('Cantidad Inválida', 'La cantidad debe ser mayor a 0')
    }

    setLoading(true)
    try {
      const res = await registrarVenta({
        producto_id: producto.id,
        cantidad: cantidadNum,
        precio_unitario: producto.precio_venta,
        total,
        metodo_pago: metodoPago,
        concepto: `Venta de ${producto.nombre} x${cantidadNum}`,
        cliente_id: selectedCliente?.id,
        monto_pagado: montoRecibidoNum > 0 ? montoRecibidoNum : total
      })

      if (res.success) {
        showPremiumToast.success('Venta Exitosa', 'El producto ha sido vendido y el inventario actualizado.')
        onSuccess()
        onOpenChange(false)
      } else {
        showPremiumToast.error('Error en Venta', res.error)
      }
    } catch (err) {
      showPremiumToast.error('Fallo de Sistema', 'No se pudo procesar la venta en este momento.')
    } finally {
      setLoading(false)
    }
  }

  const handlePartialPayment = async () => {
    if (!selectedCliente) {
      return showPremiumToast.error('Cliente Requerido', 'Debe seleccionar un cliente para enviar a mora')
    }
    await handleVenta()
  }

  const faltante = montoRecibidoNum > 0 && montoRecibidoNum < total

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-[#0a0a0a] border-primary/20 shadow-[0_0_50px_-12px_rgba(255,90,0,0.3)]">
        <div className="bg-gradient-to-r from-primary/20 to-accent/10 px-6 py-4 border-b border-primary/10">
          <DialogTitle className="text-xl font-black text-primary flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            REGISTRAR VENTA
          </DialogTitle>
          <DialogDescription className="text-primary/60 font-medium">
            Venta rápida de inventario
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          {/* PRODUCTO INFO */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-zinc-100 uppercase tracking-tight">{producto.nombre}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Stock: {producto.stock} uds</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-[10px] font-bold text-primary uppercase">Unidad: ${producto.precio_venta?.toLocaleString('de-DE')}</span>
                {aplicaIva && <span className="w-1 h-1 rounded-full bg-zinc-700"></span>}
                {aplicaIva && <span className="text-[10px] font-bold text-amber-500 uppercase">+IVA {ivaPorcentaje}%</span>}
              </div>
            </div>
          </div>

          {/* SELECCIONAR CLIENTE */}
          <div className="space-y-2">
            <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-3 h-3" /> Asociar Cliente (Opcional para Mora)
            </Label>
            
            {selectedCliente ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                  {selectedCliente.nombre?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-zinc-100">{selectedCliente.nombre}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedCliente.numero_documento}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedCliente(null)}
                  className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                <Input 
                  placeholder="Buscar cliente para deuda..." 
                  className="pl-10 h-10 bg-zinc-950 border-zinc-800 rounded-xl text-sm"
                  value={clienteQuery}
                  onChange={(e) => {
                    setClienteQuery(e.target.value)
                    setShowClienteResults(true)
                  }}
                  onFocus={() => setShowClienteResults(true)}
                />
                
                {showClienteResults && clienteQuery.trim() && (
                  <div className="absolute z-50 w-full mt-1 max-h-[150px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                    {filteredClientes.length === 0 ? (
                      <div className="px-4 py-3 text-[10px] text-muted-foreground text-center">No encontrado</div>
                    ) : (
                      filteredClientes.map(c => (
                        <button
                          key={c.id}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-primary/10 border-b border-zinc-900 last:border-0"
                          onClick={() => {
                            setSelectedCliente(c)
                            setClienteQuery('')
                            setShowClienteResults(false)
                          }}
                        >
                          <span className="text-xs font-bold text-zinc-200">{c.nombre}</span>
                          <Badge variant="outline" className="ml-auto text-[8px] h-4">{c.numero_documento}</Badge>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CANTIDAD */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Cantidad</Label>
              <Input
                type="number"
                min={1}
                max={producto.stock}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-12 bg-zinc-950 border-zinc-800 rounded-xl focus:ring-primary/20 text-lg font-black text-primary"
              />
            </div>

            {/* MÉTODO */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Medio de Pago</Label>
              <Select value={metodoPago} onValueChange={(val) => setMetodoPago(val || '')}>
                <SelectTrigger className="h-12 bg-zinc-950 border-zinc-800 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                  <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                  <SelectItem value="nequi">🟣 Nequi</SelectItem>
                  <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TOTAL Y CAMBIO */}
          <div className={cn(
            "p-5 rounded-2xl border transition-all duration-500",
            metodoPago === 'efectivo' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-primary/5 border-primary/10"
          )}>
            <div className="flex flex-col gap-4">
              {/* Subtotal y IVA Desglose */}
              {aplicaIva && cantidadNum > 0 && (
                <div className="space-y-1.5 pb-3 border-b border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subtotal</span>
                    <span className="text-sm font-bold text-zinc-300">$ {subtotal.toLocaleString('de-DE')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <Receipt className="w-3 h-3" /> IVA {ivaPorcentaje}%
                    </span>
                    <span className="text-sm font-bold text-amber-500">$ {ivaMonto.toLocaleString('de-DE')}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total a Pagar</p>
                  <p className="text-3xl font-black text-primary">$ {total.toLocaleString('de-DE')}</p>
                </div>

                {metodoPago === 'efectivo' && (
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recibido</p>
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
                      <Input 
                        type="text"
                        value={montoRecibido === '' ? '' : Number(montoRecibido.replace(/\D/g, '')).toLocaleString('de-DE')}
                        onChange={(e) => setMontoRecibido(e.target.value.replace(/\D/g, ''))}
                        className="w-32 h-10 bg-emerald-500/10 border-emerald-500/30 text-right pr-8 text-lg font-black text-emerald-500 rounded-lg focus:ring-emerald-500/20"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ALERTA DE CAMBIO / FALTANTE */}
              {metodoPago === 'efectivo' && montoRecibidoNum > 0 && (
                <div className={cn(
                  "p-3 rounded-xl flex justify-between items-center animate-in zoom-in-95 duration-300",
                  faltante ? "bg-destructive/20 border border-destructive/30" : "bg-emerald-500 border border-emerald-400"
                )}>
                  <div className="flex items-center gap-2">
                    {faltante ? <X className="w-4 h-4 text-destructive" /> : <Check className="w-4 h-4 text-white" />}
                    <p className={cn("text-xs font-black uppercase", faltante ? "text-destructive" : "text-white")}>
                      {faltante ? "Saldo Pendiente" : "Entregar Cambio"}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <p className={cn("text-lg font-black", faltante ? "text-destructive" : "text-white")}>
                      $ {faltante ? (total - montoRecibidoNum).toLocaleString('de-DE') : cambio.toLocaleString('de-DE')}
                    </p>
                    
                    {faltante && selectedCliente && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={handlePartialPayment}
                        className="h-7 px-3 text-[10px] font-black uppercase mt-1 bg-white text-destructive hover:bg-white/90"
                      >
                        Enviar a Mora
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-xl">
            Cancelar
          </Button>
          <Button 
            onClick={handleVenta} 
            disabled={loading || producto.stock <= 0 || (metodoPago === 'efectivo' && faltante && !selectedCliente)} 
            className={cn(
              "flex-1 h-12 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_-5px_rgba(255,90,0,0.5)]",
              (metodoPago === 'efectivo' && faltante && !selectedCliente) ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none" : "bg-primary hover:bg-primary/90"
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingCart className="w-4 h-4 mr-2" /> Confirmar Venta</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

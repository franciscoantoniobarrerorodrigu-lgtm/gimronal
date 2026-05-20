'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registrarPago } from '@/lib/supabase/actions/pagos'
import { getClientes } from '@/lib/supabase/actions/clientes'
import { getPlanes } from '@/lib/supabase/actions/planes'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import { showPremiumToast } from '@/lib/notifications'
import { Loader2, Search, Check, X, User, CreditCard, Banknote, Tag, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasPendingDebt } from '@/lib/supabase/actions/mora'
import { AlertCircle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const pagoSchema = z.object({
  cliente_id: z.string().min(1, 'Debe seleccionar un cliente'),
  monto: z.coerce.number().min(1, 'El monto debe ser mayor a 0'),
  metodo_pago: z.string().min(1, 'Debe seleccionar un método'),
  concepto: z.string().min(1, 'El concepto es requerido'),
  generar_factura: z.boolean().optional().default(false),
})

type PagoFormValues = z.infer<typeof pagoSchema>

interface PagoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PagoFormModal({ open, onOpenChange, onSuccess }: PagoFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [planes, setPlanes] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [moduloDianActivo, setModuloDianActivo] = useState(false)

  // --- Estado del buscador de clientes ---
  const [clienteQuery, setClienteQuery] = useState('')
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null)
  const [showClienteResults, setShowClienteResults] = useState(false)
  
  // --- Estado para el cálculo de cambio ---
  const [montoRecibido, setMontoRecibido] = useState<string>('')
  const [clienteTieneDeuda, setClienteTieneDeuda] = useState(false)
  const [checkingDebt, setCheckingDebt] = useState(false)

  const form = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema) as any,
    defaultValues: {
      cliente_id: '',
      monto: 0,
      metodo_pago: 'efectivo',
      concepto: '',
      generar_factura: false,
    }
  })

  const currentMonto = form.watch('monto')
  const currentMetodo = form.watch('metodo_pago')
  const currentConcepto = form.watch('concepto')

  useEffect(() => {
    if (open) {
      form.reset({
        cliente_id: '',
        monto: 0,
        metodo_pago: 'efectivo',
        concepto: '',
        generar_factura: false,
      })
      setClienteQuery('')
      setSelectedCliente(null)
      setShowClienteResults(false)
      setMontoRecibido('')
      setClienteTieneDeuda(false)
      setCheckingDebt(false)
      cargarDatos()
    }
  }, [open, form])

  const cargarDatos = async () => {
    setLoadingData(true)
    try {
      const [clientesRes, planesData, gymData] = await Promise.all([
        getClientes(),
        getPlanes(),
        getGimnasio()
      ])
      const clientesData = clientesRes.success && clientesRes.data ? clientesRes.data : []
      setClientes(clientesData)
      setPlanes(planesData)
      setModuloDianActivo(gymData?.modulo_dian_activo || false)
    } catch (error) {
      console.error(error)
      showPremiumToast.error('Error de Carga', 'No se pudieron sincronizar los planes o clientes. Por favor reintente.')
    } finally {
      setLoadingData(false)
    }
  }

  const filteredClientes = useMemo(() => {
    if (!clienteQuery.trim()) return []
    const q = clienteQuery.toLowerCase()
    return clientes.filter(c => 
      c.nombre?.toLowerCase().includes(q) || 
      c.numero_documento?.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [clienteQuery, clientes])

  const handleSelectCliente = (cliente: any) => {
    setSelectedCliente(cliente)
    setClienteQuery('')
    setShowClienteResults(false)
    form.setValue('cliente_id', cliente.id)
    
    // Auto-selección inteligente: Si el cliente tiene un plan activo, sugerirlo
    if (cliente.plan && cliente.plan !== 'Sin Plan') {
      const planEncontrado = planes.find(p => p.nombre === cliente.plan)
      if (planEncontrado) {
        handleConceptoChange(planEncontrado.nombre)
      }
    }

    // Verificar deuda proactivamente
    verificarDeuda(cliente.id)
  }

  const verificarDeuda = async (id: string) => {
    setCheckingDebt(true)
    try {
      const tieneDeuda = await hasPendingDebt(id)
      setClienteTieneDeuda(tieneDeuda)
    } catch (error) {
      console.error('Error verificando deuda:', error)
    } finally {
      setCheckingDebt(false)
    }
  }

  const handleClearCliente = () => {
    setSelectedCliente(null)
    setClienteQuery('')
    setClienteTieneDeuda(false)
    form.setValue('cliente_id', '')
  }

  const handleConceptoChange = (val: string) => {
    form.setValue('concepto', val)
    const plan = planes.find(p => p.nombre === val)
    if (plan) {
      form.setValue('monto', plan.precio)
    }
  }

  const handlePartialPayment = async () => {
    const recibido = Number(montoRecibido)
    if (recibido <= 0) {
      showPremiumToast.error('Monto Inválido', 'El monto recibido para el pago parcial debe ser superior a cero.')
      return
    }

    const values = form.getValues()
    setIsSubmitting(true)
    try {
      const result = await registrarPago({
        ...values,
        monto: recibido
      })
      if (result.success) {
        showPremiumToast.success('Pago Parcial Registrado', 'Se ha registrado el abono. El saldo pendiente ha sido enviado a Mora.')
        onSuccess()
        onOpenChange(false)
      } else {
        showPremiumToast.error('Fallo en Registro', result.error)
      }
    } catch (error) {
      console.error(error)
      showPremiumToast.error('Error Crítico', 'Hubo un problema inesperado al intentar registrar el pago parcial.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (values: PagoFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await registrarPago(values)
      if (result.success) {
        showPremiumToast.success('Pago Procesado', 'El pago ha sido registrado exitosamente y la membresía del socio ha sido actualizada.')
        onSuccess()
        onOpenChange(false)
      } else {
        showPremiumToast.error('No se pudo procesar', result.error)
      }
    } catch (error) {
      console.error(error)
      showPremiumToast.error('Error de Sistema', 'Ocurrió un error inesperado al finalizar el proceso de facturación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cambio = useMemo(() => {
    const recibido = parseFloat(montoRecibido) || 0
    return Math.max(0, recibido - currentMonto)
  }, [montoRecibido, currentMonto])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#0a0a0a] border-primary/20 shadow-[0_0_50px_-12px_rgba(255,90,0,0.3)] max-h-[95vh] flex flex-col">
        <div className="bg-gradient-to-r from-primary/20 to-accent/10 px-6 py-4 border-b border-primary/10">
          <DialogTitle className="text-xl font-black text-primary flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            REGISTRAR PAGO
          </DialogTitle>
          <DialogDescription className="text-primary/60 font-medium">
            Facturación rápida para socios
          </DialogDescription>
        </div>

        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Sincronizando base de datos...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="pago-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
              
              {/* BUSCADOR PREMIUM */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  Socio Beneficiario
                  {form.formState.errors.cliente_id && <span className="text-[10px] text-destructive lowercase">({form.formState.errors.cliente_id.message})</span>}
                </Label>
                
                {selectedCliente ? (
                  <div className="group relative flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 hover:border-primary/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {selectedCliente.nombre?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold line-clamp-1 text-zinc-100">{selectedCliente.nombre}</p>
                      <p className="text-[10px] font-medium text-muted-foreground">ID: {selectedCliente.numero_documento}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleClearCliente}
                      className="p-1.5 rounded-full bg-zinc-900/50 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <Input 
                      placeholder="Escribe nombre o documento..." 
                      className="pl-10 h-12 bg-zinc-950 border-zinc-800 rounded-xl focus:ring-primary/20 focus:border-primary/40 text-sm"
                      value={clienteQuery}
                      onChange={(e) => {
                        setClienteQuery(e.target.value)
                        setShowClienteResults(true)
                      }}
                      onFocus={() => {
                        if (clienteQuery.trim()) setShowClienteResults(true)
                      }}
                      autoComplete="off"
                    />
                    
                    {showClienteResults && clienteQuery.trim() && (
                      <div className="absolute z-50 w-full mt-2 max-h-[250px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2">
                        {filteredClientes.length === 0 ? (
                          <div className="px-4 py-6 text-xs text-muted-foreground text-center font-medium italic">
                            No se encontraron coincidencias
                          </div>
                        ) : (
                          filteredClientes.map(cliente => (
                            <button
                              key={cliente.id}
                              type="button"
                              className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-primary/5 transition-all border-b border-zinc-900 last:border-0"
                              onClick={() => handleSelectCliente(cliente)}
                            >
                              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                {cliente.nombre?.[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-200 truncate">{cliente.nombre}</p>
                                <p className="text-[10px] text-zinc-500 font-medium">Doc: {cliente.numero_documento}</p>
                              </div>
                              {cliente.plan && (
                                <Badge className="ml-auto text-[8px] bg-primary/10 text-primary border-none">
                                  {cliente.plan}
                                </Badge>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ALERTA DE DEUDA */}
                {selectedCliente && (checkingDebt || clienteTieneDeuda) && (
                  <div className={cn(
                    "p-3 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                    checkingDebt ? "bg-zinc-900 border-zinc-800" : "bg-destructive/10 border-destructive/20"
                  )}>
                    {checkingDebt ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verificando historial financiero...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-destructive uppercase tracking-tighter">Socio en Mora</p>
                          <p className="text-[11px] font-medium text-destructive/80 leading-tight">
                            Este socio tiene una deuda pendiente. <span className="font-bold">El sistema bloqueará la creación de membresías</span> hasta que se ponga al día.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CONCEPTO */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3 h-3 text-primary" /> Concepto
                  </Label>
                  <Select value={form.watch('concepto')} onValueChange={(val) => handleConceptoChange(val || '')}>
                    <SelectTrigger className="h-11 bg-zinc-950 border-zinc-800 rounded-xl">
                      <SelectValue placeholder="¿Qué está pagando?" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 w-[var(--radix-select-trigger-width)]">
                      {planes.map(plan => (
                        <SelectItem key={plan.id} value={plan.nombre} className="focus:bg-primary/10 py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-bold text-sm text-zinc-100">{plan.nombre}</span>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-tighter">
                                {plan.duracion_dias} {plan.duracion_dias === 1 ? 'Día' : 'Días'}
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-500 font-black">
                              $ {plan.precio?.toLocaleString('de-DE')}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCliente && !currentConcepto && (
                    <p className="text-[10px] font-bold text-amber-500 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> Debes seleccionar un plan para continuar
                    </p>
                  )}
                </div>
  
                {/* MÉTODO */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Banknote className="w-3 h-3 text-primary" /> Medio de Pago
                  </Label>
                  <Select value={form.watch('metodo_pago')} onValueChange={(val) => form.setValue('metodo_pago', val || '')}>
                    <SelectTrigger className="h-11 bg-zinc-950 border-zinc-800 rounded-xl">
                      <SelectValue placeholder="Medio" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      <SelectItem value="efectivo" className="focus:bg-primary/10">💵 Efectivo</SelectItem>
                      <SelectItem value="nequi" className="focus:bg-primary/10">🟣 Nequi</SelectItem>
                      <SelectItem value="daviplata" className="focus:bg-primary/10">🔴 Daviplata</SelectItem>
                      <SelectItem value="transferencia" className="focus:bg-primary/10">🏦 Transferencia</SelectItem>
                      <SelectItem value="tarjeta" className="focus:bg-primary/10">💳 Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
  
              {/* FACTURACION ELECTRONICA */}
              <div className={cn("flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50", !moduloDianActivo && "opacity-50 grayscale")}>
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    Factura Electrónica DIAN
                    {moduloDianActivo && currentMonto >= 235325 && (
                      <Badge className="bg-primary/20 text-primary border-none text-[9px] uppercase">Obligatoria</Badge>
                    )}
                    {!moduloDianActivo && (
                      <Badge variant="outline" className="text-[9px] uppercase border-zinc-700 text-zinc-500">Módulo Inactivo</Badge>
                    )}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {moduloDianActivo 
                      ? "Generar factura con CUFE y enviarla a Factus." 
                      : "Debes adquirir el módulo DIAN para usar esto."}
                  </p>
                </div>
                <Switch 
                  checked={moduloDianActivo ? (currentMonto >= 235325 ? true : form.watch('generar_factura')) : false}
                  onCheckedChange={(val) => moduloDianActivo && form.setValue('generar_factura', val)}
                  disabled={!moduloDianActivo || currentMonto >= 235325}
                />
              </div>

              {/* MONTO Y CAMBIO */}
              <div className={cn(
                "p-4 rounded-2xl transition-all duration-500 border",
                currentMetodo === 'efectivo' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-primary/5 border-primary/10"
              )}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex justify-between">
                      Total a Pagar
                      {form.watch('concepto') !== '' && (
                        <span className="text-[9px] text-primary/50 lowercase font-medium">(Precio de Plan)</span>
                      )}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
                      <Input 
                        type="text"
                        readOnly={true}
                        value={currentMonto === 0 ? '' : currentMonto.toLocaleString('de-DE')}
                        className={cn(
                          "pl-8 h-14 border-none text-2xl font-black rounded-xl transition-all",
                          "bg-zinc-950 text-primary/80 cursor-not-allowed"
                        )}
                        placeholder="0"
                      />
                    </div>
                  </div>
  
                  {currentMetodo === 'efectivo' && (
                    <div className="space-y-2 animate-in zoom-in-95 duration-300">
                      <Label className="text-xs font-black text-emerald-500 uppercase tracking-widest flex justify-between">
                        Efectivo Recibido
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">$</span>
                        <Input 
                          type="text" 
                          value={montoRecibido === '' ? '' : Number(montoRecibido.replace(/\D/g, '')).toLocaleString('de-DE')}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '')
                            setMontoRecibido(val)
                          }}
                          className="pl-8 h-14 bg-emerald-500/10 border-emerald-500/30 text-2xl font-black text-emerald-500 placeholder:text-emerald-500/20 rounded-xl focus:ring-2 ring-emerald-500/20" 
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
  
                {/* VISUALIZACIÓN DE CAMBIO PREMIUM */}
                {currentMetodo === 'efectivo' && Number(montoRecibido) > 0 && (
                  <>
                    {/* CASO: SOBRA DINERO (CAMBIO) */}
                    {Number(montoRecibido) > currentMonto && (
                      <div className="mt-4 p-4 rounded-xl bg-emerald-500 border border-emerald-400 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] animate-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <Banknote className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white/70 uppercase tracking-tighter">Entregar Cambio</p>
                              <p className="text-2xl font-black text-white line-clamp-1">
                                $ {cambio.toLocaleString('de-DE')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase">
                              <Check className="w-3 h-3" /> Dinero Seguro
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
  
                    {/* CASO: FALTA DINERO (ALERTA ROJA) */}
                    {Number(montoRecibido) < currentMonto && (
                      <div className="mt-4 p-4 rounded-xl bg-destructive border border-destructive/50 shadow-[0_10px_30px_-10px_rgba(239,68,68,0.5)] animate-in shake-in duration-300">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <X className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white/70 uppercase tracking-tighter">Dinero Insuficiente</p>
                              <p className="text-2xl font-black text-white line-clamp-1">
                                Faltan $ {(currentMonto - Number(montoRecibido)).toLocaleString('de-DE')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col gap-2">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase self-end">
                              Dinero Insuficiente
                            </div>
                            <Button 
                              type="button"
                              onClick={handlePartialPayment}
                              disabled={isSubmitting || Number(montoRecibido) <= 0}
                              className="bg-white text-destructive hover:bg-white/90 font-black text-[10px] uppercase h-8 px-3 rounded-lg shadow-lg"
                            >
                              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enviar a Mora'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
  
          <DialogFooter className="p-6 border-t border-primary/10 bg-zinc-950/50 gap-3 flex-row items-center">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="rounded-xl hover:bg-zinc-900"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              form="pago-form"
              disabled={isSubmitting || checkingDebt || clienteTieneDeuda || !currentConcepto || currentMonto <= 0 || (currentMetodo === 'efectivo' && Number(montoRecibido) < currentMonto)} 
              className={cn(
                "flex-1 h-12 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all",
                (isSubmitting || checkingDebt || clienteTieneDeuda || !currentConcepto || currentMonto <= 0 || (currentMetodo === 'efectivo' && Number(montoRecibido) < currentMonto))
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 shadow-[0_4px_20px_-5px_rgba(255,90,0,0.5)] hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Finalizar Registro <Check className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

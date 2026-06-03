'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Lock, 
  TrendingUp,
  Dumbbell,
  Unlock,
  Calendar,
  Clock,
  RefreshCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  getCajaActiva, 
  getMovimientosCaja, 
  getHistorialCajas,
  abrirCaja,
  registrarMovimientoCaja,
  cerrarCaja
} from '@/lib/supabase/actions/caja'
import { RegistrarMovimientoModal, CerrarCajaModal } from './components/CajaModals'
import { showPremiumToast } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Printer } from 'lucide-react'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import { generateReportPDF, generateClosurePDF } from '@/lib/pdf-utils'
import { formatCOP } from '@/lib/format-utils'
import { getColombiaDateString, formatInColombiaTime } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export default function CajaPage() {
  const [cajaActiva, setCajaActiva] = useState<any>(null)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [historial, setHistorial] = useState<any[]>([])
  const [gimnasio, setGimnasio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [montoApertura, setMontoApertura] = useState('')
  const [isOpening, setIsOpening] = useState(false)
  const [isMovModalOpen, setIsMovModalOpen] = useState(false)
  const [isCierreModalOpen, setIsCierreModalOpen] = useState(false)

  // Paginación para historial
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(historial.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHistorial = historial.slice(startIndex, startIndex + itemsPerPage)

  const fetchData = async () => {
    setLoading(true)
    try {
      const active = await getCajaActiva()
      setCajaActiva(active)
      
      if (active) {
        const movs = await getMovimientosCaja(active.id)
        setMovimientos(movs)
      }
      
      const hist = await getHistorialCajas()
      setHistorial(hist)
      setCurrentPage(1)

      const gym = await getGimnasio()
      setGimnasio(gym)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])


  const handleAbrirCaja = async () => {
    if (!montoApertura) return showPremiumToast.error('Monto Requerido', 'Ingresa un monto de apertura')
    setIsOpening(true)
    const res = await abrirCaja(Number(montoApertura))
    if (res.success) {
      showPremiumToast.success('Caja abierta correctamente')
      fetchData()
    } else {
      showPremiumToast.error('Error al abrir caja', res.error || 'Ocurrió un problema inesperado')
    }
    setIsOpening(false)
  }

  const stats = useMemo(() => {
    if (!movimientos) return { ingresos: 0, egresos: 0, saldo: 0 }
    
    const ingresos = movimientos
      .filter(m => m.tipo === 'ingreso' && m.metodo_pago === 'efectivo')
      .reduce((acc, curr) => acc + Number(curr.monto), 0)
    
    const egresos = movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((acc, curr) => acc + Number(curr.monto), 0)
    
    const base = Number(cajaActiva?.monto_apertura || 0)
    
    return {
      ingresos,
      egresos,
      saldo: base + ingresos - egresos
    }
  }, [movimientos, cajaActiva])

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 pb-20 animate-in-fade">
        <SectionHeader 
          title="Módulo de Caja" 
          subtitle="Control total de ingresos, egresos y cierres de caja diarios."
        >
          {cajaActiva && (
            <Button 
              variant="outline" 
              className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10" 
              onClick={() => setIsCierreModalOpen(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Cerrar Caja
            </Button>
          )}
        </SectionHeader>

        {loading ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl bg-zinc-800/50" />)}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-48 lg:col-span-1 rounded-xl bg-zinc-800/50" />
              <Skeleton className="h-[400px] lg:col-span-2 rounded-xl bg-zinc-800/50" />
            </div>
          </div>
        ) : !cajaActiva ? (
          /* VISTA CAJA CERRADA - FORMULARIO DE APERTURA */
          <div className="max-w-md mx-auto py-12 animate-in zoom-in duration-500">
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
              <div className="p-10 text-center relative z-10">
                <div className="mx-auto w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-primary/10 border border-primary/20">
                  <Unlock className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground mb-2">Apertura de Caja</h2>
                <p className="text-zinc-400 font-medium leading-relaxed">Inicia la jornada registrando el fondo base disponible en efectivo.</p>
                
                <div className="mt-10 space-y-6">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Fondo Inicial (COP)</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-colors rounded-full" />
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary/60 text-2xl">$</span>
                        <input 
                          type="number" 
                          className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 pl-12 text-3xl font-black text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-800"
                          placeholder="0"
                          value={montoApertura}
                          onChange={(e) => setMontoApertura(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-16 text-lg font-black uppercase tracking-widest gap-3 rounded-2xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isOpening}
                    onClick={handleAbrirCaja}
                  >
                    {isOpening ? <RefreshCcw className="animate-spin w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                    Abrir Caja Hoy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA CAJA ABIERTA */
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI CARDS */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-12 h-12 text-primary" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">Base Apertura</p>
                <div className="text-2xl font-black text-white">{formatCOP(cajaActiva.monto_apertura)}</div>
              </div>
              
              <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ArrowUpRight className="w-12 h-12 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-3">Ingresos Hoy</p>
                <div className="text-2xl font-black text-emerald-500">{formatCOP(stats.ingresos)}</div>
              </div>

              <div className="bg-rose-500/5 backdrop-blur-xl border border-rose-500/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ArrowDownLeft className="w-12 h-12 text-rose-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60 mb-3">Egresos / Gastos</p>
                <div className="text-2xl font-black text-rose-500">{formatCOP(stats.egresos)}</div>
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[2rem] p-6 shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                  <Wallet className="w-12 h-12 text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-3">Saldo Efectivo</p>
                <div className="text-3xl font-black text-white leading-none">{formatCOP(stats.saldo)}</div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* ACCIONES RÁPIDAS */}
              <Card className="lg:col-span-1 glass-card border-white/5">
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-bold italic tracking-tight">ACCIONES RÁPIDAS</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <Button className="w-full justify-start gap-3 bg-emerald-600 hover:bg-emerald-700 h-11" onClick={() => setIsMovModalOpen(true)}>
                    <Plus className="w-5 h-5" />
                    Registrar Movimiento
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 border-zinc-800" onClick={() => {
                    generateClosurePDF(cajaActiva, movimientos, gimnasio)
                  }}>
                    <Printer className="w-5 h-5 text-muted-foreground" />
                    Imprimir Corte Parcial
                  </Button>
                </CardContent>
              </Card>

              {/* MOVIMIENTOS RECIENTES */}
              <Card className="lg:col-span-2 glass-card border-white/5">
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base font-bold">Movimientos del Día</CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] tracking-widest">ABIERTA</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-secondary/30">
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                          <TableHead className="text-zinc-400">Hora</TableHead>
                          <TableHead className="text-zinc-400">Concepto</TableHead>
                          <TableHead className="text-zinc-400">Cliente</TableHead>
                          <TableHead className="text-zinc-400">Método</TableHead>
                          <TableHead className="text-right text-zinc-400">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movimientos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-zinc-500 italic">
                              Sin movimientos hoy.
                            </TableCell>
                          </TableRow>
                        ) : (
                          movimientos.map((m) => (
                            <TableRow key={m.id} className="border-zinc-800 hover:bg-zinc-800/30">
                              <TableCell className="text-xs text-zinc-500">
                                {formatInColombiaTime(m.fecha, 'time')}
                              </TableCell>
                              <TableCell className="font-medium text-sm text-zinc-200">
                                <div className="flex flex-col">
                                  <span>{m.concepto}</span>
                                  {m.iva_monto > 0 && (
                                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-tighter">Incluye IVA {formatCOP(m.iva_monto)}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-zinc-400">
                                {m.pagos?.clientes?.nombre || m.ventas?.clientes?.nombre || '—'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize text-[9px] bg-zinc-800 text-zinc-400 border-none">{m.metodo_pago}</Badge>
                              </TableCell>
                              <TableCell className={cn(
                                "text-right font-bold",
                                m.tipo === 'ingreso' ? "text-emerald-500" : "text-rose-500"
                              )}>
                                {formatCOP(m.monto)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden divide-y divide-zinc-800">
                    {movimientos.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs italic">Sin movimientos hoy.</div>
                    ) : (
                      movimientos.map((m) => (
                        <div key={m.id} className="p-4 flex justify-between items-center">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-zinc-200 truncate">{m.concepto}</p>
                              {m.iva_monto > 0 && (
                                <Badge className="h-3 text-[7px] bg-amber-500/10 text-amber-500 border-none px-1">IVA</Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                              {m.pagos?.clientes?.nombre || m.ventas?.clientes?.nombre || 'General'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                              <span className="flex items-center gap-1 uppercase tracking-tighter">
                                <Clock className="w-2.5 h-2.5" /> 
                                {formatInColombiaTime(m.fecha, 'time')}
                              </span>
                              <span>·</span>
                              <span className="uppercase">{m.metodo_pago}</span>
                            </div>
                          </div>
                          <p className={cn(
                            "font-black text-sm shrink-0 ml-2",
                            m.tipo === 'ingreso' ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {m.tipo === 'ingreso' ? '+' : '-'}{formatCOP(m.monto)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* HISTORIAL DE CIERRES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Historial de Cierres</h2>
          </div>
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardContent className="p-0">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/30">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Fecha</TableHead>
                      <TableHead className="text-zinc-400">Apertura</TableHead>
                      <TableHead className="text-zinc-400">Cierre (Real)</TableHead>
                      <TableHead className="text-zinc-400">Diferencia</TableHead>
                      <TableHead className="text-zinc-400">Estado</TableHead>
                      <TableHead className="text-right text-zinc-400">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historial.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                          Sin registros históricos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedHistorial.map((c) => (
                        <TableRow key={c.id} className="border-zinc-800 hover:bg-zinc-800/30">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2 text-zinc-300">
                                  <Calendar className="w-4 h-4 text-zinc-500" />
                                  {formatInColombiaTime(c.fecha_apertura, 'shortDate')}
                                </div>
                              </TableCell>
                          <TableCell className="text-zinc-400">{formatCOP(c.monto_apertura)}</TableCell>
                          <TableCell className="font-bold text-zinc-200">{c.monto_cierre_real ? formatCOP(c.monto_cierre_real) : '—'}</TableCell>
                          <TableCell className={cn(
                            "font-bold",
                            (c.diferencia || 0) < 0 ? "text-rose-500" : (c.diferencia || 0) > 0 ? "text-emerald-500" : "text-zinc-500"
                          )}>
                            {c.diferencia !== null ? formatCOP(Math.abs(c.diferencia)) : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.estado === 'abierta' ? 'default' : 'secondary'} className={cn(
                              "text-[10px] border-none uppercase",
                              c.estado === 'abierta' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                            )}>
                              {c.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-200"
                              onClick={async () => {
                                const toastId = toast.loading('Generando reporte detallado...')
                                try {
                                  const movs = await getMovimientosCaja(c.id)
                                  await generateClosurePDF(c, movs, gimnasio)
                                  toast.success('Reporte generado', { id: toastId })
                                } catch (error) {
                                  toast.error('Error al generar reporte', { id: toastId })
                                }
                              }}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-zinc-800">
                {historial.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">Sin registros históricos.</div>
                ) : (
                  paginatedHistorial.map((c) => (
                    <div key={c.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span className="font-bold text-sm">{formatInColombiaTime(c.fecha_apertura, 'shortDate')}</span>
                        </div>
                        <Badge className={cn(
                          "text-[9px] border-none uppercase h-5 px-1.5",
                          c.estado === 'abierta' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                        )}>
                          {c.estado}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-zinc-500">Cierre Real</p>
                          <p className="text-sm font-black">{c.monto_cierre_real ? formatCOP(c.monto_cierre_real) : '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase font-bold text-zinc-500">Diferencia</p>
                          <p className={cn(
                            "text-sm font-black",
                            (c.diferencia || 0) < 0 ? "text-rose-500" : (c.diferencia || 0) > 0 ? "text-emerald-500" : "text-zinc-500"
                          )}>
                            {c.diferencia !== null ? formatCOP(Math.abs(c.diferencia)) : '—'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-8 text-[10px] border-zinc-800 text-zinc-400"
                        onClick={async () => {
                          const toastId = toast.loading('Generando reporte detallado...')
                          try {
                            const movs = await getMovimientosCaja(c.id)
                            await generateClosurePDF(c, movs, gimnasio)
                            toast.success('Reporte generado', { id: toastId })
                          } catch (error) {
                            toast.error('Error al generar reporte', { id: toastId })
                          }
                        }}
                      >
                        <Printer className="w-3 h-3 mr-2" />
                        Imprimir Reporte
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="border-t border-zinc-800 p-4 flex items-center justify-between bg-black/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="text-[10px] font-black uppercase tracking-widest h-8 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                  >
                    Anterior
                  </Button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="text-[10px] font-black uppercase tracking-widest h-8 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MODALES */}
        {cajaActiva && (
          <>
            <RegistrarMovimientoModal 
              open={isMovModalOpen}
              onOpenChange={setIsMovModalOpen}
              cajaId={cajaActiva.id}
              onSuccess={fetchData}
              registrarMovimiento={registrarMovimientoCaja}
            />
            <CerrarCajaModal 
              open={isCierreModalOpen}
              onOpenChange={setIsCierreModalOpen}
              cajaId={cajaActiva.id}
              onSuccess={fetchData}
              cerrarCaja={cerrarCaja}
              montoEsperado={stats.saldo}
            />
          </>
        )}
      </div>
    </AdminLayout>
  )
}

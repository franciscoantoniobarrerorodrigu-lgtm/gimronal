'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Download,
  Receipt,
  Dumbbell,
  Trash2,
  History,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getPagos, eliminarPagoAction } from '@/lib/supabase/actions/pagos'
import { getCajaActiva } from '@/lib/supabase/actions/caja'
import { useAction } from 'next-safe-action/hooks'
import { useQueryState, parseAsInteger } from 'nuqs'
import { PagoFormModal } from './components/PagoFormModal'
import { ReciboPago } from './components/ReciboPago'
import MovimientosPagosModal from './components/MovimientosPagosModal'
import { showPremiumToast } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { formatCOP } from '@/lib/format-utils'
import { generateReceiptPDF } from '@/lib/pdf-utils'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { GymLoading } from '@/components/shared/GymLoading'
import { getColombiaDateString, getColombiaDate, formatInColombiaTime } from '@/lib/date-utils'
import { startOfWeek, startOfMonth, subDays } from 'date-fns'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function PagosClient({ initialPagos, initialCajaAbierta, initialGimnasio }: { initialPagos: any[], initialCajaAbierta: boolean, initialGimnasio: any }) {
  const [pagos, setPagos] = useState<any[]>(initialPagos)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMovimientosOpen, setIsMovimientosOpen] = useState(false)
  
  const [searchTerm, setSearchTerm] = useQueryState('search', { defaultValue: '' })
  const [periodFilter, setPeriodFilter] = useQueryState<'hoy' | 'semana' | 'mes' | 'todos'>('period', { defaultValue: 'hoy', parse: (v) => v as any })
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(1))
  
  const [gimnasio] = useState<any>(initialGimnasio)
  const [selectedPago, setSelectedPago] = useState<any>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isCajaAbierta, setIsCajaAbierta] = useState(initialCajaAbierta)
  
  const itemsPerPage = 10
  const [pagoToDelete, setPagoToDelete] = useState<any>(null)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  const fetchPagos = async () => {
    setLoading(true)
    try {
      const data = await getPagos()
      setPagos(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const checkCaja = async () => {
    const caja = await getCajaActiva()
    setIsCajaAbierta(!!caja)
  }

  // Cálculos del día y comparativas
  const stats = useMemo(() => {
    const hoyStr = getColombiaDateString()
    const ayer = subDays(getColombiaDate(), 1)
    const ayerFormatted = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`
    
    let ingresosHoy = 0
    let efectivoHoy = 0
    let transferenciasHoy = 0
    let ingresosAyer = 0

    pagos.forEach(p => {
      const fechaPagoStr = p.fecha_pago.includes('T') ? p.fecha_pago.split('T')[0] : p.fecha_pago.split(' ')[0]
      const monto = Number(p.monto)

      if (fechaPagoStr === hoyStr) {
        ingresosHoy += monto
        if (p.metodo_pago === 'efectivo') efectivoHoy += monto
        else transferenciasHoy += monto
      } else if (fechaPagoStr === ayerFormatted) {
        ingresosAyer += monto
      }
    })

    const diffIngresos = ingresosAyer > 0 ? ((ingresosHoy - ingresosAyer) / ingresosAyer) * 100 : 0

    return { 
      ingresosHoy, 
      efectivoHoy, 
      transferenciasHoy, 
      diffIngresos,
      ingresosAyer
    }
  }, [pagos])

  // Filtrado por búsqueda y período
  const filteredPagos = useMemo(() => {
    const query = searchTerm.toLowerCase()
    const hoy = getColombiaDate()
    const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 })
    const inicioMes = startOfMonth(hoy)

    return pagos.filter(p => {
      // Filtro de búsqueda
      const clienteNombre = p.clientes?.nombre?.toLowerCase() || ''
      const recibo = p.recibo_numero?.toLowerCase() || ''
      const concepto = p.concepto?.toLowerCase() || ''
      const matchSearch = clienteNombre.includes(query) || recibo.includes(query) || concepto.includes(query)

      if (!matchSearch) return false

      // Filtro de período
      if (periodFilter === 'todos') return true
      
      const datePart = p.fecha_pago.includes('T') ? p.fecha_pago.split('T')[0] : p.fecha_pago.split(' ')[0]
      const fechaP = new Date(datePart + 'T12:00:00') 
      if (periodFilter === 'hoy') {
        return datePart === getColombiaDateString()
      }
      if (periodFilter === 'semana') {
        return fechaP >= inicioSemana
      }
      if (periodFilter === 'mes') {
        return fechaP >= inicioMes
      }
      return true
    })
  }, [pagos, searchTerm, periodFilter])

  // Paginación
  const totalItems = filteredPagos.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedPagos = filteredPagos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Subtotal de la página visible
  const subtotalPagina = paginatedPagos.reduce((acc, p) => acc + Number(p.monto), 0)
  const totalFiltrado = filteredPagos.reduce((acc, p) => acc + Number(p.monto), 0)

  const { execute: executeDelete, isExecuting: isDeleting } = useAction(eliminarPagoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        showPremiumToast.success('Eliminación Exitosa', 'El registro de pago ha sido removido y la membresía asociada ha sido ajustada.')
        fetchPagos();
        setIsConfirmDeleteOpen(false);
      } else {
        showPremiumToast.error('No se pudo eliminar', data?.error || 'Error desconocido');
      }
    },
    onError: ({ error }) => {
      showPremiumToast.error('Error de Comunicación', error.serverError || 'No se pudo procesar la solicitud de eliminación en este momento.');
    }
  })

  return (
    <div className="flex flex-col gap-6 md:gap-10 max-w-6xl mx-auto animate-in-fade">
      <SectionHeader 
        title="Pagos y Facturación" 
        subtitle="Registra ingresos, gestiona movimientos y genera comprobantes de pago."
      >
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsMovimientosOpen(true)}
            className="flex-1 md:flex-none glass-card border-white/10 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-tight"
          >
            <History className="size-4 mr-2 text-primary" />
            Historial de Caja
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all text-xs font-bold uppercase tracking-tight" 
            onClick={async () => {
              const caja = await getCajaActiva()
              if (!caja) {
                showPremiumToast.error('¡Acceso Denegado!', 'Debes abrir una sesión de caja antes de poder registrar nuevos pagos.')
                setIsCajaAbierta(false)
                return
              }
              setIsCajaAbierta(true)
              setIsModalOpen(true)
            }}
          >
            <Plus className="size-4 mr-2" />
            Nuevo Pago
          </Button>
        </div>
      </SectionHeader>

      <MovimientosPagosModal 
        open={isMovimientosOpen}
        onOpenChange={setIsMovimientosOpen}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card border-primary/20 shadow-xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Ingresos Hoy</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left">{formatCOP(stats.ingresosHoy)}</div>
            <p className={cn(
              "text-[9px] font-bold mt-1",
              stats.diffIngresos >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {stats.diffIngresos >= 0 ? '↑' : '↓'} {Math.abs(stats.diffIngresos).toFixed(1)}% vs ayer
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5 group">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Efectivo (Hoy)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors">{formatCOP(stats.efectivoHoy)}</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5 group">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Transferencias (Hoy)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors">{formatCOP(stats.transferenciasHoy)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="glass-card border-white/5 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input 
              placeholder="Buscar por cliente, concepto o recibo..." 
              className="pl-10 bg-black/40 border-white/10 focus:border-primary/50 transition-all text-sm h-10" 
              value={searchTerm || ''}
              onChange={(e) => { setSearchTerm(e.target.value || null); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Button 
              variant={periodFilter === 'hoy' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => { setPeriodFilter('hoy'); setCurrentPage(1); }}
              className="shrink-0 h-9 text-[10px] font-bold uppercase tracking-tighter transition-all"
            >
              <CalendarIcon className="w-3.5 h-3.5 mr-2" />
              Hoy
            </Button>
            <Button 
              variant={periodFilter === 'semana' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => { setPeriodFilter('semana'); setCurrentPage(1); }}
              className="shrink-0 h-9 text-[10px] font-bold uppercase tracking-tighter transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5 mr-2" />
              Semana
            </Button>
            <Button 
              variant={periodFilter === 'mes' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => { setPeriodFilter('mes'); setCurrentPage(1); }}
              className="shrink-0 h-9 text-[10px] font-bold uppercase tracking-tighter transition-all"
            >
              <CalendarRange className="w-3.5 h-3.5 mr-2" />
              Mes
            </Button>
            <Button 
              variant={periodFilter === 'todos' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => { setPeriodFilter('todos'); setCurrentPage(1); }}
              className="shrink-0 h-9 text-[10px] font-bold uppercase tracking-tighter transition-all"
            >
              <Filter className="w-3.5 h-3.5 mr-2" />
              Todos
            </Button>
          </div>
        </div>
        
        {loading ? (
          <GymLoading message="Cargando pagos..." />
        ) : (
          <>
            {/* Vista Desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPagos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron pagos
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paginatedPagos.map((pago) => (
                        <TableRow key={pago.id} className="hover:bg-white/5 transition-colors group">
                          <TableCell className="text-xs text-muted-foreground">
                            {formatInColombiaTime(pago.fecha_pago)}
                          </TableCell>
                          <TableCell className="font-medium">{pago.clientes?.nombre || 'Desconocido'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">{pago.concepto}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm capitalize">{pago.metodo_pago}</span>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCOP(pago.monto)}
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-white/10 dark:hover:bg-white/10" 
                              title="Descargar Recibo"
                              onClick={() => generateReceiptPDF(pago, gimnasio)}
                            >
                              <Download className="size-4 text-blue-400 hover:text-blue-300 transition-colors" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-rose-500/10 dark:hover:bg-rose-500/10"
                              title="Eliminar Pago"
                              onClick={() => {
                                setPagoToDelete(pago)
                                setIsConfirmDeleteOpen(true)
                              }}
                            >
                              <Trash2 className="size-4 text-rose-500 hover:text-rose-400 transition-colors" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-emerald-500/5 hover:bg-emerald-500/10 border-t-2 border-emerald-500/20">
                        <TableCell colSpan={4} className="text-right font-black uppercase text-[10px] tracking-widest text-emerald-500">
                          Subtotal Página:
                        </TableCell>
                        <TableCell className="font-black text-emerald-500 text-lg">
                          {formatCOP(subtotalPagina)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación y Contador */}
            <div className="p-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Mostrando <span className="text-foreground">{paginatedPagos.length}</span> de <span className="text-foreground">{totalItems}</span> registros
                {periodFilter !== 'todos' && ` (${periodFilter})`}
                <span className="mx-2 text-foreground/10">|</span>
                Total Período: <span className="text-emerald-500">{formatCOP(totalFiltrado)}</span>
              </p>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 glass-card"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <div className="flex items-center gap-1 px-2 overflow-x-auto max-w-[200px] md:max-w-md scrollbar-none">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const start = Math.max(1, Math.min(currentPage - 3, totalPages - 6))
                      const page = start + i
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 text-[10px] font-bold shrink-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {totalPages > 7 && (
                      <span className="text-[10px] text-muted-foreground px-1 shrink-0">...</span>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 glass-card"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Vista Móvil - Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredPagos.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No se encontraron pagos
                </div>
              ) : (
                filteredPagos.map((pago) => (
                  <div key={pago.id} className="p-4 flex flex-col gap-2 active:bg-white/5">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate text-foreground">{pago.clientes?.nombre || 'Desconocido'}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          {pago.metodo_pago} · {new Date(pago.fecha_pago).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-black text-sm text-emerald-500">{formatCOP(pago.monto)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant="outline" className="text-[9px] py-0 h-4 border-white/10 bg-secondary/20">
                        {pago.concepto}
                      </Badge>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => generateReceiptPDF(pago, gimnasio)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-rose-500"
                          onClick={() => {
                            setPagoToDelete(pago)
                            setIsConfirmDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <PagoFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSuccess={fetchPagos} 
      />

      {isPrinting && selectedPago && (
        <div className="fixed inset-0 z-[100] bg-white">
          <ReciboPago pago={selectedPago} gimnasio={gimnasio} />
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              ¿Estás seguro de que deseas eliminar el pago de <span className="font-bold text-foreground">{pagoToDelete?.clientes?.nombre}</span> por <span className="font-bold text-foreground">{formatCOP(pagoToDelete?.monto)}</span>?
              <br /><br />
              <span className="text-rose-500/80 font-medium">Esta acción anulará automáticamente la membresía asociada y no se puede deshacer.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsConfirmDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (pagoToDelete) {
                  executeDelete({ id: pagoToDelete.id })
                }
              }}
              loading={isDeleting}
            >
              Eliminar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

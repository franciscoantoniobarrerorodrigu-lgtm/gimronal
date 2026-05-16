'use client'

import React, { useState } from 'react'
import { 
  AlertCircle, 
  Search, 
  Phone, 
  Calendar, 
  CreditCard, 
  TrendingDown, 
  Users,
  Filter,
  ArrowRight,
  DollarSign,
  Loader2,
  MessageCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { formatCOP } from '@/lib/format-utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { registrarAbono } from '@/lib/supabase/actions/mora'
import { showPremiumToast } from '@/lib/notifications'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MoraItem {
  id: string
  tipo: string
  cliente: string
  clienteId: string
  telefono: string
  plan: string
  fecha_inicio: string
  fecha_fin: string
  totalCost: number
  totalPaid: number
  balanceDue: number
  estado: string
}

interface MoraClientProps {
  initialData: MoraItem[]
  summary: { totalDebt: number, count: number }
}

export default function MoraClient({ initialData, summary }: MoraClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'high'>('all')
  
  // Modal State
  const [selectedMora, setSelectedMora] = useState<MoraItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [montoAbono, setMontoAbono] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [loading, setLoading] = useState(false)

  const handleOpenAbono = (item: MoraItem) => {
    setSelectedMora(item)
    setMontoAbono(item.balanceDue.toString()) // Por defecto el saldo total
    setIsModalOpen(true)
  }

  const handleSubmitAbono = async () => {
    if (!selectedMora || !montoAbono || Number(montoAbono) <= 0) {
      showPremiumToast.warning('Monto Inválido', 'Por favor ingresa un monto válido para el abono')
      return
    }

    if (Number(montoAbono) > selectedMora.balanceDue) {
      showPremiumToast.error('Saldo Excedido', 'El abono no puede ser mayor al saldo pendiente')
      return
    }

    setLoading(true)
    try {
      // Necesitamos el ID del cliente. En getMoraList devolvemos cliente (nombre) pero no el ID.
      // Corregiré getMoraList para incluir clienteId si es necesario, 
      // pero por ahora asumo que el id de la mora es el id de la membresía y tiene acceso al cliente.
      // Re-revisando mora.ts: m.clientes.id está disponible pero no se mapeó en el objeto final.
      
      const res = await registrarAbono({
        membresiaId: selectedMora.tipo === 'membresia' ? selectedMora.id : undefined,
        ventaId: selectedMora.tipo === 'producto' ? selectedMora.id : undefined,
        clienteId: selectedMora.clienteId,
        monto: Number(montoAbono),
        concepto: selectedMora.plan,
        metodoPago: metodoPago.toLowerCase() === 'nequi/daviplata' ? 'nequi' : metodoPago.toLowerCase()
      })

      if (res.success) {
        showPremiumToast.success('Éxito', 'Abono registrado correctamente')
        setIsModalOpen(false)
        router.refresh()
      } else {
        showPremiumToast.error('Error', res.error || 'Error al registrar abono')
      }
    } catch (error) {
      showPremiumToast.error('Error', 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppMessage = (item: MoraItem) => {
    if (!item.telefono || item.telefono === 'Sin teléfono') {
      showPremiumToast.warning('Sin Teléfono', 'El cliente no tiene un número de teléfono válido registrado.')
      return
    }

    const cleanPhone = item.telefono.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`
    
    const message = `Hola ${item.cliente}, te saludamos de GymControl. 👋 Te recordamos que tienes un saldo pendiente de ${formatCOP(item.balanceDue)} por concepto de ${item.tipo === 'membresia' ? 'tu membresía' : 'productos de inventario'}. ¡Te esperamos para ponerte al día! 💪`
    
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank')
  }

  const getDebtStatus = (balance: number) => {
    if (balance > 100000) return 'critical'
    if (balance > 50000) return 'warning'
    return 'normal'
  }

  const filteredData = initialData.filter(item => {
    const matchesSearch = item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.plan.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'high') {
      return matchesSearch && item.balanceDue > 50000 // Ejemplo: Deudas altas > 50k
    }
    
    return matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            Control de Mora
          </h1>
          <p className="text-muted-foreground">Gestión de saldos pendientes y cobranza.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            router.refresh()
            toast.success('Sincronizando datos...')
          }}
          className="md:w-auto w-full border-primary/20 hover:bg-primary/10 font-bold uppercase text-[10px] tracking-widest h-10"
        >
          Actualizar Lista
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glass className="bg-red-500/10 border-red-500/20 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-400">
              <TrendingDown className="w-4 h-4" />
              Total en Mora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCOP(summary.totalDebt)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Suma de todos los saldos pendientes</p>
          </CardContent>
        </Card>

        <Card glass className="bg-card/30 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-400">
              <Users className="w-4 h-4" />
              Clientes Deudores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.count}</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes con pagos incompletos</p>
          </CardContent>
        </Card>

        <Card glass className="bg-card/30 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-400">
              <CreditCard className="w-4 h-4" />
              Promedio Deuda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCOP(summary.count > 0 ? summary.totalDebt / summary.count : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Deuda media por cliente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card glass className="bg-card/30 border-border/50 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente o plan..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button 
              variant={filterType === 'high' ? 'default' : 'outline'}
              onClick={() => setFilterType('high')}
              size="sm"
              className={filterType === 'high' ? 'bg-red-600' : ''}
            >
              Mora Alta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debtors List */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Cliente</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Tipo</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Concepto / Plan</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Vigencia</th>
                  <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Costo Total</th>
                  <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Abonado</th>
                  <th className="p-4 text-right font-bold uppercase tracking-wider text-xs text-red-500">Saldo</th>
                  <th className="p-4 text-center font-bold uppercase tracking-wider text-xs">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground italic">
                      No se encontraron clientes con mora.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{item.cliente}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {item.telefono || 'Sin teléfono'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn(
                          "text-[9px] uppercase font-black px-1.5 py-0",
                          item.tipo === 'membresia' ? "border-primary/30 text-primary" : "border-amber-500/30 text-amber-500"
                        )}>
                          {item.tipo}
                        </Badge>
                      </td>
                      <td className="p-4 italic text-muted-foreground">
                        {item.plan}
                      </td>
                      <td className="p-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.fecha_inicio), 'dd MMM', { locale: es })}
                          {item.fecha_fin !== '-' && (
                            <>
                              <ArrowRight className="w-2 h-2" />
                              {format(new Date(item.fecha_fin), 'dd MMM', { locale: es })}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {formatCOP(item.totalCost)}
                      </td>
                      <td className="p-4 text-right text-blue-400">
                        {formatCOP(item.totalPaid)}
                      </td>
                      <td className={cn(
                        "p-4 text-right font-black",
                        getDebtStatus(item.balanceDue) === 'critical' ? "text-red-500 animate-pulse" : 
                        getDebtStatus(item.balanceDue) === 'warning' ? "text-amber-500" : "text-red-400"
                      )}>
                        {formatCOP(item.balanceDue)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 gap-2 border-primary/20 hover:bg-primary/10"
                            onClick={() => handleOpenAbono(item)}
                          >
                            <DollarSign className="w-3 h-3" />
                            Abonar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 border-green-500/20 text-green-500 hover:bg-green-500/10"
                            onClick={() => handleWhatsAppMessage(item)}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredData.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground italic border-dashed border-2 bg-transparent">
              No se encontraron clientes con mora.
            </Card>
          ) : (
            filteredData.map((item) => (
              <Card key={item.id} className="bg-card/20 backdrop-blur-sm border-white/5 overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.cliente}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-medium">
                        <Phone className="w-3 h-3" />
                        {item.telefono || 'Sin teléfono'}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] uppercase font-black px-1.5 py-0",
                      item.tipo === 'membresia' ? "border-primary/30 text-primary" : "border-amber-500/30 text-amber-500"
                    )}>
                      {item.tipo}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 italic">
                    {item.plan}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-1">Costo Total</span>
                      <span className="text-xs font-bold text-zinc-300">{formatCOP(item.totalCost)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-1">Abonado</span>
                      <span className="text-xs font-bold text-blue-400">{formatCOP(item.totalPaid)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-1">Saldo Pendiente</span>
                      <span className={cn(
                        "text-sm font-black",
                        getDebtStatus(item.balanceDue) === 'critical' ? "text-red-500" : "text-red-400"
                      )}>
                        {formatCOP(item.balanceDue)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 border-green-500/20 text-green-500"
                        onClick={() => handleWhatsAppMessage(item)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 gap-2 bg-primary hover:bg-primary/90 text-black font-black text-[10px] uppercase"
                        onClick={() => handleOpenAbono(item)}
                      >
                        <DollarSign className="w-3 h-3" />
                        Abonar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de Abono */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Registrar Abono
            </DialogTitle>
            <DialogDescription>
              Ingresa el monto que el cliente {selectedMora?.cliente} desea abonar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Abonar</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Saldo pendiente: <span className="text-red-400 font-bold">{formatCOP(selectedMora?.balanceDue || 0)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select value={metodoPago} onValueChange={(val) => setMetodoPago(val || 'Efectivo')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="nequi">Nequi</SelectItem>
                  <SelectItem value="daviplata">Daviplata</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button 
              className="bg-primary font-bold" 
              onClick={handleSubmitAbono}
              loading={loading}
            >
              Confirmar Abono
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getClienteById } from '@/lib/supabase/actions/clientes'
import { registrarMedida, actualizarNotasMedicas } from '@/lib/supabase/actions/salud'
import { actualizarCliente } from '@/lib/supabase/actions/clientes'
import { actualizarDiasMembresia, getHistorialAjustes } from '@/lib/supabase/actions/membresias'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  User, 
  Calendar, 
  Activity, 
  TrendingUp, 
  CreditCard, 
  FileText,
  Weight,
  ArrowUpRight,
  ChevronLeft,
  QrCode as QrIcon,
  Dumbbell,
  Pencil,
  Plus,
  Clock,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal,
  Check,
  ChevronsUpDown,
  LogIn,
  LogOut,
  Circle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { showPremiumToast } from '@/lib/notifications'
import { formatInColombiaTime } from '@/lib/date-utils'
import { DEPARTAMENTOS_COLOMBIA } from '@/lib/constants/colombia'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import dynamic from 'next/dynamic'
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false })
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'
import { generateClientCard, generateCommitmentLetterPDF } from '@/lib/pdf-utils'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import { cn } from '@/lib/utils'
import { calculateAge, formatCOP, formatDate } from '@/lib/format-utils'

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'activo': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'vencido': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'inactivo': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  }
}

export default function PerfilClientePage() {
  const params = useParams()
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDiasDialogOpen, setIsDiasDialogOpen] = useState(false)
  const [newDias, setNewDias] = useState<string>('0')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isMedidaDialogOpen, setIsMedidaDialogOpen] = useState(false)
  const [isNotasDialogOpen, setIsNotasDialogOpen] = useState(false)
  const [isEditClienteOpen, setIsEditClienteOpen] = useState(false)
  const [nuevaMedida, setNuevaMedida] = useState({ peso: "", estatura: "", grasa: "", notas: "" })
  const [showFatCalc, setShowFatCalc] = useState(false)
  const [fatCalcData, setFatCalcData] = useState({ cuello: "", cintura: "", cadera: "" })
  const [misNotas, setMisNotas] = useState({ notas: "", alergia: "" })
  const [editFormData, setEditFormData] = useState<any>({})
  const [isDeptOpen, setIsDeptOpen] = useState(false)
  const [isCityOpen, setIsCityOpen] = useState(false)
  const [historialAjustes, setHistorialAjustes] = useState<any[]>([])
  const [gymInfo, setGymInfo] = useState<any>(null)

  const id = params.id as string

  const loadCliente = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getClienteById(id);
      
      if (!res.success) {
        showPremiumToast.error('Error de Base de Datos', res.error || 'No se pudo cargar el cliente')
        return;
      }

      const data = res.data;

      if (data) {
        setCliente(data);
        setEditFormData({
          ...data,
          notas: data.notas_medicas?.[0]?.contenido || ''
        });
        
        let calcDias = 0
        if (data?.membresia?.estado === 'congelada') {
          calcDias = data.membresia.dias_congelados || 0;
        } else if (data?.membresia?.fecha_fin) {
          const fin = new Date(data.membresia.fecha_fin + 'T23:59:59')
          const hoy = new Date()
          const diff = fin.getTime() - hoy.getTime()
          calcDias = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
        }
        setNewDias((calcDias || 0).toString())
        
        if (data?.membresia?.id) {
          const hist = await getHistorialAjustes(data.membresia.id)
          setHistorialAjustes(Array.isArray(hist) ? hist : [])
        }
      } else {
        showPremiumToast.warning('No Encontrado', 'El cliente solicitado no existe en el sistema')
      }
    } catch (error: any) {
      console.error("Error cargando cliente:", error);
      showPremiumToast.error('Error de Carga', 'No se pudieron recuperar los datos del perfil')
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCliente()
    
    // Cargar info del gimnasio para documentos legales
    const loadGym = async () => {
      const info = await getGimnasio()
      if (info) setGymInfo(info)
    }
    loadGym()
  }, [loadCliente])

  useEffect(() => {
    if (cliente?.medidas?.length > 0) {
      const last = cliente.medidas[cliente.medidas.length - 1]
      setNuevaMedida(prev => ({
        ...prev,
        estatura: last.estatura?.toString() || "",
        peso: last.peso?.toString() || ""
      }))
    }
  }, [cliente])

  // Cálculo automático de Grasa Corporal (Fórmula de Deurenberg basada en IMC)
  useEffect(() => {
    const pStr = (nuevaMedida.peso || "").toString().replace(',', '.')
    const eStr = (nuevaMedida.estatura || "").toString().replace(',', '.')
    
    const p = parseFloat(pStr)
    let e = parseFloat(eStr)
    
    // Auto-detección: Si ponen 1.70, convertir a 170cm
    if (e > 0 && e < 3) {
      e = e * 100
    }

    const edadStr = cliente?.fecha_nacimiento ? calculateAge(cliente.fecha_nacimiento) : 25
    const edad = typeof edadStr === 'number' ? edadStr : 25
    const genero = (cliente?.genero || 'masculino').toLowerCase()

    if (!isNaN(p) && !isNaN(e) && p > 5 && e > 50) {
      const imc = p / Math.pow(e / 100, 2)
      // Body Fat % = (1.20 × BMI) + (0.23 × Age) − (10.8 × sex) − 5.4
      const sex = genero === 'masculino' ? 1 : 0
      const grasaCalculada = (1.20 * imc) + (0.23 * edad) - (10.8 * sex) - 5.4
      
      const final = Math.max(2, Math.min(60, parseFloat(grasaCalculada.toFixed(1))))
      
      if (!isNaN(final)) {
        setNuevaMedida(prev => ({ ...prev, grasa: final.toString() }))
      }
    }
  }, [nuevaMedida.peso, nuevaMedida.estatura, cliente?.fecha_nacimiento, cliente?.genero])

  const handleUpdateDias = async () => {
    if (!cliente?.membresia?.id) {
      showPremiumToast.warning('Sin Membresía', 'El cliente no tiene una membresía activa para actualizar')
      return
    }
    
    const diasNum = parseInt(newDias as string)
    if (isNaN(diasNum)) {
      showPremiumToast.warning('Formato Inválido', 'Por favor ingresa un número de días válido')
      return
    }

    setIsUpdating(true)
    try {
      const result = await actualizarDiasMembresia(cliente.membresia.id, diasNum)
      if (result.success) {
        showPremiumToast.success('Días Actualizados', 'La membresía ha sido ajustada correctamente')
        setIsDiasDialogOpen(false)
        await loadCliente()
      } else {
        showPremiumToast.error('Error de Actualización', result.error || 'No se pudo cambiar la duración')
      }
    } catch (err) {
      console.error(err)
      showPremiumToast.error('Error Inesperado', 'Falló la comunicación con el servidor al actualizar días')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRegistrarMedida = async () => {
    if (!nuevaMedida.peso || !nuevaMedida.estatura) {
      showPremiumToast.warning('Datos Incompletos', 'Peso y estatura son obligatorios para el registro')
      return
    }
    setIsUpdating(true)
    try {
      const result = await registrarMedida({
        cliente_id: cliente.id,
        peso: parseFloat(nuevaMedida.peso.toString().replace(',', '.')),
        estatura: parseFloat(nuevaMedida.estatura.toString().replace(',', '.')),
        porcentaje_grasa: nuevaMedida.grasa ? parseFloat(nuevaMedida.grasa.toString().replace(',', '.')) : undefined,
        notas: nuevaMedida.notas
      })
      if (result.success) {
        showPremiumToast.success('Medida Registrada', 'Los datos antropométricos han sido guardados')
        setIsMedidaDialogOpen(false)
        setShowFatCalc(false)
        setNuevaMedida({ peso: "", estatura: "", grasa: "", notas: "" })
        await loadCliente()
      } else {
        showPremiumToast.error('Error de Registro', result.error)
      }
    } catch (err) {
      console.error(err)
      showPremiumToast.error('Error Inesperado', 'No se pudo guardar la nueva medida')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleGuardarNotas = async () => {
    setIsUpdating(true)
    try {
      const result = await actualizarNotasMedicas(cliente.id, misNotas.notas, misNotas.alergia)
      if (result.success) {
        showPremiumToast.success('Notas Guardadas', 'La información médica ha sido actualizada')
        setIsNotasDialogOpen(false)
        await loadCliente()
      } else {
        showPremiumToast.error('Error al Guardar', result.error)
      }
    } catch (err) {
      console.error(err)
      showPremiumToast.error('Error Inesperado', 'No se pudieron actualizar las notas médicas')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateCliente = async () => {
    setIsUpdating(true)
    try {
      const result = await actualizarCliente(cliente.id, editFormData)
      if (result.success) {
        showPremiumToast.success('Cliente Actualizado', 'Los datos personales han sido guardados')
        setIsEditClienteOpen(false)
        await loadCliente()
      } else {
        showPremiumToast.error('Error al Actualizar', result.error)
      }
    } catch (err) {
      console.error(err)
      showPremiumToast.error('Error Inesperado', 'No se pudieron actualizar los datos del cliente')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Dumbbell className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Cargando perfil del cliente...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!cliente) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-xl font-bold">Cliente no encontrado</p>
          <Button asChild>
            <Link href="/clientes">Volver a Clientes</Link>
          </Button>
        </div>
      </AdminLayout>
    )
  }

  const initials = cliente.nombre
    ? cliente.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : '??'

  const diasRestantes = cliente.dias_restantes || 0


  const dataPeso = (cliente.medidas || [])
    .filter((m: any) => m.peso && (m.fecha_medicion || m.created_at))
    .map((m: any) => {
      const dateVal = m.fecha_medicion || m.created_at;
      const d = new Date(dateVal);
      return {
        timestamp: isNaN(d.getTime()) ? 0 : d.getTime(),
        fecha: isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        peso: m.peso
      }
    })
    .sort((a: any, b: any) => a.timestamp - b.timestamp);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-4 md:py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="gap-2 px-2 hover:bg-zinc-800" asChild>
            <Link href="/clientes">
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Volver</span>
            </Link>
          </Button>
          <div className="h-6 w-px bg-zinc-800 hidden sm:block mx-2" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Perfil del Cliente</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna Izquierda: Info Básica */}
          <div className="space-y-6">
            <Card className="border-border/50 overflow-hidden relative mx-0.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white border border-white/10"
                onClick={() => {
                  setEditFormData({
                    nombre: cliente.nombre,
                    tipo_documento: cliente.tipo_documento,
                    numero_documento: cliente.numero_documento,
                    email: cliente.email,
                    telefono: cliente.telefono,
                    fecha_nacimiento: cliente.fecha_nacimiento,
                    genero: cliente.genero,
                    direccion: cliente.direccion,
                    ciudad: cliente.ciudad,
                    barrio: cliente.barrio,
                    departamento: cliente.departamento,
                    contacto_emergencia_nombre: cliente.contacto_emergencia_nombre,
                    contacto_emergencia_telefono: cliente.contacto_emergencia_telefono,
                    objetivos: cliente.objetivos,
                  })
                  setIsEditClienteOpen(true)
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <div className="h-24 md:h-32 bg-gradient-to-r from-primary to-accent relative" />
              <CardContent className="pt-0 -mt-10 md:-mt-12 text-center relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-background bg-secondary font-black text-2xl md:text-3xl text-primary shadow-xl">
                  {initials}
                </div>
                <div className="text-center space-y-1 px-2">
                  <h2 className="text-xl md:text-2xl font-bold break-words leading-tight">{cliente.nombre}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">{cliente.tipo_documento} {cliente.numero_documento}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <Badge className={cn(
                      "border-none font-bold uppercase tracking-tighter text-[10px]",
                      (cliente.estado || '').toLowerCase() === 'activo' && diasRestantes > 0
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : (cliente.estado || '').toLowerCase() === 'inactivo' && diasRestantes > 0
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-rose-500/20 text-rose-600 animate-pulse'
                    )}>
                      {(cliente.estado || '').toLowerCase() === 'activo' && diasRestantes > 0 ? 'Activo' : (cliente.estado || '').toLowerCase() === 'inactivo' && diasRestantes > 0 ? 'Congelado' : 'PAGO PENDIENTE'}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-[10px] uppercase font-bold",
                      diasRestantes <= 0 ? "text-rose-500 border-rose-500/30" : "text-zinc-400 border-zinc-800"
                    )}>
                      {cliente.plan || 'Sin Plan'} {diasRestantes <= 0 ? '(Vencido)' : ''}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 border-t border-border/50 pt-6">
                  <div className="text-center space-y-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Género</p>
                    <p className="font-bold text-xs md:text-sm capitalize truncate">{cliente.genero || 'N/A'}</p>
                  </div>
                  <div className="text-center space-y-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Edad</p>
                    <p className="font-bold text-xs md:text-sm truncate">{cliente.fecha_nacimiento ? `${calculateAge(cliente.fecha_nacimiento)} años` : 'N/A'}</p>
                  </div>
                  <div className="text-center space-y-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Teléfono</p>
                    <p className="font-bold text-xs md:text-sm truncate">{cliente.telefono || 'N/A'}</p>
                  </div>
                  <div className="text-center space-y-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Ubicación</p>
                    <p className="font-bold text-xs md:text-sm truncate px-1" title={cliente.ciudad}>{cliente.ciudad || 'N/A'}</p>
                  </div>
                  <div className="text-center col-span-2 space-y-1 pt-2 border-t border-white/5 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Correo Electrónico</p>
                    <p className="font-bold text-[11px] md:text-sm truncate px-2">{cliente.email || 'Sin correo'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <QrIcon className="w-4 h-4 text-primary" />
                  Carné Digital
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-xl shadow-inner border border-border/20">
                  <QRCodeSVG value={cliente.numero_documento || cliente.id} size={120} />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-xs h-8"
                  onClick={() => generateClientCard(cliente)}
                >
                  <CreditCard className="w-3 h-3 mr-2" />
                  Descargar Carné PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mt-2 text-xs h-8 border-primary/20 hover:bg-primary/5 text-primary/80"
                  onClick={() => generateCommitmentLetterPDF(cliente, gymInfo)}
                >
                  <FileText className="w-3 h-3 mr-2" />
                  Carta de Compromiso
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Tabs de Información */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="resumen" className="w-full">
              <div className="overflow-x-auto custom-scrollbar -mx-2 px-2">
                <TabsList className="bg-secondary/50 p-1 mb-6 inline-flex min-w-full sm:min-w-0">
                  <TabsTrigger value="resumen" className="flex-1 sm:flex-none">Resumen</TabsTrigger>
                  <TabsTrigger value="salud" className="flex-1 sm:flex-none">Salud</TabsTrigger>
                  <TabsTrigger value="pagos" className="flex-1 sm:flex-none">Pagos</TabsTrigger>
                  <TabsTrigger value="asistencia" className="flex-1 sm:flex-none">Asistencia</TabsTrigger>
                  <TabsTrigger value="auditoria" className="flex-1 sm:flex-none">Auditoría</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="resumen" className="space-y-6">
                <div className="grid gap-3 md:grid-cols-3">
                  <Card className="bg-primary/5 border-none p-4">
                    <p className="text-[10px] uppercase font-bold text-primary/70">Vencimiento</p>
                    <p className={cn(
                      "text-xl md:text-2xl font-black italic uppercase tracking-tighter",
                      diasRestantes > 0 ? "text-primary" : "text-rose-600 animate-pulse"
                    )}>
                      {diasRestantes > 0 ? `${diasRestantes} Días` : 'PAGO PENDIENTE'}
                    </p>
                    {cliente.membresia?.fecha_fin && (
                      <p className="text-[10px] text-primary/60 font-medium">
                        {(() => {
                          const d = new Date(cliente.membresia.fecha_fin + 'T12:00:00');
                          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('es-ES');
                        })()}
                      </p>
                    )}
                  </Card>
                  <Card className={cn(
                    "border-none p-4 relative",
                    diasRestantes > 0 ? "bg-emerald-500/5" : "bg-rose-500/10"
                  )}>
                    <div className="flex justify-between items-start">
                      <p className={cn(
                        "text-[10px] uppercase font-bold",
                        diasRestantes > 0 ? "text-emerald-600/70" : "text-rose-600/70"
                      )}>Días Disponibles</p>
                      {cliente?.membresia?.id && diasRestantes > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "h-6 w-6 rounded-full",
                            diasRestantes > 0 ? "hover:bg-emerald-500/20 text-emerald-600" : "hover:bg-rose-500/20 text-rose-600"
                          )}
                          onClick={() => setIsDiasDialogOpen(true)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className={cn(
                      "text-xl md:text-2xl font-black italic uppercase tracking-tighter",
                      diasRestantes > 0 ? "text-emerald-600" : "text-rose-600 animate-pulse"
                    )}>
                      {diasRestantes > 0 ? `${diasRestantes} Días` : 'DEBE COMPRAR PLAN'}
                    </p>
                  </Card>
                  <Card className={cn(
                    "border-none p-4",
                    diasRestantes > 0 ? "bg-amber-500/5" : "bg-rose-500/10"
                  )}>
                    <p className={cn(
                      "text-[10px] uppercase font-bold",
                      diasRestantes > 0 ? "text-amber-600/70" : "text-rose-600/70"
                    )}>Estado</p>
                    <p className={cn(
                      "text-xl md:text-2xl font-black italic uppercase tracking-tighter",
                      diasRestantes > 0 ? "text-amber-600" : "text-rose-600 animate-pulse"
                    )}>
                      {diasRestantes > 0 ? (cliente.estado || 'ACTIVO').toUpperCase() : 'PAGO PENDIENTE'}
                    </p>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Progreso de Peso (kg)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 p-2 md:p-6 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dataPeso}>
                        <defs>
                          <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                        <XAxis dataKey="fecha" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#27272a' }} />
                        <Area type="monotone" dataKey="peso" stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorPeso)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pagos" className="space-y-4">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="p-4 border-b border-zinc-800/50">
                    <CardTitle className="text-base">Historial de Pagos</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-zinc-400">Fecha</TableHead>
                            <TableHead className="text-zinc-400">Concepto</TableHead>
                            <TableHead className="text-zinc-400">Monto</TableHead>
                            <TableHead className="text-zinc-400 text-right">Método</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(cliente.pagos || []).length > 0 ? (
                            cliente.pagos.map((pago: any) => (
                              <TableRow key={pago.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                <TableCell className="text-sm">
                                  {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-ES') : 'N/A'}
                                </TableCell>
                                <TableCell className="text-sm">{pago.concepto || 'Membresía'}</TableCell>
                                <TableCell className="text-emerald-500 font-bold">
                                  ${pago.monto?.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right text-xs uppercase font-medium">{pago.metodo_pago || 'Efectivo'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10 text-zinc-500">Sin pagos.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View for Pagos */}
                    <div className="md:hidden divide-y divide-zinc-800">
                      {(cliente.pagos || []).length > 0 ? (
                        cliente.pagos.map((pago: any) => (
                          <div key={pago.id} className="p-4 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-zinc-100">{pago.concepto || 'Membresía'}</p>
                              <p className="text-[10px] text-zinc-500">{formatInColombiaTime(pago.fecha_pago, 'date')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-emerald-500">${pago.monto?.toLocaleString()}</p>
                              <Badge variant="outline" className="text-[8px] uppercase h-4 px-1">{pago.metodo_pago || 'Efectivo'}</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-zinc-500 text-xs">Sin registros.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="asistencia" className="space-y-4">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="p-4 border-b border-zinc-800/50">
                    <CardTitle className="text-base">Registro de Asistencia</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-zinc-400">Fecha</TableHead>
                            <TableHead className="text-zinc-400">Entrada</TableHead>
                            <TableHead className="text-zinc-400">Salida</TableHead>
                            <TableHead className="text-zinc-400 text-right">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cliente.asistencias?.length > 0 ? (
                            cliente.asistencias.map((asistencia: any) => {
                              const esActivo = !asistencia.fecha_hora_salida;
                              return (
                                <TableRow key={asistencia.id} className="border-zinc-800 hover:bg-zinc-800/50 group">
                                  <TableCell className="text-sm font-medium">
                                    {asistencia.fecha_hora_entrada ? new Date(asistencia.fecha_hora_entrada).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-md w-fit border border-emerald-500/10">
                                      <LogIn className="w-3 h-3" />
                                      <span className="text-xs font-bold">
                                        {formatInColombiaTime(asistencia.fecha_hora_entrada, 'time')}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {asistencia.fecha_hora_salida ? (
                                      <div className="flex items-center gap-2 text-rose-500 bg-rose-500/5 px-2 py-1 rounded-md w-fit border border-rose-500/10">
                                        <LogOut className="w-3 h-3" />
                                        <span className="text-xs font-bold">
                                          {formatInColombiaTime(asistencia.fecha_hora_salida, 'time')}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground font-medium italic">En curso...</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {esActivo ? (
                                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black tracking-tighter animate-pulse">
                                        <Circle className="w-2 h-2 fill-current mr-1" />
                                        EN GIMNASIO
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-zinc-800 text-zinc-400 border-none text-[9px] font-black tracking-tighter">
                                        COMPLETADO
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10 text-zinc-500">Sin asistencias.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="md:hidden divide-y divide-zinc-800">
                      {(cliente.asistencias || []).length > 0 ? (
                        cliente.asistencias.map((asistencia: any) => {
                          const esActivo = !asistencia.fecha_hora_salida;
                          return (
                            <div key={asistencia.id} className="p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-zinc-500" />
                                  <span className="text-xs font-bold text-zinc-300">
                                    {formatInColombiaTime(asistencia.fecha_hora_entrada, 'date')}
                                  </span>
                                </div>
                                {esActivo ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black tracking-tighter">
                                    EN GIMNASIO
                                  </Badge>
                                ) : (
                                  <Badge className="bg-zinc-800 text-zinc-500 border-none text-[8px] font-black tracking-tighter">
                                    COMPLETADO
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Entrada</p>
                                  <div className="flex items-center gap-2 text-emerald-500">
                                    <LogIn className="w-3 h-3" />
                                    <span className="text-xs font-black">{formatInColombiaTime(asistencia.fecha_hora_entrada, 'time')}</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Salida</p>
                                  {asistencia.fecha_hora_salida ? (
                                    <div className="flex items-center gap-2 text-rose-500">
                                      <LogOut className="w-3 h-3" />
                                      <span className="text-xs font-black">{formatInColombiaTime(asistencia.fecha_hora_salida, 'time')}</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-zinc-600 italic">En curso...</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-zinc-500 text-xs">Sin registros de asistencia.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="salud" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border/50">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Medidas
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsMedidaDialogOpen(true)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {cliente.medidas?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-secondary/20 rounded-lg">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">Peso</p>
                            <p className="text-lg font-black text-primary">{cliente.medidas[cliente.medidas.length-1].peso} kg</p>
                          </div>
                          <div className="p-3 bg-secondary/20 rounded-lg">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">Estatura</p>
                            <p className="text-lg font-black">{cliente.medidas[cliente.medidas.length-1].estatura} cm</p>
                          </div>
                          <div className="p-3 bg-secondary/20 rounded-lg">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">IMC</p>
                            <p className="text-lg font-black">{cliente.medidas[cliente.medidas.length-1].imc}</p>
                          </div>
                          <div className="p-3 bg-secondary/20 rounded-lg">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">% Grasa</p>
                            <p className="text-lg font-black">{cliente.medidas[cliente.medidas.length-1].porcentaje_grasa || 'N/A'}%</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-muted-foreground text-xs italic">No hay medidas.</div>
                      )}
                      <Button size="sm" className="w-full text-xs" onClick={() => setIsMedidaDialogOpen(true)}>Nueva Medición</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border/50">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Weight className="w-4 h-4 text-primary" />
                        Notas Médicas
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsNotasDialogOpen(true)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-rose-500 mb-1">Condiciones Médicas</p>
                          <p className="text-sm font-medium leading-relaxed">{cliente.condiciones_medicas || 'Ninguna registrada'}</p>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Objetivos</p>
                          <p className="text-sm leading-relaxed">{cliente.objetivos || 'Sin registrar'}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setIsNotasDialogOpen(true)}>Editar Notas</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="auditoria" className="space-y-6">
                <Card className="bg-zinc-950 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-black italic uppercase tracking-tighter flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-orange-500" />
                      Historial de Ajustes Manuales
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-medium text-zinc-500">
                      Registro de todas las modificaciones manuales a los días de membresía
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-zinc-900/50">
                        <TableRow className="border-zinc-800">
                          <TableHead className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Fecha</TableHead>
                          <TableHead className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Antes</TableHead>
                          <TableHead className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Nuevo</TableHead>
                          <TableHead className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Ajuste</TableHead>
                          <TableHead className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Autor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historialAjustes.length > 0 ? (
                          historialAjustes.map((ajuste) => (
                            <TableRow key={ajuste.id} className="border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                              <TableCell className="text-[11px] font-medium text-zinc-400">
                                {formatInColombiaTime(ajuste.created_at)}
                              </TableCell>
                              <TableCell className="text-xs font-bold text-zinc-500">{ajuste.dias_anteriores} d</TableCell>
                              <TableCell className="text-xs font-black text-white">{ajuste.dias_nuevos} d</TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  "text-[10px] font-black italic uppercase px-2 py-0.5 border-none",
                                  ajuste.dias_diferencia > 0 
                                    ? "bg-emerald-500/10 text-emerald-500" 
                                    : "bg-rose-500/10 text-rose-500"
                                )}>
                                  {ajuste.dias_diferencia > 0 ? '+' : ''}{ajuste.dias_diferencia}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-bold text-orange-500/80 uppercase tracking-tighter">
                                {ajuste.perfiles?.nombre} {ajuste.perfiles?.apellido}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-zinc-500 text-xs italic">
                              No hay ajustes manuales registrados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      <Dialog open={isDiasDialogOpen} onOpenChange={setIsDiasDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Ajustar Días
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Modifica los días restantes de la membresía actual.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-8 space-y-4 text-center">
            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 block mb-2">Días restantes de membresía</Label>
            <Input 
              type="number" 
              className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-16 text-3xl font-black text-center transition-all"
              value={newDias} 
              onChange={(e) => setNewDias(e.target.value)} 
            />
            <p className="text-[10px] text-zinc-500 italic">
              Este ajuste recalculará la fecha de vencimiento automáticamente.
            </p>
          </div>

          <div className="p-6 pt-2 bg-zinc-900/30 border-t border-zinc-800/50">
            <Button 
              onClick={handleUpdateDias} 
              disabled={isUpdating} 
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold uppercase tracking-widest text-xs border-none shadow-lg shadow-orange-900/20"
            >
              {isUpdating ? (
                <Dumbbell className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMedidaDialogOpen} onOpenChange={setIsMedidaDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-zinc-950 border-zinc-800 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
          
          <DialogHeader className="p-6 pb-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-orange-500" />
                  Nueva Medición
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Registra el progreso físico de {cliente?.nombre || 'cliente'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 pt-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <Label className="text-[10px] uppercase font-black text-zinc-500 group-focus-within:text-orange-500 transition-colors">Peso (kg)</Label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="0.0"
                    className="pl-10 h-14 bg-zinc-900/50 border-zinc-800 text-xl font-bold text-white focus:border-orange-500/50 focus:ring-orange-500/20 transition-all"
                    value={nuevaMedida.peso} 
                    onChange={(e) => setNuevaMedida({...nuevaMedida, peso: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2 group">
                <Label className="text-[10px] uppercase font-black text-zinc-500 group-focus-within:text-orange-500 transition-colors">Estatura (cm)</Label>
                <div className="relative">
                  <ArrowUpRight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <Input 
                    type="number" 
                    placeholder="0"
                    className="pl-10 h-14 bg-zinc-900/50 border-zinc-800 text-xl font-bold text-white focus:border-orange-500/50 focus:ring-orange-500/20 transition-all"
                    value={nuevaMedida.estatura} 
                    onChange={(e) => setNuevaMedida({...nuevaMedida, estatura: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Activity className="w-16 h-16 text-orange-500" />
              </div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-[10px] uppercase font-black text-orange-500/70">% Grasa Corporal</Label>
                <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-[8px] font-black text-orange-500 px-1.5 h-4">
                  AUTO-CALCULADO
                </Badge>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="0.0"
                  className="h-16 bg-transparent border-none text-4xl font-black text-orange-500 focus-visible:ring-0 p-0"
                  value={nuevaMedida.grasa} 
                  onChange={(e) => setNuevaMedida({...nuevaMedida, grasa: e.target.value})} 
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl font-black text-orange-500/30">%</span>
              </div>
              <p className="text-[10px] text-zinc-500 italic">
                * Estimación basada en IMC, edad y género. Puedes editarlo manualmente.
              </p>
            </div>

            <div className="space-y-2 group">
              <Label className="text-[10px] uppercase font-black text-zinc-500 group-focus-within:text-orange-500 transition-colors">Notas / Observaciones</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <textarea 
                  placeholder="Escribe alguna observación..."
                  className="w-full min-h-[80px] pl-10 pr-4 py-3 bg-zinc-900/50 border-zinc-800 rounded-md text-sm font-medium text-white focus:border-orange-500/50 focus:ring-orange-500/20 transition-all outline-none"
                  value={nuevaMedida.notas} 
                  onChange={(e) => setNuevaMedida({...nuevaMedida, notas: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800">
            <Button 
              onClick={handleRegistrarMedida} 
              disabled={isUpdating} 
              className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-900/20"
            >
              {isUpdating ? (
                <Dumbbell className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Guardar Medida
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotasDialogOpen} onOpenChange={setIsNotasDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <Pencil className="w-5 h-5 text-orange-500" />
              Editar Notas Médicas
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Actualiza el historial médico y observaciones de {cliente?.nombre}
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500">Alergias Conocidas</Label>
              <Input 
                className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 transition-all h-12"
                value={misNotas.alergia} 
                onChange={(e) => setMisNotas({...misNotas, alergia: e.target.value})} 
                placeholder="Ej: Ibuprofeno, Maní, Penicilina..." 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500">Observaciones / Lesiones / Limitaciones</Label>
              <textarea 
                className="w-full min-h-[150px] bg-zinc-900/50 border border-zinc-800 rounded-md p-3 text-sm focus:border-orange-500/50 transition-all outline-none resize-none"
                value={misNotas.notas} 
                onChange={(e) => setMisNotas({...misNotas, notas: e.target.value})} 
                placeholder="Detalla cualquier condición que deba ser tenida en cuenta durante el entrenamiento..."
              />
            </div>
          </div>

          <div className="p-6 pt-2 bg-zinc-900/30 border-t border-zinc-800/50">
            <Button 
              onClick={handleGuardarNotas} 
              disabled={isUpdating} 
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold uppercase tracking-widest text-xs border-none shadow-lg shadow-orange-900/20"
            >
              {isUpdating ? (
                <Dumbbell className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Actualizar Notas Médicas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditClienteOpen} onOpenChange={setIsEditClienteOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-white p-0">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <User className="w-6 h-6 text-orange-500" />
              Editar Perfil del Cliente
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Modifica los datos personales y de contacto de {cliente?.nombre}.
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 py-4 space-y-8 pb-12">
            {/* Sección: Datos Básicos */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/80 mb-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-orange-500/30"></span>
                Información Básica
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Nombre Completo</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.nombre || ''} 
                    onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Email</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.email || ''} 
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Teléfono</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.telefono || ''} 
                    onChange={(e) => setEditFormData({...editFormData, telefono: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Género</Label>
                  <Select 
                    value={editFormData.genero || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, genero: value})}
                  >
                    <SelectTrigger className="h-12 bg-zinc-900/50 border-zinc-800 focus:ring-0 focus:border-orange-500/50">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Fecha de Nacimiento</Label>
                  <Input 
                    type="date"
                    className="h-12 bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 [color-scheme:dark]"
                    value={editFormData.fecha_nacimiento || ''} 
                    onChange={(e) => setEditFormData({...editFormData, fecha_nacimiento: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Objetivos</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.objetivos || ''} 
                    onChange={(e) => setEditFormData({...editFormData, objetivos: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Sección: Ubicación */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/80 mb-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-orange-500/30"></span>
                Ubicación
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Barrio</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.barrio || ''} 
                    onChange={(e) => setEditFormData({...editFormData, barrio: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Dirección</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.direccion || ''} 
                    onChange={(e) => setEditFormData({...editFormData, direccion: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Sección: Emergencia */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/80 mb-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-orange-500/30"></span>
                Contacto de Emergencia
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Nombre de Contacto</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.contacto_emergencia_nombre || ''} 
                    onChange={(e) => setEditFormData({...editFormData, contacto_emergencia_nombre: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 ml-1">Teléfono de Emergencia</Label>
                  <Input 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-12 transition-all"
                    value={editFormData.contacto_emergencia_telefono || ''} 
                    onChange={(e) => setEditFormData({...editFormData, contacto_emergencia_telefono: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 p-8 bg-zinc-950 border-t border-zinc-800/80 flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12 border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-400 font-bold uppercase tracking-widest text-xs" 
              onClick={() => setIsEditClienteOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateCliente} 
              disabled={isUpdating} 
              className="flex-[2] h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold uppercase tracking-widest text-xs border-none shadow-lg shadow-orange-900/20"
            >
              {isUpdating ? (
                <Dumbbell className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

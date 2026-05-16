'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { QRCodeCanvas } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  CalendarDays,
  Dumbbell,
  Clock,
  Download,
  Users,
  User,
  ShieldCheck,
  ShieldAlert,
  RefreshCcw,
  LogIn,
  LogOut,
  MapPin,
  Circle,
  XCircle,
  Tag,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity,
  TrendingUp,
  History,
  QrCode as QrIcon,
  Monitor,
  Cake,
  PartyPopper
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { showPremiumToast } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/client'
import { buscarClientesAsistencia, registrarAsistenciaCliente, getAsistenciaHoy, registrarSalidaCliente } from '@/lib/supabase/actions/asistencia'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import { formatInColombiaTime } from '@/lib/date-utils'

import { SectionHeader } from '@/components/shared/SectionHeader'

export const dynamic = 'force-dynamic'

export default function AsistenciaPage() {
  const [searching, setSearching] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  
  // Paso 1: resultados de búsqueda
  const [resultados, setResultados] = useState<any[]>([])
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [hasBuscado, setHasBuscado] = useState(false)

  // Paso 2: registrar ingreso
  const [registrando, setRegistrando] = useState<string | null>(null) // ID del cliente en proceso
  const [resultadoIngreso, setResultadoIngreso] = useState<any>(null)
  const [errorIngreso, setErrorIngreso] = useState<string | null>(null)

  // Tabla de registros del día
  const [registros, setRegistros] = useState<any[]>([])
  const [loadingRegistros, setLoadingRegistros] = useState(true)
  const [isQrExpanded, setIsQrExpanded] = useState(true) // Expandido por defecto si es QR
  const [qrViewMode, setQrViewMode] = useState<'scanner' | 'gym-qr'>('gym-qr')
  const [scannerReady, setScannerReady] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scannerRefState, setScannerRefState] = useState<any>(null) // Para forzar re-render si fuera necesario
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [lastAuthorizedName, setLastAuthorizedName] = useState('')
  const [limitResultados, setLimitResultados] = useState(5)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [gymInfo, setGymInfo] = useState<any>(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  const totalPages = Math.ceil(registros.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRegistros = registros.slice(startIndex, startIndex + itemsPerPage)

  const stats = {
    total: registros.length,
    enSala: registros.filter(r => !r.fecha_hora_salida).length,
    ultimo: registros[0]?.fecha_hora_entrada
  }

  const fetchRegistros = async () => {
    setLoadingRegistros(true)
    try {
      const data = await getAsistenciaHoy()
      setRegistros(data)
      setLastSyncTime(new Date())
      setCurrentPage(1) // Resetear página al actualizar
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRegistros(false)
    }
  }

  useEffect(() => {
    fetchRegistros()
    
    // Cargar info del gimnasio
    const loadGym = async () => {
      const info = await getGimnasio()
      if (info) setGymInfo(info)
    }
    loadGym()
    
    // Configurar Supabase Realtime para sincronización instantánea
    const supabase = createClient()
    const channel = supabase
      .channel('asistencia_realtime_v2')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'asistencia' }, 
        (payload) => {
          console.log('NUEVO INGRESO DETECTADO:', payload)
          showPremiumToast.info('Actualización en Tiempo Real', "Se ha detectado un nuevo registro de asistencia.")
          fetchRegistros()
        }
      )
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'asistencia' }, 
        (payload) => {
          console.log('ACTUALIZACIÓN DETECTADA:', payload)
          fetchRegistros()
        }
      )
      .subscribe((status) => {
        console.log('Estado suscripción Realtime:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // PASO 1: Buscar clientes
  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!busqueda.trim()) return

    setSearching(true)
    setErrorBusqueda(null)
    setResultados([])
    setResultadoIngreso(null)
    setErrorIngreso(null)
    setHasBuscado(true)
    
    try {
      const response = await buscarClientesAsistencia(busqueda.trim())
      
      if (response.success && response.data.length > 0) {
        setResultados(response.data)
      } else {
        setErrorBusqueda(response.error || 'No se encontraron clientes.')
      }
    } catch (err) {
      console.error(err)
      setErrorBusqueda('Error de conexión con el servidor.')
    } finally {
      setSearching(false)
    }
  }

  // PASO 2: Registrar asistencia del cliente seleccionado
  const handleRegistrar = async (cliente: any) => {
    setRegistrando(cliente.id)
    setErrorIngreso(null)
    setResultadoIngreso(null)

    try {
      const response = await registrarAsistenciaCliente(cliente.id)

      if (response.success && response.data) {
        setLastAuthorizedName(cliente.nombre)
        setShowSuccessOverlay(true)
        setTimeout(() => setShowSuccessOverlay(false), 3000)

        setResultadoIngreso({
          nombre: cliente.nombre,
          documento: cliente.numero_documento,
          ...response.data,
        })
        if (response.data.esCumpleanos) {
          showPremiumToast.success('¡Feliz Cumpleaños! 🎂', `¡Hoy es el día especial de ${cliente.nombre}! Que tenga un excelente entrenamiento.`)
        } else if (response.data.esReingreso) {
          showPremiumToast.success('Re-ingreso Autorizado', `${cliente.nombre} ha vuelto a entrar a la sala.`)
        } else {
          showPremiumToast.success('Ingreso Exitoso', `${cliente.nombre} ha ingresado. Le quedan ${response.data.diasRestantes} días en su plan.`)
        }
        setResultados([]) // Limpiar resultados
        setBusqueda('')
        setHasBuscado(false)
        fetchRegistros() // Refrescar tabla
      } else {
        setErrorIngreso(`${cliente.nombre}: ${response.error}`)
        showPremiumToast.error('Acceso Denegado', `No se pudo autorizar a ${cliente.nombre}: ${response.error}`)
      }
    } catch (err) {
      console.error(err)
      setErrorIngreso('Error de conexión.')
      showPremiumToast.error('Error de Comunicación', 'No se pudo contactar con el servidor de seguridad.')
    } finally {
      setRegistrando(null)
    }
  }

  const handleRegistrarSalida = async (asistenciaId: string) => {
    try {
      const response = await registrarSalidaCliente(asistenciaId)
      if (response.success) {
        showPremiumToast.success('Salida Exitosa', 'Se ha registrado la salida del socio correctamente.')
        fetchRegistros()
      } else {
        showPremiumToast.error('Error en Salida', response.error)
      }
    } catch (err) {
      console.error(err)
      showPremiumToast.error('Fallo del Sistema', 'Ocurrió un error inesperado al procesar la salida.')
    }
  }

  // Lógica del Escáner QR
  useEffect(() => {
    if (isQrExpanded && qrViewMode === 'scanner') {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            async (decodedText) => {
              // Sonido o vibración de éxito si fuera posible
              setBusqueda(decodedText);
              setScannerReady(false);
              
              // Buscar y registrar
              const response = await buscarClientesAsistencia(decodedText.trim());
              if (response.success && response.data.length > 0) {
                const cliente = response.data[0];
                if (cliente.tieneMembresia && !cliente.estaEnSala) {
                  handleRegistrar(cliente);
                  // Detener scanner para evitar múltiples lecturas
                  if (scannerRef.current) {
                    await scannerRef.current.stop();
                    setIsQrExpanded(false);
                  }
                } else if (cliente.yaAsistioHoy) {
                  showPremiumToast.info('Estado de Socio', `${cliente.nombre} ya se encuentra registrado en la sala.`);
                } else {
                  showPremiumToast.error('Membresía Inactiva', `El socio ${cliente.nombre} no cuenta con un plan vigente.`);
                }
              } else {
                showPremiumToast.error('Socio No Encontrado', "El código QR escaneado no corresponde a ningún socio registrado.");
              }
            },
            (errorMessage) => {
              // Errores de lectura ignorados
            }
          );
          setScannerReady(true);
        } catch (err) {
          console.error("Error al iniciar scanner:", err);
          showPremiumToast.error('Cámara No Disponible', "No se pudo acceder a la cámara. Por favor, revisa los permisos de tu navegador.");
        }
      };

      startScanner();

      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
      };
    }
  }, [isQrExpanded, qrViewMode]);

  const handlePrintQR = async () => {
    try {
      showPremiumToast.info('Preparando QR', 'Estamos generando el documento PDF para tu gimnasio...')
      
      const canvas = document.getElementById('gym-qr-canvas') as HTMLCanvasElement
      
      if (!canvas) {
        alert('Error: No se encontró el código QR en la pantalla.')
        return
      }

      const qrImage = canvas.toDataURL('image/png')
      
      // Asegurarnos de tener la info del gimnasio
      let currentGymInfo = gymInfo
      if (!currentGymInfo) {
        const info = await getGimnasio()
        if (info) {
          setGymInfo(info)
          currentGymInfo = info
        }
      }

      const gymName = currentGymInfo?.nombre || 'GymControl'
      
      // Importar jsPDF dinámicamente para evitar que rompa el SSR/Hydration
      const { jsPDF } = await import('jspdf')

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      doc.setDrawColor(255, 90, 0)
      doc.setLineWidth(1.5)
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(32)
      doc.setFont('helvetica', 'bold')
      doc.text(gymName.toUpperCase(), pageWidth / 2, 35, { align: 'center' })

      doc.setTextColor(255, 90, 0)
      doc.setFontSize(20)
      doc.text('REGISTRO DE ASISTENCIA', pageWidth / 2, 48, { align: 'center' })

      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.5)
      doc.line(40, 58, pageWidth - 40, 58)

      const qrSize = 130
      const xPos = (pageWidth - qrSize) / 2
      doc.addImage(qrImage, 'PNG', xPos, 75, qrSize, qrSize)

      doc.setTextColor(60, 60, 60)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'normal')
      doc.text('1. Escanea el código con la cámara de tu móvil.', pageWidth / 2, pageHeight - 65, { align: 'center' })
      doc.text('2. El sistema registrará tu ingreso automáticamente.', pageWidth / 2, pageHeight - 57, { align: 'center' })

      doc.setTextColor(180, 180, 180)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('Generado por GymControl', pageWidth / 2, pageHeight - 25, { align: 'center' })

      const fileName = `QR-Asistencia-${gymName.replace(/\s+/g, '-')}.pdf`
      doc.save(fileName)
      showPremiumToast.success('¡Descarga Exitosa!', 'El PDF con el código QR ha sido generado y descargado.')

    } catch (err: any) {
      // Si falla cualquier cosa arriba, mostraremos un alert crudo para poder debuggear en el móvil del usuario
      alert(`Ocurrió un error al generar PDF: ${err?.message || 'Error desconocido'}`)
      
      try {
        const canvas = document.getElementById('gym-qr-canvas') as HTMLCanvasElement
        if (canvas) {
          canvas.toBlob(async (blob) => {
            if (!blob) return
            
            const file = new File([blob], 'QR.png', { type: 'image/png' })
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'QR Asistencia'
              })
            } else {
              const qrImage = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = qrImage
              link.download = `QR.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(qrImage)
            }
          }, 'image/png')
        }
      } catch (e) {
        alert('También falló el intento de respaldo como imagen.')
      }
    }
  }

  const gymQrValue = gymInfo ? `GYM_CONTROL_ASISTENCIA_${gymInfo.id}` : "GYM_CONTROL_ASISTENCIA_SECRET_TOKEN";

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in-fade">
        {/* Header simplificado */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
            Control de <span className="text-primary drop-shadow-[0_0_15px_rgba(255,90,0,0.3)]">Asistencia</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-bold uppercase tracking-widest opacity-80">
            Gimnasio <span className="text-zinc-300">{gymInfo?.nombre || 'Gestión Profesional'}</span>
          </p>
        </div>

        {/* Stats Summary Bar - Nueva sección accesible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-center gap-4 group transition-all hover:border-emerald-500/30">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">En Sala Ahora</p>
              <p className="text-2xl font-black text-white italic">{stats.enSala}</p>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-center gap-4 group transition-all hover:border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ingresos Hoy</p>
              <p className="text-2xl font-black text-white italic">{stats.total}</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-center gap-4 group transition-all hover:border-blue-500/30">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Último Ingreso</p>
              <p className="text-2xl font-black text-white italic">
                {stats.ultimo ? formatInColombiaTime(stats.ultimo, 'time') : '--:--'}
              </p>
            </div>
          </div>
        </div>

        {/* Buscador Principal - Full Width y Prominente */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-orange-600/30 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-5 md:p-8 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80 mb-6 px-2 flex items-center gap-3">
              <Search className="w-4 h-4" /> Búsqueda de Socio
            </h3>
            <form onSubmit={handleBuscar} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/60" />
                <Input 
                  placeholder="Nombre completo o número de cédula..." 
                  className="h-16 pl-16 bg-black/40 border-white/5 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-full text-xl text-white font-bold placeholder:text-zinc-700" 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  disabled={searching}
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                disabled={!busqueda.trim()} 
                loading={searching}
                className="h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-full shadow-[0_10px_30px_-10px_rgba(255,90,0,0.5)] transition-all hover:scale-[1.02] active:scale-95 text-sm"
              >
                Validar Ingreso
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3 items-start">
          {/* Columna Lateral: Lector QR y Errores */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group/qr transition-all duration-500 shadow-2xl h-fit">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <QrIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-black text-white uppercase tracking-tighter italic text-xl">
                    Punto <span className="text-primary">QR</span>
                  </h3>
                </div>
                <div className="flex bg-zinc-900/80 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-inner">
                  <button 
                    type="button"
                    onClick={() => {
                      setQrViewMode('gym-qr')
                      setIsQrExpanded(true)
                    }}
                    className={cn(
                      "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      qrViewMode === 'gym-qr' 
                        ? "bg-primary text-white shadow-lg" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Mi QR
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setQrViewMode('scanner')
                      setIsQrExpanded(false)
                    }}
                    className={cn(
                      "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      qrViewMode === 'scanner' 
                        ? "bg-primary text-white shadow-lg" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Lector
                  </button>
                </div>
              </div>

              {qrViewMode === 'scanner' ? (
                <div className="mb-4 relative z-10">
                  <div 
                    onClick={() => setIsQrExpanded(!isQrExpanded)}
                    className={cn(
                      "w-full aspect-square border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center bg-black/60 cursor-pointer transition-all duration-500 overflow-hidden relative",
                      isQrExpanded ? "border-primary/40 shadow-[0_0_40px_rgba(255,90,0,0.1)]" : "border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    {!isQrExpanded ? (
                      <>
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                          <Camera className="w-8 h-8 text-primary/60" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Toca para Iniciar Lector</p>
                      </>
                    ) : (
                      <div className="w-full h-full relative">
                        <div id="qr-reader" className="w-full h-full" />
                        {!scannerReady && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
                            <RefreshCcw className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Accediendo a Cámara...</p>
                          </div>
                        )}
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_25px_rgba(255,90,0,1)] animate-scan z-20" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-2xl animate-in fade-in zoom-in-95 duration-500 border border-white/10">
                    <div className="relative">
                      <QRCodeCanvas 
                        id="gym-qr-canvas"
                        ref={qrCanvasRef}
                        value={gymQrValue} 
                        size={256} 
                        level="H"
                        includeMargin={false}
                        className="qr-canvas w-full h-auto max-w-[200px]"
                      />
                    </div>
                    <div className="mt-8 text-center space-y-2">
                      <p className="text-zinc-900 text-2xl font-black uppercase italic tracking-tighter leading-none">
                        Registrar <span className="text-primary">Ingreso</span>
                      </p>
                      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">Escanea con tu móvil</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-8">
                    <Button
                      onClick={handlePrintQR}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] h-14 rounded-full shadow-lg transition-all active:scale-95 group"
                    >
                      <Download className="w-5 h-5 mr-3" />
                      Descargar QR en PDF
                    </Button>
                    <div className="text-center pt-2">
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        QR Oficial <span className="text-primary italic">
                          {gymInfo ? gymInfo.nombre : '...'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(errorBusqueda || errorIngreso) && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex shrink-0 items-center justify-center shadow-lg shadow-rose-500/30">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-rose-500 text-[11px] font-black uppercase tracking-widest mb-1">Error de Acceso</p>
                  <p className="text-rose-200/60 text-xs font-bold leading-relaxed">{errorBusqueda || errorIngreso}</p>
                </div>
              </div>
            )}
          </div>

          {/* Columna Principal: Resultados de Búsqueda */}
          <div className="lg:col-span-2 space-y-6">
            {resultados.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                    Socio{resultados.length > 1 ? 's' : ''} Detectado{resultados.length > 1 ? 's' : ''} ({resultados.length})
                  </span>
                </div>
                
                <div className="space-y-4">
                  {resultados.slice(0, limitResultados).map((cliente) => {
                    const hasActiveMem = cliente.tieneMembresia;
                    
                    return (
                      <div 
                        key={cliente.id} 
                        className="group relative bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 hover:border-primary/40 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                          {/* Avatar con Estado */}
                          <div className="relative shrink-0">
                            <div className={cn(
                              "w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500",
                              hasActiveMem 
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 group-hover:border-emerald-500/50" 
                                : "bg-rose-500/5 border-rose-500/20 text-rose-500 group-hover:border-rose-500/50"
                            )}>
                              <User className="w-10 h-10" />
                            </div>
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-zinc-950 flex items-center justify-center",
                              hasActiveMem ? "bg-emerald-500" : "bg-rose-500"
                            )}>
                              {hasActiveMem ? <CheckCircle2 className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
                            </div>
                          </div>

                          {/* Info del Cliente */}
                          <div className="flex-1 min-w-0 space-y-4">
                            <div>
                              <h4 className="font-black text-white text-2xl md:text-3xl tracking-tighter uppercase italic mb-1 break-words">
                                {cliente.nombre || 'Sin Nombre'}
                              </h4>
                              <p className="text-[12px] text-zinc-400 font-black tracking-widest uppercase flex items-center gap-2">
                                <Tag className="w-3 h-3 text-primary" /> CC: {cliente.numero_documento}
                              </p>
                              {cliente.esCumpleanos && (
                                <Badge className="mt-2 bg-pink-500 hover:bg-pink-600 text-white border-none animate-bounce py-1 px-3 rounded-full flex items-center gap-2 w-fit">
                                  <Cake className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">¡HOY ES SU CUMPLEAÑOS! 🎂</span>
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-6 p-4 bg-black/40 rounded-2xl border border-white/5">
                              <div className="space-y-1">
                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Plan Actual</p>
                                <p className="text-sm font-bold text-zinc-100">{cliente.planNombre}</p>
                              </div>
                              <div className="w-px h-8 bg-zinc-800" />
                              <div className="space-y-1">
                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Estado / Días</p>
                                <p className={cn(
                                  "text-sm font-black italic",
                                  !hasActiveMem ? "text-rose-500" : 
                                  cliente.diasRestantes <= 2 ? "text-amber-500" : "text-emerald-500"
                                )}>
                                  {hasActiveMem 
                                    ? `${cliente.diasRestantes} DÍAS ${cliente.diasRestantes <= 2 ? '(POR VENCER)' : '(ACTIVO)'}` 
                                    : 'VENCIDO'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Botón de Acción */}
                          <div className="shrink-0">
                            <Button 
                              disabled={!hasActiveMem || cliente.yaAsistioHoy}
                              onClick={() => handleRegistrar(cliente)}
                              loading={registrando === cliente.id}
                              className={cn(
                                "w-full md:w-auto h-20 md:h-24 px-10 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex flex-col gap-2",
                                cliente.estaEnSala 
                                  ? "bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-default" 
                                  : !hasActiveMem 
                                    ? "bg-rose-950/10 text-rose-600 border border-rose-900/20"
                                    : "bg-primary text-white hover:scale-105 active:scale-95 shadow-[0_15px_30px_-10px_rgba(255,90,0,0.5)]"
                              )}
                            >
                              {cliente.estaEnSala ? (
                                <>
                                  <Clock className="w-6 h-6 text-emerald-500" />
                                  <span className="text-emerald-500">En Sala</span>
                                </>
                              ) : cliente.yaAsistioHoy ? (
                                <>
                                  <CheckCircle2 className="w-6 h-6 text-amber-500" />
                                  <span className="text-amber-500">Ya Ingresó</span>
                                  <span className="text-[7px] opacity-60">Re-ingresar</span>
                                </>
                              ) : !hasActiveMem ? (
                                <>
                                  <ShieldAlert className="w-6 h-6" />
                                  <span>Inactivo</span>
                                </>
                              ) : (
                                <>
                                  <LogIn className="w-6 h-6" />
                                  <span>Autorizar</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {resultados.length > limitResultados && (
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 text-zinc-500 font-bold uppercase tracking-widest hover:text-white"
                      onClick={() => setLimitResultados(prev => prev + 5)}
                    >
                      Mostrar más resultados ({resultados.length - limitResultados})
                    </Button>
                  )}
                </div>
              </div>
            ) : !searching && busqueda && (
              <div className="flex flex-col items-center justify-center py-24 bg-zinc-950/30 border-2 border-dashed border-zinc-900 rounded-[3rem] text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-zinc-800" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">No se encontró al socio</h3>
                <p className="text-zinc-600 text-sm font-medium max-w-xs mx-auto">
                  Asegúrate de que el nombre o número de cédula sea correcto e intenta nuevamente.
                </p>
              </div>
            )}
          </div>
        </div>

            {/* PASO 2: Resultado exitoso */}
            {resultadoIngreso && (
              <Card className="border-emerald-500/30 bg-emerald-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{resultadoIngreso.nombre}</h3>
                      <p className="text-sm text-muted-foreground">CC: {resultadoIngreso.documento}</p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-border/50">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Membresía</p>
                          <p className="text-sm font-semibold">{resultadoIngreso.plan}</p>
                        </div>
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-border/50">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> Vencimiento
                          </p>
                          <p className="text-sm font-semibold">{resultadoIngreso.vencimiento}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <div>
                          <Badge className="bg-emerald-500 text-white border-none mb-1">
                            Ingreso Registrado
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {resultadoIngreso.diasRestantes === 0 
                              ? 'Plan diario consumido. Membresía cerrada.' 
                              : 'Se descontó 1 día/clase del plan.'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {resultadoIngreso.diasRestantes}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-emerald-600/70">Días Restantes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

        {/* ====== TABLA DE REGISTROS DEL DÍA ====== */}
        <Card className="glass-card border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="flex items-center w-full gap-2">
              <div className="flex items-center gap-2 italic font-bold tracking-tight uppercase">
                <Clock className="w-5 h-5 text-primary" />
                Registros de Hoy
                <Badge className="ml-2 bg-primary/20 text-primary border-none">{registros.length}</Badge>
              </div>
              <div className="ml-auto flex items-center gap-4">
                {lastSyncTime && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Sincronizado: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchRegistros} 
                  className="h-8 px-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors"
                  disabled={loadingRegistros}
                >
                  <RefreshCcw className={cn("w-3 h-3 mr-1", loadingRegistros && "animate-spin")} />
                  Actualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingRegistros ? (
              <div className="p-4 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full rounded-md bg-zinc-800/50" />
                ))}
              </div>
            ) : registros.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <Users className="w-10 h-10 mb-2 opacity-30" />
                <p>No hay registros de asistencia hoy</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow>
                        <TableHead className="w-[120px]">Estado</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Salida</TableHead>
                        <TableHead className="text-right">Método</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRegistros.map((r) => {
                        const esActivo = !r.fecha_hora_salida;
                        return (
                          <TableRow key={r.id} className="group hover:bg-secondary/20 transition-colors">
                            <TableCell>
                              {esActivo ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 flex items-center w-fit gap-1.5 animate-pulse">
                                  <Circle className="w-2 h-2 fill-current" />
                                  EN GIMNASIO
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground border-border/50 flex items-center w-fit gap-1.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  FINALIZADO
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-white text-base group-hover:text-primary transition-colors">
                                    {r.clientes?.nombre || '—'}
                                  </p>
                                  {r.esCumpleanos && (
                                    <div className="flex items-center gap-1 text-pink-500 animate-pulse" title="¡Cumpleaños!">
                                      <Cake className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-[11px] uppercase font-black text-zinc-400 tracking-wider">
                                  CC: {r.clientes?.numero_documento || '—'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-md w-fit border border-emerald-500/10">
                                <LogIn className="w-3.5 h-3.5" />
                                <span className="text-sm font-bold tracking-tight">
                                  {formatInColombiaTime(r.fecha_hora_entrada, 'time')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {r.fecha_hora_salida ? (
                                <div className="flex items-center gap-2 text-rose-500 bg-rose-500/5 px-2 py-1 rounded-md w-fit border border-rose-500/10">
                                  <LogOut className="w-3.5 h-3.5" />
                                  <span className="text-sm font-bold tracking-tight">
                                    {formatInColombiaTime(r.fecha_hora_salida, 'time')}
                                  </span>
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-[10px] uppercase font-black tracking-widest border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-rose-500/20"
                                  onClick={() => handleRegistrarSalida(r.id)}
                                >
                                  Marcar Salida
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-tighter px-2 bg-zinc-800 text-zinc-400 border-none">
                                {r.metodo_registro}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-border/50">
                  {paginatedRegistros.map((r) => {
                    const esActivo = !r.fecha_hora_salida;
                    return (
                      <div key={r.id} className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {esActivo && <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />}
                              <p className="font-black text-sm leading-tight">{r.clientes?.nombre || '—'}</p>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              CC: {r.clientes?.numero_documento || '—'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-black uppercase bg-zinc-900 border-border/50 text-muted-foreground">
                            {r.metodo_registro}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <span className="text-[9px] font-black text-emerald-500/60 uppercase flex items-center gap-1">
                              <LogIn className="w-2.5 h-2.5" /> Entrada
                            </span>
                            <span className="text-xs font-bold text-emerald-500">
                              {formatInColombiaTime(r.fecha_hora_entrada, 'time')}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-1 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 min-h-[44px] justify-center">
                            {r.fecha_hora_salida ? (
                              <>
                                <span className="text-[9px] font-black text-rose-500/60 uppercase flex items-center gap-1">
                                  <LogOut className="w-2.5 h-2.5" /> Salida
                                </span>
                                <span className="text-xs font-bold text-rose-500">
                                  {formatInColombiaTime(r.fecha_hora_salida, 'time')}
                                </span>
                              </>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-[9px] px-2 font-black uppercase tracking-tighter border-rose-500/40 text-rose-500 bg-rose-500/5"
                                onClick={() => handleRegistrarSalida(r.id)}
                              >
                                Marcar Salida
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                  <div className="border-t border-border/50 p-4 flex items-center justify-between bg-zinc-900/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-xs font-bold uppercase tracking-widest"
                    >
                      Anterior
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="text-xs font-bold uppercase tracking-widest"
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Success Overlay - Confirmación Visual Clara */}
        {showSuccessOverlay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="bg-emerald-500 text-white px-12 py-8 rounded-[3rem] shadow-[0_20px_50px_rgba(16,185,129,0.4)] animate-in zoom-in-90 fade-in duration-300 flex flex-col items-center gap-4 border-4 border-white/20 backdrop-blur-md">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">¡Ingreso Exitoso!</h2>
                <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">{lastAuthorizedName}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

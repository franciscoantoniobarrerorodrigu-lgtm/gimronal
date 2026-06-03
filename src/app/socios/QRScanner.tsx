'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode, Dumbbell, CheckCircle2, AlertCircle, Camera } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { showPremiumToast } from '@/lib/notifications'
import { registrarAsistenciaQR } from '@/lib/supabase/actions/portal'

interface QRScannerProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export default function QRScanner({ isOpen: controlledIsOpen, onOpenChange: controlledOnOpenChange, trigger }: QRScannerProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const setIsOpen = isControlled && controlledOnOpenChange ? controlledOnOpenChange : setInternalIsOpen

  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const qrWorkerRef = useRef<any>(null)

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }, [])

  const handleAttendance = useCallback(async (token?: string) => {
    setLoading(true)
    try {
      const result = await registrarAsistenciaQR(token)
      
      if (result.success) {
        showPremiumToast.success('Asistencia Registrada', result.message || 'Tu ingreso ha sido procesado correctamente')
        setIsOpen(false)
      } else {
        showPremiumToast.error('Error de Registro', result.error || 'No se pudo procesar tu asistencia')
      }
    } catch (error) {
      showPremiumToast.error('Fallo del Sistema', 'Ocurrió un error inesperado al procesar la asistencia')
    } finally {
      setLoading(false)
    }
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setScanning(false)

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          aspectRatio: { ideal: 1 }
        }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setScanning(true)

        // Dynamically import jsQR for scanning
        const jsQR = (await import('jsqr')).default

        const scanFrame = () => {
          if (!videoRef.current || !canvasRef.current || !streamRef.current) return
          
          const video = videoRef.current
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          
          if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationRef.current = requestAnimationFrame(scanFrame)
            return
          }

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          })

          if (code) {
            // QR detected! Stop scanning and process attendance
            stopCamera()
            handleAttendance(code.data)
            return
          }

          animationRef.current = requestAnimationFrame(scanFrame)
        }

        // Start scanning loop
        animationRef.current = requestAnimationFrame(scanFrame)
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Permiso de cámara denegado. Activa la cámara en los ajustes del navegador.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No se encontró cámara en este dispositivo.')
      } else {
        setCameraError('No se pudo activar la cámara. Intenta de nuevo.')
      }
      setScanning(false)
    }
  }, [stopCamera, handleAttendance])

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [isOpen, startCamera, stopCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        stopCamera()
        setCameraError(null)
      }
    }}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="w-[95vw] max-w-md rounded-[2.5rem] bg-black/80 backdrop-blur-3xl border border-white/10 p-6 shadow-[0_0_80px_-20px_rgba(249,115,22,0.2)] overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/30 rounded-full blur-[60px] pointer-events-none" />
        
        <DialogHeader className="pt-2 pb-2 relative z-10">
          <DialogTitle className="text-center text-xl sm:text-2xl font-black bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent tracking-tight">
            ESCANEAR QR
          </DialogTitle>
          <p className="text-center text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase mt-1">Sistema de Acceso</p>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 space-y-6 relative z-10">
          <div className="w-full aspect-square max-w-[320px] bg-gradient-to-b from-zinc-900 to-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative group transition-all ring-1 ring-white/5 mx-auto">
            {/* Live video feed */}
            <video 
              ref={videoRef}
              className="w-full h-full object-cover scale-[1.02]"
              playsInline
              muted
              autoPlay
              controls={false}
            />
            {/* Hidden canvas for QR processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <CheckCircle2 className="w-6 h-6 text-primary absolute animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white tracking-widest uppercase">Procesando</p>
                <p className="text-[10px] text-zinc-400 mt-1">Verificando asistencia...</p>
              </div>
            )}

            {/* Initializing / Manual Start state */}
            {!scanning && !loading && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                {/* Decorative grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/10 flex items-center justify-center relative shadow-2xl backdrop-blur-md">
                      <Camera className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1.5">
                    <h3 className="text-lg font-black text-white tracking-widest uppercase">Cámara Inactiva</h3>
                    <p className="text-xs text-zinc-400 font-medium px-4">Activa tu cámara para registrar tu acceso</p>
                  </div>

                  <Button 
                    onClick={startCamera}
                    className="relative group bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-black tracking-widest text-xs py-6 px-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(249,115,22,0.8)] hover:scale-105 transition-all overflow-hidden border border-white/20"
                  >
                    <div className="absolute inset-0 bg-white/20 w-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                    INICIAR ESCÁNER
                  </Button>
                </div>
              </div>
            )}

            {/* Error state */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-sm text-red-400 text-center">{cameraError}</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={startCamera}
                  className="mt-2"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Reintentar cámara
                </Button>
              </div>
            )}

            {/* Scanning overlay guide */}
            {scanning && !loading && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="w-[65%] h-[65%] relative">
                  {/* Animated Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse" />
                  
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(249,115,22,0.15)] rounded-2xl" />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {!cameraError && (
            <div className="text-center space-y-2 max-w-[280px]">
              <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                Ubica el código QR dentro del recuadro para registrar tu asistencia automáticamente.
              </p>
            </div>
          )}


          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl font-bold tracking-widest uppercase text-xs w-full py-6 mt-2"
          >
            Cerrar Escáner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

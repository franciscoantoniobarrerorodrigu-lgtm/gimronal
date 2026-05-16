'use client'

import { QRCodeCanvas } from 'qrcode.react'
import { Dumbbell, Printer, Smartphone, CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'

export default function QRAsistenciaPage() {
  const [gymInfo, setGymInfo] = useState<any>(null)

  useEffect(() => {
    const loadGym = async () => {
      const info = await getGimnasio()
      if (info) setGymInfo(info)
    }
    loadGym()
  }, [])

  const qrValue = gymInfo ? `GYM_CONTROL_ASISTENCIA_${gymInfo.id}` : "GYM_CONTROL_ASISTENCIA_SECRET_TOKEN"
  const gymName = gymInfo?.nombre || "GymControl"

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadImage = () => {
    const canvas = document.querySelector('.qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_Asistencia_${gymName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .qr-container { border: none !important; box-shadow: none !important; margin-top: 50px !important; }
          .qr-canvas { width: 400px !important; height: 400px !important; }
        }
      `}</style>

      <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 no-print">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Dumbbell className="text-primary-foreground w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">{gymName}</h1>
        </div>

        {/* QR Card */}
        <div className="qr-container bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 sm:p-16 rounded-[40px] shadow-2xl flex flex-col items-center space-y-8 w-full">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Registro de Asistencia</h2>
            <p className="text-zinc-400">Escanea este código para entrar o salir</p>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-inner">
            <QRCodeCanvas 
              value={qrValue} 
              size={256} 
              level="H"
              includeMargin={false}
              className="qr-canvas"
            />
          </div>

          <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700/50">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">Punto de Control Oficial</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full no-print">
          <div className="flex items-start gap-4 text-left p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Abre tu Portal</h3>
              <p className="text-xs text-zinc-500 mt-1">Ingresa a tu cuenta desde tu celular.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Escanea y Listo</h3>
              <p className="text-xs text-zinc-500 mt-1">Tu asistencia se marcará al instante.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full no-print mt-4">
          <Button 
            onClick={handlePrint}
            variant="outline"
            className="flex-1 h-14 rounded-2xl gap-2 font-bold text-lg border-primary/20 hover:bg-primary/10 transition-all"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </Button>
          <Button 
            onClick={handleDownloadImage}
            className="flex-1 h-14 rounded-2xl gap-2 font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Download className="w-5 h-5" />
            Descargar Imagen
          </Button>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-zinc-600 text-xs uppercase tracking-[0.2em] font-medium no-print">
        Powered by GymControl System
      </div>
    </div>
  )
}

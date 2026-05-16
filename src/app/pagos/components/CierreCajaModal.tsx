'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Printer, X, Banknote, CreditCard, Receipt, Calendar, ArrowUpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCOP } from '@/lib/format-utils'

interface CierreCajaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    ingresosHoy: number
    efectivoHoy: number
    transferenciasHoy: number
    totalPagos: number
  }
}

export const CierreCajaModal = ({ open, onOpenChange, data }: CierreCajaModalProps) => {
  if (!open) return null


  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300",
      open ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="bg-[#0a0a0a] border border-primary/20 w-full max-w-md rounded-[2rem] shadow-[0_0_50px_-12px_rgba(255,90,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-primary tracking-tighter uppercase">CIERRE DE CAJA</h2>
            <div className="flex items-center gap-2 text-primary/60">
              <Calendar className="w-3 h-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Resumen Diario</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-primary transition-colors border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-8" id="cierre-print">
          {/* FECHA DISPLAY */}
          <div className="text-center">
            <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Periodo Actual</p>
            <p className="text-sm font-bold text-zinc-100 uppercase italic">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Bogota' })}
            </p>
          </div>

          <div className="space-y-4">
            {/* TOTAL CARDI */}
            <div className="relative overflow-hidden p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col items-center text-center group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowUpCircle className="w-20 h-20 text-primary" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Total Recaudado Hoy</span>
              <span className="text-4xl font-black text-primary tracking-tighter drop-shadow-2xl">
                {formatCOP(data.ingresosHoy)}
              </span>
            </div>

            {/* SPLIT CARDS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <Banknote className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">Efectivo</span>
                </div>
                <p className="text-lg font-black text-zinc-100">{formatCOP(data.efectivoHoy)}</p>
              </div>

              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <CreditCard className="w-3 h-3 text-blue-500" />
                  </div>
                  <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">Bancos</span>
                </div>
                <p className="text-lg font-black text-zinc-100">{formatCOP(data.transferenciasHoy)}</p>
              </div>
            </div>

            {/* STATS */}
            <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-900 mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Transacciones</span>
                </div>
                <span className="text-sm font-black text-zinc-100">{data.totalPagos}</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-900 pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-500 border-dashed" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Inicial</span>
                </div>
                <span className="text-sm font-black text-zinc-500 italic">$ 0</span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] hidden print:block">
            GymControl Ledger - {new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-zinc-950/80 border-t border-primary/10 flex gap-3">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-900" 
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button 
            className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-[0_4px_20px_-5px_rgba(255,90,0,0.5)]" 
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cierre-print, #cierre-print * {
            visibility: visible;
          }
          #cierre-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          #cierre-print * {
            color: black !important;
            border-color: #ddd !important;
          }
        }
      `}</style>
    </div>
  )
}

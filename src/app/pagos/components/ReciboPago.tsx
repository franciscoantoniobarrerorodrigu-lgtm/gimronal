'use client'

import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCOP } from '@/lib/format-utils'

interface ReciboPagoProps {
  pago: any
  gimnasio: any
}

export const ReciboPago = ({ pago, gimnasio }: ReciboPagoProps) => {
  if (!pago) return null


  return (
    <div className="bg-white text-black p-8 max-w-[400px] mx-auto border border-gray-200 font-sans shadow-lg rounded-xl overflow-hidden" id="recibo-print">
      {/* Header */}
      <div className="text-center border-b-2 border-zinc-100 pb-6 mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">{gimnasio?.nombre || 'GIMRONAL'}</h2>
        <div className="mt-2 space-y-0.5">
          <p className="text-[10px] font-bold text-zinc-500 uppercase">{gimnasio?.direccion || 'Dirección del Gimnasio'}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase">NIT: {gimnasio?.nit || '000000000-0'}</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase">Tel: {gimnasio?.telefono || '300 000 0000'}</p>
        </div>
      </div>

      {/* Info Recibo */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recibo de Pago</p>
          <p className="text-sm font-black text-zinc-900 uppercase">N° {pago.recibo_numero || '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-900 uppercase">
            {format(new Date(pago.fecha_pago), "dd 'de' MMMM, yyyy", { locale: es })}
          </p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase">
            {format(new Date(pago.fecha_pago), "hh:mm a")}
          </p>
        </div>
      </div>

      {/* Info Cliente */}
      <div className="bg-zinc-50 p-4 rounded-lg mb-6 border border-zinc-100">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Cliente</p>
          <p className="text-sm font-black text-zinc-900 uppercase">{pago.clientes?.nombre}</p>
          <p className="text-[10px] font-bold text-zinc-500">CC/NIT: {pago.clientes?.numero_documento}</p>
        </div>
      </div>

      {/* Detalle */}
      <div className="mb-8">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-2 mb-2">
          <span className="text-[10px] font-black text-zinc-400 uppercase">Concepto</span>
          <span className="text-[10px] font-black text-zinc-400 uppercase text-right">Valor</span>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-zinc-800 uppercase max-w-[70%]">{pago.concepto}</p>
          <p className="text-sm font-black text-zinc-900">
            {formatCOP(pago.monto)}
          </p>
        </div>
      </div>

      {/* Totales */}
      <div className="border-t-2 border-zinc-900 pt-4 mb-10">
        <div className="flex justify-between items-center">
          <span className="text-sm font-black text-zinc-900 uppercase tracking-widest">Total Pagado</span>
          <span className="text-2xl font-black text-zinc-900 tracking-tighter">{formatCOP(pago.monto)}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-900" />
          <p className="text-[10px] font-black text-zinc-500 uppercase italic">Método: {pago.metodo_pago}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-dashed border-zinc-200 pt-6">
        <p className="text-[11px] font-black text-zinc-900 uppercase italic mb-1 italic">¡Gracias por tu confianza!</p>
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Este documento es un soporte oficial de pago</p>
        <p className="mt-4 text-[8px] font-bold text-zinc-300 uppercase tracking-[0.2em]">GymControl • Ledger System</p>
      </div>

      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #recibo-print, #recibo-print * {
            visibility: visible;
          }
          #recibo-print {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 100%;
            border: none;
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}

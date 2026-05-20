'use client'

import React, { useState } from 'react'
import { 
  Building2, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Crown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GymActions } from './GymActions'
import { cn } from '@/lib/utils'

interface GymListClientProps {
  initialGyms: any[]
}

export function GymListClient({ initialGyms }: GymListClientProps) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredGyms = initialGyms.filter(gym => {
    const admin = gym.perfiles?.find((p: any) => p.rol === 'admin') || gym.perfiles?.[0]
    const searchLower = search.toLowerCase()
    return (
      gym.nombre.toLowerCase().includes(searchLower) ||
      admin?.nombre?.toLowerCase().includes(searchLower) ||
      admin?.email?.toLowerCase().includes(searchLower) ||
      gym.nit?.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredGyms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedGyms = filteredGyms.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <Input
          placeholder="Buscar gimnasio, admin o NIT..."
          className="pl-10 sm:pl-12 h-12 sm:h-14 bg-white/[0.02] border-white/5 rounded-xl sm:rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/50 text-sm sm:text-lg transition-all"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Grid View */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {paginatedGyms.map((gym) => {
          const admin = gym.perfiles?.find((p: any) => p.rol === 'admin') || gym.perfiles?.[0]
          const isExpired = gym.vencimiento_licencia && new Date(gym.vencimiento_licencia) < new Date()
          
          return (
            <div 
              key={gym.id} 
              className="group relative bg-zinc-950/40 border border-white/5 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-8 transition-all hover:border-blue-500/30 hover:bg-zinc-900/40 shadow-2xl overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative space-y-6 sm:space-y-8">
                {/* Header: Gym Name & Status */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-5 min-w-0">
                    <div className="relative shrink-0 mt-1">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-lg sm:text-xl font-black text-white shadow-2xl group-hover:scale-110 transition-transform border border-white/10">
                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 h-6 bg-zinc-950 rounded-full flex items-center justify-center border border-white/10">
                        <Crown className={cn("w-3 sm:w-3.5 h-3 sm:h-3.5", isExpired ? "text-zinc-500" : "text-amber-500")} />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-white text-xl sm:text-2xl lg:text-3xl tracking-tighter leading-tight break-words">
                          {gym.nombre}
                        </h3>
                        <div className="sm:hidden">
                          {isExpired ? (
                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-2 py-0.5 font-black text-[8px] uppercase tracking-widest animate-pulse">
                              EXPIRADA
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 font-black text-[8px] uppercase tracking-widest">
                              ACTIVA
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.2em] mt-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ID: {gym.nit || 'SIN NIT'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block shrink-0 pt-2">
                    {isExpired ? (
                      <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-widest animate-pulse">
                        EXPIRADA
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
                        ACTIVA
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl sm:rounded-3xl p-5 space-y-2 group/info hover:bg-white/[0.05] transition-colors">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Responsable</span>
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-100 text-lg leading-tight break-words">
                        {admin?.nombre || 'Administrador'}
                      </p>
                      <p className="text-xs text-zinc-500 font-medium break-all flex items-center gap-1.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        {admin?.email || 'Sin correo'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl sm:rounded-3xl p-5 space-y-2 group/info hover:bg-white/[0.05] transition-colors">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Vencimiento</span>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-xl">
                        <Calendar className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="font-mono text-xl font-black text-zinc-100 tracking-tighter">
                        {gym.vencimiento_licencia 
                          ? new Date(gym.vencimiento_licencia).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                      Creado: {gym.creado_en ? new Date(gym.creado_en).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GymActions gymId={gym.id} gymName={gym.nombre} isActive={gym.activo !== false} hasDian={gym.modulo_dian_activo === true} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-xl mt-8">
          <div className="text-zinc-500 text-sm font-medium">
            Mostrando <span className="text-white font-black">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredGyms.length)}</span> de <span className="text-white font-black">{filteredGyms.length}</span> gimnasios
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="bg-zinc-900/50 border-white/10 hover:bg-zinc-800 text-white rounded-xl h-12 px-6"
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(i + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={cn(
                    "w-10 h-10 rounded-xl font-bold transition-all",
                    currentPage === i + 1 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>

            <Button
              variant="outline"
              size="lg"
              className="bg-zinc-900/50 border-white/10 hover:bg-zinc-800 text-white rounded-xl h-12 px-6"
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {filteredGyms.length === 0 && (
        <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem]">
          <p className="text-zinc-500 font-medium italic">No se encontraron gimnasios que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  )
}

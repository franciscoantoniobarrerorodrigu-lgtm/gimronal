'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { 
  Plus, Search, MoreHorizontal, UserPlus, Filter, Download,
  CreditCard, QrCode, Eye, Dumbbell, User, ShieldAlert, Pencil,
  KeyRound, Users, Trash2, AlertCircle, FileSpreadsheet, ChevronLeft, ChevronRight
} from 'lucide-react'
import { actualizarEstadoCliente, cambiarPasswordClienteAction, eliminarClienteAction } from '@/lib/supabase/actions/clientes'
import { useAction } from 'next-safe-action/hooks'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { showPremiumToast } from '@/lib/notifications'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

import { SectionHeader } from '@/components/shared/SectionHeader'
import { EmptyState } from '@/components/ui/empty-state'

function toTitleCase(str: string) {
  if (!str) return ''
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1))
  }).join(' ')
}

export default function ClientesClient({ initialClients }: { initialClients: any[] }) {
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useQueryState('search', { defaultValue: '' })
  const [activeTab, setActiveTab] = useQueryState<'todos' | 'activos' | 'vencidos' | 'por_vencer'>('tab', { 
    defaultValue: 'todos',
    parse: (value) => value as 'todos' | 'activos' | 'vencidos' | 'por_vencer'
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeTab])

  const filteredClients = initialClients.filter(c => {
    const name = (c.nombre || '').toLowerCase()
    const doc = (c.numero_documento || '').toLowerCase()
    const search = searchTerm.toLowerCase()

    const matchesSearch = name.includes(search) || doc.includes(search)
    
    if (!matchesSearch) return false

    if (activeTab === 'todos') return true
    if (activeTab === 'activos') return c.estado === 'activo'
    if (activeTab === 'vencidos') return c.estado === 'vencido' || c.estado === 'inactivo'
    if (activeTab === 'por_vencer') return c.dias_restantes > 0 && c.dias_restantes <= 2

    return true
  })

  const getPlanBadgeStyle = (planName: string) => {
    const name = (planName || '').toLowerCase()
    if (name.includes('mensual')) return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    if (name.includes('semana')) return "bg-purple-500/10 text-purple-400 border-purple-500/20"
    if (name.includes('diario')) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (name.includes('año') || name.includes('anual')) return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  }

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6 md:space-y-10 animate-in-fade">
      <SectionHeader 
        title="Gestión de Clientes" 
        subtitle="Administra la base de datos de socios, sus membresías y estados de acceso."
      >
        <Button variant="outline" className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
        <Link href="/clientes/nuevo">
          <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </Link>
      </SectionHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 glass-card p-4 rounded-2xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Buscar por nombre, documento o teléfono..." 
              className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 h-11"
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value || null)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-11 border-white/10 bg-white/5 flex-1 md:flex-initial">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button 
              variant="outline" 
              className="h-11 border-white/10 bg-white/5 flex-1 md:flex-initial"
              onClick={() => showPremiumToast.info('Procesando Datos', 'Generando reporte de clientes en formato Excel...')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 px-1">
          {[
            { id: 'todos', label: 'Todos', count: initialClients.length },
            { id: 'activos', label: 'Activos', count: initialClients.filter(c => c.estado === 'activo').length },
            { id: 'por_vencer', label: 'Por Vencer', count: initialClients.filter(c => c.dias_restantes > 0 && c.dias_restantes <= 2).length },
            { id: 'vencidos', label: 'Vencidos', count: initialClients.filter(c => c.estado === 'vencido' || c.estado === 'inactivo').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab.label} <span className="ml-1 opacity-60 text-[10px]">({tab.count})</span>
            </button>
          ))}
          <div className="ml-auto text-[11px] text-zinc-500 font-medium hidden sm:block">
            Mostrando {filteredClients.length} de {initialClients.length} clientes
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Vista de Escritorio - Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Plan Actual</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48">
                    <EmptyState 
                      icon={Users}
                      title="No se encontraron clientes"
                      description="No hay clientes registrados o ninguno coincide con tu búsqueda."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => {
                  const isNearExpiring = client.dias_restantes > 0 && client.dias_restantes <= 2
                  const isPrueba = (client.nombre || '').toLowerCase().includes('prueba')

                  return (
                    <TableRow 
                      key={client.id} 
                      className={`hover:bg-secondary/20 transition-colors group ${isNearExpiring ? 'bg-amber-500/[0.02]' : ''} ${isPrueba ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    >
                      <TableCell>
                        <div className="relative">
                          <div className="relative w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                            {client.foto_url ? (
                              <Image src={client.foto_url} alt={client.nombre} fill className="object-cover" sizes="40px" />
                            ) : (
                              <span className="font-bold text-zinc-400 text-xs">
                                {client.nombre?.split(' ').map((n: string) => n[0]).slice(0,2).join('') || 'U'}
                              </span>
                            )}
                          </div>
                          {isNearExpiring && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#09090b] flex items-center justify-center">
                              <AlertCircle className="w-2.5 h-2.5 text-black" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={isPrueba ? "line-through text-zinc-500" : ""}>
                            {toTitleCase(client.nombre)}
                          </span>
                          {isPrueba && <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Dato de prueba</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 font-mono text-xs">{client.tipo_documento} {client.numero_documento}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`py-0.5 px-2 text-[10px] font-bold uppercase tracking-wider border-none ${getPlanBadgeStyle(client.plan)}`}
                        >
                          {client.plan || 'Sin Plan'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`font-medium text-sm ${isNearExpiring ? 'text-amber-500' : 'text-zinc-300'}`}>
                            {client.vencimiento && client.vencimiento !== 'N/A' 
                              ? new Date(client.vencimiento + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : '---'}
                          </span>
                          {client.dias_restantes > 0 && (
                            <span className={`text-[10px] font-black uppercase ${isNearExpiring ? 'text-amber-500' : 'text-emerald-500/70'}`}>
                              {isNearExpiring ? '⚠️ vence pronto' : `Vence en ${client.dias_restantes} días`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.estado === 'activo' && (
                          <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit border border-emerald-500/20">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase">Activo</span>
                          </div>
                        )}
                        {(client.estado === 'vencido' || client.estado === 'inactivo') && (
                          <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full w-fit border border-rose-500/20">
                            <div className="w-1 h-1 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-bold uppercase">Vencido</span>
                          </div>
                        )}
                        {client.estado === 'por_vencer' && (
                          <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit border border-amber-500/20">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-bold uppercase">Por Vencer</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ClientActions client={client} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Vista Móvil - Tarjetas */}
        <div className="md:hidden flex flex-col gap-3 mt-2">
          {filteredClients.length === 0 ? (
            <EmptyState 
              icon={Users}
              title="No se encontraron clientes"
              description="Ningún cliente coincide con tu búsqueda."
              className="border-none bg-transparent"
            />
          ) : (
            paginatedClients.map((client) => {
              const isNearExpiring = client.dias_restantes > 0 && client.dias_restantes <= 2;
              const isPrueba = (client.nombre || '').toLowerCase().includes('prueba');
              
              return (
                <div 
                  key={client.id} 
                  className={`relative p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                    isNearExpiring 
                      ? 'bg-amber-500/[0.03] border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                  } overflow-hidden`}
                >
                  {isNearExpiring && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="relative">
                        <div className={`relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-xs border uppercase overflow-hidden ${
                          isNearExpiring ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {client.foto_url ? (
                            <Image src={client.foto_url} alt={client.nombre} fill className="object-cover" sizes="48px" />
                          ) : (
                            client.nombre?.split(' ').map((n: string) => n[0]).slice(0,2).join('') || 'U'
                          )}
                        </div>
                        {isNearExpiring && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#09090b] flex items-center justify-center shadow-lg">
                            <AlertCircle className="w-2.5 h-2.5 text-black" />
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`font-semibold text-sm truncate ${isPrueba ? 'line-through text-zinc-500' : 'text-foreground'}`}>
                            {toTitleCase(client.nombre)}
                          </p>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mb-2 font-mono">
                          {client.tipo_documento} {client.numero_documento}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] py-0 h-4 px-1.5 border-none uppercase font-bold tracking-wider ${getPlanBadgeStyle(client.plan)}`}
                          >
                            {client.plan || 'Sin Plan'}
                          </Badge>
                          
                          {/* Status Indicator */}
                          {client.estado === 'activo' && (
                            <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-500 uppercase">Activo</span>
                            </div>
                          )}
                          {(client.estado === 'vencido' || client.estado === 'inactivo') && (
                            <div className="flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span className="text-[9px] font-bold text-rose-500 uppercase">Vencido</span>
                            </div>
                          )}
                          {client.estado === 'por_vencer' && (
                            <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span className="text-[9px] font-bold text-amber-500 uppercase">Por Vencer</span>
                            </div>
                          )}
                        </div>
                        
                        {(client.vencimiento && client.vencimiento !== 'N/A') && (
                          <p className={`text-[10px] mt-2 font-medium ${isNearExpiring ? 'text-amber-500' : 'text-zinc-500'}`}>
                            Vence: {new Date(client.vencimiento + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            {client.dias_restantes > 0 && (
                              <span className="ml-1 opacity-80">({client.dias_restantes} días)</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="pl-1 border-l border-white/5 ml-auto self-stretch flex items-center justify-center">
                      <ClientActions client={client} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-white/5 bg-white/[0.01] rounded-b-2xl">
            <div className="text-xs text-zinc-400 hidden sm:block">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredClients.length)} de {filteredClients.length}
            </div>
            <div className="flex gap-2 items-center w-full sm:w-auto justify-between sm:justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              <div className="flex items-center px-4 h-9 text-xs font-bold text-white bg-white/5 rounded-lg border border-white/10 tracking-widest uppercase">
                <span className="sm:hidden">{currentPage} / {totalPages}</span>
                <span className="hidden sm:inline">Pág {currentPage} de {totalPages}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ClientActions({ client }: { client: any }) {
  const router = useRouter()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const { execute: executePasswordChange, isExecuting: isUpdatingPassword } = useAction(cambiarPasswordClienteAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        showPremiumToast.success('Acceso Actualizado', 'La contraseña del socio ha sido modificada correctamente.')
        setIsPasswordDialogOpen(false)
        setNewPassword('')
      }
    },
    onError: ({ error }) => {
      showPremiumToast.error('Fallo de Actualización', error.serverError || error.validationErrors?._errors?.[0] || 'Ocurrió un error')
    }
  })

  const { execute: executeDelete } = useAction(eliminarClienteAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        showPremiumToast.success('Socio Eliminado', 'El registro ha sido removido permanentemente.')
        window.location.reload()
      }
    },
    onError: ({ error }) => {
      showPremiumToast.error('Fallo al Eliminar', error.serverError || 'Ocurrió un error al intentar eliminar el cliente')
    }
  })

  const handlePasswordChange = async () => {
    executePasswordChange({ clienteId: client.id, nuevaPassword: newPassword })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones para {client.nombre?.split(' ')[0]}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/clientes/${client.id}`)}>
              <Eye className="w-4 h-4 mr-2" /> Ver Perfil Completo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/clientes/${client.id}?edit=true`)}>
              <Pencil className="w-4 h-4 mr-2" /> Editar Información
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/pagos?documento=${client.numero_documento}`)}>
              <CreditCard className="w-4 h-4 mr-2" /> Gestionar Pagos/Plan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
              <KeyRound className="w-4 h-4 mr-2" /> Cambiar Contraseña
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => showPremiumToast.info('Generando QR', 'Estamos preparando el código de acceso digital del socio...')}>
              <QrCode className="w-4 h-4 mr-2" /> Mostrar QR de Acceso
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm(`¿Estás seguro de ELIMINAR permanentemente a ${client.nombre}? Esta acción no se puede deshacer.`)) {
                executeDelete({ clienteId: client.id });
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar Cliente
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {client.estado === 'inactivo' ? (
            <DropdownMenuItem 
              className="text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10"
              onClick={async () => {
                if (window.confirm(`¿Estás seguro de activar a ${client.nombre}?`)) {
                  const result = await actualizarEstadoCliente(client.id, 'activo');
                  if (result.success) {
                    showPremiumToast.success('Socio Activado', `El socio ${client.nombre} ahora tiene acceso al sistema.`)
                    window.location.reload();
                  } else {
                    showPremiumToast.error('Error de Activación', result.error);
                  }
                }
              }}
            >
              Activar Cliente
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
              onClick={async () => {
                if (window.confirm(`¿Estás seguro de desactivar a ${client.nombre}?`)) {
                  const result = await actualizarEstadoCliente(client.id, 'inactivo');
                  if (result.success) {
                    showPremiumToast.success('Socio Desactivado', `El acceso de ${client.nombre} ha sido suspendido temporalmente.`)
                    window.location.reload();
                  } else {
                    showPremiumToast.error('Error de Desactivación', result.error);
                  }
                }
              }}
            >
              Desactivar Cliente
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Asigna una nueva contraseña para que el cliente {client.nombre} pueda ingresar al portal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="text"
                placeholder="Ingresa la nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Si se deja en blanco, seguirá siendo el número de documento.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordChange} loading={isUpdatingPassword}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

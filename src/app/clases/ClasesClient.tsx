'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Dumbbell,
  Users,
  Loader2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Database } from '@/types/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClase, updateClase, deleteClase } from '@/lib/supabase/actions/clases'

type ClaseRow = Database['public']['Tables']['clases']['Row'] & {
  entrenadores: { id: string; nombre: string } | null
}
type EntrenadorRow = Database['public']['Tables']['entrenadores']['Row']

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
// Expandir las horas según la lógica de DB
const horas = ['06:00:00', '07:00:00', '08:00:00', '09:00:00', '10:00:00', '17:00:00', '18:00:00', '19:00:00', '20:00:00']

// Helpers para formato de hora
function formatTime(timeStr: string) {
  const [hour, minute] = timeStr.split(':')
  const h = parseInt(hour, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const formattedHour = h % 12 || 12
  return `${formattedHour.toString().padStart(2, '0')}:${minute} ${ampm}`
}

export function ClasesClient({ initialClases, entrenadores }: { initialClases: ClaseRow[], entrenadores: EntrenadorRow[] }) {
  const router = useRouter()
  const [clases, setClases] = useState<ClaseRow[]>(initialClases)
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedClaseId, setSelectedClaseId] = useState<string | null>(null)
  
  // Form state
  const defaultFormData = {
    nombre: '',
    dia_semana: 'Lunes',
    hora_inicio: '06:00:00',
    hora_fin: '07:00:00',
    entrenador_id: '',
    sala: '',
    cupo_maximo: 20,
    color: 'bg-primary'
  }
  const [formData, setFormData] = useState(defaultFormData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'cupo_maximo' ? parseInt(value) || 0 : value }))
  }

  const openCreateDialog = (dia?: string, hora?: string) => {
    setSelectedClaseId(null)
    setFormData({
      ...defaultFormData,
      dia_semana: dia || 'Lunes',
      hora_inicio: hora || '06:00:00',
    })
    setIsOpen(true)
  }

  const openEditDialog = (clase: ClaseRow) => {
    setSelectedClaseId(clase.id)
    setFormData({
      nombre: clase.nombre || '',
      dia_semana: clase.dia_semana || 'Lunes',
      hora_inicio: clase.hora_inicio || '06:00:00',
      hora_fin: clase.hora_fin || '07:00:00',
      entrenador_id: clase.entrenador_id || '',
      sala: clase.sala || '',
      cupo_maximo: clase.cupo_maximo || 20,
      color: clase.color || 'bg-primary'
    })
    setIsOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedClaseId) return
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta clase?')) return

    setIsDeleting(true)
    const result = await deleteClase(selectedClaseId)
    
    if (result.success) {
      toast.success('Clase eliminada correctamente')
      setClases(prev => prev.filter(c => c.id !== selectedClaseId))
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Error al eliminar clase')
    }
    setIsDeleting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre || !formData.dia_semana || !formData.hora_inicio || !formData.entrenador_id) {
      toast.error('Faltan campos obligatorios')
      return
    }

    setIsLoading(true)
    
    // Prepare data for insertion/update
    const { ...submitData } = formData
    
    if (selectedClaseId) {
      const result = await updateClase(selectedClaseId, submitData as any)
      if (result.success && result.data) {
        toast.success('Clase actualizada correctamente')
        const entrenadorSeleccionado = entrenadores.find(e => e.id === formData.entrenador_id)
        const claseActualizada = {
          ...result.data,
          entrenadores: entrenadorSeleccionado ? { id: entrenadorSeleccionado.id, nombre: entrenadorSeleccionado.nombre } : null
        } as ClaseRow
        
        setClases(prev => prev.map(c => c.id === selectedClaseId ? claseActualizada : c))
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar clase')
      }
    } else {
      const result = await createClase(submitData as any)
      if (result.success && result.data) {
        toast.success('Clase programada correctamente')
        const entrenadorSeleccionado = entrenadores.find(e => e.id === formData.entrenador_id)
        const nuevaClase = {
          ...result.data,
          entrenadores: entrenadorSeleccionado ? { id: entrenadorSeleccionado.id, nombre: entrenadorSeleccionado.nombre } : null
        } as ClaseRow
        
        setClases(prev => [...prev, nuevaClase])
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al programar clase')
      }
    }
    
    setIsLoading(false)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 pb-20 animate-in-fade">
        <SectionHeader 
          title="Clases Grupales" 
          subtitle="Horario semanal coordinado y gestión de cupos para entrenamientos dirigidos."
        >
          <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/5 shadow-inner">
            <Button variant="ghost" size="sm" className="h-8 px-4 bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-lg">Semana</Button>
            <Button variant="ghost" size="sm" className="h-8 px-4 text-zinc-400 hover:text-white">Día</Button>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform" onClick={() => openCreateDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Programar Clase
            </Button>
            <DialogContent className="sm:max-w-[425px] border-white/10 bg-black/90 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selectedClaseId ? 'Editar Clase' : 'Programar Nueva Clase'}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {selectedClaseId ? 'Modifica los detalles de la sesión.' : 'Agrega una sesión al calendario grupal.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre" className="text-white">Nombre de la Clase *</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="Ej. Crossfit Avanzado" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dia_semana" className="text-white">Día *</Label>
                    <select 
                      id="dia_semana" 
                      name="dia_semana" 
                      value={formData.dia_semana} 
                      onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {dias.map(d => <option key={d} value={d} className="bg-zinc-900">{d}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hora_inicio" className="text-white">Hora (00:00:00) *</Label>
                    <select 
                      id="hora_inicio" 
                      name="hora_inicio" 
                      value={formData.hora_inicio} 
                      onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {horas.map(h => <option key={h} value={h} className="bg-zinc-900">{h.substring(0, 5)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="entrenador_id" className="text-white">Entrenador *</Label>
                  <select 
                    id="entrenador_id" 
                    name="entrenador_id" 
                    value={formData.entrenador_id} 
                    onChange={handleInputChange} 
                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled className="bg-zinc-900">Seleccionar entrenador</option>
                    {entrenadores.map(e => <option key={e.id} value={e.id} className="bg-zinc-900">{e.nombre}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sala" className="text-white">Sala / Área</Label>
                    <Input id="sala" name="sala" value={formData.sala} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="Ej. Zona Funcional" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cupo_maximo" className="text-white">Cupo Máximo</Label>
                    <Input id="cupo_maximo" name="cupo_maximo" type="number" min="1" value={formData.cupo_maximo} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>

                <DialogFooter className="pt-4 flex justify-between sm:justify-between items-center w-full">
                  {selectedClaseId ? (
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting || isLoading} className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Eliminar
                    </Button>
                  ) : <div></div>}
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">Cancelar</Button>
                    <Button type="submit" disabled={isLoading || isDeleting} className="bg-primary text-primary-foreground">
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Guardar
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </SectionHeader>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 glass-card border-white/5 rounded-2xl">
          <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-white/5">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-black tracking-tight text-white px-2">SEMANA ACTUAL</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 rounded-xl">
            <Filter className="w-3.5 h-3.5 mr-2" />
            Filtrar por Sala
          </Button>
        </div>

        {/* Desktop Schedule Grid */}
        <div className="glass-card border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="p-5 border-b border-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24">Hora</th>
                  {dias.map(dia => (
                    <th key={dia} className="p-5 border-b border-white/5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horas.map(hora => (
                  <tr key={hora} className="group/row">
                    <td className="p-5 text-[11px] font-black text-zinc-500 bg-white/[0.01] border-b border-white/[0.02] whitespace-nowrap">
                      {formatTime(hora)}
                    </td>
                    {dias.map(dia => {
                      // Buscar clase para este día y esta hora (comparamos la hora extraída)
                      const clase = clases.find(c => c.dia_semana === dia && c.hora_inicio === hora)
                      return (
                        <td key={`${dia}-${hora}`} className="p-2 min-w-[160px] h-28 relative border-b border-white/[0.02] border-r border-white/[0.02] last:border-r-0">
                          {clase ? (
                            <div onClick={() => openEditDialog(clase)} className={`h-full w-full rounded-2xl p-3 text-white shadow-xl ${clase.color || 'bg-primary'} transition-all hover:scale-[1.03] hover:rotate-1 cursor-pointer relative overflow-hidden group/item`}>
                              <div className="absolute top-0 right-0 p-2 opacity-20">
                                <Dumbbell className="w-8 h-8 rotate-12" />
                              </div>
                              <p className="text-[9px] font-black uppercase tracking-tighter opacity-70 mb-1">
                                {clase.entrenadores?.nombre || 'Sin Asignar'}
                              </p>
                              <p className="text-xs font-black leading-tight mb-2">{clase.nombre}</p>
                              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[9px] bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                <Users className="w-2.5 h-2.5" />
                                0/{clase.cupo_maximo || '-'}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full rounded-2xl border border-dashed border-white/5 hover:bg-white/[0.02] transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer" onClick={() => openCreateDialog(dia, hora)}>
                              <Plus className="w-4 h-4 text-white/10" />
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}


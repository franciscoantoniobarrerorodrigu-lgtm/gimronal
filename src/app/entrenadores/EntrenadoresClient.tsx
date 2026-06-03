'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Award,
  Loader2,
  Trash2,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Database } from '@/types/supabase'
import { createEntrenador, deleteEntrenador, updateEntrenador } from '@/lib/supabase/actions/entrenadores'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type EntrenadorRow = Database['public']['Tables']['entrenadores']['Row']

interface Shift {
  dia: string
  inicio: string
  fin: string
}

export function EntrenadoresClient({ initialEntrenadores }: { initialEntrenadores: EntrenadorRow[] }) {
  const router = useRouter()
  const [trainers, setTrainers] = useState<EntrenadorRow[]>(initialEntrenadores)
  
  React.useEffect(() => {
    setTrainers(initialEntrenadores)
  }, [initialEntrenadores])
  
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    formacion: '',
    telefono: '',
    email: '',
    horario_disponibilidad: '',
    estado: 'activo'
  })

  const [shifts, setShifts] = useState<Shift[]>([])

  const diasOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  const resetForm = () => {
    setFormData({
      nombre: '',
      especialidad: '',
      formacion: '',
      telefono: '',
      email: '',
      horario_disponibilidad: '',
      estado: 'activo'
    })
    setShifts([])
    setEditingId(null)
  }

  const handleOpenNew = () => {
    resetForm()
    setIsOpen(true)
  }

  const handleOpenEdit = (trainer: EntrenadorRow) => {
    setFormData({
      nombre: trainer.nombre || '',
      especialidad: trainer.especialidad || '',
      formacion: trainer.formacion || '',
      telefono: trainer.telefono || '',
      email: trainer.email || '',
      horario_disponibilidad: trainer.horario_disponibilidad || '',
      estado: trainer.estado || 'activo'
    })
    
    let parsedShifts: Shift[] = []
    try {
      if (trainer.horario_disponibilidad && trainer.horario_disponibilidad.startsWith('[')) {
        parsedShifts = JSON.parse(trainer.horario_disponibilidad)
      }
    } catch(e) {
      console.log('No json shifts found')
    }
    
    setShifts(parsedShifts)
    setEditingId(trainer.id)
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addShift = () => {
    setShifts(prev => [...prev, { dia: 'Lunes', inicio: '06:00', fin: '14:00' }])
  }

  const updateShift = (index: number, field: keyof Shift, value: string) => {
    const newShifts = [...shifts]
    newShifts[index][field] = value
    setShifts(newShifts)
  }

  const removeShift = (index: number) => {
    setShifts(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre) {
      toast.error('El nombre es obligatorio')
      return
    }

    setIsLoading(true)
    
    const payload = {
      ...formData,
      // Si hay turnos, guardamos el JSON, si no, guardamos el texto plano (por compatibilidad o si quieren texto libre)
      horario_disponibilidad: shifts.length > 0 ? JSON.stringify(shifts) : formData.horario_disponibilidad
    }

    if (editingId) {
      const result = await updateEntrenador(editingId, payload)
      if (result.success && result.data) {
        toast.success('Entrenador actualizado')
        setTrainers(prev => prev.map(t => t.id === editingId ? (result.data as EntrenadorRow) : t))
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar')
      }
    } else {
      const result = await createEntrenador(payload)
      if (result.success && result.data) {
        toast.success('Entrenador vinculado correctamente')
        setTrainers(prev => [...prev, result.data as EntrenadorRow])
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al guardar')
      }
    }
    
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas dar de baja a este entrenador?')) return
    
    const result = await deleteEntrenador(id)
    if (result.success) {
      toast.success('Entrenador eliminado')
      setTrainers(prev => prev.filter(t => t.id !== id))
      router.refresh()
    } else {
      toast.error(result.error || 'Error al eliminar')
    }
  }

  const formatShiftsForDisplay = (disponibilidadStr: string | null) => {
    if (!disponibilidadStr) return 'Horario no especificado'
    try {
      if (disponibilidadStr.startsWith('[')) {
        const parsed: Shift[] = JSON.parse(disponibilidadStr)
        if (parsed.length === 0) return 'Horario no especificado'
        return parsed.map(s => `${s.dia.substring(0,3)}: ${s.inicio}-${s.fin}`).join(' | ')
      }
    } catch(e) {}
    return disponibilidadStr
  }

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 pb-20 animate-in-fade">
        <SectionHeader 
          title="Equipo de Entrenadores" 
          subtitle="Gestiona el personal técnico, sus especialidades y carga académica semanal."
        >
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button onClick={handleOpenNew} className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Vincular Entrenador
            </Button>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-white/10 bg-black/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-white">{editingId ? 'Editar Entrenador' : 'Vincular Nuevo Entrenador'}</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {editingId ? 'Actualiza los datos y la disponibilidad.' : 'Ingresa los datos del nuevo miembro de tu equipo.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre" className="text-white">Nombre Completo *</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="Ej. Carlos Giraldo" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="especialidad" className="text-white">Especialidad</Label>
                    <Input id="especialidad" name="especialidad" value={formData.especialidad} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="Ej. Crossfit" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estado" className="text-white">Estado</Label>
                    <Select value={formData.estado} onValueChange={(v) => setFormData(p => ({ ...p, estado: v || 'activo' }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 text-white">
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="formacion" className="text-white">Formación / Certificación</Label>
                  <Input id="formacion" name="formacion" value={formData.formacion} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="Ej. Profesional en Deporte" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="telefono" className="text-white">Teléfono</Label>
                    <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="Ej. 300 123 4567" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="email@ejemplo.com" />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-white text-base">Horario de Disponibilidad</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addShift} className="h-8 bg-white/5 border-white/10 text-white hover:bg-white/10">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Añadir Turno
                    </Button>
                  </div>

                  {shifts.length === 0 ? (
                    <div className="grid gap-2">
                      <Label htmlFor="horario_disponibilidad" className="text-zinc-400 text-xs">Opcional: Texto libre si no usas turnos estructurados</Label>
                      <Input id="horario_disponibilidad" name="horario_disponibilidad" value={formData.horario_disponibilidad} onChange={handleInputChange} className="bg-white/5 border-white/10 text-white" placeholder="Ej. Lunes a Viernes 6am a 2pm" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shifts.map((shift, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                          <Select value={shift.dia} onValueChange={(v) => updateShift(idx, 'dia', v || '')}>
                            <SelectTrigger className="w-[120px] bg-black/40 border-white/10 text-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 text-white">
                              {diasOptions.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center gap-1 flex-1">
                            <Input 
                              type="time" 
                              value={shift.inicio}
                              onChange={(e) => updateShift(idx, 'inicio', e.target.value)}
                              className="bg-black/40 border-white/10 text-white h-9 px-2"
                              required
                            />
                            <span className="text-zinc-500 text-xs">a</span>
                            <Input 
                              type="time" 
                              value={shift.fin}
                              onChange={(e) => updateShift(idx, 'fin', e.target.value)}
                              className="bg-black/40 border-white/10 text-white h-9 px-2"
                              required
                            />
                          </div>
                          
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeShift(idx)} className="h-9 w-9 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">Cancelar</Button>
                  <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingId ? 'Actualizar' : 'Guardar Entrenador'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </SectionHeader>

        {trainers.length === 0 ? (
          <div className="glass-card border-white/5 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Sin entrenadores registrados</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Agrega entrenadores al equipo para comenzar a asignar clases y clientes.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="glass-card border-white/5 hover:bg-white/[0.08] transition-all group overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-5 pb-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="relative">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-xl border border-primary/20 shadow-inner">
                      {trainer.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    {trainer.estado === 'activo' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#09090b] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                    )}
                    {trainer.estado === 'inactivo' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-500 rounded-full border-2 border-[#09090b]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-black tracking-tight text-white">{trainer.nombre}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10 text-white">
                          <DropdownMenuItem onClick={() => handleOpenEdit(trainer)} className="hover:bg-white/10 cursor-pointer">Editar Perfil</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(trainer.id)} className="text-rose-500 hover:bg-rose-500/10 cursor-pointer font-bold mt-1 border-t border-white/5">Dar de Baja</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest">
                      {trainer.especialidad || 'General'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors font-medium">
                    <Award className="w-4 h-4 mr-3 text-primary/60" />
                    {trainer.formacion || 'Sin formación registrada'}
                  </div>
                  <div className="flex items-center text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors font-medium">
                    <Phone className="w-4 h-4 mr-3 text-primary/60" />
                    {trainer.telefono || 'Sin teléfono'}
                  </div>
                  <div className="flex items-center text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors font-medium">
                    <Mail className="w-4 h-4 mr-3 text-primary/60" />
                    {trainer.email || 'Sin email'}
                  </div>
                  
                  <div className="flex items-start text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors font-medium bg-primary/10 text-primary p-3 rounded-xl border border-primary/20 mt-2">
                    <Calendar className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="leading-relaxed">
                      {formatShiftsForDisplay(trainer.horario_disponibilidad)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5 shadow-inner">
                      <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 mb-1">Estado</p>
                      <p className={`text-sm font-black ${trainer.estado === 'activo' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {trainer.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5 shadow-inner">
                      <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 mb-1">Desde</p>
                      <p className="text-sm font-black text-white">
                        {trainer.created_at ? new Date(trainer.created_at).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}


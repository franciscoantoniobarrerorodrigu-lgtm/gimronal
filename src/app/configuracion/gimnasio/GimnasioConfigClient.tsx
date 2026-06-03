'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Building2, Save, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateGimnasioAction } from '@/lib/supabase/actions/gimnasio'
import { useAction } from 'next-safe-action/hooks'

export default function GimnasioConfigClient({ initialGimnasio }: { initialGimnasio: any }) {
  const [gimnasio, setGimnasio] = useState<any>(initialGimnasio)
  const [formData, setFormData] = useState({
    nombre: initialGimnasio?.nombre || '',
    nit: initialGimnasio?.nit || '',
    telefono: initialGimnasio?.telefono || '',
    email: initialGimnasio?.email || '',
    direccion: initialGimnasio?.direccion || '',
    ciudad: initialGimnasio?.ciudad || '',
    horario_apertura: initialGimnasio?.horario_apertura || '05:00',
    horario_cierre: initialGimnasio?.horario_cierre || '22:00',
    aforo_maximo: initialGimnasio?.aforo_maximo || 80
  })

  const { execute, isExecuting } = useAction(updateGimnasioAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Datos del gimnasio actualizados')
      }
    },
    onError: () => {
      toast.error('Error al actualizar datos')
    }
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!gimnasio?.id) return

    execute({ id: gimnasio.id, updates: formData })
  }

  return (
    <AdminLayout isGymActive={gimnasio?.activo !== false} gymName={gimnasio?.nombre}>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datos del Gimnasio</h1>
          <p className="text-muted-foreground mt-1">Información general de tu sede.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del Gimnasio</Label>
                  <Input 
                    value={formData.nombre} 
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre oficial"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIT</Label>
                  <Input 
                    value={formData.nit} 
                    onChange={(e) => setFormData({...formData, nit: e.target.value})}
                    placeholder="Número de identificación tributaria"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input 
                    value={formData.telefono} 
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="Teléfono de contacto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    type="email" 
                    placeholder="Correo oficial"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input 
                  value={formData.direccion} 
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Dirección física de la sede"
                />
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input 
                  value={formData.ciudad} 
                  onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                  placeholder="Ciudad"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horarios y Aforo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hora de Apertura</Label>
                  <Input 
                    type="time" 
                    value={formData.horario_apertura} 
                    onChange={(e) => setFormData({...formData, horario_apertura: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora de Cierre</Label>
                  <Input 
                    type="time" 
                    value={formData.horario_cierre} 
                    onChange={(e) => setFormData({...formData, horario_cierre: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Aforo Máximo</Label>
                <Input 
                  type="number" 
                  value={formData.aforo_maximo} 
                  onChange={(e) => setFormData({...formData, aforo_maximo: Number(e.target.value)})}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isExecuting}>
            <Save className="w-4 h-4 mr-2" />
            {isExecuting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </div>
    </AdminLayout>
  )
}

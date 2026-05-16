'use client'

import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Building2, Save, Clock, Users, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getGimnasio, updateGimnasio } from '@/lib/supabase/actions/gimnasio'

export default function GimnasioConfigPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [gimnasio, setGimnasio] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    horario_apertura: '05:00',
    horario_cierre: '22:00',
    aforo_maximo: 80
  })

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGimnasio()
        if (data) {
          setGimnasio(data)
          setFormData({
            nombre: data.nombre || '',
            nit: data.nit || '',
            telefono: data.telefono || '',
            email: data.email || '',
            direccion: data.direccion || '',
            ciudad: data.ciudad || '',
            horario_apertura: data.horario_apertura || '05:00',
            horario_cierre: data.horario_cierre || '22:00',
            aforo_maximo: data.aforo_maximo || 80
          })
        }
      } catch (error) {
        toast.error('Error al cargar datos')
      } finally {
        setFetching(false)
      }
    }
    loadData()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!gimnasio?.id) return

    setLoading(true)
    try {
      await updateGimnasio(gimnasio.id, formData)
      toast.success('Datos del gimnasio actualizados')
    } catch (error) {
      toast.error('Error al actualizar datos')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
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

          <Button type="submit" className="w-full" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </div>
    </AdminLayout>
  )
}

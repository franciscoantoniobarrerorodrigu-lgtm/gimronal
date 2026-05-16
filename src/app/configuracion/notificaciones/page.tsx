'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Bell, Save, Clock, CalendarDays, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function NotificacionesPage() {
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-1">Configura las alertas automáticas del sistema.</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas de Vencimiento
            </CardTitle>
            <CardDescription>Notificar a clientes cuando su membresía está por vencer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alerta a 7 días</Label>
                <p className="text-xs text-muted-foreground">Enviar aviso una semana antes del vencimiento.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alerta a 3 días</Label>
                <p className="text-xs text-muted-foreground">Recordatorio urgente 3 días antes.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alerta el día de vencimiento</Label>
                <p className="text-xs text-muted-foreground">Notificación el mismo día que vence.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Cumpleaños
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Felicitar por WhatsApp</Label>
                <p className="text-xs text-muted-foreground">Enviar mensaje automático el día del cumpleaños.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Inactividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cliente sin asistir 5+ días</Label>
                <p className="text-xs text-muted-foreground">Alertar cuando un cliente activo lleva días sin venir.</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label>Días de inactividad para alerta</Label>
              <Input type="number" defaultValue="5" className="max-w-[100px]" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={() => toast.success('Preferencias de notificación guardadas')}>
          <Save className="w-4 h-4 mr-2" />
          Guardar Preferencias
        </Button>
      </div>
    </AdminLayout>
  )
}

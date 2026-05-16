'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  MessageSquare, 
  Send, 
  Settings, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function WhatsAppConfigPage() {
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integración WhatsApp</h1>
            <p className="text-muted-foreground mt-1">Automatiza el envío de recordatorios y comprobantes.</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Conectado
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuración de API */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Credenciales API
              </CardTitle>
              <CardDescription>Configura las llaves de WhatsApp Business API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number ID</Label>
                <Input placeholder="Ej: 1092837465..." type="password" />
              </div>
              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input placeholder="EAABw..." type="password" />
              </div>
              <Button className="w-full">Guardar Configuración</Button>
            </CardContent>
          </Card>

          {/* Estado de Notificaciones */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Automatizaciones
              </CardTitle>
              <CardDescription>Elige qué mensajes enviar automáticamente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bienvenida</Label>
                  <p className="text-xs text-muted-foreground">Enviar al registrar un nuevo cliente.</p>
                </div>
                <Switch checked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comprobante de Pago</Label>
                  <p className="text-xs text-muted-foreground">Enviar PDF del recibo al pagar.</p>
                </div>
                <Switch checked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alerta de Vencimiento</Label>
                  <p className="text-xs text-muted-foreground">3 días antes de que venza la membresía.</p>
                </div>
                <Switch checked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Preview */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Plantillas de Mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 relative">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[10px]">Previsualización</Badge>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg rounded-tl-none shadow-sm text-sm">
                    <p className="font-bold text-primary">¡Hola Carlos! 👋</p>
                    <p className="mt-1">Bienvenido a **GymControl**. Tu membresía **VIP** ha sido activada con éxito. Vence el **12 de Junio**.</p>
                    <p className="mt-2 text-[10px] text-muted-foreground italic">Enviado automáticamente por GymControl</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 relative">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[10px]">Previsualización</Badge>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg rounded-tl-none shadow-sm text-sm">
                    <p className="font-bold text-amber-600">Aviso de Vencimiento ⚠️</p>
                    <p className="mt-1">Hola Valentina, te recordamos que tu plan vence en **3 días**. Acércate a recepción para renovar y no perder tus beneficios.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Tool */}
        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Prueba de Envío</h3>
              <p className="text-sm text-muted-foreground">Envía un mensaje de prueba a tu celular.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input placeholder="Número (ej: 3001234567)" className="max-w-xs" />
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Probar
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

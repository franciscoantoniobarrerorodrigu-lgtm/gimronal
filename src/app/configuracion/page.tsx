'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  MessageSquare, 
  Building2, 
  Shield, 
  Bell, 
  Palette,
  ChevronRight,
  Key,
  FileSignature
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { SectionHeader } from '@/components/shared/SectionHeader'

const configSections = [
  {
    title: 'Datos del Gimnasio',
    description: 'Nombre, dirección, NIT, horarios y logo de tu sede.',
    icon: Building2,
    href: '/configuracion/gimnasio',
    color: 'text-primary'
  },
  {
    title: 'WhatsApp Business',
    description: 'Configura las credenciales y plantillas de mensajes automáticos.',
    icon: MessageSquare,
    href: '/configuracion/whatsapp',
    color: 'text-emerald-500'
  },
  {
    title: 'Notificaciones',
    description: 'Alertas de vencimiento, cumpleaños y recordatorios.',
    icon: Bell,
    href: '/configuracion/notificaciones',
    color: 'text-amber-500'
  },
  {
    title: 'Seguridad y Roles',
    description: 'Gestión de usuarios, permisos y control de acceso.',
    icon: Shield,
    href: '/configuracion/seguridad',
    color: 'text-rose-500'
  },
  {
    title: 'Apariencia',
    description: 'Tema, colores y personalización visual del sistema.',
    icon: Palette,
    href: '/configuracion/apariencia',
    color: 'text-indigo-500'
  },
  {
    title: 'Licencia y Serial',
    description: 'Gestiona la suscripción de tu gimnasio y activa nuevos seriales.',
    icon: Key,
    href: '/configuracion/licencia',
    color: 'text-blue-500'
  },
  {
    title: 'Facturación Electrónica',
    description: 'Adquiere y configura el módulo DIAN con Factus.',
    icon: FileSignature,
    href: '/configuracion/suscripcion',
    color: 'text-purple-500'
  },
]


export default function ConfiguracionPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 max-w-4xl mx-auto animate-in-fade">
        <SectionHeader 
          title="Configuración" 
          subtitle="Administra las opciones generales del sistema y personaliza tu experiencia."
        />

        <div className="grid gap-4">
          {configSections.map((section) => (
            <Link key={section.title} href={section.href}>
              <Card className="glass-card border-border hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
                <CardContent className="flex items-center gap-6 py-6 px-6">
                  <div className={`w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center border border-border shadow-xl transition-all group-hover:scale-110 ${section.color}`}>
                    <section.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-xl italic tracking-tight uppercase">{section.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{section.description}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

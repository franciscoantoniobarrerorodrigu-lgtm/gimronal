'use client'

import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Plus, Tag, Clock, CheckCircle2, MoreVertical, Edit, Trash2, Dumbbell } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getPlanes, deletePlan } from '@/lib/supabase/actions/planes'
import { PlanFormModal } from './components/PlanFormModal'
import { toast } from 'sonner'
import { showPremiumToast } from '@/lib/notifications'
import { formatCOP } from '@/lib/format-utils'

import { SectionHeader } from '@/components/shared/SectionHeader'

export const dynamic = 'force-dynamic'

export default function PlanesPage() {
  const [planes, setPlanes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [planToEdit, setPlanToEdit] = useState<any | null>(null)

  const fetchPlanes = async () => {
    setLoading(true)
    try {
      const data = await getPlanes()
      setPlanes(data)
    } catch (error) {
      console.error(error)
      showPremiumToast.error('Error de Carga', 'No se pudieron recuperar los planes de membresía')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlanes()
  }, [])

  const handleCreate = () => {
    setPlanToEdit(null)
    setModalOpen(true)
  }

  const handleEdit = (plan: any) => {
    setPlanToEdit(plan)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este plan? No se borrará del historial, pero ya no se podrá asignar.')) return;
    
    try {
      const result = await deletePlan(id)
      if (result.success) {
        showPremiumToast.success('Plan Eliminado', 'El plan ha sido desactivado y removido de la oferta actual')
        fetchPlanes()
      } else {
        showPremiumToast.error('Error al Eliminar', 'No se pudo completar la eliminación del plan')
      }
    } catch (error) {
      console.error(error)
      showPremiumToast.error('Fallo del Sistema', 'Ocurrió un error inesperado al intentar eliminar el plan')
    }
  }


  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 md:gap-10 pb-20 animate-in-fade">
        <SectionHeader 
          title="Planes de Membresía" 
          subtitle="Configura las opciones de suscripción y beneficios para tus clientes."
        >
          <Button 
            onClick={handleCreate} 
            className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <Plus className="size-4 mr-2" />
            Nuevo Plan
          </Button>
        </SectionHeader>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Dumbbell className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : planes.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border/50 rounded-xl">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No hay planes activos</h3>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primer plan de membresía para comenzar.</p>
            <Button onClick={handleCreate} variant="outline" className="mt-4 border-primary/50 text-primary hover:bg-primary/10">
              Crear Plan
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {planes.map((plan) => (
              <Card key={plan.id} className="glass-card border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                {/* Accent line for visual flair */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-50" />
                
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl font-bold tracking-tight">{plan.nombre}</CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{plan.descripcion}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card">
                      <DropdownMenuItem onClick={() => handleEdit(plan)} className="cursor-pointer">
                        <Edit className="size-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive focus:text-destructive cursor-pointer">
                        <Trash2 className="size-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="flex flex-col gap-6 pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">{formatCOP(plan.precio)}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">/ {plan.duracion_dias} días</span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center text-xs font-medium text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Clock className="w-3 h-3 text-primary" />
                      </div>
                      Vigencia por {plan.duracion_dias} días
                    </div>
                    <div className="flex items-center text-xs font-medium text-muted-foreground">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                        plan.incluye_clases ? "bg-emerald-500/10" : "bg-white/5"
                      )}>
                        <CheckCircle2 className={cn("w-3 h-3", plan.incluye_clases ? "text-emerald-500" : "text-muted-foreground/30")} />
                      </div>
                      {plan.incluye_clases ? "Acceso total a clases grupales" : "Solo acceso a gimnasio"}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-white/5 border-t border-white/5 py-3 flex justify-between items-center">
                  <Badge variant="outline" className={cn(
                    "text-[10px] border-none uppercase tracking-widest px-2 h-5",
                    plan.activo ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-muted-foreground"
                  )}>
                    {plan.activo ? "Activo" : "Inactivo"}
                  </Badge>
                  {plan.incluye_clases && (
                    <Badge className="bg-primary/20 text-primary text-[9px] border-none font-black italic">PREMIUM</Badge>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <PlanFormModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          planToEdit={planToEdit}
          onSuccess={fetchPlanes}
        />
      </div>
    </AdminLayout>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createPlan, updatePlan } from '@/lib/supabase/actions/planes'
import { showPremiumToast } from '@/lib/notifications'
import { Tag, Dumbbell, CheckCircle2, Loader2, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCOP } from '@/lib/format-utils'

const planSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  duracion_dias: z.coerce.number().min(1, 'La duración debe ser al menos 1 día'),
  incluye_clases: z.boolean().default(false),
  aplica_iva: z.boolean().default(false),
  iva_porcentaje: z.coerce.number().default(19),
})

type PlanFormValues = z.infer<typeof planSchema>

interface PlanFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planToEdit?: any | null
  onSuccess: () => void
}

export function PlanFormModal({ open, onOpenChange, planToEdit, onSuccess }: PlanFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isEditing = !!planToEdit

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: 0,
      duracion_dias: 30,
      incluye_clases: false,
      aplica_iva: false,
      iva_porcentaje: 19,
    }
  })

  useEffect(() => {
    if (open) {
      if (planToEdit) {
        form.reset({
          nombre: planToEdit.nombre,
          descripcion: planToEdit.descripcion || '',
          precio: planToEdit.precio,
          duracion_dias: planToEdit.duracion_dias,
          incluye_clases: planToEdit.incluye_clases,
          aplica_iva: planToEdit.aplica_iva || false,
          iva_porcentaje: planToEdit.iva_porcentaje || 19,
        })
      } else {
        form.reset({
          nombre: '',
          descripcion: '',
          precio: 0,
          duracion_dias: 30,
          incluye_clases: false,
          aplica_iva: false,
          iva_porcentaje: 19,
        })
      }
    }
  }, [open, planToEdit, form])

  const onSubmit = async (values: PlanFormValues) => {
    setIsSubmitting(true)
    try {
      let result;
      if (isEditing) {
        result = await updatePlan(planToEdit.id, values)
      } else {
        result = await createPlan(values)
      }

      if (result.success) {
        showPremiumToast.success('Plan Actualizado', 'La configuración del plan ha sido guardada correctamente.')
        onSuccess()
        onOpenChange(false)
      } else {
        showPremiumToast.error('Fallo de Registro', result.error)
      }
    } catch (error) {
      console.error(error)
      showPremiumToast.error('Error Crítico', 'Ocurrió un error inesperado al intentar guardar el plan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-500" />
            {isEditing ? 'Editar Plan' : 'Crear Nuevo Plan'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            {isEditing ? 'Modifica los detalles del plan seleccionado.' : 'Llena los datos para registrar una nueva opción de membresía.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Nombre del Plan <span className="text-rose-500">*</span></Label>
            <Input 
              id="nombre" 
              placeholder="Ej. Mensual VIP" 
              {...form.register('nombre')} 
              className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-11" 
            />
            {form.formState.errors.nombre && <p className="text-[10px] font-bold text-rose-500 uppercase italic">{form.formState.errors.nombre.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="precio" className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Precio (COP) <span className="text-rose-500">*</span></Label>
              <Input 
                id="precio" 
                type="number" 
                {...form.register('precio')} 
                className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-11" 
              />
              {form.formState.errors.precio && <p className="text-[10px] font-bold text-rose-500 uppercase italic">{form.formState.errors.precio.message as string}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duracion_dias" className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Duración (Días) <span className="text-rose-500">*</span></Label>
              <Input 
                id="duracion_dias" 
                type="number" 
                {...form.register('duracion_dias')} 
                className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 h-11" 
              />
              {form.formState.errors.duracion_dias && <p className="text-[10px] font-bold text-rose-500 uppercase italic">{form.formState.errors.duracion_dias.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Descripción</Label>
            <Textarea 
              id="descripcion" 
              placeholder="Beneficios y detalles del plan..." 
              {...form.register('descripcion')} 
              className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 resize-none h-24"
            />
          </div>

          {/* CONFIGURACIÓN DE IVA */}
          <div className={cn(
            "p-4 border rounded-xl transition-all space-y-4",
            form.watch('aplica_iva') 
              ? "bg-amber-500/5 border-amber-500/20" 
              : "bg-zinc-900/30 border-zinc-800"
          )}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Receipt className={cn("w-4 h-4", form.watch('aplica_iva') ? "text-amber-500" : "text-zinc-500")} />
                  <Label className="text-xs font-black uppercase italic tracking-wider text-zinc-200">IVA 19% COLOMBIA</Label>
                </div>
                <p className="text-[10px] text-zinc-500">
                  {form.watch('aplica_iva') 
                    ? "Este plan cobra IVA 19% — clubes sociales, spa, servicios de lujo." 
                    : "¿Este plan debe cobrar IVA?"}
                </p>
              </div>
              <Switch 
                checked={form.watch('aplica_iva')}
                onCheckedChange={(val) => form.setValue('aplica_iva', val)}
                className="data-[state=checked]:bg-amber-600"
              />
            </div>

            {form.watch('aplica_iva') && (
              <div className="pt-2 border-t border-amber-500/10 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-500/70 uppercase">Precio con IVA:</span>
                  <span className="text-lg font-black text-amber-500">
                    {formatCOP(Math.round(Number(form.watch('precio') || 0) * 1.19))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="flex-1 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:text-white text-zinc-400 font-bold uppercase text-[10px] tracking-widest h-12"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-[2] bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold uppercase tracking-widest text-xs h-12 border-none shadow-lg shadow-orange-900/20"
            >
              {isSubmitting ? (
                <Dumbbell className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              {isEditing ? 'Guardar Cambios' : 'Crear Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

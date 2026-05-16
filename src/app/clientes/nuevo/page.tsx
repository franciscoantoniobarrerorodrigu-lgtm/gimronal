'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { format, parse, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  User, 
  IdCard, 
  Phone, 
  Mail, 
  MapPin, 
  Target, 
  ShieldAlert, 
  Camera,
  CalendarIcon,
  ChevronLeft,
  Save,
  Dumbbell,
  Check,
  ChevronsUpDown
} from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { showPremiumToast } from '@/lib/notifications'
import { createCliente } from '@/lib/supabase/actions/clientes'
import { DEPARTAMENTOS_COLOMBIA } from '@/lib/constants/colombia'

export const dynamic = 'force-dynamic'

const formSchema = z.object({
  tipo_documento: z.string().min(1, 'Requerido'),
  numero_documento: z.string().min(5, 'Mínimo 5 dígitos'),
  primer_nombre: z.string().min(2, 'Requerido'),
  segundo_nombre: z.string().optional(),
  primer_apellido: z.string().min(2, 'Requerido'),
  segundo_apellido: z.string().optional(),
  fecha_nacimiento: z.date(),
  genero: z.string().min(1, 'Seleccione un género'),
  celular: z.string().min(10, 'Mínimo 10 dígitos'),
  correo: z.string().email('Email inválido').optional().or(z.literal('')),
  departamento: z.string().optional(),
  ciudad: z.string().optional(),
  barrio: z.string().optional(),
  direccion: z.string().optional(),
  objetivo_fitness: z.string().optional(),
  contacto_emergencia_nombre: z.string().min(2, 'Nombre requerido'),
  contacto_emergencia_telefono: z.string().min(10, 'Teléfono requerido'),
  acepta_politica_datos: z.boolean().refine(val => val === true, 'Debe aceptar los términos'),
  peso: z.string().optional(),
  estatura: z.string().optional(),
})

export default function NuevoClientePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo_documento: 'CC',
      numero_documento: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      genero: '',
      celular: '',
      correo: '',
      departamento: '',
      ciudad: '',
      barrio: '',
      direccion: '',
      objetivo_fitness: '',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      acepta_politica_datos: false,
      peso: '',
      estatura: '',
      // @ts-ignore - inicializado como undefined para forzar selección
      fecha_nacimiento: undefined,
    },
  })

  const [dateInput, setDateInput] = useState("")

  // Sincronizar input de texto cuando cambia la fecha desde el calendario
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue("fecha_nacimiento", date)
      setDateInput(format(date, "dd/MM/yyyy"))
    }
  }

  // Sincronizar fecha cuando el usuario escribe en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDateInput(value)
    
    // Intentar parsear si tiene el formato correcto DD/MM/YYYY
    if (value.length === 10) {
      const parsedDate = parse(value, "dd/MM/yyyy", new Date())
      if (isValid(parsedDate)) {
        form.setValue("fecha_nacimiento", parsedDate)
      }
    }
  }

  const selectedDepartamento = form.watch("departamento")
  const ciudadesDisponibles = DEPARTAMENTOS_COLOMBIA.find(
    (d) => d.departamento === selectedDepartamento
  )?.ciudades || []

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const result = await createCliente(values)
      if (result.success) {
        showPremiumToast.success('Cliente Registrado', 'El nuevo socio ha sido creado exitosamente')
        router.push('/clientes')
      } else {
        showPremiumToast.error('Error de Registro', result.error || 'No se pudo crear el cliente')
      }
    } catch (error) {
      showPremiumToast.error('Error Inesperado', 'Ocurrió un fallo en el servidor al procesar el registro')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Cliente</h1>
            <p className="text-muted-foreground">Ingresa los datos personales para el nuevo socio.</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Errores de validación:", errors);
            showPremiumToast.warning('Formulario Incompleto', 'Por favor, revisa los campos en rojo que faltan por llenar')
          })} className="space-y-8">
            {/* 1. Información de Identidad */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-secondary/20 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-primary" />
                  Identificación y Datos Básicos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tipo_documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                          <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                          <SelectItem value="PA">Pasaporte</SelectItem>
                          <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero_documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 1020334455" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primer_nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="segundo_nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo Nombre (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: David" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primer_apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="segundo_apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Rodríguez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_nacimiento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Nacimiento (DD/MM/AAAA)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="DD/MM/AAAA" 
                            value={dateInput}
                            onChange={handleInputChange}
                            className="flex-1"
                          />
                        </FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className={cn(
                                "shrink-0",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={handleDateSelect}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                              startMonth={new Date(1900, 0)}
                              endMonth={new Date()}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormDescription>Puedes digitarla o usar el calendario</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                          <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 2. Contacto y Ubicación */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-secondary/20 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Contacto y Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono Celular</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 300 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="ejemplo@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departamento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Departamento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? DEPARTAMENTOS_COLOMBIA.find(
                                    (dept) => dept.departamento === field.value
                                  )?.departamento
                                : "Selecciona el departamento"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar departamento..." />
                            <CommandList>
                              <CommandEmpty>No se encontró el departamento.</CommandEmpty>
                              <CommandGroup>
                                {DEPARTAMENTOS_COLOMBIA.map((dept) => (
                                  <CommandItem
                                    value={dept.departamento}
                                    key={dept.id}
                                    onSelect={() => {
                                      form.setValue("departamento", dept.departamento)
                                      form.setValue("ciudad", "")
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        dept.departamento === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {dept.departamento}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ciudad"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ciudad / Municipio</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={!selectedDepartamento}
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? ciudadesDisponibles.find(
                                    (ciudad) => ciudad === field.value
                                  )
                                : "Selecciona la ciudad"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar ciudad..." />
                            <CommandList>
                              <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                              <CommandGroup>
                                {ciudadesDisponibles.map((ciudad) => (
                                  <CommandItem
                                    value={ciudad}
                                    key={ciudad}
                                    onSelect={() => {
                                      form.setValue("ciudad", ciudad)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        ciudad === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {ciudad}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 3. Emergencia y Objetivos */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-secondary/20 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  Emergencia y Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contacto_emergencia_nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contacto de Emergencia (Nombre)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contacto_emergencia_telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Emergencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Celular" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objetivo_fitness"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Objetivo Fitness</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="¿Qué busca lograr?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bajar_peso">Bajar de peso</SelectItem>
                          <SelectItem value="ganar_musculo">Ganar músculo</SelectItem>
                          <SelectItem value="mejorar_resistencia">Mejorar resistencia</SelectItem>
                          <SelectItem value="rehabilitacion">Rehabilitación</SelectItem>
                          <SelectItem value="recreacion">Recreación</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 3.5 Salud Inicial */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-secondary/20 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Salud Inicial (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Inicial (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ej: 75.5" {...field} />
                      </FormControl>
                      <FormDescription>Útil para el seguimiento automático posterior.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estatura Inicial (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej: 170" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 4. Legal */}
            <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <FormField
                control={form.control}
                name="acepta_politica_datos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Acepto el tratamiento de datos personales (Ley 1581 de 2012)
                      </FormLabel>
                      <FormDescription>
                        Consiento que mis datos sean procesados para fines administrativos y de marketing del gimnasio.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="px-8 h-11" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Dumbbell className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Registrar Cliente
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  )
}

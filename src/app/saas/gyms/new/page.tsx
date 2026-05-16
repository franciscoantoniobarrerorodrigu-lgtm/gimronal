'use client'

import React, { useState, useEffect } from 'react'
import { SaaSLayout } from '@/components/layout/SaaSLayout'
import { createGymSimulation, switchGymContext } from '@/lib/supabase/actions/saas'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Lock, Phone, MapPin, Hash, Loader2, CheckCircle2, Users } from 'lucide-react'
import { DEPARTAMENTOS_COLOMBIA } from '@/lib/constants/colombia'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { showPremiumToast } from '@/lib/notifications'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function NewGymPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [createdGymName, setCreatedGymName] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [defaultValues, setDefaultValues] = useState<any>(null)

  useEffect(() => {
    async function loadDefaults() {
      try {
        const gym = await getGimnasio()
        if (gym) {
          setDefaultValues(gym)
          setSelectedCity(gym.ciudad || '')
        }
      } catch (error) {
        console.error('Error loading default gym info:', error)
      } finally {
        setFetching(false)
      }
    }
    loadDefaults()
  }, [])

  const deptData = DEPARTAMENTOS_COLOMBIA.find(d => d.departamento === selectedDept)
  const ciudades = deptData ? deptData.ciudades : []

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nombre: formData.get('nombre') as string,
      nit: formData.get('nit') as string,
      direccion: formData.get('direccion') as string,
      telefono: formData.get('telefono') as string,
      ciudad: selectedCity || 'Medellín',
      emailGimnasio: formData.get('emailGimnasio') as string,
      aforoMaximo: Number(formData.get('aforoMaximo')) || 80,
      correoAdmin: formData.get('correoAdmin') as string,
      passwordAdmin: formData.get('passwordAdmin') as string,
    }

    const result = await createGymSimulation(data)

    if (result.success && result.gymId) {
      setCreatedGymName(data.nombre)
      showPremiumToast.success('Gimnasio Creado', 'La nueva instancia y simulación se han configurado correctamente')
      setSuccess(true)
      
      // Activar contexto automáticamente
      await switchGymContext(result.gymId)
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      showPremiumToast.error('Error de Creación', result.error || 'No se pudo configurar el gimnasio')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <SaaSLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold">¡{createdGymName || 'Simulación'} Creada!</h2>
          <p className="text-muted-foreground text-center max-w-xs">
            El gimnasio ha sido configurado y el administrador principal ya puede iniciar sesión.
          </p>
          <p className="text-xs animate-pulse">Redirigiendo al panel global...</p>
        </div>
      </SaaSLayout>
    )
  }

  return (
    <SaaSLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Simulación</h1>
          <p className="text-muted-foreground mt-2">
            Configura una nueva instancia de gimnasio con su propio aislamiento de datos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-card/30 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Datos de la Empresa</CardTitle>
              <CardDescription>Información básica del gimnasio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Gimnasio</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="nombre" 
                      name="nombre" 
                      placeholder="Ej. Iron Gym Center" 
                      className="pl-10" 
                      defaultValue={defaultValues?.nombre}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="nit" 
                      name="nit" 
                      placeholder="Ej. 900.123.456-7" 
                      className="pl-10" 
                      defaultValue={defaultValues?.nit}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="telefono" 
                      name="telefono" 
                      placeholder="Ej. 3101234567" 
                      className="pl-10" 
                      defaultValue={defaultValues?.telefono}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailGimnasio">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="emailGimnasio" 
                      name="emailGimnasio" 
                      type="email" 
                      placeholder="contacto@gym.com" 
                      className="pl-10" 
                      defaultValue={defaultValues?.email}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="direccion" 
                    name="direccion" 
                    placeholder="Ej. Calle 100 #15-20" 
                    className="pl-10" 
                    defaultValue={defaultValues?.direccion}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select onValueChange={(val) => typeof val === 'string' && setSelectedDept(val)} required>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Selecciona departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS_COLOMBIA.map((dept) => (
                        <SelectItem key={dept.id} value={dept.departamento}>
                          {dept.departamento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Select 
                    onValueChange={(val) => typeof val === 'string' && setSelectedCity(val)} 
                    disabled={!selectedDept}
                    required
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Selecciona ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudades.map((ciudad) => (
                        <SelectItem key={ciudad} value={ciudad}>
                          {ciudad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aforoMaximo">Aforo Máximo</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="aforoMaximo" 
                    name="aforoMaximo" 
                    type="number" 
                    placeholder="80" 
                    className="pl-10" 
                    defaultValue={defaultValues?.aforo_maximo}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Credenciales Administrativas</CardTitle>
              <CardDescription>Acceso inicial para el dueño del gimnasio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correoAdmin">Correo Electrónico Admin</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="correoAdmin" name="correoAdmin" type="email" placeholder="admin@gym.com" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordAdmin">Contraseña Inicial</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="passwordAdmin" name="passwordAdmin" type="password" placeholder="••••••••" className="pl-10" required />
                </div>
                <p className="text-[10px] text-muted-foreground">Mínimo 8 caracteres.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Iniciar Simulación'
              )}
            </Button>
          </div>
        </form>
      </div>
    </SaaSLayout>
  )
}

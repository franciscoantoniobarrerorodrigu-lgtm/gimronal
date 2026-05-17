'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dumbbell, Mail, Lock, Fingerprint, Users, ShieldCheck, Globe, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Removed direct sonner import to use premium utility
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { loginCliente } from '@/lib/supabase/actions/portal'
import { showPremiumToast } from '@/lib/notifications'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const tabParam = searchParams.get('tab')
  const defaultTab = tabParam === 'admin' || tabParam === 'saas' || tabParam === 'socio' ? tabParam : 'socio'
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [userEmail, setUserEmail] = useState('')

  // Check for session on mount
  React.useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setUserEmail(user.email || '')
        setProfile(profileData)
        setIsLoggedIn(true)
      }
    }
    checkSession()
  }, [supabase])
  
  // Admin State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Socio State
  const [documento, setDocumento] = useState('')
  const [socioPassword, setSocioPassword] = useState('')
  const [gymChoices, setGymChoices] = useState<any[]>([])
  const [showGymSelector, setShowGymSelector] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('No se pudo obtener el usuario.')

      // Get the user's profile to decide where to send them
      const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('is_saas_admin')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // VALIDACIÓN DE ROL SEGÚN PESTAÑA
      if (activeTab === 'saas' && !profile.is_saas_admin) {
        await supabase.auth.signOut()
        showPremiumToast.error(
          'Acceso Denegado', 
          'No tienes permisos de SaaS Master. Por favor, usa la pestaña de Administrador del Gimnasio.'
        )
        return
      }

      showPremiumToast.success('¡Bienvenido!', 'Sesión iniciada correctamente.')
      
      // REDIRECCIÓN SEGÚN PESTAÑA SELECCIONADA
      if (activeTab === 'saas') {
        router.push('/saas')
      } else {
        router.push('/dashboard')
      }
      
      router.refresh()
    } catch (error: any) {
      showPremiumToast.error('Error de Acceso', error.message || 'No se pudo completar el inicio de sesión.')
    } finally {
      setLoading(false)
    }
  }
  const performSocioLogin = async (gimnasioId?: string) => {
    try {
      const result = await loginCliente(documento, socioPassword, gimnasioId)
      if (!result.success) {
        if (result.requireGymSelection) {
          setGymChoices(result.gyms || [])
          setShowGymSelector(true)
          showPremiumToast.info(
            'Múltiples Cuentas', 
            'Se encontraron varias cuentas con este documento. Por favor selecciona tu gimnasio para continuar.'
          )
          return
        }
        throw new Error(result.error || 'Documento o contraseña incorrectos')
      }
      showPremiumToast.success('Acceso Exitoso', 'Bienvenido al Portal del Socio.')
      router.push('/socios')
      router.refresh()
    } catch (error: any) {
      showPremiumToast.error('Error de Acceso', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSocioLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documento || !socioPassword) {
      showPremiumToast.warning('Campos Incompletos', 'Por favor ingresa tu documento y contraseña.')
      return
    }
    setLoading(true)
    performSocioLogin()
  }

  return (
    <div className="w-full max-w-md p-8 bg-card/50 backdrop-blur-xl border border-border rounded-2xl shadow-2xl relative z-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
          <Dumbbell className="text-primary-foreground w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">GymControl</h1>
        <p className="text-muted-foreground mt-2">
          {isLoggedIn ? 'Sesión Activa' : 'Acceso Seguro'}
        </p>
      </div>

      {isLoggedIn ? (
        <div className="space-y-6">
          <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground">Bienvenido de nuevo</p>
            <p className="text-lg font-medium text-white truncate">{userEmail}</p>
          </div>

          <div className="grid gap-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full h-12 text-base font-semibold"
            >
              <Users className="w-5 h-5 mr-2" />
              Entrar al Gimnasio
            </Button>

            {profile?.is_saas_admin && (
              <Button 
                onClick={() => router.push('/saas')}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Globe className="w-5 h-5 mr-2" />
                Panel SaaS Master
              </Button>
            )}

            <Button 
              variant="outline" 
              onClick={async () => {
                await supabase.auth.signOut()
                setIsLoggedIn(false)
                setProfile(null)
                router.refresh()
              }}
              className="w-full h-11 text-muted-foreground hover:text-white"
            >
              Cerrar Sesión e Iniciar con otra cuenta
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="socio" className="flex items-center gap-2 text-xs">
              <Users className="w-4 h-4" />
              Socio
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="saas" className="flex items-center gap-2 text-xs">
              <Globe className="w-4 h-4" />
              SaaS Master
            </TabsTrigger>
          </TabsList>

        <TabsContent value="socio">
          {showGymSelector ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white">Selecciona tu Gimnasio</h3>
                <p className="text-sm text-muted-foreground mt-1">Elige la sede a la que quieres entrar</p>
              </div>
              <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {gymChoices.map((gym) => (
                  <Button
                    key={gym.id}
                    variant="outline"
                    className="justify-between h-auto py-4 px-4 border-border/50 hover:border-primary hover:bg-primary/5 group"
                    onClick={() => performSocioLogin(gym.id)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-white group-hover:text-primary">{gym.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sede Registrada</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </Button>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full text-xs text-muted-foreground hover:text-white"
                onClick={() => {
                  setShowGymSelector(false)
                  setGymChoices([])
                }}
              >
                Volver al formulario
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSocioLogin} className="space-y-6" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="documento">Número de Documento</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="documento"
                    type="text"
                    placeholder="Tu identificación"
                    className="pl-10"
                    autoComplete="off"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="socioPassword">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="socioPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    autoComplete="new-password"
                    value={socioPassword}
                    onChange={(e) => setSocioPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? 'Entrando...' : 'Ingresar al Portal'}
              </Button>
            </form>
          )}
        </TabsContent>

        <TabsContent value="admin">
          <form onSubmit={handleAdminLogin} className="space-y-6" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email">Correo de Administrador</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gimnasio.com"
                  className="pl-10"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Acceso exclusivo para el personal del gimnasio.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar al Gimnasio'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="saas">
          <form onSubmit={handleAdminLogin} className="space-y-6" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="saas-email">Correo Master</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="saas-email"
                  type="email"
                  placeholder="master@gymcontrol.com"
                  className="pl-10 border-blue-500/20 focus:border-blue-500"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-[10px] text-blue-400/70">
                Panel de control global de la plataforma SaaS.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="saas-password">Contraseña Master</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="saas-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 border-blue-500/20 focus:border-blue-500"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Verificando Master...' : 'Acceder como SaaS Master'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      )}

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Gestión inteligente pre-configurada para tu gimnasio.
        </p>
      </div>
    </div>
  )
}

export default function UnifiedLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl animate-pulse" />

      <Suspense fallback={<Dumbbell className="w-12 h-12 text-primary animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

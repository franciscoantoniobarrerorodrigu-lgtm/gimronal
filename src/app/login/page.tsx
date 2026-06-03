'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dumbbell, Mail, Lock, Fingerprint, Users, ShieldCheck, Globe, ChevronRight, ArrowLeft } from 'lucide-react'
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
  const roleParam = searchParams.get('role')
  const activeRole = tabParam || roleParam
  const isDedicatedView = activeRole === 'socio' || activeRole === 'admin' || activeRole === 'saas'
  
  const defaultTab = isDedicatedView ? (activeRole as any) : 'socio'
  const [activeTab, setActiveTab] = useState(defaultTab)

  React.useEffect(() => {
    if (isDedicatedView) {
      setActiveTab(activeRole as any)
    }
  }, [activeRole, isDedicatedView])
  
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
        email: email.trim(),
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
      const result = await loginCliente(documento.trim(), socioPassword, gimnasioId)
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
    <div className="w-full max-w-md p-8 md:p-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-white/20">
          <Dumbbell className="text-white w-10 h-10" />
        </div>
        <h1 className="text-[9vw] sm:text-4xl font-black tracking-tighter text-white uppercase italic text-center">Gym<span className="text-primary">Control</span></h1>
        <p className="text-muted-foreground mt-2 font-medium tracking-wide">
          {isLoggedIn ? 'Sesión Activa' : 
           isDedicatedView && activeTab === 'socio' ? 'Portal de Socios' :
           isDedicatedView && activeTab === 'admin' ? 'Acceso Administrativo' :
           isDedicatedView && activeTab === 'saas' ? 'SaaS Master Center' : 'Acceso Seguro'}
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
          {!isDedicatedView && (
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
          )}

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
                    className="pl-11 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12 rounded-xl text-white placeholder:text-muted-foreground/50"
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
                    className="pl-11 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12 rounded-xl text-white placeholder:text-muted-foreground/50"
                    autoComplete="new-password"
                    value={socioPassword}
                    onChange={(e) => setSocioPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]" disabled={loading}>
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
                    className="pl-11 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12 rounded-xl text-white placeholder:text-muted-foreground/50"
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
                    className="pl-11 bg-black/20 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12 rounded-xl text-white placeholder:text-muted-foreground/50"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]" disabled={loading}>
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
                    className="pl-11 bg-black/20 border-blue-500/20 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all h-12 rounded-xl text-white placeholder:text-blue-500/30"
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
                    className="pl-11 bg-black/20 border-blue-500/20 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all h-12 rounded-xl text-white placeholder:text-blue-500/30"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600/90 hover:to-indigo-600/90 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]" disabled={loading}>
              {loading ? 'Verificando Master...' : 'Acceder como SaaS Master'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      )}

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Gestión inteligente preconfigurada para tu gimnasio.
          <br className="mt-1" />
          <span className="opacity-70 text-[10px] uppercase tracking-wider font-semibold">v1.0.0 | Diseñado por Ing. BarnafOS</span>
        </p>
      </div>
    </div>
  )
}

import { GymLoading } from '@/components/shared/GymLoading'

export default function UnifiedLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-3xl animate-pulse" />

      {/* Back button placed above the card */}
      <div className="w-full max-w-md mb-4 flex justify-start z-50 relative">
        <Link 
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-medium uppercase tracking-widest text-xs bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>
      </div>

      <Suspense fallback={<GymLoading message="Cargando acceso..." />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

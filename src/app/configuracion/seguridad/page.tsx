'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Shield, UserPlus, Key, Trash2, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword, updateUserPasswordAsAdmin } from '@/lib/supabase/actions/auth'
import { getGymUsers } from '@/lib/supabase/actions/gimnasio'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function SeguridadPage() {
  const [usuariosList, setUsuariosList] = React.useState<any[]>([])
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  
  // Para el diálogo de reseteo de otros usuarios
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false)
  const [resetPassword, setResetPassword] = React.useState('')

  React.useEffect(() => {
    const loadData = async () => {
      const data = await getGymUsers()
      setUsuariosList(data)
    }
    loadData()
  }, [])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      const res = await updatePassword(newPassword)
      if (res.success) {
        toast.success('Contraseña actualizada correctamente')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(res.error || 'Error al actualizar la contraseña')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminResetPassword = async () => {
    if (!selectedUser) return
    if (resetPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await updateUserPasswordAsAdmin(selectedUser.id, resetPassword)
      if (res.success) {
        toast.success(`Contraseña de ${selectedUser.nombre} actualizada`)
        setIsResetDialogOpen(false)
        setResetPassword('')
        setSelectedUser(null)
      } else {
        toast.error(res.error || 'Error al actualizar')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const rolColors: Record<string, string> = {
    admin: 'bg-rose-500/10 text-rose-600',
    recepcion: 'bg-primary/10 text-primary',
    entrenador: 'bg-emerald-500/10 text-emerald-600',
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seguridad y Roles</h1>
            <p className="text-muted-foreground mt-1">Gestión de usuarios y permisos del sistema.</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar Usuario
          </Button>
        </div>

        {/* Password Change Section */}
        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              Cambiar Contraseña
            </CardTitle>
            <CardDescription>Actualiza tus credenciales de acceso de forma segura.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input 
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/20 border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/20 border-white/10"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Usuarios del Sistema</CardTitle>
            <CardDescription>Personas con acceso al panel administrativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosList.map((u) => (
                  <TableRow key={u.id} className="group/row">
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={`border-none capitalize ${rolColors[u.rol] || ''}`}>
                        {u.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.activo ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Activo</Badge>
                      ) : (
                        <Badge className="bg-zinc-500/10 text-zinc-600 border-none">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover/row:opacity-100 transition-opacity"
                        onClick={() => {
                          setSelectedUser(u)
                          setIsResetDialogOpen(true)
                        }}
                      >
                        <Key className="w-4 h-4 mr-2" /> Reset Clave
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Reset de Contraseña */}
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Resetear Contraseña</DialogTitle>
              <DialogDescription>
                Establece una nueva contraseña temporal para <strong>{selectedUser?.nombre}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">Nueva Contraseña</Label>
                <Input 
                  id="reset-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="bg-black/20 border-white/10"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAdminResetPassword} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Guardando...' : 'Cambiar Contraseña'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Permisos por Rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                <h4 className="font-bold text-rose-600 mb-2">Admin</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Acceso total al sistema</li>
                  <li>✓ Gestión financiera</li>
                  <li>✓ Configuración</li>
                  <li>✓ Eliminar registros</li>
                </ul>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="font-bold text-primary mb-2">Recepción</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Registrar clientes</li>
                  <li>✓ Marcar asistencia</li>
                  <li>✓ Cobrar pagos</li>
                  <li>✗ Sin acceso a reportes</li>
                </ul>
              </div>
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <h4 className="font-bold text-emerald-600 mb-2">Entrenador</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Ver sus clientes</li>
                  <li>✓ Registrar medidas</li>
                  <li>✓ Ver horario de clases</li>
                  <li>✗ Sin acceso a pagos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getColombiaISOString } from '@/lib/date-utils'

export async function createGymSimulation(formData: {
  nombre: string
  nit: string
  direccion?: string
  telefono?: string
  ciudad?: string
  emailGimnasio?: string
  aforoMaximo?: number
  correoAdmin: string
  passwordAdmin: string
}) {
  // Verificar que quien llama es SaaS admin
  const { isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos de SaaS admin' }
  }

  // Usar admin client para evitar problemas de RLS y sesión
  const adminClient = createAdminClient()

  try {
    // 1. Crear el Gimnasio (usando admin client para saltar RLS)
    const { data: gym, error: gymError } = await adminClient
      .from('gimnasios')
      .insert({
        nombre: formData.nombre,
        nit: formData.nit,
        direccion: formData.direccion || null,
        telefono: formData.telefono || null,
        ciudad: formData.ciudad || 'Medellín',
        email: formData.emailGimnasio || formData.correoAdmin,
        aforo_maximo: formData.aforoMaximo || 80,
        activo: true,
        modulo_dian_activo: false,
        vencimiento_licencia: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (gymError) {
      logger.error('Error creating gym:', { gymError })
      return { success: false, error: `Error al crear gimnasio: ${gymError.message}` }
    }

    // 2. Crear el usuario Admin para este gym usando admin client
    // Esto NO afecta la sesión del SaaS admin actual
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: formData.correoAdmin,
      password: formData.passwordAdmin,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        nombre: 'Admin ' + formData.nombre
      }
    })

    if (authError) {
      // Si falla la creación del usuario, eliminar el gym creado
      logger.error('Error creating admin user:', { authError })
      await adminClient.from('gimnasios').delete().eq('id', gym.id)
      
      if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
        return { success: false, error: 'El correo electrónico ya está registrado. Usa otro correo.' }
      }
      return { success: false, error: `Error al crear usuario admin: ${authError.message}` }
    }

    // 3. Asignar permisos en perfiles. Nunca confiar roles desde user_metadata.
    if (authUser?.user) {
      const { error: perfilError } = await adminClient
        .from('perfiles')
        .upsert({
          id: authUser.user.id,
          nombre: 'Admin ' + formData.nombre,
          email: formData.correoAdmin,
          rol: 'admin',
          gimnasio_id: gym.id,
          is_saas_admin: false,
          activo: true
        }, {
          onConflict: 'id'
        })

      if (perfilError) {
        logger.error('Error assigning admin profile:', { perfilError })
        await adminClient.auth.admin.deleteUser(authUser.user.id)
        await adminClient.from('gimnasios').delete().eq('id', gym.id)
        return { success: false, error: `Error al asignar perfil administrador: ${perfilError.message}` }
      }
    }

    // 4. SIEMBRA DE DATOS INICIALES (Activación de funciones)
    // Crear Caja Principal
    await adminClient.from('cajas').insert({
      gimnasio_id: gym.id,
      estado: 'cerrada',
      monto_apertura: 0,
      fecha_apertura: getColombiaISOString()
    })

    // Crear Plan Inicial
    await adminClient.from('planes').insert({
      nombre: 'Mensualidad General',
      descripcion: 'Plan básico de acceso al gimnasio',
      precio: 50000,
      duracion_dias: 30,
      gimnasio_id: gym.id,
      aplica_iva: false,
      iva_porcentaje: 0,
      activo: true
    })

    // Crear Producto Inicial
    await adminClient.from('productos').insert({
      nombre: 'Agua Mineral',
      precio_venta: 2000,
      precio_costo: 1000,
      stock: 10,
      stock_minimo: 5,
      gimnasio_id: gym.id,
      aplica_iva: false,
      iva_porcentaje: 0
    })

    revalidatePath('/saas')
    return { success: true, gymId: gym.id }
  } catch (error: any) {
    logger.error('Error in createGymSimulation:', { error })
    return { success: false, error: error.message || 'Error desconocido al crear la simulación' }
  }
}

export async function getSaaSStats() {
  const { supabase, isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) return { totalGyms: 0, totalUsers: 0, totalClients: 0, recentGyms: [] }

  try {
    const { count: gymCount } = await supabase
      .from('gimnasios')
      .select('*', { count: 'exact', head: true })

    const { count: userCount } = await supabase
      .from('perfiles')
      .select('*', { count: 'exact', head: true })

    const { count: totalClients } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })

    const { data: recentGyms } = await supabase
      .from('gimnasios')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: allGyms } = await supabase
      .from('gimnasios')
      .select('*, perfiles(nombre, email, rol)')
      .order('nombre', { ascending: true })

    return {
      totalGyms: gymCount || 0,
      totalUsers: userCount || 0,
      totalClients: totalClients || 0,
      recentGyms: recentGyms || [],
      allGymsWithAdmins: allGyms || []
    }
  } catch (error) {
    logger.error('Error fetching SaaS stats:', { error })
    return { totalGyms: 0, totalUsers: 0, totalClients: 0, recentGyms: [] }
  }
}

export async function deleteGym(gymId: string) {
  const { isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos' }
  }

  const adminClient = createAdminClient()
  
  try {
    // Primero obtener los perfiles asociados para eliminar usuarios auth
    const { data: perfiles } = await adminClient
      .from('perfiles')
      .select('id')
      .eq('gimnasio_id', gymId)

    // Eliminar datos relacionados en orden (por foreign keys)
    // 1. Asistencias
    const { data: clientes } = await adminClient
      .from('clientes')
      .select('id')
      .eq('gimnasio_id', gymId)
    
    const clienteIds = clientes?.map(c => c.id) || []
    
    if (clienteIds.length > 0) {
      await adminClient.from('asistencia').delete().in('cliente_id', clienteIds)
      await adminClient.from('notas_medicas').delete().in('cliente_id', clienteIds)
      await adminClient.from('medidas').delete().in('cliente_id', clienteIds)
      await adminClient.from('inscripciones_clases').delete().in('cliente_id', clienteIds)
      
      // Membresías y sus dependencias
      const { data: membresias } = await adminClient
        .from('membresias')
        .select('id')
        .in('cliente_id', clienteIds)
      const membresiaIds = membresias?.map(m => m.id) || []
      
      if (membresiaIds.length > 0) {
        await adminClient.from('historial_ajustes_dias').delete().in('membresia_id', membresiaIds)
        await adminClient.from('pagos').delete().in('membresia_id', membresiaIds)
      }
      // Pagos sin membresía
      await adminClient.from('pagos').delete().in('cliente_id', clienteIds)
      await adminClient.from('membresias').delete().in('cliente_id', clienteIds)
      await adminClient.from('ventas').delete().in('cliente_id', clienteIds)
    }
    
    // 2. Cajas y movimientos
    const { data: cajas } = await adminClient.from('cajas').select('id').eq('gimnasio_id', gymId)
    if (cajas && cajas.length > 0) {
      await adminClient.from('movimientos_caja').delete().in('caja_id', cajas.map(c => c.id))
    }
    await adminClient.from('cajas').delete().eq('gimnasio_id', gymId)
    
    // 3. Ventas sin cliente
    await adminClient.from('ventas').delete().eq('gimnasio_id', gymId)
    
    // 4. Productos, Entrenadores, Clases, Planes
    await adminClient.from('clases').delete().eq('gimnasio_id', gymId)
    await adminClient.from('entrenadores').delete().eq('gimnasio_id', gymId)
    await adminClient.from('productos').delete().eq('gimnasio_id', gymId)
    await adminClient.from('clientes').delete().eq('gimnasio_id', gymId)
    await adminClient.from('planes').delete().eq('gimnasio_id', gymId)
    
    // 5. Perfiles y Asistencias directas
    await adminClient.from('asistencia').delete().eq('gimnasio_id', gymId)
    await adminClient.from('perfiles').delete().eq('gimnasio_id', gymId)
    
    // 6. Eliminar usuarios auth
    if (perfiles && perfiles.length > 0) {
      for (const perfil of perfiles) {
        try {
          await adminClient.auth.admin.deleteUser(perfil.id)
        } catch (e) {
          logger.warn(`Could not delete auth user ${perfil.id}:`, { error: e })
        }
      }
    }
    
    // 7. Finalmente eliminar el gimnasio
    const { error } = await adminClient
      .from('gimnasios')
      .delete()
      .eq('id', gymId)

    if (error) throw error
    revalidatePath('/saas')
    revalidatePath('/saas/gyms')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error: any) {
    logger.error('Error deleting gym:', { error })
    return { success: false, error: error.message }
  }
}

export async function switchGymContext(gymId: string) {
  const { isSaaSAdmin, supabase } = await requireAuth()
  if (!isSaaSAdmin) {
    redirect('/dashboard')
  }

  const { data: gym } = await supabase
    .from('gimnasios')
    .select('id')
    .eq('id', gymId)
    .maybeSingle()

  if (!gym) {
    redirect('/saas')
  }

  const cookieStore = await cookies()
  cookieStore.set('active_gym_id', gymId, {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  })
  
  redirect('/dashboard')
}

export async function clearGymContext() {
  const cookieStore = await cookies()
  cookieStore.delete('active_gym_id')
  redirect('/saas')
}

export async function toggleGymStatus(gymId: string, currentStatus: boolean) {
  const { supabase, isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos' }
  }

  try {
    const { error } = await supabase
      .from('gimnasios')
      .update({ activo: !currentStatus })
      .eq('id', gymId)

    if (error) throw error
    revalidatePath('/saas')
    return { success: true }
  } catch (error: any) {
    logger.error('Error in toggleGymStatus:', { error })
    return { success: false, error: error.message }
  }
}

export async function extendGymLicense(gymId: string, days: number) {
  const { supabase, isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos' }
  }

  try {
    // 1. Obtener vencimiento actual
    const { data: gym, error: getError } = await supabase
      .from('gimnasios')
      .select('vencimiento_licencia')
      .eq('id', gymId)
      .single()

    if (getError) throw getError

    let baseDate = new Date()
    if (gym.vencimiento_licencia && new Date(gym.vencimiento_licencia) > new Date()) {
      baseDate = new Date(gym.vencimiento_licencia)
    }

    const newExpiry = new Date(baseDate)
    newExpiry.setDate(newExpiry.getDate() + days)

    const { error: updateError } = await supabase
      .from('gimnasios')
      .update({ vencimiento_licencia: newExpiry.toISOString() })
      .eq('id', gymId)

    if (updateError) throw updateError

    revalidatePath('/saas')
    return { success: true, newExpiry: newExpiry.toISOString() }
  } catch (error: any) {
    logger.error('Error in extendGymLicense:', { error })
    return { success: false, error: error.message }
  }
}

export async function toggleDianModule(gymId: string, currentStatus: boolean) {
  const { isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos de SaaS admin' }
  }

  const adminClient = createAdminClient()

  try {
    const { error } = await adminClient
      .from('gimnasios')
      .update({ modulo_dian_activo: !currentStatus })
      .eq('id', gymId)

    if (error) throw error
    revalidatePath('/saas')
    revalidatePath('/configuracion/suscripcion')
    return { success: true, newStatus: !currentStatus }
  } catch (error: any) {
    logger.error('Error in toggleDianModule:', { error })
    return { success: false, error: error.message }
  }
}

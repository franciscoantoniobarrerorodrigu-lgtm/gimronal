'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getColombiaDate, getColombiaDateString, getColombiaISOString } from '@/lib/date-utils'
import { differenceInDays, parseISO, addDays, format } from 'date-fns'
import { logger } from '@/lib/logger'

export async function createCliente(formData: any) {
    const { supabase, activeGymId } = await requireAuth()
    if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }

    const { data, error } = await supabase
      .from('clientes')
      .insert([
        {
          nombre: `${formData.primer_nombre || ''} ${formData.segundo_nombre || ''} ${formData.primer_apellido || ''} ${formData.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim(),
          tipo_documento: formData.tipo_documento,
          numero_documento: formData.numero_documento,
          email: formData.correo,
          telefono: formData.celular,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          genero: formData.genero || null,
          direccion: formData.direccion || null,
          ciudad: formData.ciudad || 'Medellín',
          contacto_emergencia_nombre: formData.contacto_emergencia_nombre || null,
          contacto_emergencia_telefono: formData.contacto_emergencia_telefono || null,
          objetivos: formData.objetivo_fitness || null,
          condiciones_medicas: null,
          acepta_habeas_data: formData.acepta_politica_datos || false,
          estado: 'activo',
          gimnasio_id: activeGymId
        }
      ])
      .select()

  if (error) {
    logger.error('Error creating cliente:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  const clienteId = data[0].id

  // Si se proporcionaron medidas iniciales, registrarlas automáticamente
  if (formData.peso || formData.estatura) {
    const peso = parseFloat(formData.peso) || 0
    const estatura = parseFloat(formData.estatura) || 0
    let imc = 0
    
    if (peso > 0 && estatura > 0) {
      const estaturaMetros = estatura / 100
      imc = parseFloat((peso / (estaturaMetros * estaturaMetros)).toFixed(2))
    }

    await supabase
      .from('medidas')
      .insert([
        {
          cliente_id: clienteId,
          peso,
          estatura,
          imc,
          fecha_medicion: getColombiaDateString()
        }
      ])
  }

  revalidatePath('/clientes')
  return { success: true, data }
}

export async function getClientes() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: true, data: [] }
  
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      membresias (
        *,
        planes (nombre)
      )
    `)
    .eq('gimnasio_id', activeGymId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching clientes:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  // Obtener asistencias de hoy para todos estos clientes en una sola consulta
  const hoyStr = getColombiaDateString()
  const { data: asistenciasHoy } = await supabase
    .from('asistencia')
    .select('cliente_id')
    .eq('gimnasio_id', activeGymId)
    .gte('fecha_hora_entrada', hoyStr)
  
  const idsAsistieron = new Set(asistenciasHoy?.map(a => a.cliente_id) || [])

  const result = (data || []).map(cliente => {
    // Ordenar membresías por fecha de fin descendente para tomar la más reciente
    const membresiasOrdenadas = [...(cliente.membresias || [])].sort((a: any, b: any) => {
      const dateA = a.fecha_fin ? new Date(a.fecha_fin).getTime() : 0
      const dateB = b.fecha_fin ? new Date(b.fecha_fin).getTime() : 0
      return dateB - dateA
    })

    const membresiaPrincipal = membresiasOrdenadas[0]
    
    const hoyStr = getColombiaDateString()
    
    // Buscar la membresía que realmente está vigente hoy
    // Una membresía es válida si: (es activa O vencida) Y la fecha_fin >= hoy
    // Esto corrige casos donde el estado en DB dice 'vencida' pero la fecha es futura
    const membresiaActiva = membresiasOrdenadas.find((m: any) => {
      const isNotExpired = m.fecha_fin && m.fecha_fin >= hoyStr
      return isNotExpired
    })
    
    // Determinar estado real para visualización
    let estadoCalculado = cliente.estado
    if (membresiaActiva) {
      estadoCalculado = 'activo'
    } else {
      estadoCalculado = 'vencido'
    }

    let diasRestantes = 0
    if (membresiaActiva?.fecha_fin) {
      const hoy = getColombiaDate()
      const fin = new Date(membresiaActiva.fecha_fin + 'T23:59:59')
      const diff = fin.getTime() - hoy.getTime()
      if (!isNaN(diff)) {
        diasRestantes = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      }
    }

    const yaAsistioHoy = idsAsistieron.has(cliente.id)

    return {
      ...cliente,
      estado: estadoCalculado,
      plan: membresiaPrincipal?.planes?.nombre || 'Sin Plan',
      vencimiento: membresiaActiva?.fecha_fin || null,
      dias_restantes: (yaAsistioHoy && diasRestantes > 0) ? diasRestantes - 1 : diasRestantes,
      yaAsistioHoy
    }
  })

  return { success: true, data: result }
}

export async function actualizarEstadoCliente(clienteId: string, nuevoEstado: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }
  
  // Lógica de congelar/descongelar
  if (nuevoEstado === 'inactivo') {
    // Buscar si tiene membresía activa para congelarla
    const { data: membresiasActivas } = await supabase
      .from('membresias')
      .select('id, fecha_fin')
      .eq('cliente_id', clienteId)
      .eq('estado', 'activa')
      
    if (membresiasActivas && membresiasActivas.length > 0) {
      const hoy = getColombiaDate()
      hoy.setHours(0, 0, 0, 0)
      
      for (const mem of membresiasActivas) {
        if (mem.fecha_fin) {
          const fechaFin = parseISO(mem.fecha_fin)
          const diasRestantes = Math.max(0, differenceInDays(fechaFin, hoy))
          
          if (diasRestantes > 0) {
            await supabase
              .from('membresias')
              .update({
                estado: 'congelada',
                dias_congelados: diasRestantes,
        updated_at: getColombiaISOString()
              })
              .eq('id', mem.id)
          } else {
             // Si no le quedan días, solo la marcamos vencida
             await supabase.from('membresias').update({ estado: 'vencida', updated_at: getColombiaISOString() }).eq('id', mem.id)
          }
        }
      }
    }
  } else if (nuevoEstado === 'activo') {
    // Buscar membresías congeladas para descongelarlas
    const { data: membresiasCongeladas } = await supabase
      .from('membresias')
      .select('id, dias_congelados')
      .eq('cliente_id', clienteId)
      .eq('estado', 'congelada')
      
    if (membresiasCongeladas && membresiasCongeladas.length > 0) {
      const hoy = getColombiaDate()
      hoy.setHours(0, 0, 0, 0)
      
      for (const mem of membresiasCongeladas) {
        const diasAAdicionar = mem.dias_congelados || 0
        if (diasAAdicionar > 0) {
          const nuevaFechaFin = addDays(hoy, diasAAdicionar)
          const fechaFinStr = format(nuevaFechaFin, 'yyyy-MM-dd')
          
          await supabase
            .from('membresias')
            .update({
              estado: 'activa',
              fecha_fin: fechaFinStr,
              dias_congelados: 0,
      updated_at: getColombiaISOString()
            })
            .eq('id', mem.id)
            
          // Guardar registro de ajuste
          const { data: userData } = await supabase.auth.getUser()
          if (userData?.user) {
            await supabase.from('historial_ajustes_dias').insert({
              membresia_id: mem.id,
              dias_anteriores: diasAAdicionar, // Referencia
              dias_nuevos: diasAAdicionar,
              dias_diferencia: 0,
              motivo: 'Descongelamiento automático (Cliente Activado)',
              registrado_por: userData.user.id
            })
          }
        } else {
          // Si por error quedó con 0 días
          await supabase.from('membresias').update({ estado: 'vencida', updated_at: getColombiaISOString() }).eq('id', mem.id)
        }
      }
    }
  }

  const { error } = await supabase
    .from('clientes')
    .update({ estado: nuevoEstado })
    .eq('id', clienteId)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    logger.error('Error updating client state:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${clienteId}`)
  return { success: true }
}

export async function getClienteById(id: string) {
  try {
    const { supabase, activeGymId } = await requireAuth()
    if (!activeGymId) return { success: true, data: null }
    
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select(`
        *,
        membresias (*, planes (nombre)),
        pagos (*),
        asistencia (*),
        medidas (*),
        notas_medicas (*)
      `)
      .eq('id', id)
      .eq('gimnasio_id', activeGymId)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching client by id:', { error })
      return { success: false, error: 'Error interno del servidor' }
    }

    if (!cliente) return { success: true, data: null }

    // Ordenar membresías por fecha de fin descendente
    const membresiasOrdenadas = [...(cliente.membresias || [])].sort((a: any, b: any) => {
      const dateA = a.fecha_fin ? new Date(a.fecha_fin).getTime() : 0
      const dateB = b.fecha_fin ? new Date(b.fecha_fin).getTime() : 0
      if (isNaN(dateA) || isNaN(dateB)) return 0
      return dateB - dateA
    })

    const membresiaPrincipal = membresiasOrdenadas[0]

    const hoyStr = getColombiaDateString()
    const membresiaActiva = membresiasOrdenadas.find((m: any) => {
      const isStatusActive = ['activa', 'activo'].includes((m.estado || '').toLowerCase())
      const isNotExpired = (m.estado === 'congelada') || (m.fecha_fin && m.fecha_fin >= hoyStr)
      return isStatusActive && isNotExpired
    })

    let yaAsistioHoy = false

    if (membresiaActiva) {
      try {
        const hoyStr = getColombiaDateString()
        const { count } = await supabase
          .from('asistencia')
          .select('id', { count: 'exact', head: true })
          .eq('cliente_id', id)
          .eq('gimnasio_id', activeGymId)
          .gte('fecha_hora_entrada', hoyStr)

        if (count && count > 0) {
          yaAsistioHoy = true
        }
      } catch (e) {
        logger.error("Error consultando asistencia de hoy:", { error: e })
      }
    }

    let diasRestantesVisual = 0
    if (membresiaActiva?.estado === 'congelada') {
      diasRestantesVisual = membresiaActiva.dias_congelados || 0
    } else if (membresiaActiva?.fecha_fin) {
      try {
        const hoy = getColombiaDate()
        const fin = new Date(membresiaActiva.fecha_fin + 'T23:59:59')
        const diff = fin.getTime() - hoy.getTime()
        if (!isNaN(diff)) {
          diasRestantesVisual = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
        }
        
        // Eliminamos el descuento automático de -1 si ya asistió hoy,
        // para que siempre muestre el total de días hasta el vencimiento.
        if (yaAsistioHoy && diasRestantesVisual > 0) {
          diasRestantesVisual -= 1
        }
      } catch (e) {
        logger.error("Error calculando dias restantes:", { error: e })
        diasRestantesVisual = 0
      }
    }

    // Construir objeto de retorno limpio para evitar errores de serialización
    const response = {
      id: cliente.id,
      nombre: cliente.nombre || '',
      tipo_documento: cliente.tipo_documento || 'CC',
      numero_documento: cliente.numero_documento || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      foto_url: cliente.foto_url || null,
      estado: cliente.estado || 'activo',
      fecha_nacimiento: cliente.fecha_nacimiento || null,
      genero: cliente.genero || null,
      direccion: cliente.direccion || null,
      ciudad: cliente.ciudad || 'Medellín',
      barrio: cliente.barrio || null,
      departamento: cliente.departamento || null,
      contacto_emergencia_nombre: cliente.contacto_emergencia_nombre || '',
      contacto_emergencia_telefono: cliente.contacto_emergencia_telefono || '',
      objetivos: cliente.objetivos || '',
      condiciones_medicas: cliente.condiciones_medicas || '',
      membresia: membresiaActiva || membresiaPrincipal || null,
      yaAsistioHoy,
      dias_restantes: diasRestantesVisual,
      plan: membresiaPrincipal?.planes?.nombre || 'Sin Plan',
      pagos: cliente.pagos || [],
      asistencias: cliente.asistencia || [],
      medidas: cliente.medidas || [],
      notas_medicas: cliente.notas_medicas || []
    }

    // Hard serialization check
    return { success: true, data: JSON.parse(JSON.stringify(response)) }
  } catch (error: any) {
    logger.error('CRITICAL ERROR in getClienteById:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function actualizarCliente(clienteId: string, formData: any) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }

  const { error } = await supabase
    .from('clientes')
    .update({
      nombre: formData.nombre,
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento,
      email: formData.email,
      telefono: formData.telefono,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      genero: formData.genero || null,
      direccion: formData.direccion || null,
      ciudad: formData.ciudad || 'Medellín',
      barrio: formData.barrio || null,
      departamento: formData.departamento || null,
      contacto_emergencia_nombre: formData.contacto_emergencia_nombre || null,
      contacto_emergencia_telefono: formData.contacto_emergencia_telefono || null,
      objetivos: formData.objetivos || null,
    })
    .eq('id', clienteId)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    logger.error('Error updating cliente:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${clienteId}`)
  return { success: true }
}

export async function cambiarPasswordCliente(clienteId: string, nuevaPassword: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }

  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(nuevaPassword.trim(), salt)

  const { error } = await supabase
    .from('clientes')
    .update({
      portal_password: hashedPassword,
      updated_at: getColombiaISOString()
    })
    .eq('id', clienteId)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    logger.error('Error updating password:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true }
}

export async function eliminarCliente(clienteId: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', clienteId)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    logger.error('Error deleting client:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath('/clientes')
  return { success: true }
}

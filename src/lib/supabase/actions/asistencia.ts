'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendAttendanceNotification } from '@/lib/mail'
import { getColombiaDate, getColombiaDateString, getColombiaISOString } from '@/lib/date-utils'

export async function buscarClientesAsistencia(busqueda: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado', data: [] }

  const hoyStr = getColombiaDateString()

  // Hacemos una sola consulta agrupada con joins relacionales para evitar consultas N+1 repetitivas
  let query = supabase
    .from('clientes')
    .select(`
      id, 
      nombre, 
      numero_documento, 
      estado, 
      fecha_nacimiento,
      membresias (
        id, 
        estado, 
        fecha_fin, 
        dias_congelados,
        planes (nombre)
      ),
      asistencia (
        id,
        fecha_hora_entrada,
        fecha_hora_salida
      )
    `)
    .eq('gimnasio_id', activeGymId)
    .or(`numero_documento.ilike.%${busqueda}%,nombre.ilike.%${busqueda}%`)
    .order('nombre', { ascending: true })
    .limit(10)

  const { data: clientes, error } = await query

  if (error) {
    console.error('Error searching clients:', error)
    return { success: false, error: 'Error al buscar clientes.', data: [] }
  }

  if (!clientes || clientes.length === 0) {
    return { success: false, error: 'No se encontraron clientes activos.', data: [] }
  }

  const hoy = getColombiaDate()

  const clientesConMembresia = clientes.map((cliente: any) => {
    const mem = cliente.membresias || []
    const asistencias = cliente.asistencia || []

    // 1. Verificar si tiene alguna sesión abierta (En Sala) sin importar la fecha
    const estaEnSala = asistencias.some((a: any) => !a.fecha_hora_salida)

    // 2. Verificar si asistió hoy (para saber si es re-ingreso o si descuenta días)
    const yaAsistioHoy = asistencias.some((a: any) => 
      a.fecha_hora_entrada && a.fecha_hora_entrada.startsWith(hoyStr)
    )

    let tieneMembresia = false
    let planNombre = 'Sin Plan'
    let fechaFin = null
    let diasRestantes = 0
    let estadoMembresia = 'Sin membresía'

    if (mem && mem.length > 0) {
      // Ordenar membresías en memoria por fecha_fin descendente
      const sortedMem = [...mem].sort((a: any, b: any) => {
        if (!a.fecha_fin) return 1
        if (!b.fecha_fin) return -1
        return b.fecha_fin.localeCompare(a.fecha_fin)
      })

      // La membresía más reciente para saber el nombre del plan
      const mPrincipal: any = sortedMem[0]
      planNombre = mPrincipal.planes?.nombre || mPrincipal.planes?.[0]?.nombre || 'Plan Activo'

      // Buscar la mejor membresía que esté realmente activa por fecha y estado
      const m = sortedMem.find((mItem: any) => {
        const isStatusActive = ['activa', 'activo'].includes((mItem.estado || '').toLowerCase())
        const isNotExpired = mItem.fecha_fin && mItem.fecha_fin >= hoyStr
        return isStatusActive && isNotExpired
      })

      if (m) {
        tieneMembresia = true
        fechaFin = m.fecha_fin
        estadoMembresia = 'Activo'
        
        const fFin = new Date(m.fecha_fin + 'T23:59:59')
        const diffMs = fFin.getTime() - hoy.getTime()
        let dias = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
        
        // Descontar el día si ya asistió hoy
        if (yaAsistioHoy && dias > 0) {
          dias -= 1
        }
        
        diasRestantes = dias
      } else {
        // Si no hay activa, verificar si está congelada
        const mCongelada = sortedMem.find((mItem: any) => (mItem.estado || '').toLowerCase() === 'congelada')
        if (mCongelada) {
          estadoMembresia = 'Plan congelado'
          diasRestantes = mCongelada.dias_congelados || 0
        } else {
          estadoMembresia = 'Plan vencido'
        }
      }
    }

    const esCumpleanos = cliente.fecha_nacimiento ? (() => {
      const birthDate = new Date(cliente.fecha_nacimiento + 'T12:00:00')
      return birthDate.getDate() === hoy.getDate() && birthDate.getMonth() === hoy.getMonth()
    })() : false

    return {
      id: cliente.id,
      nombre: cliente.nombre,
      numero_documento: cliente.numero_documento,
      estado: cliente.estado,
      fecha_nacimiento: cliente.fecha_nacimiento,
      tieneMembresia,
      planNombre,
      fechaFin,
      diasRestantes,
      yaAsistioHoy,
      estaEnSala,
      estadoMembresia,
      esCumpleanos
    }
  })

  return { success: true, data: clientesConMembresia }
}


export async function registrarAsistenciaCliente(clienteId: string) {
  const { supabase, user, activeGymId } = await requireAuth()

  // Buscar todas las membresías activas y tomar la que vence más tarde
  const { data: membresias, error: memErr } = await supabase
    .from('membresias')
    .select(`
      id, 
      estado, 
      fecha_inicio, 
      fecha_fin, 
      plan_id,
      clientes (
        fecha_nacimiento
      )
    `)
    .eq('cliente_id', clienteId)
    .in('estado', ['activa', 'activo'])
    .order('fecha_fin', { ascending: false })
    .limit(1)

  if (memErr || !membresias || membresias.length === 0) {
    return { success: false, error: 'El cliente no tiene una membresía activa.' }
  }

  const membresia = membresias[0]

  const hoy = getColombiaDate()
  const hoyStr = getColombiaDateString()
  // Verificar si ya tiene una sesión abierta (En Sala)
  const { data: asistenciaAbierta } = await supabase
    .from('asistencia')
    .select('id')
    .eq('cliente_id', clienteId)
    .is('fecha_hora_salida', null)
    .limit(1)
    .single()

  // Verificar si ya asistió hoy para saber si es re-ingreso
  const { data: asistenciasHoy } = await supabase
    .from('asistencia')
    .select('id')
    .eq('cliente_id', clienteId)
    .gte('fecha_hora_entrada', hoyStr + 'T00:00:00')
    .lte('fecha_hora_entrada', hoyStr + 'T23:59:59')
    .limit(1)

  const yaAsistioHoy = !!(asistenciasHoy && asistenciasHoy.length > 0)

  if (asistenciaAbierta) {
    return { success: false, error: 'El cliente ya se encuentra en la sala. Debe registrar su salida primero.' }
  }

  if (hoyStr > membresia.fecha_fin) {
    await supabase.from('membresias').update({ estado: 'vencida' }).eq('id', membresia.id)
    return { success: false, error: 'La membresía del cliente ha vencido.' }
  }

  let planNombre = 'Membresía Activa'
  let duracionDias = 0
  if (membresia.plan_id) {
    const { data: plan } = await supabase
      .from('planes')
      .select('nombre, duracion_dias')
      .eq('id', membresia.plan_id)
      .single()
    if (plan) {
      planNombre = plan.nombre
      duracionDias = plan.duracion_dias
    }
  }

  // Cálculo correcto de días restantes usando la membresía encontrada
  const fFin = new Date(membresia.fecha_fin + 'T23:59:59')
  const msRestantes = fFin.getTime() - hoy.getTime()
  let diasRestantesCalculados = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)))

  // Al registrar asistencia manual, descontamos el día inmediatamente del reporte visual
  if (diasRestantesCalculados > 0) {
    diasRestantesCalculados -= 1
  }

  // activeGymId ya está validado y disponible


  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }

  const { data: nuevaAsistencia, error: asisErr } = await supabase
    .from('asistencia')
    .insert([{ 
      cliente_id: clienteId, 
      gimnasio_id: activeGymId,
      metodo_registro: 'manual',
      fecha_hora_entrada: getColombiaISOString()
    }])
    .select()
    .single()

  if (asisErr) {
    console.error('Error registering attendance:', asisErr)
    return { success: false, error: 'Error al registrar el ingreso.' }
  }

  revalidatePath('/asistencia')
  revalidatePath('/dashboard')

  // Notificación por correo
  try {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('nombre')
      .eq('id', clienteId)
      .single()

    await sendAttendanceNotification({
      cliente: cliente?.nombre || 'Cliente Desconocido',
      plan: planNombre,
      vencimiento: membresia.fecha_fin,
      diasRestantes: Math.max(0, diasRestantesCalculados)
    })
  } catch (e) {
    console.error('Email notification error:', e)
  }

    return { 
      success: true, 
      data: { 
        id: nuevaAsistencia?.id, 
        clienteId, 
        diasRestantes: diasRestantesCalculados,
        esReingreso: yaAsistioHoy,
        esCumpleanos: (() => {
          const birthDateStr = (membresia as any).clientes?.fecha_nacimiento;
          if (!birthDateStr) return false;
          const birthDate = new Date(birthDateStr + 'T12:00:00');
          const hoyDate = getColombiaDate();
          return birthDate.getDate() === hoyDate.getDate() && birthDate.getMonth() === hoyDate.getMonth();
        })()
      } 
    }
}

export async function registrarSalidaCliente(asistenciaId: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }
  
  const { error } = await supabase
    .from('asistencia')
    .update({ fecha_hora_salida: getColombiaISOString() })
    .eq('id', asistenciaId)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    console.error('Error registering exit:', error)
    return { success: false, error: 'Error al registrar la salida.' }
  }

  revalidatePath('/asistencia')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function getAsistenciaHoy() {
  const { unstable_noStore: noStore } = await import('next/cache');
  noStore(); // Prevenir cacheo agresivo en Next.js App Router

  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const hoyStr = getColombiaDateString()
  // Rango del día completo en hora Colombia (almacenada como UTC nominal).
  // Ver convención documentada en getColombiaISOString().
  const startOfDay = `${hoyStr}T00:00:00.000`
  const endOfDay = `${hoyStr}T23:59:59.999`
  
  // activeGymId ya está validado y disponible

  
  let query = supabase
    .from('asistencia')
    .select(`
      *,
      clientes (
        nombre,
        numero_documento,
        fecha_nacimiento
      )
    `)
    .eq('gimnasio_id', activeGymId)
    .or(`fecha_hora_entrada.gte.${startOfDay},fecha_hora_salida.is.null`)

  const { data, error } = await query.order('fecha_hora_entrada', { ascending: false })

  if (error) {
    console.error('Error fetching asistencia:', error)
    return []
  }

  const hoy = getColombiaDate()
  return (data || []).map((asist: any) => {
    const esCumpleanos = asist.clientes?.fecha_nacimiento ? (() => {
      const birthDate = new Date(asist.clientes.fecha_nacimiento + 'T12:00:00')
      return birthDate.getDate() === hoy.getDate() && birthDate.getMonth() === hoy.getMonth()
    })() : false

    return {
      ...asist,
      esCumpleanos
    }
  })
}

export async function getUltimasAsistencias(limit = 5) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const { data, error } = await supabase
    .from('asistencia')
    .select(`
      id,
      fecha_hora_entrada,
      fecha_hora_salida,
      metodo_registro,
      clientes!inner (
        nombre,
        gimnasio_id
      )
    `)
    .eq('gimnasio_id', activeGymId)
    .order('fecha_hora_entrada', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching latest attendance:', error)
    return []
  }

  return data.map((asist: any) => ({
    id: asist.id,
    clienteNombre: asist.clientes?.nombre || 'Cliente Desconocido',
    sede: 'Sede Principal',
    fecha: asist.fecha_hora_entrada,
    fechaSalida: asist.fecha_hora_salida,
    metodo: asist.metodo_registro
  }))
}

export async function getClientesLargaEstancia() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const colDate = getColombiaDate()
  const dosHorasAtrasDate = new Date(colDate.getTime() - 2 * 60 * 60 * 1000)
  const year = dosHorasAtrasDate.getFullYear();
  const month = String(dosHorasAtrasDate.getMonth() + 1).padStart(2, '0');
  const day = String(dosHorasAtrasDate.getDate()).padStart(2, '0');
  const hours = String(dosHorasAtrasDate.getHours()).padStart(2, '0');
  const minutes = String(dosHorasAtrasDate.getMinutes()).padStart(2, '0');
  const seconds = String(dosHorasAtrasDate.getSeconds()).padStart(2, '0');
  const dosHorasAtras = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;
  
  const { data, error } = await supabase
    .from('asistencia')
    .select(`
      id,
      fecha_hora_entrada,
      clientes!inner (
        nombre,
        numero_documento,
        gimnasio_id
      )
    `)
    .eq('gimnasio_id', activeGymId)
    .is('fecha_hora_salida', null)
    .lt('fecha_hora_entrada', dosHorasAtras)
    .order('fecha_hora_entrada', { ascending: true })

  if (error) {
    console.error('Error fetching long stay clients:', error)
    return []
  }

  return (data || []).map((asis: any) => ({
    id: asis.id,
    clienteNombre: asis.clientes?.nombre || 'Desconocido',
    documento: asis.clientes?.numero_documento || '---',
    entrada: asis.fecha_hora_entrada
  }))
}

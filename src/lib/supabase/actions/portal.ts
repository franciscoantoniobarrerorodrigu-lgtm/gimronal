'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient, requireAuth } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { getColombiaDate, getColombiaDateString, getColombiaISOString } from '@/lib/date-utils'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

const COOKIE_NAME = 'gym_client_session'

export async function loginCliente(documento: string, passwordStr: string, gimnasioId?: string) {
  try {
    const supabase = createAdminClient() // Usamos adminClient para buscar al cliente antes de la sesión
    const cleanDoc = documento.trim()
    const cleanPass = passwordStr.trim()

    // Buscar al cliente por número de documento (pueden ser varios en diferentes gimnasios)
    let query = supabase
      .from('clientes')
      .select('id, numero_documento, portal_password, gimnasio_id, gimnasios(nombre)')
      .eq('numero_documento', cleanDoc)
    
    const { data: clientes, error } = await query

    if (error || !clientes || clientes.length === 0) {
      logger.error('Login error:', { error })
      return { success: false, error: 'Documento o contraseña incorrectos' }
    }

    // Filtrar clientes que tengan contraseña válida
    const validClients = clientes.filter(c => {
      const storedPassword = (c.portal_password || '').toString().trim()
      const defaultPassword = (c.numero_documento || '').toString().trim()
      
      if (storedPassword) {
        if (storedPassword.startsWith('$2')) {
          return bcrypt.compareSync(cleanPass, storedPassword)
        }
        return storedPassword === cleanPass
      }
      return defaultPassword === cleanPass
    })

    if (validClients.length === 0) {
      return { success: false, error: 'Documento o contraseña incorrectos' }
    }

    let targetClient = null

    if (validClients.length > 1 && !gimnasioId) {
      return { 
        success: false, 
        requireGymSelection: true, 
        gyms: validClients.map(c => ({ id: c.gimnasio_id, nombre: (c as any).gimnasios?.nombre })) 
      }
    }

    if (gimnasioId) {
      targetClient = validClients.find(c => c.gimnasio_id === gimnasioId)
    } else {
      targetClient = validClients[0]
    }

    if (!targetClient) {
      return { success: false, error: 'No se encontró tu cuenta en este gimnasio' }
    }

    // Actualizar a hash si era texto plano
    const stored = (targetClient.portal_password || '').toString().trim()
    if (!stored || !stored.startsWith('$2')) {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(cleanPass, salt)
      await supabase.from('clientes').update({ portal_password: hash }).eq('id', targetClient.id)
    }

  // Guardar la cookie de sesión (expira en 7 días)
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, targetClient.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/'
  })

  return { success: true }
} catch (err: any) {
  logger.error('Unexpected login error:', { err })
  return { success: false, error: 'Error inesperado al iniciar sesión' }
}
}

export async function logoutCliente() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return { success: true }
}

export async function getClientSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  return sessionCookie?.value || null
}

export async function getClientEntrenadores() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return null

    const supabase = createAdminClient()

    // Primero obtener el gimnasio_id del cliente
    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) return null

    // Luego obtener entrenadores de ese gimnasio
    const { data: entrenadores, error: entErr } = await supabase
      .from('entrenadores')
      .select('id, nombre, especialidad, foto_url, horario_disponibilidad, estado')
      .eq('gimnasio_id', cliente.gimnasio_id)
      .eq('estado', 'activo')
      .order('nombre')

    if (entErr) return null
    return entrenadores
  } catch (e) {
    logger.error('Error fetching entrenadores:', { error: e })
    return null
  }
}

export async function getClientClases() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado' }

    const supabase = createAdminClient()

    // Obtener gimnasio_id del cliente
    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Gimnasio no encontrado' }
    }

    const { data: clases, error } = await supabase
      .from('clases')
      .select(`
        *,
        entrenadores (
          id,
          nombre
        )
      `)
      .eq('gimnasio_id', cliente.gimnasio_id)
      .order('dia_semana', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) {
      logger.error('Error fetching clases portal:', { error })
      return { success: false, error: 'Error interno del servidor' }
    }

    return { success: true, data: clases }
  } catch (e) {
    logger.error('Error fetching clases:', { error: e })
    return { success: false, error: 'Excepción al cargar clases' }
  }
}

export async function getPortalData() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return null

    const supabase = createAdminClient()

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select(`
        *,
        membresias (*, planes (*)),
        asistencia (*),
        gimnasios (*)
      `)
      .eq('id', clienteId)
      .single()


    if (error || !cliente) {
      logger.error('Error fetching portal data:', { error })
      return null
    }

  // Ordenar membresías
  const membresiasOrdenadas = [...(cliente.membresias || [])].sort((a: any, b: any) => 
    new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime()
  )

  const hoy = getColombiaDate()
  const hoyStr = getColombiaDateString()
  
  const membresiaActiva = membresiasOrdenadas.find((m: any) => {
    const isStatusActive = ['activa', 'activo'].includes((m.estado || '').toLowerCase())
    const isNotExpired = m.fecha_fin && m.fecha_fin >= hoyStr
    return isStatusActive && isNotExpired
  })

  let yaAsistioHoy = false

  // Revisar si ya asistió hoy
  const asistenciasHoy = cliente.asistencia?.filter((a: any) => a.fecha_hora_entrada?.startsWith(hoyStr))
  if (asistenciasHoy && asistenciasHoy.length > 0) {
    yaAsistioHoy = true
  }

  // Calcular días restantes (basado en fecha_fin)
  let diasRestantes = 0
  if (membresiaActiva?.fecha_fin) {
    const fin = new Date(membresiaActiva.fecha_fin + 'T23:59:59')
    const diff = fin.getTime() - hoy.getTime()
    // El "descuento" ocurre cuando entra, así que si ya asistió hoy, mostramos los días restantes EXCLUYENDO hoy.
    // Si NO ha asistido hoy, mostramos los días incluyendo hoy.
    diasRestantes = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    
    if (yaAsistioHoy && diasRestantes > 0) {
      diasRestantes -= 1
    }
  }

  // Asistencias recientes
  const asistenciasRecientes = [...(cliente.asistencia || [])]
    .sort((a: any, b: any) => new Date(b.fecha_hora_entrada).getTime() - new Date(a.fecha_hora_entrada).getTime())
    .slice(0, 100)

  // Asistencias este mes
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const inicioMesStr = `${y}-${m}-01`
  
  const asistenciasDelMes = cliente.asistencia?.filter((a: any) => a.fecha_hora_entrada >= inicioMesStr).length || 0

  // Asistencias totales
  const totalAsistencias = cliente.asistencia?.length || 0

  // CALCULAR NIVEL DE LEALTAD
  // 1 Nivel = 1 Mes de Lealtad (aprox. 12 asistencias)
  const asistenciasPorNivel = 12
  const maxNiveles = 100
  let nivelActual = Math.min(maxNiveles, Math.floor(totalAsistencias / asistenciasPorNivel) + 1)
  
  let ligaInfo = { nombre: 'Atleta Novato', icon: '👟', color: 'text-emerald-400', bg: 'bg-emerald-400/20', border: 'border-emerald-400/30' }
  if (nivelActual >= 60) ligaInfo = { nombre: 'Leyenda del Fitness', icon: '👑', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/30' }
  else if (nivelActual >= 48) ligaInfo = { nombre: 'Titán del Gym', icon: '🦍', color: 'text-rose-500', bg: 'bg-rose-500/20', border: 'border-rose-500/30' }
  else if (nivelActual >= 36) ligaInfo = { nombre: 'Máquina de Entrenar', icon: '⚙️', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/30' }
  else if (nivelActual >= 24) ligaInfo = { nombre: 'Guerrero de Hierro', icon: '🏋️', color: 'text-zinc-300', bg: 'bg-zinc-300/20', border: 'border-zinc-300/30' }
  else if (nivelActual >= 12) ligaInfo = { nombre: 'Gym Rat', icon: '💪', color: 'text-amber-500', bg: 'bg-amber-500/20', border: 'border-amber-500/30' }

  const progresoNivel = nivelActual === maxNiveles ? 100 : ((totalAsistencias % asistenciasPorNivel) / asistenciasPorNivel) * 100
  const asistenciasParaSiguiente = nivelActual === maxNiveles ? 0 : asistenciasPorNivel - (totalAsistencias % asistenciasPorNivel)

  const gamificacion = {
    nivel: nivelActual,
    liga: ligaInfo,
    progreso: progresoNivel,
    faltan: asistenciasParaSiguiente
  }

    let es_cumpleanos = false
    if (cliente.fecha_nacimiento) {
      const fnDate = new Date(cliente.fecha_nacimiento + 'T12:00:00')
      if (fnDate.getMonth() === hoy.getMonth() && fnDate.getDate() === hoy.getDate()) {
        es_cumpleanos = true
      }
    }

    return {
      ...cliente,
      avatar_theme: (cliente as any).avatar_theme || 'default',
      gimnasio_nombre: (cliente as any).gimnasios?.nombre || 'GymControl',
      membresia: membresiaActiva || null,
      dias_restantes: diasRestantes,
      yaAsistioHoy,
      asistencias_mes: asistenciasDelMes,
      asistencias_totales: totalAsistencias,
      asistencias_recientes: asistenciasRecientes,
      gamificacion,
      es_cumpleanos,
      // NEW: Streak (racha de días consecutivos)
      streak: calcularStreak(cliente.asistencia || [], hoyStr),
      // NEW: Weekly attendance (últimos 7 días)
      asistencia_semanal: calcularAsistenciaSemanal(cliente.asistencia || [], hoy),
      // NEW: Logros/Medallas
      logros: calcularLogros(cliente.asistencia || [], totalAsistencias, membresiasOrdenadas),
      gimnasio_activo: (cliente as any).gimnasios?.activo !== false,
      vencimiento_licencia: (cliente as any).gimnasios?.vencimiento_licencia
    }
  } catch (err) {
    logger.error('Fatal error in getPortalData:', { err })
    return null
  }
}

export async function updateClientPassword(currentPass: string, newPass: string) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }

    const supabase = createAdminClient()

    // 1. Verificar la contraseña actual
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('numero_documento, portal_password')
      .eq('id', clienteId)
      .single()

    if (fetchError || !cliente) {
      return { success: false, error: 'Error al verificar la cuenta' }
    }

    const storedPassword = (cliente.portal_password || '').toString().trim()
    const defaultPassword = (cliente.numero_documento || '').toString().trim()
    
    let isCurrentValid = false
    if (storedPassword) {
      if (storedPassword.startsWith('$2')) {
        isCurrentValid = bcrypt.compareSync(currentPass.trim(), storedPassword)
      } else {
        isCurrentValid = storedPassword === currentPass.trim()
      }
    } else {
      isCurrentValid = defaultPassword === currentPass.trim()
    }

    if (!isCurrentValid) {
      return { success: false, error: 'La contraseña actual es incorrecta' }
    }

    // 2. Hashear nueva contraseña y actualizar
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(newPass.trim(), salt)

    const { error: updateError } = await supabase
      .from('clientes')
      .update({ portal_password: hashedPassword })
      .eq('id', clienteId)

    if (updateError) {
      logger.error('Error updating portal password:', { updateError })
      return { success: false, error: 'No se pudo actualizar la contraseña' }
    }

    return { success: true }
  } catch (err: any) {
    logger.error('Unexpected error in updateClientPassword:', { err })
    return { success: false, error: 'Ocurrió un error inesperado' }
  }
}

export async function registrarAsistenciaQR(token?: string) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }

    const supabase = createAdminClient()

    // 0. Validar el token si se proporciona
    let gymIdFromToken = null
    if (token) {
      if (!token.startsWith('GYM_CONTROL_ASISTENCIA_')) {
        return { success: false, error: 'Código QR no reconocido' }
      }
      gymIdFromToken = token.replace('GYM_CONTROL_ASISTENCIA_', '')
    }

    // 1. Buscar si hay una asistencia abierta (entrada sin salida)
    const { data: asistenciaAbierta, error: errorAsis } = await supabase
      .from('asistencia')
      .select('*')
      .eq('cliente_id', clienteId)
      .is('fecha_hora_salida', null)
      .order('fecha_hora_entrada', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (asistenciaAbierta) {
      // REGISTRAR SALIDA
      const { error: errorSalida } = await supabase
        .from('asistencia')
        .update({ fecha_hora_salida: getColombiaISOString() })
        .eq('id', asistenciaAbierta.id)

      if (errorSalida) throw errorSalida
      
      revalidatePath('/socios')
      revalidatePath('/asistencia')
      return { success: true, message: 'Salida registrada correctamente. ¡Vuelve pronto!' }
    }

    // 2. REGISTRAR ENTRADA
    // Buscar membresía activa para descontar día
    const { data: cliente, error: errorCli } = await supabase
      .from('clientes')
      .select('*, membresias(*)')
      .eq('id', clienteId)
      .single()

    if (errorCli || !cliente) return { success: false, error: 'Cliente no encontrado' }

    const hoyStr = getColombiaDateString()
    const membresiaActiva = (cliente.membresias || []).find((m: any) => {
      const isStatusActive = ['activa', 'activo'].includes((m.estado || '').toLowerCase())
      const isNotExpired = m.fecha_fin && m.fecha_fin >= hoyStr
      return isStatusActive && isNotExpired
    })

    if (!membresiaActiva) {
      return { success: false, error: 'No tienes una membresía activa.' }
    }

    // Calcular días restantes (basado en fecha_fin)
    const hoy = getColombiaDate()
    const fin = new Date(membresiaActiva.fecha_fin + 'T23:59:59')
    const diff = fin.getTime() - hoy.getTime()
    const diasRestantes = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))

    if (diasRestantes <= 0) {
      return { success: false, error: 'No tienes días disponibles.' }
    }

    // Validar que el gimnasio del token coincida con el del cliente
    // El cliente SOLO puede registrar asistencia en el gimnasio con el que inició sesión.
    if (gymIdFromToken && cliente.gimnasio_id !== gymIdFromToken) {
      return { 
        success: false, 
        error: 'Este código pertenece a otro gimnasio. Debes iniciar sesión con la cuenta de este gimnasio.' 
      }
    }

    // Insertar asistencia de entrada
    const { error: errorEntrada } = await supabase
      .from('asistencia')
      .insert({
        cliente_id: clienteId,
        gimnasio_id: cliente.gimnasio_id,
        fecha_hora_entrada: getColombiaISOString(),
        metodo_registro: 'qr'
      })

    if (errorEntrada) throw errorEntrada

    let esCumpleanos = false
    if (cliente.fecha_nacimiento) {
      const fnDate = new Date(cliente.fecha_nacimiento + 'T12:00:00')
      if (fnDate.getMonth() === hoy.getMonth() && fnDate.getDate() === hoy.getDate()) {
        esCumpleanos = true
      }
    }

    revalidatePath('/socios')
    revalidatePath('/asistencia')
    return { 
      success: true, 
      message: esCumpleanos 
        ? '¡FELIZ CUMPLEAÑOS! 🎂 Entrada registrada. ¡Que tengas un excelente entrenamiento en tu día especial!' 
        : 'Entrada registrada. ¡Que tengas un excelente entrenamiento!'
    }

  } catch (err: any) {
    logger.error('Error in registrarAsistenciaQR:', { err })
    return { success: false, error: 'Error al procesar la asistencia.' }
  }
}

export async function updateClientAvatarTheme(theme: string) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('clientes')
      .update({ avatar_theme: theme } as any)
      .eq('id', clienteId)

    if (error) {
      logger.error('Error updating avatar theme:', { error })
      return { success: false, error: 'No se pudo actualizar el avatar' }
    }

    revalidatePath('/socios')
    return { success: true }
  } catch (err: any) {
    logger.error('Unexpected error in updateClientAvatarTheme:', { err })
    return { success: false, error: 'Error inesperado' }
  }
}

// ============================================================
// HELPER FUNCTIONS: Gamification
// ============================================================

function calcularStreak(asistencias: any[], hoyStr: string): number {
  // Get unique attendance dates, sorted descending
  const fechasUnicas = [...new Set(
    asistencias
      .filter((a: any) => a.fecha_hora_entrada)
      .map((a: any) => a.fecha_hora_entrada.substring(0, 10))
  )].sort((a, b) => b.localeCompare(a))

  if (fechasUnicas.length === 0) return 0

  let streak = 0
  const hoy = new Date(hoyStr + 'T12:00:00')

  // Check if today or yesterday is in the list (to start counting)
  const primerDia = fechasUnicas[0]
  const diffPrimer = Math.floor((hoy.getTime() - new Date(primerDia + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffPrimer > 1) return 0 // Last attendance was more than 1 day ago

  for (let i = 0; i < fechasUnicas.length; i++) {
    const fechaActual = new Date(fechasUnicas[i] + 'T12:00:00')
    const esperada = new Date(hoy)
    esperada.setDate(esperada.getDate() - i - (diffPrimer === 1 ? 1 : 0))
    
    const fechaEsperadaStr = esperada.toISOString().substring(0, 10)
    
    if (fechasUnicas[i] === fechaEsperadaStr) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function calcularAsistenciaSemanal(asistencias: any[], hoy: Date): { dia: string, asistio: boolean, fecha: string }[] {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const resultado = []

  const fechasAsistencia = new Set(
    asistencias
      .filter((a: any) => a.fecha_hora_entrada)
      .map((a: any) => a.fecha_hora_entrada.substring(0, 10))
  )

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() - i)
    const fechaStr = fecha.toISOString().substring(0, 10)
    resultado.push({
      dia: dias[fecha.getDay()],
      asistio: fechasAsistencia.has(fechaStr),
      fecha: fechaStr
    })
  }

  return resultado
}

function calcularLogros(asistencias: any[], totalAsistencias: number, membresias: any[]): { id: string, nombre: string, icon: string, descripcion: string, desbloqueado: boolean }[] {
  const fechasUnicas = new Set(
    asistencias
      .filter((a: any) => a.fecha_hora_entrada)
      .map((a: any) => a.fecha_hora_entrada.substring(0, 10))
  )

  // Check for early bird (entry between 4am and 9am)
  const madrugador = asistencias.some((a: any) => {
    if (!a.fecha_hora_entrada) return false
    const hora = parseInt(a.fecha_hora_entrada.substring(11, 13))
    return hora >= 4 && hora < 9
  })

  // Check for night owl (entry between 7pm and 4am)  
  const nocturno = asistencias.some((a: any) => {
    if (!a.fecha_hora_entrada) return false
    const hora = parseInt(a.fecha_hora_entrada.substring(11, 13))
    return hora >= 19 || hora < 4
  })

  // Check for 30 days in a single month
  const mesesConteo: Record<string, number> = {}
  asistencias.forEach((a: any) => {
    if (!a.fecha_hora_entrada) return
    const mesKey = a.fecha_hora_entrada.substring(0, 7)
    mesesConteo[mesKey] = (mesesConteo[mesKey] || 0) + 1
  })
  const ironMan = Object.values(mesesConteo).some(count => count >= 30)

  // Months of membership
  const mesesMembresia = membresias.length > 0 ? membresias.length : 0

  return [
    {
      id: 'primera_semana',
      nombre: 'Primera Semana',
      icon: '🌱',
      descripcion: '7 asistencias totales',
      desbloqueado: totalAsistencias >= 7
    },
    {
      id: 'constancia',
      nombre: 'Constancia',
      icon: '💪',
      descripcion: '30 asistencias totales',
      desbloqueado: totalAsistencias >= 30
    },
    {
      id: 'centurion',
      nombre: 'Centurión',
      icon: '🏛️',
      descripcion: '100 asistencias totales',
      desbloqueado: totalAsistencias >= 100
    },
    {
      id: 'madrugador',
      nombre: 'Madrugador',
      icon: '🌅',
      descripcion: 'Entrada antes de 7am',
      desbloqueado: madrugador
    },
    {
      id: 'nocturno',
      nombre: 'Búho Nocturno',
      icon: '🦉',
      descripcion: 'Entrada después de 8pm',
      desbloqueado: nocturno
    },
    {
      id: 'iron_man',
      nombre: 'Iron Man',
      icon: '🦾',
      descripcion: '30 días en un mes',
      desbloqueado: ironMan
    },
    {
      id: 'veterano',
      nombre: 'Veterano',
      icon: '🎖️',
      descripcion: '6+ meses de membresía',
      desbloqueado: mesesMembresia >= 6
    },
    {
      id: 'leyenda',
      nombre: 'Leyenda',
      icon: '👑',
      descripcion: '200 asistencias totales',
      desbloqueado: totalAsistencias >= 200
    },
  ]
}

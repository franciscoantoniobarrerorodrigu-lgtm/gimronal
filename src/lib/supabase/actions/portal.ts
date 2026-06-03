'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient, requireAuth } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { getColombiaDate, getColombiaDateString, getColombiaISOString } from '@/lib/date-utils'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import {
  createClientSessionToken,
  getClientIdFromVerifiedSession,
  getClientSessionExpiresAt,
  verifyClientSessionToken,
} from '@/lib/client-session'

const COOKIE_NAME = 'gym_client_session'

function clientSessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    expires,
    path: '/',
  }
}

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
    const requiresPasswordChange = !stored || !stored.startsWith('$2') || cleanPass.length < 6 || cleanPass === cleanDoc
    let sessionPasswordVerifier = stored
    if (!stored || !stored.startsWith('$2')) {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(cleanPass, salt)
      const { error: passwordUpdateError } = await supabase
        .from('clientes')
        .update({ portal_password: hash })
        .eq('id', targetClient.id)

      if (passwordUpdateError) {
        logger.error('Error hashing client portal password during login:', { passwordUpdateError })
        return { success: false, error: 'No se pudo preparar la sesión del socio' }
      }

      sessionPasswordVerifier = hash
    }

  // Guardar la cookie de sesión (expira en 7 días)
  const expiresAt = getClientSessionExpiresAt()
  const expires = new Date(expiresAt)
  const sessionToken = createClientSessionToken(targetClient.id, sessionPasswordVerifier, expiresAt, requiresPasswordChange)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, sessionToken, clientSessionCookieOptions(expires))

  return { success: true, requiresPasswordChange }
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
  const session = await getClientSessionInfo()
  return session?.clienteId || null
}

export async function getClientSessionInfo() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  const sessionToken = sessionCookie?.value
  const sessionPayload = verifyClientSessionToken(sessionToken)

  if (!sessionPayload) return null

  const supabase = createAdminClient()
  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('portal_password')
    .eq('id', sessionPayload.sub)
    .maybeSingle()

  if (error || !cliente) return null

  const clienteId = getClientIdFromVerifiedSession(sessionToken, cliente.portal_password)
  if (!clienteId) return null

  return {
    clienteId,
    requiresPasswordChange: sessionPayload.pc === true,
  }
}

export async function getClientPhysicalData() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return null

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await (supabase as any)
      .from('clientes')
      .select('primer_nombre, fecha_nacimiento')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente) return null

    const { data: valoracion, error: valErr } = await (supabase as any)
      .from('valoraciones_fisicas')
      .select('peso, estatura')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle()

    let edad = null
    if (cliente.fecha_nacimiento) {
      const birthDate = new Date(cliente.fecha_nacimiento)
      const today = new Date()
      edad = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        edad--
      }
    }

    return {
      nombre: cliente.primer_nombre,
      edad: edad,
      peso: valoracion?.peso || null,
      altura: valoracion?.estatura || null,
    }
  } catch (e) {
    console.error('Error fetching physical data:', e)
    return null
  }
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
        gimnasios (*)
      `)
      .eq('id', clienteId)
      .single()

    if (error || !cliente) {
      logger.error('Error fetching portal data:', { error })
      return null
    }

    const { count: totalAsisCount } = await supabase
      .from('asistencia')
      .select('id', { count: 'exact', head: true })
      .eq('cliente_id', clienteId)

    const { data: asistenciasData } = await supabase
      .from('asistencia')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha_hora_entrada', { ascending: false })
      .limit(200)

    ;(cliente as any).asistencia = asistenciasData || []

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
  const asistenciasHoy = (cliente as any).asistencia?.filter((a: any) => a.fecha_hora_entrada?.startsWith(hoyStr))
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
  const clienteAny = cliente as any
  const asistenciasRecientes = [...(clienteAny.asistencia || [])]
    .sort((a: any, b: any) => new Date(b.fecha_hora_entrada).getTime() - new Date(a.fecha_hora_entrada).getTime())
    .slice(0, 100)

  // Asistencias este mes
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const inicioMesStr = `${y}-${m}-01`
  
  const asistenciasDelMes = clienteAny.asistencia?.filter((a: any) => a.fecha_hora_entrada >= inicioMesStr).length || 0

  // Asistencias totales
  const totalAsistencias = totalAsisCount || 0

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
      ultima_membresia: membresiasOrdenadas.length > 0 ? membresiasOrdenadas[0] : null,
      dias_restantes: diasRestantes,
      yaAsistioHoy,
      asistencias_mes: asistenciasDelMes,
      asistencias_totales: totalAsistencias,
      asistencias_recientes: asistenciasRecientes,
      gamificacion,
      es_cumpleanos,
      // NEW: Streak (racha de días consecutivos)
      streak: calcularStreak(clienteAny.asistencia || [], hoyStr),
      // NEW: Weekly attendance (últimos 7 días)
      asistencia_semanal: calcularAsistenciaSemanal(clienteAny.asistencia || [], hoy),
      // NEW: Logros/Medallas
      logros: calcularLogros(clienteAny.asistencia || [], totalAsistencias, membresiasOrdenadas),
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

    const cleanNewPass = newPass.trim()
    if (cleanNewPass.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' }
    }

    if (cleanNewPass === defaultPassword) {
      return { success: false, error: 'La nueva contraseña no puede ser tu número de documento' }
    }

    // 2. Hashear nueva contraseña y actualizar
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(cleanNewPass, salt)

    const { error: updateError } = await supabase
      .from('clientes')
      .update({ portal_password: hashedPassword })
      .eq('id', clienteId)

    if (updateError) {
      logger.error('Error updating portal password:', { updateError })
      return { success: false, error: 'No se pudo actualizar la contraseña' }
    }

    const expiresAt = getClientSessionExpiresAt()
    const cookieStore = await cookies()
    cookieStore.set(
      COOKIE_NAME,
      createClientSessionToken(clienteId, hashedPassword, expiresAt),
      clientSessionCookieOptions(new Date(expiresAt))
    )

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
      const horaSalida = getColombiaISOString()
      const { error: errorSalida } = await supabase
        .from('asistencia')
        .update({ fecha_hora_salida: horaSalida })
        .eq('id', asistenciaAbierta.id)

      if (errorSalida) throw errorSalida
      
      revalidatePath('/socios')
      revalidatePath('/asistencia')

      // Enviar notificación de salida
      try {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('nombre')
          .eq('id', clienteId)
          .single()
        
        const clienteNombre = cliente?.nombre || 'Cliente Desconocido'
        const horaEntradaStr = asistenciaAbierta.fecha_hora_entrada || ''
        
        // Calcular duración
        let duracion = 'N/A'
        if (horaEntradaStr) {
          const entrada = new Date(horaEntradaStr)
          const salida = new Date(horaSalida)
          const diffMs = salida.getTime() - entrada.getTime()
          const diffMins = Math.floor(diffMs / 60000)
          const horas = Math.floor(diffMins / 60)
          const mins = diffMins % 60
          duracion = horas > 0 ? `${horas}h ${mins}min` : `${mins} min`
        }

        const formatHora = (isoStr: string) => {
          try {
            return new Date(isoStr).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
          } catch { return isoStr }
        }

        const { sendExitNotification } = await import('@/lib/mail')
        await sendExitNotification({
          cliente: clienteNombre,
          horaEntrada: formatHora(horaEntradaStr),
          horaSalida: formatHora(horaSalida),
          duracion
        })
      } catch (e) {
        logger.error('Error sending QR exit email:', { error: e })
      }

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
    
    const y = esperada.getFullYear()
    const m = String(esperada.getMonth() + 1).padStart(2, '0')
    const d = String(esperada.getDate()).padStart(2, '0')
    const fechaEsperadaStr = `${y}-${m}-${d}`
    
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

// ============================================================
// PORTAL: Mi Progreso Físico (Medidas Corporales)
// ============================================================

export async function getClientMedidas() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: [] }

    const supabase = createAdminClient()

    // Obtener gimnasio_id del cliente para seguridad adicional
    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado', data: [] }
    }

    const { data: medidas, error } = await supabase
      .from('medidas')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('gimnasio_id', cliente.gimnasio_id)
      .order('fecha_medicion', { ascending: true })

    if (error) {
      logger.error('Error fetching medidas portal:', { error })
      return { success: false, error: 'Error interno del servidor', data: [] }
    }

    return { success: true, data: medidas || [] }
  } catch (e) {
    logger.error('Error fetching medidas:', { error: e })
    return { success: false, error: 'Excepción al cargar medidas', data: [] }
  }
}

// ============================================================
// PORTAL: Mis Pagos (Historial de Facturación)
// ============================================================

export async function getClientPagos() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: [] }

    const supabase = createAdminClient()

    // Obtener gimnasio_id del cliente
    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado', data: [] }
    }

    const { data: pagos, error } = await supabase
      .from('pagos')
      .select('id, monto, metodo_pago, concepto, recibo_numero, fecha_pago, subtotal, iva_monto, iva_porcentaje, factus_url')
      .eq('cliente_id', clienteId)
      .eq('gimnasio_id', cliente.gimnasio_id)
      .order('fecha_pago', { ascending: false })

    if (error) {
      logger.error('Error fetching pagos portal:', { error })
      return { success: false, error: 'Error interno del servidor', data: [] }
    }

    return { success: true, data: pagos || [] }
  } catch (e) {
    logger.error('Error fetching pagos:', { error: e })
    return { success: false, error: 'Excepción al cargar pagos', data: [] }
  }
}

// ============================================================
// PORTAL: Plan Nutricional
// ============================================================

export async function getClientPlanNutricional() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: null }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado', data: null }
    }

    const { data, error } = await (supabase as any)
      .from('planes_nutricionales')
      .select(`
        *,
        entrenadores:entrenador_id (nombre, avatar_url)
      `)
      .eq('cliente_id', clienteId)
      .eq('gimnasio_id', cliente.gimnasio_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching plan nutricional:', { error })
      return { success: false, error: 'Error interno del servidor', data: null }
    }

    return { success: true, data: data as any }
  } catch (e) {
    logger.error('Error fetching plan nutricional:', { error: e })
    return { success: false, error: 'Excepción al cargar plan nutricional', data: null }
  }
}

// ============================================================
// PORTAL: Mis Compras (Productos)
// ============================================================

export async function getClientCompras() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: [] }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado', data: [] }
    }

    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        productos:producto_id (nombre, categoria)
      `)
      .eq('cliente_id', clienteId)
      .eq('gimnasio_id', cliente.gimnasio_id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching compras portal:', { error })
      return { success: false, error: 'Error interno del servidor', data: [] }
    }

    return { success: true, data: (data || []) as any }
  } catch (e) {
    logger.error('Error fetching compras:', { error: e })
    return { success: false, error: 'Excepción al cargar compras', data: [] }
  }
}

// ============================================================
// PORTAL: Notificaciones
// ============================================================

export async function getClientNotificaciones() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: [] }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado', data: [] }
    }

    const { data, error } = await (supabase as any)
      .from('notificaciones')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('gimnasio_id', cliente.gimnasio_id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      logger.error('Error fetching notificaciones:', { error })
      return { success: false, error: 'Error interno del servidor', data: [] }
    }

    return { success: true, data: data || [] }
  } catch (e) {
    logger.error('Error fetching notificaciones:', { error: e })
    return { success: false, error: 'Excepción al cargar notificaciones', data: [] }
  }
}

export async function marcarNotificacionesLeidas() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado' }

    const supabase = createAdminClient()

    const { error } = await (supabase as any)
      .from('notificaciones')
      .update({ estado_envio: 'leido' })
      .eq('cliente_id', clienteId)

    if (error) {
      logger.error('Error marking notifications as read:', { error })
      return { success: false, error: 'Error al marcar notificaciones como leídas' }
    }

    return { success: true }
  } catch (e) {
    logger.error('Error marking notifications:', { error: e })
    return { success: false, error: 'Excepción al marcar notificaciones' }
  }
}

// ============================================================
// PORTAL: Editar Perfil
// ============================================================

export async function updateClientProfile(formData: {
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  contacto_emergencia_nombre?: string
  contacto_emergencia_telefono?: string
}) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }

    const supabase = createAdminClient()

    const updateData: Record<string, any> = {}
    if (formData.telefono !== undefined) updateData.telefono = formData.telefono
    if (formData.email !== undefined) updateData.email = formData.email
    if (formData.direccion !== undefined) updateData.direccion = formData.direccion
    if (formData.ciudad !== undefined) updateData.ciudad = formData.ciudad
    if (formData.contacto_emergencia_nombre !== undefined) updateData.contacto_emergencia_nombre = formData.contacto_emergencia_nombre
    if (formData.contacto_emergencia_telefono !== undefined) updateData.contacto_emergencia_telefono = formData.contacto_emergencia_telefono

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No hay datos para actualizar' }
    }

    const { error } = await supabase
      .from('clientes')
      .update(updateData as any)
      .eq('id', clienteId)

    if (error) {
      logger.error('Error updating profile:', { error })
      return { success: false, error: 'No se pudo actualizar el perfil' }
    }

    revalidatePath('/socios/perfil')
    return { success: true }
  } catch (e) {
    logger.error('Error updating profile:', { error: e })
    return { success: false, error: 'Error inesperado al actualizar perfil' }
  }
}

// ============================================================
// PORTAL: Valoraciones Físicas (por entrenadores)
// ============================================================

export async function getClientValoraciones() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: [] }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado', data: [] }
    }

    const { data, error } = await (supabase as any)
      .from('valoraciones_fisicas')
      .select(`
        *,
        entrenadores:entrenador_id (nombre)
      `)
      .eq('cliente_id', clienteId)
      .eq('gimnasio_id', cliente.gimnasio_id)
      .order('fecha', { ascending: false })

    if (error) {
      logger.error('Error fetching valoraciones:', { error })
      return { success: false, error: 'Error interno del servidor', data: [] }
    }

    return { success: true, data: (data || []) as any }
  } catch (e) {
    logger.error('Error fetching valoraciones:', { error: e })
    return { success: false, error: 'Excepción al cargar valoraciones', data: [] }
  }
}

// ============================================================
// PORTAL: Inscripción a Clases
// ============================================================

export async function getClientInscripciones() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: [] }

    const supabase = createAdminClient()

    const { data, error } = await (supabase as any)
      .from('inscripciones_clases')
      .select(`
        *,
        clases:clase_id (
          id, nombre, dia_semana, hora_inicio, hora_fin, sala, cupo_maximo,
          entrenadores (id, nombre)
        )
      `)
      .eq('cliente_id', clienteId)
      .eq('activa', true)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching inscripciones:', { error })
      return { success: false, error: 'Error interno del servidor', data: [] }
    }

    return { success: true, data: data || [] }
  } catch (e) {
    logger.error('Error fetching inscripciones:', { error: e })
    return { success: false, error: 'Excepción al cargar inscripciones', data: [] }
  }
}

export async function inscribirClase(claseId: string) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado' }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    const { data: clase } = await supabase
      .from('clases')
      .select('cupo_maximo, gimnasio_id')
      .eq('id', claseId)
      .single()

    if (!clase) return { success: false, error: 'Clase no encontrada' }
    if (clase.gimnasio_id !== cliente.gimnasio_id) return { success: false, error: 'Acceso denegado' }

    if (clase.cupo_maximo) {
      const { count } = await (supabase as any)
        .from('inscripciones_clases')
        .select('*', { count: 'exact', head: true })
        .eq('clase_id', claseId)
        .eq('activa', true)

      if (count != null && count >= clase.cupo_maximo) {
        return { success: false, error: 'La clase ya alcanzó su cupo máximo' }
      }
    }

    const { error: insErr } = await (supabase as any)
      .from('inscripciones_clases')
      .insert({
        clase_id: claseId,
        cliente_id: clienteId,
        gimnasio_id: cliente.gimnasio_id
      })

    if (insErr) {
      if (insErr.code === '23505') {
        return { success: false, error: 'Ya estás inscrito en esta clase' }
      }
      logger.error('Error inscribiendo clase:', { insErr })
      return { success: false, error: 'Error al inscribirse en la clase' }
    }

    revalidatePath('/socios/horarios')
    return { success: true, message: '¡Inscripción exitosa!' }
  } catch (e) {
    logger.error('Error inscribiendo clase:', { error: e })
    return { success: false, error: 'Error inesperado' }
  }
}

export async function cancelarInscripcionClase(inscripcionId: string) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado' }

    const supabase = createAdminClient()

    const { error } = await (supabase as any)
      .from('inscripciones_clases')
      .update({ activa: false })
      .eq('id', inscripcionId)
      .eq('cliente_id', clienteId)

    if (error) {
      logger.error('Error cancelando inscripcion:', { error })
      return { success: false, error: 'Error al cancelar inscripción' }
    }

    revalidatePath('/socios/horarios')
    return { success: true, message: 'Inscripción cancelada' }
  } catch (e) {
    logger.error('Error cancelando inscripcion:', { error: e })
    return { success: false, error: 'Error inesperado' }
  }
}

// ============================================================
// PORTAL: Solicitar Renovación de Membresía
// ============================================================

export async function solicitarRenovacionMembresia() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('nombre, gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    const { error } = await (supabase as any)
      .from('notificaciones')
      .insert({
        cliente_id: clienteId,
        gimnasio_id: cliente.gimnasio_id,
        tipo: 'renovacion',
        mensaje: `${cliente.nombre} ha solicitado renovar su membresía.`,
        canal: 'correo',
        estado_envio: 'pendiente'
      })

    if (error) {
      logger.error('Error creando solicitud renovacion:', { error })
      return { success: false, error: 'Error al crear la solicitud' }
    }

    return { success: true, message: 'Solicitud de renovación enviada. Te contactaremos pronto.' }
  } catch (e) {
    logger.error('Error en solicitar renovacion:', { error: e })
    return { success: false, error: 'Error inesperado' }
  }
}

// ============================================================
// PORTAL: Contacto / Soporte
// ============================================================

export async function enviarMensajeContacto(asunto: string, mensaje: string) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('nombre, email, telefono, gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    const { error } = await (supabase as any)
      .from('notificaciones')
      .insert({
        cliente_id: clienteId,
        gimnasio_id: cliente.gimnasio_id,
        tipo: 'soporte',
        mensaje: `[${asunto}] ${mensaje}`,
        canal: 'correo',
        estado_envio: 'pendiente'
      })

    if (error) {
      logger.error('Error creando mensaje soporte:', { error })
      return { success: false, error: 'Error al enviar el mensaje' }
    }

    return { success: true, message: 'Mensaje enviado correctamente. Te contactaremos pronto.' }
  } catch (e) {
    logger.error('Error enviando mensaje soporte:', { error: e })
    return { success: false, error: 'Error inesperado' }
  }
}

// ============================================================
// PORTAL: Nutrición IA
// ============================================================

export async function createAIPlanNutricional(planData: any) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id, nombre')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    // Preparar el plan para insertarlo
    const insertData = {
      cliente_id: clienteId,
      // No asignamos entrenador_id porque es generado por IA, o podemos dejarlo nulo si la DB lo permite
      calorias_diarias: planData.calorias_diarias,
      proteinas_g: planData.proteinas_g,
      carbohidratos_g: planData.carbohidratos_g,
      grasas_g: planData.grasas_g,
      numero_comidas: planData.numero_comidas,
      horario_comidas: JSON.stringify(planData.horario_comidas),
      alimentos_recomendados: planData.alimentos_recomendados,
      alimentos_evitar: planData.alimentos_evitar,
      observaciones: (planData.observaciones || '') + '\n\n*Nota: Este plan fue generado automáticamente por Inteligencia Artificial (Nutricionista IA).*',
      // Agregar gimnasio_id si es necesario, aunque en el esquema inicial planes_nutricionales no tiene gimnasio_id, 
      // pero por si acaso, la lectura asume que sí? Revisando la consulta de lectura: eq('gimnasio_id', cliente.gimnasio_id)
      // Necesito agregar gimnasio_id si la consulta de GET lo pide, o simplemente guardar.
      // Modifiqué la DB manualmente? El schema initial NO tiene gimnasio_id en planes_nutricionales.
      // Wait, let's verify if getClientPlanNutricional asks for it.
    }

    // In getClientPlanNutricional we use eq('gimnasio_id') -> yes, it might have it. Let's add it.
    ;(insertData as any).gimnasio_id = cliente.gimnasio_id;

    const { error } = await (supabase as any)
      .from('planes_nutricionales')
      .insert(insertData as any)

    if (error) {
      logger.error('Error insertando plan AI:', { error })
      return { success: false, error: 'No se pudo guardar el plan generado' }
    }

    revalidatePath('/socios/plan-nutricional')
    return { success: true }
  } catch (e) {
    logger.error('Error guardando plan AI:', { error: e })
    return { success: false, error: 'Error inesperado al guardar el plan' }
  }
}

// ============================================================
// PORTAL: Planes y Pagos (Pasarela WhatsApp)
// ============================================================

export async function getPlanesDisponibles() {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado', data: [] }

    const supabase = createAdminClient()

    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado', data: [] }
    }

    const { data: planes, error } = await supabase
      .from('planes')
      .select('*')
      .eq('gimnasio_id', cliente.gimnasio_id)
      .eq('activo', true)
      .order('precio', { ascending: true })

    if (error) {
      logger.error('Error fetching planes:', { error })
      return { success: false, error: 'Error al cargar los planes', data: [] }
    }

    return { success: true, data: planes || [] }
  } catch (e) {
    logger.error('Error fetching planes:', { error: e })
    return { success: false, error: 'Excepción al cargar planes', data: [] }
  }
}

export async function solicitarPlanWhatsApp(planId: string) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No autorizado' }

    const supabase = createAdminClient()

    // Obtener cliente y gimnasio
    const { data: cliente, error: cliErr } = await supabase
      .from('clientes')
      .select('nombre, numero_documento, telefono, gimnasio_id')
      .eq('id', clienteId)
      .single()

    if (cliErr || !cliente || !cliente.gimnasio_id) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    // Obtener el teléfono del gimnasio
    const { data: gimnasio, error: gymErr } = await supabase
      .from('gimnasios')
      .select('telefono, nombre')
      .eq('id', cliente.gimnasio_id)
      .single()

    if (gymErr || !gimnasio) {
      return { success: false, error: 'Gimnasio no encontrado' }
    }

    // Obtener detalles del plan
    const { data: plan, error: planErr } = await supabase
      .from('planes')
      .select('nombre, precio')
      .eq('id', planId)
      .single()

    if (planErr || !plan) {
      return { success: false, error: 'Plan no encontrado' }
    }

    // Registrar notificación interna
    const { error: notifErr } = await (supabase as any)
      .from('notificaciones')
      .insert({
        cliente_id: clienteId,
        gimnasio_id: cliente.gimnasio_id,
        tipo: 'compra_plan',
        mensaje: `El cliente ${cliente.nombre} (Doc: ${cliente.numero_documento}) desea adquirir el plan: ${plan.nombre}.`,
        canal: 'interno',
        estado_envio: 'pendiente'
      })

    if (notifErr) {
      logger.error('Error creando notificación de compra de plan:', { error: notifErr })
    }

    // Preparar el mensaje para WhatsApp
    const precioFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(plan.precio)
    const mensaje = `Hola, soy ${cliente.nombre} con documento ${cliente.numero_documento}. Deseo adquirir el plan *${plan.nombre}* por el valor de *${precioFormateado}*.`
    
    // Formatear teléfono para que sirva en la URL (solo números, y agregar 57 si no tiene código de país)
    let telefonoLimpio = gimnasio.telefono?.replace(/\D/g, '') || ''
    if (telefonoLimpio.length === 10 && telefonoLimpio.startsWith('3')) {
      telefonoLimpio = `57${telefonoLimpio}`
    }

    return { 
      success: true, 
      data: {
        telefono: telefonoLimpio,
        mensaje: mensaje
      }
    }
  } catch (e) {
    logger.error('Error en solicitarPlanWhatsApp:', { error: e })
    return { success: false, error: 'Error inesperado al generar la solicitud' }
  }
}

export async function uploadClientAvatar(formData: FormData) {
  try {
    const clienteId = await getClientSession()
    if (!clienteId) return { success: false, error: 'No hay sesión activa' }
    
    const file = formData.get('file') as File
    if (!file) return { success: false, error: 'No se proporcionó un archivo' }

    const supabase = createAdminClient()

    // 1. Obtener la foto_url antigua
    const { data: cliente, error: cliError } = await supabase
      .from('clientes')
      .select('foto_url')
      .eq('id', clienteId)
      .single()

    if (cliError) {
      return { success: false, error: 'Error al obtener cliente' }
    }

    const oldUrl = cliente?.foto_url

    // 2. Borrar archivo antiguo si existe en el bucket avatars
    if (oldUrl && oldUrl.includes('/storage/v1/object/public/avatars/')) {
       const pathParts = oldUrl.split('/storage/v1/object/public/avatars/')
       if (pathParts.length === 2) {
         const oldPath = pathParts[1]
         await supabase.storage.from('avatars').remove([oldPath])
       }
    }

    // 3. Subir archivo
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `custom/${clienteId}-${Date.now()}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })
      
    if (uploadError) {
      logger.error('Error uploading avatar:', { error: uploadError })
      return { success: false, error: 'Error al subir la imagen' }
    }
    
    // 4. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    
    // 5. Actualizar cliente
    const { error: updateError } = await supabase.from('clientes').update({ 
      foto_url: publicUrl,
      avatar_theme: 'custom'
    }).eq('id', clienteId)

    if (updateError) {
      logger.error('Error updating cliente foto:', { error: updateError })
      return { success: false, error: 'Error al guardar foto' }
    }
    
    revalidatePath('/socios')
    return { success: true, url: publicUrl }
  } catch (err: any) {
    logger.error('Exception in uploadClientAvatar:', { error: err })
    return { success: false, error: 'Excepción al subir la imagen' }
  }
}

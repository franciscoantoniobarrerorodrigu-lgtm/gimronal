'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getColombiaISOString } from '@/lib/date-utils'

export async function getCajaActiva() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return null

  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .eq('gimnasio_id', activeGymId)
    .eq('estado', 'abierta')
    .maybeSingle()

  if (error) return null

  if (data) {
    const opts = { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' } as const
    const fechaAperturaStr = data.fecha_apertura
      ? new Intl.DateTimeFormat('es-CO', opts).format(new Date(data.fecha_apertura))
      : ''
    const hoyStr = new Intl.DateTimeFormat('es-CO', opts).format(new Date())
    
    // Si la caja es de un día anterior (hora Colombia), cerrarla automáticamente
    if (fechaAperturaStr && fechaAperturaStr !== hoyStr) {
      await autoCerrarCaja(data.id)
      return null
    }
  }

  return data
}

// Nueva función para cierre automático a media noche (lazy)
async function autoCerrarCaja(cajaId: string) {
  const supabase = await createClient()
  
  // 1. Obtener movimientos para calcular saldo esperado
  const { data: movimientos } = await supabase
    .from('movimientos_caja')
    .select('monto, tipo, metodo_pago')
    .eq('caja_id', cajaId)
  
  const { data: caja } = await supabase
    .from('cajas')
    .select('monto_apertura')
    .eq('id', cajaId)
    .single()

  const ingresos = movimientos
    ?.filter(m => m.tipo === 'ingreso' && m.metodo_pago === 'efectivo')
    .reduce((acc, curr) => acc + Number(curr.monto), 0) || 0
  
  const egresos = movimientos
    ?.filter(m => m.tipo === 'egreso')
    .reduce((acc, curr) => acc + Number(curr.monto), 0) || 0

  const montoEsperado = (caja?.monto_apertura || 0) + ingresos - egresos

  // 2. Cerrar caja con el monto esperado (asumiendo que no hubo descuadre)
  await supabase
    .from('cajas')
    .update({
      fecha_cierre: getColombiaISOString(),
      monto_cierre_esperado: montoEsperado,
      monto_cierre_real: montoEsperado,
      diferencia: 0,
      estado: 'cerrada',
      observaciones: 'Cierre automático del sistema (día vencido)'
    })
    .eq('id', cajaId)

  revalidatePath('/caja')
}

export async function abrirCaja(montoApertura: number) {
  const { supabase, user, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'No se encontró el gimnasio' }

  const { data, error } = await supabase
    .from('cajas')
    .insert([{
      gimnasio_id: activeGymId,
      usuario_id_apertura: user.id,
      monto_apertura: montoApertura,
      estado: 'abierta',
      fecha_apertura: getColombiaISOString(),
      created_at: getColombiaISOString()
    }])
    .select()
    .single()

  if (error) return { success: false, error: 'Error interno del servidor' }

  revalidatePath('/caja')
  return { success: true, data }
}

export async function registrarMovimientoCaja(mov: any) {
  const { supabase } = await requireAuth()
  
  const { data, error } = await supabase
    .from('movimientos_caja')
    .insert([{
      ...mov,
      created_at: getColombiaISOString()
    }])
    .select()

  if (error) return { success: false, error: 'Error interno del servidor' }

  revalidatePath('/caja')
  return { success: true, data }
}

export async function getMovimientosCaja(cajaId: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const { data, error } = await supabase
    .from('movimientos_caja')
    .select(`
      *,
      pagos(clientes(nombre)),
      ventas(clientes(nombre)),
      cajas!inner(gimnasio_id)
    `)
    .eq('caja_id', cajaId)
    .eq('cajas.gimnasio_id', activeGymId)
    .order('fecha', { ascending: false })

  if (error) return []
  return data || []
}

export async function cerrarCaja(cajaId: string, montoReal: number, observaciones: string) {
  const { supabase, user, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }

  const movimientos = await getMovimientosCaja(cajaId)
  const { data: caja } = await supabase
    .from('cajas')
    .select('monto_apertura')
    .eq('id', cajaId)
    .eq('gimnasio_id', activeGymId)
    .single()
  
  const ingresos = movimientos
    .filter(m => m.tipo === 'ingreso' && m.metodo_pago === 'efectivo')
    .reduce((acc, curr) => acc + Number(curr.monto), 0)
  
  const egresos = movimientos
    .filter(m => m.tipo === 'egreso')
    .reduce((acc, curr) => acc + Number(curr.monto), 0)

  const montoEsperado = (caja?.monto_apertura || 0) + ingresos - egresos
  const diferencia = montoReal - montoEsperado

  const { data, error } = await supabase
    .from('cajas')
    .update({
      usuario_id_cierre: user.id,
      fecha_cierre: getColombiaISOString(),
      monto_cierre_esperado: montoEsperado,
      monto_cierre_real: montoReal,
      diferencia: diferencia,
      estado: 'cerrada',
      observaciones: observaciones
    })
    .eq('id', cajaId)
    .eq('gimnasio_id', activeGymId)
    .select()
    .single()

  if (error) return { success: false, error: 'Error interno del servidor' }

  revalidatePath('/caja')
  return { success: true, data }
}

export async function getHistorialCajas() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []

  const { data, error } = await supabase
    .from('cajas')
    .select(`
      *,
      perfil_apertura:usuario_id_apertura(nombre),
      perfil_cierre:usuario_id_cierre(nombre)
    `)
    .eq('gimnasio_id', activeGymId)
    .order('fecha_apertura', { ascending: false })
    .limit(20)

  if (error) return []
  return data || []
}

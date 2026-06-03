'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getColombiaDate, getColombiaDateString } from '@/lib/date-utils'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

export async function getDashboardStats() {
  const { supabase, activeGymId } = await requireAuth()
  const defaultStats = {
    clientesActivos: 0, clientesVencidos: 0, clientesNuevosMes: 0,
    ingresosMes: 0, ingresosDia: 0, aforoActual: 0, asistenciasHoy: 0,
    vencimientos2d: 0, saldoCaja: 0, tasaRetencion: 0,
    detalleVencimientos: [], detalleVencidos: [], cajaAbierta: true,
    ingresosTrend: '0.0%'
  }

  if (!activeGymId) return defaultStats

  
  const hoy = getColombiaDate()
  const hoyStr = getColombiaDateString()
  
  const primerDiaMesISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01T00:00:00.000`
  
  const mesAnt = hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1
  const añoAnt = hoy.getMonth() === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear()
  const primerDiaMesAnteriorISO = `${añoAnt}-${String(mesAnt + 1).padStart(2, '0')}-01T00:00:00.000`

  const en2Dias = getColombiaDate()
  en2Dias.setDate(en2Dias.getDate() + 2)
  const en2DiasStr = `${en2Dias.getFullYear()}-${String(en2Dias.getMonth() + 1).padStart(2, '0')}-${String(en2Dias.getDate()).padStart(2, '0')}`

  try {
    const [
      { count: activos },
      { data: vencidosData },
      { count: nuevosMes },
      { data: pagosMes },
      { data: pagosDia },
      { data: pagosMesAnterior },
      { count: aforo },
      { count: asistenciasHoy },
      { data: vencimientosData },
      cajaAbiertaRes,
      { count: activosInicioMes }
    ] = await Promise.all([
      supabase.from('membresias').select('id, cliente:clientes!inner(id)', { count: 'exact', head: true }).eq('cliente.gimnasio_id', activeGymId).gte('fecha_fin', hoyStr),
      supabase.from('membresias').select('cliente:clientes!inner(nombre), fecha_fin').eq('cliente.gimnasio_id', activeGymId).lt('fecha_fin', hoyStr).order('fecha_fin', { ascending: false }).limit(5),
      supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('gimnasio_id', activeGymId).gte('created_at', primerDiaMesISO),
      supabase.from('pagos').select('monto, cliente:clientes!inner(id)').eq('cliente.gimnasio_id', activeGymId).gte('fecha_pago', primerDiaMesISO),
      supabase.from('pagos').select('monto, cliente:clientes!inner(id)').eq('cliente.gimnasio_id', activeGymId).gte('fecha_pago', `${hoyStr}T00:00:00`).lte('fecha_pago', `${hoyStr}T23:59:59`),
      supabase.from('pagos').select('monto, cliente:clientes!inner(id)').eq('cliente.gimnasio_id', activeGymId).gte('fecha_pago', primerDiaMesAnteriorISO).lt('fecha_pago', primerDiaMesISO),
      supabase.from('asistencia').select('id', { count: 'exact', head: true }).eq('gimnasio_id', activeGymId).is('fecha_hora_salida', null),
      supabase.from('asistencia').select('id', { count: 'exact', head: true }).eq('gimnasio_id', activeGymId).gte('fecha_hora_entrada', `${hoyStr}T00:00:00`),
      supabase.from('membresias').select('cliente:clientes!inner(nombre), fecha_fin').eq('cliente.gimnasio_id', activeGymId).lte('fecha_fin', en2DiasStr).gte('fecha_fin', hoyStr).order('fecha_fin', { ascending: true }),
      supabase.from('cajas').select('id, monto_apertura').eq('gimnasio_id', activeGymId).eq('estado', 'abierta').order('fecha_apertura', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('membresias').select('id, cliente:clientes!inner(id)', { count: 'exact', head: true }).eq('cliente.gimnasio_id', activeGymId).lte('fecha_inicio', primerDiaMesISO.split('T')[0]).gte('fecha_fin', primerDiaMesISO.split('T')[0])
    ])

    const { count: totalVencidos } = await supabase
      .from('membresias')
      .select('id, cliente:clientes!inner(id)', { count: 'exact', head: true })
      .eq('cliente.gimnasio_id', activeGymId)
      .lt('fecha_fin', hoyStr)

    const totalIngresosMes = pagosMes?.reduce((acc, pago) => acc + Number(pago.monto), 0) || 0
    const totalIngresosDia = pagosDia?.reduce((acc, pago) => acc + Number(pago.monto), 0) || 0
    const totalIngresosMesAnterior = pagosMesAnterior?.reduce((acc, pago) => acc + Number(pago.monto), 0) || 0

    let saldoCaja = 0
    if (cajaAbiertaRes?.data) {
      const { data: movs } = await supabase
        .from('movimientos_caja')
        .select('monto, tipo')
        .eq('caja_id', cajaAbiertaRes.data.id)
      
      const balance = movs?.reduce((acc, mov) => {
        return mov.tipo === 'ingreso' ? acc + Number(mov.monto) : acc - Number(mov.monto)
      }, 0) || 0
      
      saldoCaja = Number(cajaAbiertaRes.data.monto_apertura) + balance
    }

    const ingresosTrend = totalIngresosMesAnterior > 0 
      ? ((totalIngresosMes - totalIngresosMesAnterior) / totalIngresosMesAnterior * 100).toFixed(1)
      : '0.0'
    
    const ingresosTrendLabel = Number(ingresosTrend) >= 0 ? `+${ingresosTrend}%` : `${ingresosTrend}%`

    return {
      clientesActivos: activos || 0,
      clientesVencidos: totalVencidos || 0,
      clientesNuevosMes: nuevosMes || 0,
      ingresosMes: totalIngresosMes,
      ingresosDia: totalIngresosDia,
      ingresosTrend: ingresosTrendLabel,
      aforoActual: aforo || 0,
      asistenciasHoy: asistenciasHoy || 0,
      vencimientos2d: vencimientosData?.length || 0,
      saldoCaja: saldoCaja,
      cajaAbierta: !!cajaAbiertaRes?.data,

      tasaRetencion: (activosInicioMes || 0) > 0 
        ? Math.min(100, Math.max(0, Math.round(((activos || 0) - (nuevosMes || 0)) / (activosInicioMes || 0) * 100)))
        : (activos || 0) > 0 ? 100 : 0,
      detalleVencimientos: vencimientosData?.map((v: { cliente: { nombre: string } | null; fecha_fin: string }) => ({
        nombre: v.cliente?.nombre || 'Desconocido',
        fecha_fin: v.fecha_fin
      })) || [],
      detalleVencidos: vencidosData?.map((v: { cliente: { nombre: string } | null; fecha_fin: string }) => ({
        nombre: v.cliente?.nombre || 'Desconocido',
        fecha_fin: v.fecha_fin
      })) || []
    }
  } catch (error) {
    console.error("Error fetching getDashboardStats:", error)
    return defaultStats
  }
}

export async function getRecentExonerations() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []

  const { data } = await supabase
    .from('exoneraciones')
    .select('*')
    .eq('gimnasio_id', activeGymId)
    .order('creado_en', { ascending: false })
    .limit(5)

  return data || []
}

export async function getDashboardCharts() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { chartAsistencia: [], chartPlanes: [], chartComparativo: [], asistenciaTrend: '+0%' }
  const hoy = getColombiaDate()
  
  const hace7Dias = getColombiaDate()
  hace7Dias.setDate(hace7Dias.getDate() - 6)

  const hace14Dias = getColombiaDate()
  hace14Dias.setDate(hace14Dias.getDate() - 13)

  const hace7DiasStr = `${hace7Dias.getFullYear()}-${String(hace7Dias.getMonth() + 1).padStart(2, '0')}-${String(hace7Dias.getDate()).padStart(2, '0')}T00:00:00.000`
  const hace14DiasStr = `${hace14Dias.getFullYear()}-${String(hace14Dias.getMonth() + 1).padStart(2, '0')}-${String(hace14Dias.getDate()).padStart(2, '0')}T00:00:00.000`
  
  try {
    const [
      { data: asistencias },
      { data: asistenciasPrev },
      { data: ingresosPlan }
    ] = await Promise.all([
      supabase.from('asistencia').select('fecha_hora_entrada').eq('gimnasio_id', activeGymId).gte('fecha_hora_entrada', hace7DiasStr),
      supabase.from('asistencia').select('fecha_hora_entrada').eq('gimnasio_id', activeGymId).gte('fecha_hora_entrada', hace14DiasStr).lt('fecha_hora_entrada', hace7DiasStr),
      supabase.from('pagos').select('monto, membresias!inner(planes(nombre), clientes!inner(gimnasio_id))').eq('membresias.clientes.gimnasio_id', activeGymId).not('membresia_id', 'is', null)
    ])

    const asistenciaPorDia: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = getColombiaDate()
      d.setDate(d.getDate() - i)
      asistenciaPorDia[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`] = 0
    }

    asistencias?.forEach(a => {
      if (!a.fecha_hora_entrada) return
      const fecha = new Date(a.fecha_hora_entrada).toISOString().split('T')[0]
      if (asistenciaPorDia[fecha] !== undefined) asistenciaPorDia[fecha]++
    })

    const totalAsistenciasSemana = asistencias?.length || 0
    const totalAsistenciasSemanaAnt = asistenciasPrev?.length || 0
    const asistenciaTrendValue = totalAsistenciasSemanaAnt > 0 
      ? ((totalAsistenciasSemana - totalAsistenciasSemanaAnt) / totalAsistenciasSemanaAnt * 100).toFixed(1)
      : '0.0'

    const chartAsistencia = Object.entries(asistenciaPorDia)
      .map(([fecha, total]) => ({
        name: new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }),
        asistencias: total,
        fecha
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))

    const statsPorPlan: Record<string, number> = {}
    ingresosPlan?.forEach((p: { membresias?: { planes?: { nombre?: string } | null } | null; monto: number }) => {
      const nombrePlan = p.membresias?.planes?.nombre || 'Otro'
      statsPorPlan[nombrePlan] = (statsPorPlan[nombrePlan] || 0) + Number(p.monto)
    })

    return {
      chartAsistencia,
      chartPlanes: Object.entries(statsPorPlan).map(([name, value]) => ({ name, value })),
      asistenciaTrend: `${Number(asistenciaTrendValue) >= 0 ? '+' : ''}${asistenciaTrendValue}%`
    }
  } catch (error) {
    console.error("Error fetching getDashboardCharts:", error)
    return { chartAsistencia: [], chartPlanes: [], chartComparativo: [], asistenciaTrend: '+0%' }
  }

}

export async function getEntrenadoresHoy() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  const { data } = await supabase
    .from('entrenadores')
    .select('nombre, especialidad, foto_url')
    .eq('gimnasio_id', activeGymId)
    .eq('estado', 'activo')
    .limit(5)
  return data || []
}

export async function getClasesHoy() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const hoyDia = dias[getColombiaDate().getDay()]

  const { data } = await supabase
    .from('clases')
    .select(`
      id, 
      nombre, 
      hora_inicio, 
      cupo_maximo,
      entrenadores(nombre),
      inscripciones_clases(count)
    `)
    .eq('gimnasio_id', activeGymId)
    .eq('dia_semana', hoyDia)
    .eq('activa', true)
    .order('hora_inicio', { ascending: true })

  return data?.map((c: { id: string; nombre: string; hora_inicio: string; cupo_maximo: number | null; inscripciones_clases: { count: number }[] }) => ({
    ...c,
    inscritos: c.inscripciones_clases?.[0]?.count || 0
  })) || []
}

export async function getAdminNotificaciones() {
  const { activeGymId } = await requireAuth()
  if (!activeGymId) return []

  const supabaseAdmin = createAdminClient()

  const { data, error } = await (supabaseAdmin as any)
    .from('notificaciones')
    .select('id, tipo, mensaje, created_at, estado_envio')
    .eq('gimnasio_id', activeGymId)
    .eq('estado_envio', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching admin notifications:', error)
    return []
  }
  
  return data || []
}

export const marcarNotificacionLeidaAction = actionClient
  .schema(z.object({
    id: z.string()
  }))
  .action(async ({ parsedInput: { id } }) => {
  const { activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false }

  const supabaseAdmin = createAdminClient()

  const { error } = await (supabaseAdmin as any)
    .from('notificaciones')
    .update({ estado_envio: 'enviado' })
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)

  return { success: !error }
})

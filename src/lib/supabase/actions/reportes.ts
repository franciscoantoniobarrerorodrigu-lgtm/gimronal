'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { startOfYear, endOfYear, format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { getColombiaDate } from '@/lib/date-utils'

export async function getReporteFinanciero() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return {
    ingresosTotales: 0, gastosTotales: 0, utilidadNeta: 0, margen: 0,
    graficoVentas: [], dataMetodos: [{ name: 'Sin Datos', value: 100, color: '#3f3f46' }],
    ticketPromedio: 0, churnRate: 0, ocupacionHoy: [], comparativaMensual: 0,
    statsMembresias: { activas: 0, vencidas: 0, porVencer: 0 }
  }
  
  const ahora = getColombiaDate()
  const inicioMesActual = startOfMonth(ahora)
  const finMesActual = endOfMonth(ahora)
  const inicioMesAnterior = startOfMonth(subMonths(ahora, 1))
  const finMesAnterior = endOfMonth(subMonths(ahora, 1))
  
  // 1. Obtener pagos y movimientos para cálculos financieros
  const inicioAño = `${ahora.getFullYear()}-01-01T00:00:00.000`
  const finAño = `${ahora.getFullYear()}-12-31T23:59:59.999`

  const { data: pagos } = await supabase
    .from('pagos')
    .select('monto, metodo_pago, fecha_pago, cliente:clientes!inner(gimnasio_id)')
    .eq('cliente.gimnasio_id', activeGymId)
    .gte('fecha_pago', inicioAño)
    .lte('fecha_pago', finAño)

  const { data: movimientos } = await supabase
    .from('movimientos_caja')
    .select('monto, tipo, fecha, cajas!inner(gimnasio_id)')
    .eq('cajas.gimnasio_id', activeGymId)
    .gte('fecha', inicioAño)
    .lte('fecha', finAño)

  // 2. Cálculos Financieros
  const ingresosTotales = pagos?.reduce((acc, p) => acc + Number(p.monto), 0) || 0
  const gastosTotales = movimientos
    ?.filter(m => m.tipo === 'egreso')
    .reduce((acc, m) => acc + Number(m.monto), 0) || 0

  const utilidadNeta = ingresosTotales - gastosTotales
  const margen = ingresosTotales > 0 ? (utilidadNeta / ingresosTotales) * 100 : 0

  // 3. Comparativa Mensual (Ingresos Mes Actual vs Mes Anterior)
  const ingresosMesActual = pagos
    ?.filter(p => {
      if (!p.fecha_pago) return false
      const d = new Date(p.fecha_pago)
      return d >= inicioMesActual && d <= finMesActual
    })
    .reduce((acc, p) => acc + Number(p.monto), 0) || 0

  const ingresosMesAnterior = pagos
    ?.filter(p => {
      if (!p.fecha_pago) return false
      const d = new Date(p.fecha_pago)
      return d >= inicioMesAnterior && d <= finMesAnterior
    })
    .reduce((acc, p) => acc + Number(p.monto), 0) || 0

  const comparativaMensual = ingresosMesAnterior > 0 
    ? ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100 
    : 100

  // 4. Ocupación de Hoy (Por Horas)
  const inicioHoy = new Date(ahora.setHours(0,0,0,0)).toISOString()
  const finHoy = new Date(ahora.setHours(23,59,59,999)).toISOString()

  const { data: asistenciasHoy } = await supabase
    .from('asistencia')
    .select('fecha_hora_entrada')
    .eq('gimnasio_id', activeGymId)
    .gte('fecha_hora_entrada', inicioHoy)
    .lte('fecha_hora_entrada', finHoy)

  const ocupacionHoy = Array.from({ length: 24 }, (_, i) => {
    const hora = i
    const count = asistenciasHoy?.filter(a => {
      if (!a.fecha_hora_entrada) return false
      const h = new Date(a.fecha_hora_entrada).getHours()
      return h === hora
    }).length || 0
    return {
      hora: `${hora}:00`,
      personas: count
    }
  }).filter(o => parseInt(o.hora) >= 5 && parseInt(o.hora) <= 22)

  // 5. Estadísticas de Membresías
  const { data: membresias } = await supabase
    .from('membresias')
    .select('estado, fecha_fin, cliente:clientes!inner(gimnasio_id)')
    .eq('cliente.gimnasio_id', activeGymId)

  const statsMembresias = {
    activas: membresias?.filter(m => m.estado === 'activa').length || 0,
    vencidas: membresias?.filter(m => m.estado === 'vencida').length || 0,
    porVencer: membresias?.filter(m => {
      if (m.estado !== 'activa') return false
      const fin = new Date(m.fecha_fin)
      const diff = (fin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 3
    }).length || 0
  }

  // 6. Datos para Gráfico: Ingresos vs Gastos Mensuales (Últimos 6 meses)
  const mesesData = []
  const hoyRef = getColombiaDate()
  
  for (let i = 5; i >= 0; i--) {
    const fechaMes = subMonths(hoyRef, i)
    const primerDia = startOfMonth(fechaMes)
    const ultimoDia = endOfMonth(fechaMes)
    
    const ingresosMes = pagos
      ?.filter(p => {
        if (!p.fecha_pago) return false
        const d = new Date(p.fecha_pago)
        return d >= primerDia && d <= ultimoDia
      })
      .reduce((acc, p) => acc + Number(p.monto), 0) || 0
      
    const gastosMes = movimientos
      ?.filter(m => {
        if (!m.fecha) return false
        const d = new Date(m.fecha)
        return m.tipo === 'egreso' && d >= primerDia && d <= ultimoDia
      })
      .reduce((acc, m) => acc + Number(m.monto), 0) || 0

    mesesData.push({
      mes: format(fechaMes, 'MMM', { locale: es }).toUpperCase(),
      ingresos: ingresosMes,
      gastos: gastosMes
    })
  }

  // 7. Distribución de Métodos de Pago
  const metodosCount: Record<string, number> = {}
  pagos?.forEach(p => {
    const m = p.metodo_pago || 'otro'
    metodosCount[m] = (metodosCount[m] || 0) + 1
  })

  const totalPagos = pagos?.length || 0
  const dataMetodos = Object.entries(metodosCount).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: totalPagos > 0 ? Math.round((count / totalPagos) * 100) : 0,
    color: getColorForMetodo(name)
  }))

  const ticketPromedio = statsMembresias.activas > 0 ? ingresosTotales / statsMembresias.activas : 0

  return {
    ingresosTotales,
    gastosTotales,
    utilidadNeta,
    margen,
    graficoVentas: mesesData,
    dataMetodos: dataMetodos.length > 0 ? dataMetodos : [
      { name: 'Sin Datos', value: 100, color: '#3f3f46' }
    ],
    ticketPromedio,
    churnRate: 4.2,
    ocupacionHoy,
    comparativaMensual,
    statsMembresias
  }
}

function getColorForMetodo(metodo: string) {
  const colors: Record<string, string> = {
    'efectivo': '#10b981',
    'transferencia': '#1e3a8a',
    'nequi': '#0ea5e9',
    'tarjeta': '#f59e0b',
    'otro': '#6b7280'
  }
  return colors[metodo.toLowerCase()] || '#6b7280'
}

export async function getReporteIVA(year?: number) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { ivaVentas: 0, ivaPagos: 0, totalIVA: 0, subtotalGravado: 0 }
  
  const targetYear = year || getColombiaDate().getFullYear()
  const start = `${targetYear}-01-01T00:00:00.000`
  const end = `${targetYear}-12-31T23:59:59.999`

  // 1. IVA de Ventas (Productos)
  const { data: ventas } = await supabase
    .from('ventas')
    .select('iva_monto, subtotal')
    .eq('gimnasio_id', activeGymId)
    .gte('created_at', start)
    .lte('created_at', end)

  // 2. IVA de Pagos (Membresías)
  const { data: pagos } = await supabase
    .from('pagos')
    .select('iva_monto, subtotal')
    .eq('gimnasio_id', activeGymId)
    .gte('created_at', start)
    .lte('created_at', end)

  const ivaVentas = ventas?.reduce((acc, v) => acc + (Number(v.iva_monto) || 0), 0) || 0
  const ivaPagos = pagos?.reduce((acc, p) => acc + (Number(p.iva_monto) || 0), 0) || 0
  
  const subtotalGravadoVentas = ventas?.reduce((acc, v) => acc + (Number(v.subtotal) || 0), 0) || 0
  const subtotalGravadoPagos = pagos?.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0) || 0

  return {
    ivaVentas,
    ivaPagos,
    totalIVA: ivaVentas + ivaPagos,
    subtotalGravado: subtotalGravadoVentas + subtotalGravadoPagos
  }
}

export async function getTopeFiscalDIAN() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return {
    ingresosAnoActual: 0,
    topeUVT: 3500,
    valorUVT2026: 52374,
    topePesos: 183309000,
    porcentaje: 0,
    estado: 'ok',
    faltante: 183309000
  }

  const { data: gymData } = await supabase
    .from('gimnasios')
    .select('modulo_dian_activo')
    .eq('id', activeGymId)
    .single()

  const ahora = getColombiaDate()
  const year = 2026
  const inicioAño = `${year}-01-01T00:00:00.000`
  const finAño = `${year}-12-31T23:59:59.999`

  const [{ data: pagos }, { data: ventas }] = await Promise.all([
    supabase
      .from('pagos')
      .select('monto, cliente:clientes!inner(gimnasio_id)')
      .eq('cliente.gimnasio_id', activeGymId)
      .gte('fecha_pago', inicioAño)
      .lte('fecha_pago', finAño),
    supabase
      .from('ventas')
      .select('total')
      .eq('gimnasio_id', activeGymId)
      .gte('created_at', inicioAño)
      .lte('created_at', finAño)
  ])

  const totalPagos = pagos?.reduce((acc, p) => acc + Number(p.monto || 0), 0) || 0
  const totalVentas = ventas?.reduce((acc, v) => acc + Number(v.total || 0), 0) || 0
  const ingresosAnoActual = totalPagos + totalVentas

  const topePesos = 183309000 // 3.500 UVT * $52.374 en 2026
  const porcentaje = Math.min(100, Math.round((ingresosAnoActual / topePesos) * 100))
  const faltante = Math.max(0, topePesos - ingresosAnoActual)
  
  let estado = 'ok'
  if (porcentaje >= 100) estado = 'excedido'
  else if (porcentaje >= 80) estado = 'alerta'

  return {
    ingresosAnoActual,
    topeUVT: 3500,
    valorUVT2026: 52374,
    topePesos,
    porcentaje,
    estado,
    faltante,
    moduloDianActivo: gymData?.modulo_dian_activo || false
  }
}

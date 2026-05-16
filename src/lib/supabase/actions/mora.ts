'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getColombiaISOString } from '@/lib/date-utils'

export async function getMoraList() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []

  // 1. Obtener deudas de Membresías
  const { data: memberships, error: mError } = await supabase
    .from('membresias')
    .select(`
      id, fecha_inicio, fecha_fin, estado,
      planes (nombre, precio),
      clientes!inner (id, nombre, telefono, gimnasio_id),
      pagos (monto)
    `)
    .eq('clientes.gimnasio_id', activeGymId)
    .neq('estado', 'cancelada')

  // 2. Obtener deudas de Ventas (Productos)
  const { data: sales, error: sError } = await supabase
    .from('ventas')
    .select(`
      id, total, created_at, concepto,
      clientes!inner (id, nombre, telefono, gimnasio_id),
      pagos (monto)
    `)
    .eq('clientes.gimnasio_id', activeGymId)
    .not('cliente_id', 'is', null)

  if (mError || sError) {
    console.error('Error fetching mora sources:', { mError, sError })
    return []
  }

  // 3. Procesar Membresías
  const membershipMora = (memberships as any[]).map(m => {
    const totalCost = Number(m.planes?.precio || 0)
    const totalPaid = m.pagos?.reduce((acc: number, p: any) => acc + Number(p.monto), 0) || 0
    const balanceDue = totalCost - totalPaid

    return {
      id: m.id,
      tipo: 'membresia',
      cliente: m.clientes.nombre,
      clienteId: m.clientes.id,
      telefono: m.clientes.telefono,
      plan: m.planes?.nombre || 'Plan Desconocido',
      fecha_inicio: m.fecha_inicio,
      fecha_fin: m.fecha_fin,
      totalCost,
      totalPaid,
      balanceDue,
      estado: m.estado
    }
  }).filter(m => m.balanceDue > 0)

  // 4. Procesar Ventas
  const salesMora = (sales as any[]).map(s => {
    const totalCost = Number(s.total || 0)
    const totalPaid = s.pagos?.reduce((acc: number, p: any) => acc + Number(p.monto), 0) || 0
    const balanceDue = totalCost - totalPaid

    return {
      id: s.id,
      tipo: 'producto',
      cliente: s.clientes.nombre,
      clienteId: s.clientes.id,
      telefono: s.clientes.telefono,
      plan: s.concepto || 'Producto',
      fecha_inicio: s.created_at,
      fecha_fin: '-',
      totalCost,
      totalPaid,
      balanceDue,
      estado: 'pendiente'
    }
  }).filter(s => s.balanceDue > 0)

  // 5. Unificar y Ordenar
  return [...membershipMora, ...salesMora].sort((a, b) => b.balanceDue - a.balanceDue)
}

export async function getMoraSummary() {
  const list = await getMoraList()
  const totalDebt = list.reduce((acc, m) => acc + m.balanceDue, 0)
  const count = new Set(list.map(m => m.cliente)).size // Clientes únicos con deuda
  
  return { 
    totalDebt, 
    count 
  }
}

export async function registrarAbono(data: { 
  membresiaId?: string, 
  ventaId?: string,
  clienteId: string, 
  monto: number, 
  metodoPago: string, 
  concepto: string 
}) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }

  // 1. Verificar Caja
  const { data: cajaActiva } = await supabase
    .from('cajas')
    .select('id')
    .eq('estado', 'abierta')
    .eq('gimnasio_id', activeGymId)
    .maybeSingle()

  if (!cajaActiva) {
    return { success: false, error: 'Debes abrir la caja primero para realizar cobros.' }
  }

  // 2. Insertar Pago
  const { data: nuevoPago, error: pagoErr } = await supabase
    .from('pagos')
    .insert([{
      cliente_id: data.clienteId,
      membresia_id: data.membresiaId || null,
      venta_id: data.ventaId || null,
      monto: data.monto,
      metodo_pago: (data.metodoPago || 'efectivo').toLowerCase().includes('nequi') ? 'nequi' : 
                   (data.metodoPago || 'efectivo').toLowerCase().includes('daviplata') ? 'daviplata' :
                   ['efectivo', 'transferencia', 'tarjeta', 'nequi', 'daviplata'].includes((data.metodoPago || '').toLowerCase()) 
                   ? data.metodoPago.toLowerCase() : 'efectivo',
      concepto: `Abono: ${data.concepto}`,
      fecha_pago: getColombiaISOString(),
      created_at: getColombiaISOString()
    }])
    .select()
    .single()

  if (pagoErr) {
    console.error('Error al registrar abono:', pagoErr)
    return { success: false, error: 'Error al registrar el pago' }
  }

  // 3. Movimiento de Caja
  await supabase.from('movimientos_caja').insert([{
    caja_id: cajaActiva.id,
    tipo: 'ingreso',
    metodo_pago: nuevoPago.metodo_pago || 'efectivo',
    monto: data.monto,
    concepto: `Abono Mora: ${data.concepto}`,
    pago_id: nuevoPago.id,
    venta_id: data.ventaId || null,
    created_at: getColombiaISOString()
  }])

  revalidatePath('/mora')
  revalidatePath('/pagos')
  revalidatePath('/caja')
  revalidatePath('/dashboard')

  return { success: true }
}
export async function hasPendingDebt(clienteId: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return false

  // 1. Verificar deudas de Membresías
  const { data: memberships } = await supabase
    .from('membresias')
    .select(`
      id,
      planes (precio),
      pagos (monto)
    `)
    .eq('cliente_id', clienteId)
    .neq('estado', 'cancelada')

  if (memberships) {
    for (const m of memberships) {
      const totalCost = Number((m as any).planes?.precio || 0)
      const totalPaid = (m as any).pagos?.reduce((acc: number, p: any) => acc + Number(p.monto), 0) || 0
      if (totalCost - totalPaid > 0) return true
    }
  }

  // 2. Verificar deudas de Ventas
  const { data: sales } = await supabase
    .from('ventas')
    .select(`
      id,
      total,
      pagos (monto)
    `)
    .eq('cliente_id', clienteId)

  if (sales) {
    for (const s of sales) {
      const totalCost = Number(s.total || 0)
      const totalPaid = (s as any).pagos?.reduce((acc: number, p: any) => acc + Number(p.monto), 0) || 0
      if (totalCost - totalPaid > 0) return true
    }
  }

  return false
}

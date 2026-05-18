'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPaymentNotification } from '@/lib/mail'
import { getColombiaDate, getColombiaISOString } from '@/lib/date-utils'
import { logger } from '@/lib/logger'

export async function getInventarioDashboard() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }

  const { data: productos, error: pError } = await supabase
    .from('productos')
    .select('*')
    .eq('gimnasio_id', activeGymId)
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (pError) return { success: false, error: 'Error interno del servidor' }

  const stockBajo = productos.filter(p => (p.stock ?? 0) <= (p.stock_minimo || 5)).length
  const valorTotal = productos.reduce((acc, p) => acc + ((p.stock ?? 0) * (Number(p.precio_venta) || 0)), 0)

  const ahora = getColombiaDate()
  const yearMonth = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const inicioMes = `${yearMonth.getFullYear()}-${String(yearMonth.getMonth() + 1).padStart(2, '0')}-01T00:00:00.000`
  
  const { data: ventas } = await supabase
    .from('ventas')
    .select('total, producto_id, cantidad, productos(nombre)')
    .eq('gimnasio_id', activeGymId)
    .gte('created_at', inicioMes)

  const ventasMes = (ventas || []).reduce((acc, v) => acc + Number(v.total), 0)
  
  // Agrupar ventas por producto para la gráfica
  const ventasPorProductoMap: Record<string, { nombre: string, total: number, cantidad: number }> = {}
  
  ;(ventas || []).forEach((v: any) => {
    const nombre = v.productos?.nombre || 'Desconocido'
    if (!ventasPorProductoMap[nombre]) {
      ventasPorProductoMap[nombre] = { nombre, total: 0, cantidad: 0 }
    }
    ventasPorProductoMap[nombre].total += Number(v.total)
    ventasPorProductoMap[nombre].cantidad += Number(v.cantidad)
  })

  const ventasPorProducto = Object.values(ventasPorProductoMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return {
    success: true,
    data: {
      productos,
      stats: {
        stockBajo,
        valorTotal,
        ventasMes,
        ventasPorProducto
      }
    }
  }
}

export async function crearProducto(producto: any) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }

  const dataToInsert = {
    ...producto,
    gimnasio_id: activeGymId,
    precio_costo: Number(producto.precio_costo) || 0,
    precio_venta: Number(producto.precio_venta) || 0,
    stock: Number(producto.stock) || 0,
    stock_minimo: Number(producto.stock_minimo) || 5,
    fecha_vencimiento: producto.fecha_vencimiento || null,
    sku: producto.sku || null,
    proveedor: producto.proveedor || null,
    foto_url: producto.foto_url || null,
    aplica_iva: producto.aplica_iva !== undefined ? producto.aplica_iva : true,
    iva_porcentaje: producto.aplica_iva === false ? 0 : (Number(producto.iva_porcentaje) || 19),
    activo: true
  }

  const { data, error } = await supabase
    .from('productos')
    .insert([dataToInsert])
    .select()

  if (error) return { success: false, error: 'Error interno del servidor' }

  revalidatePath('/inventario')
  return { success: true, data: data[0] }
}

export async function registrarVenta(ventaData: any) {
  const { supabase, user, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }

  // VERIFICAR CAJA ABIERTA
  const { data: cajaActiva } = await supabase
    .from('cajas')
    .select('id')
    .eq('estado', 'abierta')
    .eq('gimnasio_id', activeGymId)
    .maybeSingle()

  if (!cajaActiva) {
    return { success: false, error: 'Debes abrir la caja primero para realizar ventas.' }
  }

  // Calcular IVA basado en la configuración del producto
  const { data: productoInfo } = await supabase
    .from('productos')
    .select('aplica_iva, iva_porcentaje')
    .eq('id', ventaData.producto_id)
    .single()

  const aplicaIva = productoInfo?.aplica_iva ?? true
  const ivaPorcentaje = aplicaIva ? (Number(productoInfo?.iva_porcentaje) || 19) : 0
  const subtotal = ventaData.precio_unitario * ventaData.cantidad
  const ivaMonto = aplicaIva ? Math.round(subtotal * (ivaPorcentaje / 100)) : 0
  const totalConIva = subtotal + ivaMonto

  const { data: venta, error: vError } = await supabase
    .from('ventas')
    .insert([{
      producto_id: ventaData.producto_id,
      cliente_id: ventaData.cliente_id || null,
      cantidad: ventaData.cantidad,
      precio_unitario: ventaData.precio_unitario,
      subtotal,
      iva_porcentaje: ivaPorcentaje,
      iva_monto: ivaMonto,
      total: totalConIva,
      metodo_pago: ventaData.metodo_pago,
      concepto: ventaData.concepto,
      vendido_por: user.id,
      gimnasio_id: activeGymId,
      created_at: getColombiaISOString()
    }])
    .select()
    .single()

  if (vError) return { success: false, error: 'Error al registrar la venta' }

  // 2. Registrar el Pago (si hay monto pagado)
  const montoPagado = ventaData.monto_pagado !== undefined ? ventaData.monto_pagado : totalConIva
  let pagoId = null

  if (montoPagado > 0) {
    const { data: nuevoPago, error: pError } = await supabase
      .from('pagos')
      .insert([{
        cliente_id: ventaData.cliente_id || null,
        venta_id: venta.id,
        monto: montoPagado,
        subtotal: subtotal,
        iva_monto: ivaMonto,
        iva_porcentaje: ivaPorcentaje,
        metodo_pago: ventaData.metodo_pago || 'efectivo',
        concepto: `Pago Venta: ${ventaData.concepto || 'Producto'}`,
        fecha_pago: getColombiaISOString(),
        created_at: getColombiaISOString(),
        gimnasio_id: activeGymId
      }])
      .select()
      .single()
    
    if (!pError && nuevoPago) pagoId = nuevoPago.id
  }

  // 3. Descontar stock (atómico via RPC)
  await supabase.rpc('decrement_stock_producto', {
    p_id: ventaData.producto_id,
    p_cantidad: ventaData.cantidad
  })

  // 4. Registrar movimiento en caja
  if (cajaActiva && montoPagado > 0) {
    await supabase.from('movimientos_caja').insert([{
      caja_id: cajaActiva.id,
      tipo: 'ingreso',
      metodo_pago: ventaData.metodo_pago || 'efectivo',
      monto: montoPagado,
      subtotal: subtotal,
      iva_monto: ivaMonto,
      concepto: `Venta: ${ventaData.concepto || 'Producto'}`,
      venta_id: venta.id,
      pago_id: pagoId,
      created_at: getColombiaISOString(),
      gimnasio_id: activeGymId
    }])
  }

  revalidatePath('/inventario')
  revalidatePath('/caja')

  // Enviar notificación por correo
  try {
    await sendPaymentNotification({
      cliente: 'Venta Inventario',
      monto: ventaData.total,
      concepto: ventaData.concepto || 'Producto',
      metodo: ventaData.metodo_pago || 'efectivo'
    })
  } catch (e) {
    logger.error('Email notification error:', { error: e })
  }

  return { success: true, data: venta }
}

export async function actualizarProducto(id: string, updates: any) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('productos')
    .update(updates)
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)
    .select()

  if (error) return { success: false, error: 'Error interno del servidor' }

  return { success: true, data: data[0] }
}

export async function eliminarProducto(id: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)

  if (error) return { success: false, error: 'Error interno del servidor' }

  return { success: true }
}

export async function getProductos() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .eq('gimnasio_id', activeGymId)
    .order('nombre', { ascending: true })

  if (error) {
    logger.error('Error fetching productos:', { error })
    return []
  }

  return data || []
}
export async function getMovimientosInventario() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }

  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      productos(nombre)
    `)
    .eq('gimnasio_id', activeGymId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { success: false, error: 'Error interno del servidor' }

  return { success: true, data }
}

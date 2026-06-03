'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPaymentNotification } from '@/lib/mail'
import { getColombiaDate, getColombiaDateString, getColombiaISOString } from '@/lib/date-utils'
import { hasPendingDebt } from './mora'
import { logger } from '@/lib/logger'
import { generarFacturaElectronica } from '@/lib/factus/api'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

export const eliminarPagoAction = actionClient
  .schema(z.object({
    id: z.string()
  }))
  .action(async ({ parsedInput: { id: pagoId } }) => {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }

  const { data: pago } = await supabase
    .from('pagos')
    .select(`
      cliente_id, monto, concepto, created_at,
      clientes!inner(gimnasio_id)
    `)
    .eq('id', pagoId)
    .eq('clientes.gimnasio_id', activeGymId)
    .single()

  if (pago && pago.created_at) {
    await supabase
      .from('membresias')
      .delete()
      .eq('cliente_id', pago.cliente_id)
      .filter('created_at', 'gte', new Date(new Date(pago.created_at).getTime() - 5000).toISOString())
      .filter('created_at', 'lte', new Date(new Date(pago.created_at).getTime() + 5000).toISOString())
  }

  const { error } = await supabase
    .from('pagos')
    .delete()
    .eq('id', pagoId)
    // El filtro ya se aplicó arriba al verificar la existencia del pago en este gimnasio

  if (error) return { success: false, error: 'Error interno del servidor' }

  revalidatePath('/pagos')
  revalidatePath('/asistencia')
  revalidatePath('/membresias')
  return { success: true }
})

export async function getPagos() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const { data, error } = await supabase
    .from('pagos')
    .select(`
      *,
      clientes!inner (
        nombre,
        numero_documento,
        gimnasio_id
      )
    `)
    .eq('clientes.gimnasio_id', activeGymId)
    .order('fecha_pago', { ascending: false })

  if (error) return []
  return data || []
}

export const registrarPagoAction = actionClient
  .schema(z.object({
    cliente_id: z.string().min(1, 'Debe seleccionar un cliente'),
    monto: z.number(),
    metodo_pago: z.string(),
    concepto: z.string(),
    generar_factura: z.boolean().optional()
  }))
  .action(async ({ parsedInput: pagoData }) => {
  const { supabase, activeGymId } = await requireAuth()
  
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }

  // VERIFICAR CAJA ABIERTA
  const { data: cajaActiva } = await supabase
    .from('cajas')
    .select('id')
    .eq('estado', 'abierta')
    .eq('gimnasio_id', activeGymId)
    .maybeSingle()

  if (!cajaActiva) {
    return { success: false, error: 'Debes abrir la caja primero para realizar cobros.' }
  }

  const { data: gymInfo } = await supabase
    .from('gimnasios')
    .select('tope_factura_electronica, modulo_dian_activo')
    .eq('id', activeGymId)
    .single()

  const { data: plan } = await supabase
    .from('planes')
    .select('id, nombre, duracion_dias, aplica_iva, iva_porcentaje')
    .eq('nombre', pagoData.concepto)
    .eq('activo', true)
    .eq('gimnasio_id', activeGymId)
    .maybeSingle()

  // Calcular Desglose IVA si el plan lo aplica
  let subtotal = Number(pagoData.monto)
  let ivaMonto = 0
  let ivaPorcentaje = 0

  if (plan?.aplica_iva) {
    ivaPorcentaje = Number(plan.iva_porcentaje) || 19
    // El monto que llega es el TOTAL pagado. El IVA está incluido.
    // Total = Subtotal * (1 + IVA) -> Subtotal = Total / (1 + IVA)
    subtotal = Math.round(Number(pagoData.monto) / (1 + (ivaPorcentaje / 100)))
    ivaMonto = Number(pagoData.monto) - subtotal
  }

  let membresiaId: string | null = null

  if (plan && pagoData.cliente_id) {
    // REGLA: No crear membresía si tiene deuda pendiente
    const debt = await hasPendingDebt(pagoData.cliente_id)
    if (debt) {
      return { success: false, error: 'El cliente tiene una deuda pendiente. Debe estar a paz y salvo para crear una membresía.' }
    }

    const hoyStr = getColombiaDateString()
    
    // Buscar si ya tiene una membresía activa para extenderla
    const { data: memActual } = await supabase
      .from('membresias')
      .select('fecha_fin')
      .eq('cliente_id', pagoData.cliente_id)
      .in('estado', ['activa', 'activo'])
      .order('fecha_fin', { ascending: false })
      .limit(1)
      .maybeSingle()

    let fechaInicioBase = hoyStr
    
    // Si tiene una activa que vence hoy o en el futuro, la nueva empieza después de esa
    if (memActual && memActual.fecha_fin >= hoyStr) {
      const fActual = new Date(memActual.fecha_fin + 'T12:00:00')
      fActual.setDate(fActual.getDate() + 1)
      const y = fActual.getFullYear()
      const m = String(fActual.getMonth() + 1).padStart(2, '0')
      const d = String(fActual.getDate()).padStart(2, '0')
      fechaInicioBase = `${y}-${m}-${d}`
    }

    // Calcular fecha fin: inicio + duracion - 1 día
    const fInicio = new Date(fechaInicioBase + 'T12:00:00')
    const fFin = new Date(fInicio)
    fFin.setDate(fFin.getDate() + plan.duracion_dias - 1)
    
    const yFin = fFin.getFullYear()
    const mFin = String(fFin.getMonth() + 1).padStart(2, '0')
    const dFin = String(fFin.getDate()).padStart(2, '0')
    const fechaFinStr = `${yFin}-${mFin}-${dFin}`

    const { data: membresia, error: memErr } = await supabase
      .from('membresias')
      .insert([{
        cliente_id: pagoData.cliente_id,
        plan_id: plan.id,
        fecha_inicio: fechaInicioBase,
        fecha_fin: fechaFinStr,
        estado: 'activa',
        created_at: getColombiaISOString(),
        gimnasio_id: activeGymId
      }])
      .select()

    if (memErr) logger.error('Error creating/extending membership:', { error: memErr })
    else if (membresia && membresia[0]) membresiaId = membresia[0].id
  }

  // Generar numeración consecutiva para el recibo: REC-YYYYMMDD-XXXX
  const todayStart = getColombiaDateString() + 'T00:00:00.000Z'
  const todayEnd = getColombiaDateString() + 'T23:59:59.999Z'
  const { count } = await supabase
    .from('pagos')
    .select('id', { count: 'exact', head: true })
    .eq('gimnasio_id', activeGymId)
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd)

  const correlativo = String((count || 0) + 1).padStart(4, '0')
  const dateStr = getColombiaDateString().replace(/-/g, '') // YYYYMMDD
  const recibo_numero = `REC-${dateStr}-${correlativo}`

  // Extraer solo los campos válidos para la tabla pagos (evitar campos extras del form como generar_factura, efectivo_recibido)
  const { cliente_id, monto, metodo_pago, concepto } = pagoData

  const { data, error } = await supabase
    .from('pagos')
    .insert([{
      cliente_id,
      monto,
      metodo_pago,
      concepto,
      membresia_id: membresiaId,
      subtotal,
      iva_monto: ivaMonto,
      iva_porcentaje: ivaPorcentaje,
      recibo_numero,
      fecha_pago: getColombiaISOString(),
      created_at: getColombiaISOString(),
      gimnasio_id: activeGymId
    }])
    .select()

  if (error) {
    logger.error('Error insertando pago:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  // --- LOGICA FACTURA ELECTRONICA (FACTUS) ---
  let factus_id = null
  let factus_cufe = null
  let factus_url = null
  let factus_status = null

  const tope = gymInfo?.tope_factura_electronica || 235325
  const generarFactura = pagoData.monto >= tope || pagoData.generar_factura
  
  if (generarFactura && gymInfo?.modulo_dian_activo) {
    const { data: cliente } = await supabase.from('clientes').select('*').eq('id', pagoData.cliente_id).single()
    
    if (cliente) {
      const payloadFactus = {
        reference_code: recibo_numero,
        document: "01", // Factura de venta electrónica
        numbering_range_id: 1, // ID rango pruebas Factus Sandbox
        customer: {
          identification_document_code: cliente.tipo_documento === 'NIT' ? "31" : "13",
          identification: cliente.numero_documento,
          dv: "0",
          legal_organization_code: cliente.tipo_documento === 'NIT' ? "1" : "2",
          tribute_code: "ZY", // No responsable de IVA por defecto
          municipality_code: "05001" // Código municipio (Ej: Medellín)
        },
        payment_details: [
          {
            payment_form_code: "1", // Contado
            payment_method_code: pagoData.metodo_pago === 'efectivo' ? "10" : "42",
            due_date: getColombiaDateString()
          }
        ],
        items: [
          {
            code_reference: plan ? plan.id.substring(0, 8) : "GEN-01",
            price: subtotal,
            quantity: 1,
            unit_measure_code: "94", // Unidad estándar
            standard_code: {
              scheme_name: "UNSPSC",
              code: "85121600" // Educación física y deportes
            },
            taxes: ivaPorcentaje > 0 ? [
              {
                tax_code: "01",
                tax_percentage: ivaPorcentaje.toString(),
                tax_amount: ivaMonto.toString(),
                tax_base: subtotal.toString()
              }
            ] : []
          }
        ]
      }

      const factusResult = await generarFacturaElectronica(payloadFactus)
      
      if (factusResult.success && factusResult.factura) {
        factus_id = factusResult.factura.id
        factus_cufe = factusResult.factura.cufe
        factus_url = factusResult.factura.url_pdf
        factus_status = factusResult.factura.status

        await supabase.from('pagos').update({
          factus_id,
          factus_cufe,
          factus_url,
          factus_status
        }).eq('id', data[0].id)
      } else {
        logger.error('No se pudo emitir la factura en Factus:', factusResult.error)
      }
    }
  }
  // ---------------------------------------------

  if (cajaActiva) {
    await supabase.from('movimientos_caja').insert([{
      caja_id: cajaActiva.id,
      tipo: 'ingreso',
      metodo_pago: pagoData.metodo_pago,
      monto: pagoData.monto,
      subtotal,
      iva_monto: ivaMonto,
      concepto: `Pago: ${pagoData.concepto}`,
      pago_id: data[0].id,
      created_at: getColombiaISOString(),
      gimnasio_id: activeGymId
    }])
  }

  revalidatePath('/pagos')
  revalidatePath('/membresias')
  revalidatePath('/asistencia')
  revalidatePath('/caja')

  // Enviar notificación por correo
  try {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('nombre')
      .eq('id', pagoData.cliente_id)
      .single()

    // Calcular días restantes de la membresía para el correo
    let vencimiento: string | undefined
    let diasRestantes: number | undefined

    if (plan) {
      // Usamos el id de la membresía recién creada para obtener la fecha_fin real
      if (membresiaId) {
        const { data: memCreada } = await supabase
          .from('membresias')
          .select('fecha_fin')
          .eq('id', membresiaId)
          .single()
        
        if (memCreada) {
          vencimiento = memCreada.fecha_fin
          const hoy = getColombiaDate()
          const fFin = new Date(memCreada.fecha_fin + 'T23:59:59')
          const msRestantes = fFin.getTime() - hoy.getTime()
          diasRestantes = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)))
        }
      }
    }

    await sendPaymentNotification({
      cliente: cliente?.nombre || 'Cliente Desconocido',
      monto: pagoData.monto,
      concepto: pagoData.concepto,
      metodo: pagoData.metodo_pago,
      vencimiento,
      diasRestantes
    })
  } catch (e) {
    logger.error('Email notification error:', { error: e })
  }

  return { success: true, data }
})

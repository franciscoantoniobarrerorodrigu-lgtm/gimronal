import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Step 1: Get just the client
    const { data: clienteBasico, error: errBasico } = await supabase
      .from('clientes')
      .select('id, nombre, estado')
      .eq('id', id)
      .maybeSingle()

    if (errBasico) {
      return NextResponse.json({ step: 'basic', error: errBasico.message }, { status: 500 })
    }
    if (!clienteBasico) {
      return NextResponse.json({ step: 'basic', error: 'Client not found' }, { status: 404 })
    }

    // Step 2: Get memberships separately
    const { data: membresias, error: errMemb } = await supabase
      .from('membresias')
      .select('*')
      .eq('cliente_id', id)

    if (errMemb) {
      return NextResponse.json({ step: 'membresias', error: errMemb.message, clienteBasico }, { status: 500 })
    }

    // Step 3: Get plans for each membership
    let planesInfo: any[] = []
    if (membresias && membresias.length > 0) {
      const planIds = [...new Set(membresias.map((m: any) => m.plan_id).filter(Boolean))]
      if (planIds.length > 0) {
        const { data: planes, error: errPlanes } = await supabase
          .from('planes')
          .select('*')
          .in('id', planIds)
        
        if (errPlanes) {
          return NextResponse.json({ step: 'planes', error: errPlanes.message, clienteBasico, membresias }, { status: 500 })
        }
        planesInfo = planes || []
      }
    }

    // Step 4: Get pagos
    const { data: pagos, error: errPagos } = await supabase
      .from('pagos')
      .select('*')
      .eq('cliente_id', id)

    if (errPagos) {
      return NextResponse.json({ step: 'pagos', error: errPagos.message }, { status: 500 })
    }

    // Step 5: Get asistencia
    const { data: asistencia, error: errAsist } = await supabase
      .from('asistencia')
      .select('*')
      .eq('cliente_id', id)

    if (errAsist) {
      return NextResponse.json({ step: 'asistencia', error: errAsist.message }, { status: 500 })
    }

    // Step 6: Try the full joined query that might be failing
    let fullQueryResult = null
    let fullQueryError = null
    try {
      const { data, error } = await supabase
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
        .maybeSingle()

      fullQueryResult = data
      fullQueryError = error
    } catch (e: any) {
      fullQueryError = e.message
    }

    // Step 7: Try serialization
    let serializationOk = true
    let serializationError = null
    if (fullQueryResult) {
      try {
        JSON.parse(JSON.stringify(fullQueryResult))
      } catch (e: any) {
        serializationOk = false
        serializationError = e.message
      }
    }

    return NextResponse.json({
      clienteBasico,
      membresiasCount: membresias?.length || 0,
      membresias: membresias,
      planesInfo,
      pagosCount: pagos?.length || 0,
      asistenciaCount: asistencia?.length || 0,
      fullQueryError: fullQueryError ? (fullQueryError.message || fullQueryError) : null,
      fullQueryKeys: fullQueryResult ? Object.keys(fullQueryResult) : null,
      serializationOk,
      serializationError,
      fullQuerySample: fullQueryResult ? JSON.parse(JSON.stringify(fullQueryResult)) : null,
    })
  } catch (e: any) {
    return NextResponse.json({ criticalError: e.message, stack: e.stack }, { status: 500 })
  }
}

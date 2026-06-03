'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getColombiaDateString } from '@/lib/date-utils'
import { logger } from '@/lib/logger'

export async function registrarMedida(data: {
  cliente_id: string
  peso: number
  estatura: number
  porcentaje_grasa?: number
  masa_muscular?: number
  pecho?: number
  cintura?: number
  cadera?: number
  brazo_derecho?: number
  brazo_izquierdo?: number
  muslo_derecho?: number
  muslo_izquierdo?: number
  notas?: string
}) {
  const { supabase, activeGymId } = await requireAuth()

  // Normalizar estatura: Si es menor a 3, probablemente está en metros
  let estaturaReal = data.estatura
  if (estaturaReal > 0 && estaturaReal < 3) {
    estaturaReal = estaturaReal * 100
  }

  // Calcular IMC
  const estaturaMetros = estaturaReal / 100
  let imc = 0
  if (estaturaMetros > 0) {
    imc = data.peso / (estaturaMetros * estaturaMetros)
  }

  // Limitar IMC a un valor razonable para evitar numeric overflow en DB
  // La mayoría de las columnas numeric(4,1) o similares fallan con > 999.9
  const imcFinal = Math.min(Math.max(imc, 0), 999.9)

  const { error } = await supabase
    .from('medidas')
    .insert({
      ...data,
      gimnasio_id: activeGymId,
      estatura: estaturaReal, // Guardar la estatura normalizada en cm
      imc: parseFloat(imcFinal.toFixed(1)),
      fecha_medicion: getColombiaDateString()
    })

  if (error) {
    logger.error('Error registrando medida:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath(`/clientes/${data.cliente_id}`)
  return { success: true }
}

export async function actualizarNotasMedicas(cliente_id: string, notas: string, alergia?: string) {
  const { supabase } = await requireAuth()

  // Primero eliminar notas anteriores de tipo 'nota' y 'alergia' para este cliente
  // (O simplemente insertar nuevas si queremos historial, pero para simplificar ahora...)
  
  // Vamos a insertar una nota general
  const { error: errorNota } = await supabase
    .from('notas_medicas')
    .insert({
      cliente_id,
      tipo: 'nota',
      contenido: notas,
      prioridad: 'normal'
    })

  if (alergia) {
    await supabase
      .from('notas_medicas')
      .insert({
        cliente_id,
        tipo: 'alergia',
        contenido: alergia,
        prioridad: 'alta'
      })
  }

  if (errorNota) {
    logger.error('Error actualizando notas:', { error: errorNota })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath(`/clientes/${cliente_id}`)
  return { success: true }
}

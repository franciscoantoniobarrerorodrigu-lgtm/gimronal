'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

/**
 * Genera un serial aleatorio de 16 caracteres (formato XXXX-XXXX-XXXX-XXXX)
 */
function generateRandomSerial() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      // Use crypto for cryptographically secure random numbers
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const randomIndex = array[0] % chars.length;
      result += chars.charAt(randomIndex);
    }
    if (i < 3) result += '-';
  }
  return result;
}

/**
 * Crea un nuevo serial (Solo SaaS Admin)
 */
export async function createSerial(dias: number) {
  const { supabase, isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos de SaaS admin' }
  }

  const serial = generateRandomSerial()

  try {
    const { data, error } = await supabase
      .from('seriales')
      .insert({
        serial,
        dias,
        usado: false
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/saas')
    return { success: true, serial: data }
  } catch (error: any) {
    logger.error('Error creating serial:', { error })
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene todos los seriales (Solo SaaS Admin)
 */
export async function getSerials() {
  const { supabase, isSaaSAdmin } = await requireAuth()
  if (!isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos' }
  }

  try {
    const { data, error } = await supabase
      .from('seriales')
      .select('*, gimnasios:usado_por_gimnasio_id(nombre)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    logger.error('Error fetching serials:', { error })
    return { success: false, error: error.message }
  }
}

/**
 * Aplica un serial a un gimnasio
 */
export async function applySerial(serialCode: string) {
  const { activeGymId } = await requireAuth()
  if (!activeGymId) {
    return { success: false, error: 'No tienes un gimnasio asociado' }
  }

  const gymId = activeGymId
  const adminClient = createAdminClient()

  try {
    // 1. Buscar el serial
    const { data: serial, error: serialError } = await adminClient
      .from('seriales')
      .select('*')
      .eq('serial', serialCode.toUpperCase().trim())
      .eq('usado', false)
      .maybeSingle()

    if (serialError || !serial) {
      return { success: false, error: 'Serial inválido o ya utilizado' }
    }

    // 2. Obtener el gimnasio actual para saber su vencimiento
    const { data: gym, error: gymError } = await adminClient
      .from('gimnasios')
      .select('vencimiento_licencia')
      .eq('id', gymId)
      .single()

    if (gymError) throw gymError

    // 3. Calcular nueva fecha de vencimiento
    let baseDate = new Date()
    // Si la licencia actual aún no ha vencido, sumar a partir de esa fecha
    if (gym.vencimiento_licencia && new Date(gym.vencimiento_licencia) > new Date()) {
      baseDate = new Date(gym.vencimiento_licencia)
    }

    const newExpiry = new Date(baseDate)
    newExpiry.setDate(newExpiry.getDate() + serial.dias)

    // 4. Actualizar gimnasio y marcar serial como usado
    const { error: updateGymError } = await adminClient
      .from('gimnasios')
      .update({ vencimiento_licencia: newExpiry.toISOString() })
      .eq('id', gymId)

    if (updateGymError) throw updateGymError

    const { error: updateSerialError } = await adminClient
      .from('seriales')
      .update({
        usado: true,
        usado_por_gimnasio_id: gymId,
        usado_en: new Date().toISOString()
      })
      .eq('id', serial.id)

    if (updateSerialError) throw updateSerialError

    revalidatePath('/configuracion')
    revalidatePath('/', 'layout')
    
    return { success: true, newExpiry }
  } catch (error: any) {
    logger.error('Error applying serial:', { error })
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene la info de licencia del gimnasio actual
 */
export async function getMyGymLicense() {
  const { activeGymId } = await requireAuth()
  if (!activeGymId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('gimnasios')
    .select('nombre, vencimiento_licencia')
    .eq('id', activeGymId)
    .single()

  return data
}

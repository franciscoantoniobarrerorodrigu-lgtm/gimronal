import { logger } from '@/lib/logger'

const FACTUS_API_URL = process.env.FACTUS_API_URL || 'https://api-sandbox.factus.com.co'

export async function getFactusToken(): Promise<string | null> {
  try {
    const response = await fetch(`${FACTUS_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.FACTUS_CLIENT_ID || '',
        client_secret: process.env.FACTUS_CLIENT_SECRET || '',
        username: process.env.FACTUS_USERNAME || '',
        password: process.env.FACTUS_PASSWORD || '',
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      logger.error('Error al obtener token de Factus', { error: errorData })
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    logger.error('Excepción al obtener token de Factus', { error })
    return null
  }
}

export async function generarFacturaElectronica(payload: any) {
  const token = await getFactusToken()
  if (!token) return { success: false, error: 'No se pudo autenticar con Factus' }

  try {
    const response = await fetch(`${FACTUS_API_URL}/v2/bills/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    // Factus devuelve status HTTP 200 pero un cuerpo con status 'OK' o 'ERROR'
    if (!response.ok || (data.status && data.status !== 'OK' && data.status !== 'Created')) {
      logger.error('Error al validar factura en Factus', { request: payload, response: data })
      return { success: false, error: data.message || 'Error validando factura' }
    }

    return { 
      success: true, 
      factura: {
        id: data.data.bill.id,
        cufe: data.data.bill.cufe,
        url_pdf: data.data.bill.qr, // Puedes ajustar esto según cómo devuelve la URL del PDF real Factus
        status: data.status
      }
    }
  } catch (error) {
    logger.error('Excepción al generar factura en Factus', { error })
    return { success: false, error: 'Falló la conexión con el servidor de facturación' }
  }
}

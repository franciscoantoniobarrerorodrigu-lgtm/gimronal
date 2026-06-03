import { NextResponse } from 'next/server'
import { getClientSession } from '@/lib/supabase/actions/portal'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Inicializar Upstash Ratelimit (5 peticiones por día por usuario)
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN 
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN }) 
  : null

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 d'),
}) : null

export async function POST(req: Request) {
  try {
    const session = await getClientSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (ratelimit) {
      const { success, limit, reset, remaining } = await ratelimit.limit(`nutrition_ai_${session}`)
      if (!success) {
        return NextResponse.json(
          { error: 'Has alcanzado el límite diario de generación de planes (5/día). Intenta mañana.' },
          { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
        )
      }
    }

    const { nombre, edad, peso, altura, objetivo, restricciones } = await req.json()

    if (!nombre || !edad || !peso || !altura || !objetivo) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      console.error('Missing GROQ_API_KEY')
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 })
    }

    const prompt = `Eres un nutricionista experto. Crea una dieta semanal (lunes a domingo) organizada en desayuno, almuerzo y cena para:

- Nombre: ${nombre}
- Edad: ${edad} años
- Peso: ${peso} kg
- Altura: ${altura} cm
- Objetivo: ${objetivo}
- Restricciones: ${restricciones || 'Ninguna'}

Usa alimentos colombianos típicos y accesibles.
Formato: por día, con desayuno, almuerzo y cena.

INSTRUCCIÓN CRÍTICA: Responde ÚNICAMENTE en formato JSON válido. Tu respuesta debe poder ser analizada por JSON.parse() sin errores.
Usa exactamente esta estructura (y calcula aproximados para los macros y calorías):
{
  "calorias_diarias": 2000,
  "proteinas_g": 150,
  "carbohidratos_g": 200,
  "grasas_g": 60,
  "numero_comidas": 3,
  "horario_comidas": [
    { "hora": "07:00 AM", "alimentos": "Arepa con huevo..." },
    { "hora": "01:00 PM", "alimentos": "Bandeja paisa ligera..." },
    { "hora": "07:00 PM", "alimentos": "Pechuga a la plancha..." }
  ],
  "alimentos_recomendados": "Lista de alimentos recomendados separados por coma.",
  "alimentos_evitar": "Lista de alimentos a evitar separados por coma.",
  "observaciones": "Consejos adicionales y recomendaciones."
}

Solo responde con el objeto JSON, sin bloques de código markdown (\`\`\`json) ni texto adicional.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json({ error: 'Error al contactar con la IA' }, { status: 500 })
    }

    const data = await response.json()
    let content = data.choices[0].message.content

    // En caso de que el modelo haya devuelto código markdown de todas formas
    if (content.startsWith('```json')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim()
    } else if (content.startsWith('```')) {
      content = content.replace(/```/g, '').trim()
    }

    let dietPlan
    try {
      dietPlan = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parse error:', content)
      return NextResponse.json({ error: 'La respuesta de la IA no pudo ser procesada' }, { status: 500 })
    }

    return NextResponse.json({ plan: dietPlan })

  } catch (error) {
    console.error('AI Nutrition route error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

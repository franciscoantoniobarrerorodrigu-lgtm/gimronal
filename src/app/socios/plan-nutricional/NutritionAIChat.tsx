'use client'

import { useState, useRef, useEffect } from 'react'
import { Apple, Send, User, Bot, Loader2 } from 'lucide-react'
import { createAIPlanNutricional } from '@/lib/supabase/actions/portal'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type InitialData = {
  nombre: string | null
  edad: number | null
  peso: number | null
  altura: number | null
} | null

export default function NutritionAIChat({ initialData }: { initialData?: InitialData }) {
  
  // Calculate initial step and message based on available data
  let startingStep = 0
  let initialMsg = '¡Hola! Soy tu nutricionista virtual 🥗\n¿Cuál es tu nombre?'
  
  const initialUserData = {
    nombre: initialData?.nombre || '',
    edad: initialData?.edad?.toString() || '',
    peso_altura: '', 
    peso: initialData?.peso?.toString() || '',
    altura: initialData?.altura?.toString() || '',
    objetivo: '',
    restricciones: ''
  }

  if (initialData?.nombre) {
    startingStep = 1
    initialMsg = `¡Hola ${initialData.nombre}! Soy tu nutricionista virtual 🥗\n¿Cuántos años tienes?`
    if (initialData?.edad) {
      startingStep = 2
      initialMsg = `¡Hola ${initialData.nombre}! Veo que tienes ${initialData.edad} años.\n¿Cuánto pesas actualmente y cuál es tu altura en cm? (ej: 80kg, 175cm)`
      if (initialData?.peso && initialData?.altura) {
        startingStep = 3
        initialMsg = `¡Hola ${initialData.nombre}! Ya tengo tus medidas (Peso: ${initialData.peso}kg, Altura: ${initialData.altura}cm).\n¿Cuál es tu objetivo principal?`
      }
    }
  }

  const [hasStarted, setHasStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: initialMsg }
  ])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(startingStep)
  const [isTyping, setIsTyping] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Data recolectada
  const [userData, setUserData] = useState(initialUserData)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleNextStep = async (userInput: string) => {
    let nextMessage = ''
    let nextStep = step + 1
    const newUserData = { ...userData }

    if (step === 0) {
      newUserData.nombre = userInput
      nextMessage = `¿Cuántos años tienes, ${userInput}?`
    } else if (step === 1) {
      newUserData.edad = userInput
      nextMessage = `¿Cuánto pesas actualmente y cuál es tu altura en cm? (ej: 80kg, 175cm)`
    } else if (step === 2) {
      newUserData.peso_altura = userInput
      // Extraer números simples si es posible
      const nums = userInput.match(/\d+/g)
      if (nums && nums.length >= 2) {
        newUserData.peso = nums[0]
        newUserData.altura = nums[1]
      } else {
        newUserData.peso = userInput
        newUserData.altura = '170' // default fallback
      }
      nextMessage = `¿Cuál es tu objetivo principal?`
    } else if (step === 3) {
      newUserData.objetivo = userInput
      nextMessage = `¿Tienes alguna restricción alimentaria? (Ej. Vegetariano, Sin gluten, Ninguna)`
    } else if (step === 4) {
      newUserData.restricciones = userInput
      nextMessage = `¡Perfecto! Generando tu dieta personalizada con alimentos colombianos...`
      nextStep = 5
    }

    setUserData(newUserData)
    setStep(nextStep)

    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: nextMessage }])
      setIsTyping(false)

      if (nextStep === 5) {
        generateDiet(newUserData)
      }
    }, 800)
  }

  const generateDiet = async (data: typeof userData) => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          edad: data.edad,
          peso: data.peso || '70',
          altura: data.altura || '170',
          objetivo: data.objetivo,
          restricciones: data.restricciones
        })
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Error al generar la dieta')
      }

      // Guardar en Supabase
      const saveRes = await createAIPlanNutricional(json.plan)
      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Error al guardar el plan')
      }

      toast.success('¡Dieta generada y guardada con éxito!')
      router.refresh()

    } catch (error: any) {
      toast.error(error.message)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Hubo un error: ${error.message}. Por favor intenta de nuevo.` }])
      setStep(4) // Permitir reintentar
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping || isGenerating) return

    const userText = input.trim()
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userText }])
    setInput('')
    
    handleNextStep(userText)
  }

  const handleQuickReply = (text: string) => {
    if (isTyping || isGenerating) return
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    handleNextStep(text)
  }

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full bg-black/40 border border-white/10 rounded-[2rem] shadow-xl overflow-hidden min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
      
      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors"></div>
            <Bot className="w-12 h-12 text-primary relative z-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">Nutricionista IA</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Genera un plan alimenticio personalizado al instante con alimentos colombianos, basado en tus objetivos y medidas.
            </p>
          </div>
          <button
            onClick={() => setHasStarted(true)}
            className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          >
            Comenzar Evaluación
          </button>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-white font-black uppercase tracking-wider text-sm">Nutricionista IA</h2>
          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> En línea
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Apple className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-white/10 text-white rounded-tl-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && !isGenerating && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Apple className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <p className="text-sm text-primary font-bold">Analizando perfil y creando menú...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies (Objetivo) */}
      {step === 3 && !isTyping && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 justify-end">
          {['Bajar peso', 'Ganar músculo', 'Mantenerme'].map(btn => (
            <button
              key={btn}
              onClick={() => handleQuickReply(btn)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 py-2 rounded-full transition-colors"
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      {/* Quick Replies (Restricciones) */}
      {step === 4 && !isTyping && !isGenerating && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 justify-end">
          {['Ninguna', 'Vegetariano', 'Sin gluten'].map(btn => (
            <button
              key={btn}
              onClick={() => handleQuickReply(btn)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 py-2 rounded-full transition-colors"
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || isGenerating || step >= 5}
            placeholder={
              step >= 5 ? "Generando tu dieta..." : 
              "Escribe tu respuesta aquí..."
            }
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || isGenerating || step >= 5}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
      </>
      )}
    </div>
  )
}

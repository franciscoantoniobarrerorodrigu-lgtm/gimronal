'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Sparkles, Check } from "lucide-react"
import { updateClientAvatarTheme } from '@/lib/supabase/actions/portal'
import { showPremiumToast } from '@/lib/notifications'
import { motion } from 'framer-motion'

// Re-importing dialog parts since I need to be sure they exist or use a modal
import {
  Dialog as ShadDialog,
  DialogContent as ShadDialogContent,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
} from "@/components/ui/dialog"

const THEMES = [
  { id: 'default', name: 'Original', icon: '🟢', img: null },
  { id: 'dragonball', name: 'Dragon Ball', icon: '🐉', img: '/avatars/dragonball.png' },
  { id: 'angel', name: 'Ángel', icon: '😇', img: '/avatars/angel.png' },
  { id: 'devil', name: 'Diablo', icon: '😈', img: '/avatars/devil.png' },
  { id: 'futbol', name: 'Fútbol', icon: '⚽', img: '/avatars/futbol.png' },
  { id: 'pesas', name: 'Pesas', icon: '🏋️', img: '/avatars/pesas.png' },
  { id: 'nba', name: 'NBA', icon: '🏀', img: '/avatars/nba.png' },
  { id: 'beisbol', name: 'Béisbol', icon: '⚾', img: '/avatars/beisbol.png' },
  { id: 'naruto', name: 'Naruto', icon: '🍥', img: '/avatars/naruto.png' },
]

interface AvatarSelectorProps {
  currentTheme: string
}

export default function AvatarSelector({ currentTheme }: AvatarSelectorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSelect = async (themeId: string) => {
    setLoading(true)
    try {
      const result = await updateClientAvatarTheme(themeId)
      
      if (result.success) {
        showPremiumToast.success('Avatar Actualizado', 'Tu nueva imagen de perfil ha sido guardada.')
        router.refresh()
        setOpen(false)
      } else {
        showPremiumToast.error('Error de Guardado', result.error || 'No se pudo actualizar el avatar.')
      }
    } catch (err) {
      showPremiumToast.error('Fallo de Sistema', 'No se pudo actualizar tu avatar en este momento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ShadDialog open={open} onOpenChange={setOpen}>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline" 
        size="sm"
        className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2 rounded-2xl"
      >
        <Sparkles size={16} className="text-primary" />
        <span className="hidden sm:inline">Escoger Avatar</span>
      </Button>

      <ShadDialogContent className="sm:max-w-xl bg-zinc-950/95 border-white/10 backdrop-blur-2xl text-white">
        <ShadDialogHeader>
          <ShadDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
            Personaliza tu <span className="text-primary">Avatar</span>
          </ShadDialogTitle>
        </ShadDialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {THEMES.map((theme) => (
            <motion.div
              key={theme.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !loading && handleSelect(theme.id)}
              className={`
                relative cursor-pointer group rounded-3xl p-4 border transition-all duration-300
                ${currentTheme === theme.id 
                  ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,102,0,0.2)]' 
                  : 'bg-white/5 border-white/5 hover:border-white/20'
                }
              `}
            >
              <div className="aspect-square flex items-center justify-center mb-3">
                {theme.img ? (
                  <img src={theme.img} alt={theme.name} className="w-full h-full object-contain drop-shadow-lg" />
                ) : (
                  <div className="text-4xl">{theme.icon}</div>
                )}
              </div>
              
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                {theme.name}
              </p>

              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </ShadDialogContent>
    </ShadDialog>
  )
}

'use client'

import { useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Check, Lock, Sparkles, Camera, Upload, Loader2 } from "lucide-react"
import { updateClientAvatarTheme, uploadClientAvatar } from '@/lib/supabase/actions/portal'
import { showPremiumToast } from '@/lib/notifications'
import { motion } from 'framer-motion'

import {
  Dialog as ShadDialog,
  DialogContent as ShadDialogContent,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
} from "@/components/ui/dialog"

type UnlockRule =
  | { type: 'free' }
  | { type: 'attendance'; required: number }
  | { type: 'streak'; required: number }
  | { type: 'level'; required: number }

interface AvatarTheme {
  id: string
  name: string
  shortName: string
  icon: string
  img: string | null
  rule: UnlockRule
}

const THEMES: AvatarTheme[] = [
  { id: 'default', name: 'Original', shortName: 'Original', icon: 'OG', img: null, rule: { type: 'free' } },
  { id: 'pesas', name: 'Fuerza Pro', shortName: 'Fuerza', icon: 'KG', img: '/avatars/pesas.png', rule: { type: 'attendance', required: 7 } },
  { id: 'futbol', name: 'Cancha Fit', shortName: 'Cancha', icon: 'FC', img: '/avatars/futbol.png', rule: { type: 'attendance', required: 15 } },
  { id: 'nba', name: 'Aro Elite', shortName: 'Aro', icon: 'BK', img: '/avatars/nba.png', rule: { type: 'attendance', required: 15 } },
  { id: 'beisbol', name: 'Diamante Fit', shortName: 'Diamante', icon: 'BB', img: '/avatars/beisbol.png', rule: { type: 'attendance', required: 15 } },
  { id: 'angel', name: 'Aura Angel', shortName: 'Angel', icon: 'AR', img: '/avatars/angel.png', rule: { type: 'streak', required: 5 } },
  { id: 'devil', name: 'Modo Diablo', shortName: 'Diablo', icon: 'MD', img: '/avatars/devil.png', rule: { type: 'streak', required: 5 } },
  { id: 'dragonball', name: 'Energia Saiyan', shortName: 'Saiyan', icon: 'SP', img: '/avatars/dragonball.png', rule: { type: 'level', required: 10 } },
  { id: 'naruto', name: 'Ninja Fit', shortName: 'Ninja', icon: 'NF', img: '/avatars/naruto.png', rule: { type: 'level', required: 10 } },
]

interface AvatarSelectorProps {
  currentTheme: string
  nivel: number
  totalAsistencias: number
  streak: number
  fotoUrl?: string | null
  onFotoUploaded?: (newUrl: string) => void
  onThemeChanged?: (newTheme: string) => void
}

function getUnlockState(theme: AvatarTheme, stats: { nivel: number; totalAsistencias: number; streak: number }, currentTheme: string) {
  if (theme.id === currentTheme) {
    return { unlocked: true, progress: 100, hint: 'Seleccionado' }
  }

  if (theme.rule.type === 'free') {
    return { unlocked: true, progress: 100, hint: 'Disponible' }
  }

  if (theme.rule.type === 'attendance') {
    const current = stats.totalAsistencias
    const missing = Math.max(0, theme.rule.required - current)
    return {
      unlocked: current >= theme.rule.required,
      progress: Math.min(100, (current / theme.rule.required) * 100),
      hint: current >= theme.rule.required ? 'Desbloqueado' : `Faltan ${missing} asistencias`,
    }
  }

  if (theme.rule.type === 'streak') {
    const current = stats.streak
    return {
      unlocked: current >= theme.rule.required,
      progress: Math.min(100, (current / theme.rule.required) * 100),
      hint: current >= theme.rule.required ? 'Desbloqueado' : `Racha ${current}/${theme.rule.required}`,
    }
  }

  const current = stats.nivel
  const missing = Math.max(0, theme.rule.required - current)
  return {
    unlocked: current >= theme.rule.required,
    progress: Math.min(100, (current / theme.rule.required) * 100),
    hint: current >= theme.rule.required ? 'Desbloqueado' : `Faltan ${missing} niveles`,
  }
}

export default function AvatarSelector({ currentTheme, nivel, totalAsistencias, streak, fotoUrl, onFotoUploaded, onThemeChanged }: AvatarSelectorProps) {
  const [open, setOpen] = useState(false)
  const [loadingTheme, setLoadingTheme] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const stats = useMemo(() => ({ nivel, totalAsistencias, streak }), [nivel, totalAsistencias, streak])
  
  const allThemes = useMemo(() => {
    const custom: AvatarTheme = {
      id: 'custom',
      name: 'Mi Foto',
      shortName: fotoUrl ? 'Mi Foto' : 'Subir Foto',
      icon: '📸',
      img: fotoUrl || null,
      rule: { type: 'free' }
    }
    return [custom, ...THEMES]
  }, [fotoUrl])

  const activeTheme = allThemes.find((theme) => theme.id === currentTheme) || THEMES[0]

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showPremiumToast.error('Archivo muy grande', 'La imagen debe pesar menos de 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await uploadClientAvatar(formData)
      if (res.success) {
        showPremiumToast.success('Foto actualizada', 'Tu nueva foto ha sido guardada correctamente.')
        if (res.url && onFotoUploaded) {
          onFotoUploaded(res.url)
        } else {
          window.location.reload()
        }
      } else {
        showPremiumToast.error('Error', res.error || 'No se pudo subir la foto')
      }
    } catch {
      showPremiumToast.error('Fallo de sistema', 'Ocurrió un error inesperado al subir la foto')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleSelect = async (theme: AvatarTheme) => {
    if (theme.id === 'custom' && !fotoUrl) {
      fileInputRef.current?.click()
      return
    }

    const state = getUnlockState(theme, stats, currentTheme)
    if (!state.unlocked || loadingTheme) return

    setLoadingTheme(theme.id)
    try {
      const result = await updateClientAvatarTheme(theme.id)

      if (result.success) {
        showPremiumToast.success('Avatar actualizado', 'Tu nueva imagen de perfil ha sido guardada.')
        if (onThemeChanged) {
          onThemeChanged(theme.id)
        } else {
          window.location.reload()
        }
      } else {
        showPremiumToast.error('Error de guardado', result.error || 'No se pudo actualizar el avatar.')
      }
    } catch {
      showPremiumToast.error('Fallo de sistema', 'No se pudo actualizar tu avatar en este momento.')
    } finally {
      setLoadingTheme(null)
    }
  }

  return (
    <ShadDialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="size-9 rounded-xl border-white/10 bg-white/5 p-0 text-white hover:bg-white/10 sm:size-auto sm:gap-2 sm:rounded-2xl sm:px-2.5"
      >
        <Sparkles className="size-4 text-primary" />
        <span className="hidden sm:inline">Avatar</span>
      </Button>

      <ShadDialogContent className="max-h-[88dvh] overflow-y-auto border-white/10 bg-zinc-950/95 pb-6 text-white backdrop-blur-2xl sm:max-w-3xl">
        <ShadDialogHeader>
          <ShadDialogTitle className="text-2xl font-black italic tracking-tighter">
            Evoluciona tu <span className="text-primary">avatar</span>
          </ShadDialogTitle>
        </ShadDialogHeader>

        <div className="grid gap-4 py-4 lg:grid-cols-[210px_1fr]">
          <aside className="flex items-center gap-4 rounded-3xl border border-primary/20 bg-primary/10 p-4 lg:block">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 lg:mt-4 lg:h-40 lg:w-full lg:rounded-3xl">
              {activeTheme.img ? (
                <Image
                  src={activeTheme.img}
                  alt={activeTheme.name}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover drop-shadow-xl rounded-xl lg:rounded-2xl"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-black text-primary lg:h-20 lg:w-20 lg:rounded-3xl">
                  {activeTheme.icon}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80 lg:mt-4">Actual</p>
              <h3 className="mt-2 truncate text-lg font-black text-white">{activeTheme.name}</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-400">
                Nivel {nivel} · {totalAsistencias} asistencias · racha {streak}
              </p>
            </div>
          </aside>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Inputs ocultos para subida */}
            <input id="upload-gallery" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <input id="upload-camera" type="file" accept="image/*" capture="user" className="hidden" onChange={handleUpload} />

            {allThemes.map((theme) => {
              const state = getUnlockState(theme, stats, currentTheme)
              const selected = currentTheme === theme.id

              return (
                <motion.div
                  key={theme.id}
                  whileHover={state.unlocked ? { scale: 1.03 } : undefined}
                  whileTap={state.unlocked ? { scale: 0.97 } : undefined}
                  className={`group relative flex min-h-36 flex-col overflow-hidden rounded-2xl border transition-all duration-300 sm:min-h-40 ${
                    selected
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,102,0,0.18)]'
                      : state.unlocked
                        ? 'border-white/10 bg-white/[0.04] hover:border-primary/30 hover:bg-primary/10'
                        : 'border-white/5 bg-white/[0.02] opacity-70'
                  }`}
                >
                  <div
                    onClick={() => {
                      if (theme.id === 'custom' && !fotoUrl) return // Obliga a usar los botones abajo
                      handleSelect(theme)
                    }}
                    className={`flex flex-col text-left p-2.5 sm:p-3 w-full h-full relative ${(!state.unlocked || loadingTheme !== null) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-black/30 p-2 sm:h-24 sm:rounded-2xl relative">
                      {theme.img ? (
                        <Image
                          src={theme.img}
                          alt={theme.name}
                          width={120}
                          height={120}
                          className={`h-full w-full object-cover rounded-lg sm:rounded-xl transition-all ${state.unlocked ? '' : 'grayscale'} ${theme.id !== 'custom' && 'object-contain'}`}
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-black text-primary">
                          {theme.icon}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 min-w-0 flex-1">
                      <p className="truncate text-xs font-black uppercase text-white">{theme.id === 'custom' && !fotoUrl ? 'Añadir' : theme.shortName}</p>
                      <p className={`mt-1 truncate text-[10px] font-bold ${state.unlocked ? 'text-primary/80' : 'text-zinc-500'}`}>
                        {state.hint}
                      </p>
                    </div>

                    {/* Acciones de Mi Foto (Cámara y Galería) */}
                    {theme.id === 'custom' && (
                      <div className="mt-2 flex w-full gap-1.5 z-20">
                        <label 
                          htmlFor="upload-gallery" 
                          className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 cursor-pointer transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Upload size={14} className="text-zinc-300" />
                        </label>
                        <label 
                          htmlFor="upload-camera" 
                          className="flex-1 flex items-center justify-center bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg py-2 cursor-pointer transition-colors shadow-[0_0_10px_rgba(255,102,0,0.1)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Camera size={14} className="text-primary" />
                        </label>
                      </div>
                    )}

                    {!state.unlocked && (
                      <div className="mt-auto h-1.5 overflow-hidden rounded-full bg-white/5 w-full">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${state.progress}%` }} />
                      </div>
                    )}
                  </div>

                  {theme.id === 'custom' && uploading && (
                    <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">Subiendo...</span>
                    </div>
                  )}

                  {selected && (
                    <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-black shadow-lg pointer-events-none">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}

                  {!state.unlocked && (
                    <div className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/60 p-1.5 text-zinc-400 pointer-events-none">
                      <Lock size={12} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </ShadDialogContent>
    </ShadDialog>
  )
}


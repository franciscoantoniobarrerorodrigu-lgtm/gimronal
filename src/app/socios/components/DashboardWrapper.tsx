'use client'

import { useState, createContext, useContext } from 'react'
import DashboardHero from './DashboardHero'
import AvatarSelector from '../AvatarSelector'

// Shared context so AvatarSelectorButton and DashboardHeroLive share the same state
interface AvatarCtx {
  fotoUrl: string | null
  theme: string
  setFotoUrl: (url: string) => void
  setTheme: (t: string) => void
  nivel: number
  totalAsistencias: number
  streak: number
}

const AvatarContext = createContext<AvatarCtx | null>(null)

interface DashboardWrapperProps {
  firstName: string
  mensajeMotivacional: string
  streak: number
  gamificacion: {
    nivel: number
    faltan: number
    progreso: number
    liga: { bg: string; color: string; border: string; icon: string; nombre: string }
  }
  membresia: unknown
  genero: string | null
  avatarTheme: string
  fotoUrl?: string | null
  nivel: number
  totalAsistencias: number
}

export default function DashboardWrapper({
  firstName,
  mensajeMotivacional,
  streak,
  gamificacion,
  membresia,
  genero,
  avatarTheme,
  fotoUrl,
  nivel,
  totalAsistencias,
}: DashboardWrapperProps) {
  const [currentFotoUrl, setCurrentFotoUrl] = useState<string | null>(fotoUrl ?? null)
  const [currentTheme, setCurrentTheme] = useState<string>(avatarTheme)

  return (
    <AvatarContext.Provider
      value={{
        fotoUrl: currentFotoUrl,
        theme: currentTheme,
        setFotoUrl: setCurrentFotoUrl,
        setTheme: setCurrentTheme,
        nivel,
        totalAsistencias,
        streak,
      }}
    >
      {/* Avatar Button for the header */}
      <AvatarSelector
        currentTheme={currentTheme}
        nivel={nivel}
        totalAsistencias={totalAsistencias}
        streak={streak}
        fotoUrl={currentFotoUrl}
        onFotoUploaded={(url) => setCurrentFotoUrl(url)}
        onThemeChanged={(t) => setCurrentTheme(t)}
      />

      {/* Hero that reacts to state changes instantly */}
      <DashboardHero
        firstName={firstName}
        mensajeMotivacional={mensajeMotivacional}
        streak={streak}
        gamificacion={gamificacion}
        membresia={membresia}
        genero={genero}
        avatarTheme={currentTheme}
        fotoUrl={currentFotoUrl}
      />
    </AvatarContext.Provider>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Palette, Sun, Moon, Check, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { useTheme } from 'next-themes'

const themes = [
  { name: 'Modo Oscuro (Recomendado)', value: 'dark', icon: Moon },
  { name: 'Modo Claro', value: 'light', icon: Sun },
]

const accentColors = [
  { name: 'Naranja (Original)', color: '#ff5a00', hsl: '21 100% 50%', class: 'bg-[#ff5a00]' },
  { name: 'Azul', color: '#1e3a8a', hsl: '224 76% 33%', class: 'bg-blue-800' },
  { name: 'Violeta', color: '#7c3aed', hsl: '263 70% 58%', class: 'bg-violet-600' },
  { name: 'Esmeralda', color: '#059669', hsl: '160 84% 31%', class: 'bg-emerald-600' },
  { name: 'Rosa', color: '#e11d48', hsl: '347 77% 50%', class: 'bg-rose-600' },
  { name: 'Cian', color: '#0891b2', hsl: '192 91% 37%', class: 'bg-cyan-600' },
]

export default function AparienciaPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#ff5a00')

  useEffect(() => {
    setMounted(true)
    const savedColor = localStorage.getItem('gymcontrol-accent') || '#ff5a00'
    setSelectedColor(savedColor)
    // Apply saved accent on mount
    applyAccentColor(savedColor)
  }, [])

  const applyAccentColor = useCallback((colorValue: string) => {
    const root = document.documentElement
    const accent = accentColors.find(c => c.color === colorValue)
    if (accent) {
      root.style.setProperty('--primary', accent.hsl)
    }
  }, [])

  function handleColorSelect(colorValue: string) {
    setSelectedColor(colorValue)
    // Apply instantly — no need to press "Save"
    applyAccentColor(colorValue)
    localStorage.setItem('gymcontrol-accent', colorValue)
  }

  function savePreferences() {
    localStorage.setItem('gymcontrol-accent', selectedColor)
    toast.success('¡Preferencias guardadas correctamente!')
  }

  if (!mounted) return null

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-muted-foreground mt-1">Personaliza el aspecto visual del sistema.</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" aria-hidden="true" />
              Tema
            </CardTitle>
            <CardDescription>Selecciona el modo de visualización.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-left",
                    theme === t.value
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <t.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span className="font-bold">{t.name}</span>
                    {theme === t.value && (
                      <Check className="w-4 h-4 text-primary ml-auto" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.value === 'dark' 
                      ? 'Fondo oscuro, ideal para uso prolongado.' 
                      : 'Fondo claro, máxima legibilidad.'}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Color de Acento</CardTitle>
            <CardDescription>
              Color principal utilizado en botones y elementos interactivos.
              <span className="block text-primary font-medium mt-1">Los cambios se aplican en tiempo real.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {accentColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => handleColorSelect(c.color)}
                  className="flex flex-col items-center gap-2 group"
                  aria-label={`Seleccionar color ${c.name}`}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full transition-all",
                      c.class,
                      selectedColor === c.color 
                        ? "ring-4 ring-offset-2 ring-offset-background ring-primary scale-110" 
                        : "group-hover:scale-105"
                    )}
                  />
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={savePreferences}>
          <Save className="w-4 h-4 mr-2" />
          Guardar Preferencias
        </Button>
      </div>
    </AdminLayout>
  )
}

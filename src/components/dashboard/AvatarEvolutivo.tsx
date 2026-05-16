'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Flame, Star, Trophy, Circle, ScanLine, Swords, ShieldCheck, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarEvolutivoProps {
  nivel: number
  genero?: string | null
  avatarTheme?: string
  className?: string
}

const THEME_IMAGES: Record<string, string | null> = {
  dragonball: '/avatars/dragonball.png',
  angel: '/avatars/angel.png',
  devil: '/avatars/devil.png',
  futbol: '/avatars/futbol.png',
  pesas: '/avatars/pesas.png',
  nba: '/avatars/nba.png',
  beisbol: '/avatars/beisbol.png',
  naruto: '/avatars/naruto.png',
}

// Stage 1: El Pequeño Brote (Cute Slime/Blob)
const Stage1SVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
    <ellipse cx="50" cy="85" rx="20" ry="4" fill="rgba(0,0,0,0.2)" />
    <motion.path
      d="M30,70 Q50,40 70,70 Q80,85 50,85 Q20,85 30,70"
      fill={color}
      stroke="#1a1a1a"
      strokeWidth="2.5"
      animate={{ scaleY: [1, 1.05, 1], y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <circle cx="43" cy="68" r="2.5" fill="#1a1a1a" />
    <circle cx="57" cy="68" r="2.5" fill="#1a1a1a" />
    {/* Pequeña pesa de piedra */}
    <rect x="35" y="75" width="30" height="2" rx="1" fill="#4a5568" />
    <circle cx="35" cy="76" r="4" fill="#4a5568" />
    <circle cx="65" cy="76" r="4" fill="#4a5568" />
  </svg>
)

// Stage 2: El Guerrero Joven (Bipedal Creature)
const Stage2SVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
    <ellipse cx="50" cy="90" rx="25" ry="5" fill="rgba(0,0,0,0.2)" />
    {/* Cuerpo */}
    <motion.path
      d="M40,85 L35,50 Q50,30 65,50 L60,85 Z"
      fill={color}
      stroke="#1a1a1a"
      strokeWidth="2.5"
    />
    {/* Brazos con Mancuernas */}
    <motion.path d="M35,55 L20,45" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" animate={{ rotate: [0, -20, 0] }} />
    <motion.path d="M65,55 L80,45" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" animate={{ rotate: [0, 20, 0] }} />
    {/* Cabeza */}
    <circle cx="50" cy="40" r="15" fill={color} stroke="#1a1a1a" strokeWidth="2.5" />
    <rect x="44" y="38" width="3" height="6" rx="1.5" fill="#1a1a1a" />
    <rect x="53" y="38" width="3" height="6" rx="1.5" fill="#1a1a1a" />
    {/* Cuernos */}
    <path d="M40,30 L30,15 L45,28 Z" fill={color} stroke="#1a1a1a" strokeWidth="2" />
    <path d="M60,30 L70,15 L55,28 Z" fill={color} stroke="#1a1a1a" strokeWidth="2" />
  </svg>
)

// Stage 3: El Titán de Acero (Muscular Warrior)
const Stage3SVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
    <ellipse cx="50" cy="92" rx="30" ry="6" fill="rgba(0,0,0,0.3)" />
    {/* Torso Musculoso */}
    <path d="M30,85 L20,40 Q50,20 80,40 L70,85 Z" fill={color} stroke="#1a1a1a" strokeWidth="3" />
    <path d="M40,40 Q50,45 60,40" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
    {/* Brazos Gigantes con Barra */}
    <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
      <path d="M20,45 L5,30" stroke="#1a1a1a" strokeWidth="10" strokeLinecap="round" />
      <path d="M80,45 L95,30" stroke="#1a1a1a" strokeWidth="10" strokeLinecap="round" />
      <rect x="0" y="25" width="100" height="4" rx="2" fill="#2d3748" />
      <rect x="5" y="15" width="10" height="25" rx="2" fill="#1a202c" />
      <rect x="85" y="15" width="10" height="25" rx="2" fill="#1a202c" />
    </motion.g>
    {/* Cabeza con Casco */}
    <circle cx="50" cy="30" r="18" fill={color} stroke="#1a1a1a" strokeWidth="3" />
    <path d="M35,25 Q50,5 65,25" fill="none" stroke="#eab308" strokeWidth="4" />
    <path d="M42,28 L45,35 L55,35 L58,28 Z" fill="#1a1a1a" />
  </svg>
)

// Stage 4: El Dios del Olimpo (Legendary Deity)
const Stage4SVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    {/* Alas de Energía */}
    <motion.path
      d="M50,40 Q10,0 5,60 Q20,50 50,60"
      fill="rgba(251,191,36,0.3)"
      animate={{ rotate: [-5, 5, -5] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.path
      d="M50,40 Q90,0 95,60 Q80,50 50,60"
      fill="rgba(251,191,36,0.3)"
      animate={{ rotate: [5, -5, 5] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    {/* Cuerpo Divino */}
    <path d="M35,90 L25,40 Q50,15 75,40 L65,90 Z" fill="url(#goldGrad)" stroke="#1a1a1a" strokeWidth="2" />
    {/* Aura de Poder Circular */}
    <motion.circle
      cx="50" cy="50" r="45"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="0.5"
      strokeDasharray="10 5"
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    />
    {/* Cabeza Suprema */}
    <circle cx="50" cy="30" r="20" fill="url(#goldGrad)" stroke="#1a1a1a" strokeWidth="2" />
    <motion.path
      d="M40,15 L50,0 L60,15 Z"
      fill="#fbbf24"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    {/* Ojos Brillantes */}
    <circle cx="43" cy="30" r="3" fill="white shadow-lg" />
    <circle cx="57" cy="30" r="3" fill="white shadow-lg" />
  </svg>
)

const AvatarEvolutivo: React.FC<AvatarEvolutivoProps> = ({ nivel, genero = 'masculino', avatarTheme = 'default', className }) => {
  // Niveles para evolución HARDCORE (7 Etapas)
  let stage = 1
  if (nivel >= 121) stage = 7      // MODO DIOS
  else if (nivel >= 81) stage = 6  // LEYENDA
  else if (nivel >= 51) stage = 5  // MAESTRO
  else if (nivel >= 31) stage = 4  // ELITE
  else if (nivel >= 16) stage = 3  // GUERRERO
  else if (nivel >= 6) stage = 2   // APRENDIZ
  else stage = 1                   // INICIADO (B&W)

  let stageName = 'ATLETA NOVATO'
  let pokedex = 'LVL. 1-11'
  let type = ['PRINCIPIANTE', 'ADAPTACIÓN']
  let message = '¡Acabas de empezar tu camino!'
  let auraColor = 'from-emerald-500/10 to-transparent'
  let monsterColor = '#10b981'
  let cardBorder = 'border-emerald-500/20'

  if (stage === 7) {
    stageName = 'MODO OLYMPIA'
    pokedex = 'MAX LEVEL'
    type = ['MR. OLYMPIA', 'LEYENDA']
    message = '¡Has alcanzado la perfección absoluta!'
    auraColor = 'from-yellow-400/60 via-orange-500/40 to-transparent'
    monsterColor = '#fbbf24'
    cardBorder = 'border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]'
  } else if (stage === 6) {
    stageName = 'LEYENDA DEL FITNESS'
    pokedex = 'LVL. 60-120'
    type = ['MUTANTE', 'ÉLITE']
    message = '¡Eres una inspiración en la sala!'
    auraColor = 'from-red-600/40 to-transparent'
    monsterColor = '#dc2626'
    cardBorder = 'border-red-600'
  } else if (stage === 5) {
    stageName = 'TITÁN DEL GYM'
    pokedex = 'LVL. 48-59'
    type = ['HIPERTROFIA', 'FUERZA']
    message = '¡Levantas pesos que otros ni imaginan!'
    auraColor = 'from-purple-600/30 to-transparent'
    monsterColor = '#9333ea'
    cardBorder = 'border-purple-600'
  } else if (stage === 4) {
    stageName = 'MÁQUINA DE ENTRENAR'
    pokedex = 'LVL. 36-47'
    type = ['POTENCIA', 'RESISTENCIA']
    message = '¡La sala se detiene cuando entrenas!'
    auraColor = 'from-orange-500/25 to-transparent'
    monsterColor = '#f97316'
    cardBorder = 'border-orange-500'
  } else if (stage === 3) {
    stageName = 'GUERRERO DE HIERRO'
    pokedex = 'LVL. 24-35'
    type = ['CONSTANCIA', 'BÁSICO']
    message = '¡El metal ya no te asusta!'
    auraColor = 'from-blue-500/20 to-transparent'
    monsterColor = '#3b82f6'
    cardBorder = 'border-blue-500'
  } else if (stage === 2) {
    stageName = 'GYM RAT'
    pokedex = 'LVL. 12-23'
    type = ['HÁBITO', 'MOTIVACIÓN']
    message = '¡Estás creando un hábito poderoso!'
    auraColor = 'from-cyan-500/15 to-transparent'
    monsterColor = '#06b6d4'
    cardBorder = 'border-cyan-500'
  }

  return (
    <div className={`relative flex flex-col items-center justify-center pt-0 pb-4 ${className}`}>
      {/* Sistema de Fondo Dinámico */}
      <div className="absolute inset-0 flex items-center justify-center -translate-y-16">
        <div className={`w-[400px] h-[400px] rounded-full bg-gradient-radial ${auraColor} blur-[100px] opacity-70`} />
        
        {/* Anillos de Datos Pokedex */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-80 h-80 border-[0.5px] border-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-[340px] h-[340px] border-[0.5px] border-white/5 rounded-full border-dashed"
        />
      </div>

      {/* Avatar Principal: Renderizado de Stage */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 1.2, rotateY: -180 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-full h-full"
          >
            {avatarTheme && avatarTheme !== 'default' && THEME_IMAGES[avatarTheme] ? (
              <div className={cn(
                "w-full h-full p-4 flex items-center justify-center relative transition-all duration-1000",
                stage === 7 && "scale-125 drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]",
                stage === 6 && "scale-115 drop-shadow-[0_0_35px_rgba(220,38,38,0.6)]",
                stage === 5 && "scale-110",
                stage === 1 && "opacity-90"
              )}>
                {/* Aura Dinámica según Stage */}
                {(stage >= 3) && (
                  <motion.div
                    animate={{ 
                      scale: stage >= 6 ? [1, 1.3, 1] : [1, 1.1, 1],
                      opacity: stage >= 6 ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2],
                      rotate: stage === 7 ? 360 : 0
                    }}
                    transition={{ duration: stage >= 6 ? 1.5 : 3, repeat: Infinity, ease: "linear" }}
                    className={cn(
                      "absolute inset-0 rounded-full blur-3xl -z-10",
                      stage === 7 && "bg-gradient-conic from-yellow-400 via-orange-500 to-yellow-400 opacity-60",
                      stage === 6 && "bg-red-600/40",
                      stage === 5 && "bg-purple-600/30",
                      stage === 4 && "bg-orange-500/20",
                      stage === 3 && "bg-blue-500/15"
                    )}
                  />
                )}
                
                <motion.img 
                  animate={stage >= 6 ? { 
                    y: [-3, 3, -3],
                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                  } : stage >= 4 ? {
                    y: [-1, 1, -1]
                  } : {}}
                  transition={{ duration: stage === 7 ? 1 : 2, repeat: Infinity }}
                  src={THEME_IMAGES[avatarTheme]!} 
                  alt={avatarTheme} 
                  className={cn(
                    "w-full h-full object-contain transition-all duration-1000",
                    stage >= 6 ? "drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]" : "drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]",
                    stage === 1 && "opacity-90"
                  )}
                />
              </div>
            ) : (
              <>
                {stage === 1 && <Stage1SVG color={monsterColor} />}
                {stage === 2 && <Stage2SVG color={monsterColor} />}
                {stage === 3 && <Stage3SVG color={monsterColor} />}
                {stage === 4 && <Stage4SVG color={monsterColor} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Efectos de Partículas Ambientales */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 200, opacity: 0, x: (i - 3.5) * 40 }}
              animate={{ y: -200, opacity: [0, 0.5, 0] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.5 }}
              className="absolute bottom-0 left-1/2 w-1 h-1 bg-white/40 rounded-full blur-[1px]"
            />
          ))}
        </div>
      </motion.div>

      {/* Pokedex HUD Premium */}
      <div className="relative z-20 w-full max-w-[320px] px-4">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`bg-zinc-950/80 backdrop-blur-2xl border ${cardBorder} p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden`}
        >
          {/* Leds Superiores */}
          <div className="flex gap-2 mb-4">
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
            <div className="w-2 h-2 rounded-full bg-blue-500/30" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
          </div>

          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold tracking-[0.3em] text-primary/60 block">{pokedex}</span>
            <h3 className={`text-2xl md:text-3xl font-black italic tracking-tighter leading-none ${
              stage === 4 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'text-white'
            }`}>
              {stageName}
            </h3>
          </div>

          {/* Badges de Tipo */}
          <div className="flex justify-center gap-2 mt-5">
            {type.map((t, i) => (
              <span key={i} className="px-4 py-1 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-zinc-400 flex items-center gap-1.5 uppercase">
                {i === 0 ? <Swords size={10} /> : <ShieldCheck size={10} />}
                {t}
              </span>
            ))}
          </div>

          {/* Descripción de Datos */}
          <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/5">
            <p className="text-[11px] text-zinc-500 font-medium italic text-center leading-relaxed">
              "{message}"
            </p>
          </div>

          {/* Icono de Escaneo Inferior */}
          <div className="absolute -bottom-2 -right-2 opacity-10">
            <ScanLine size={60} />
          </div>
        </motion.div>
      </div>

      {/* Botón Central de Poder */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        className="mt-8 w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center bg-zinc-900/50 relative group cursor-pointer shadow-2xl"
      >
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        <Trophy size={20} className="text-zinc-500 group-hover:text-primary transition-colors" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-primary/20 rounded-full border-dashed"
        />
      </motion.div>
    </div>
  )
}

export default AvatarEvolutivo

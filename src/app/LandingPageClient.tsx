'use client'

import React from 'react'
import Link from 'next/link'
import { Dumbbell, Users, Settings, ArrowRight, Shield, Zap, Target } from 'lucide-react'

export default function LandingPageClient() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

      <div className="max-w-5xl w-full relative z-10 text-center space-y-16 animate-in fade-in zoom-in duration-1000">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-bounce-slow border border-white/20">
              <Dumbbell className="text-white w-12 h-12" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic">
              Gym<span className="text-primary">Control</span>
            </h1>
            <div className="h-1.5 w-32 bg-primary mx-auto rounded-full" />
          </div>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Gestión inteligente y pre-configurada. <br />
            <span className="text-zinc-500 text-lg">Donde el rendimiento se une con la simplicidad.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
          {/* Client Portal Option */}
          <Link 
            href="/login?tab=socio"
            className="group relative p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.03] hover:bg-white/[0.08] hover:border-primary/50 text-left shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-all duration-500 group-hover:rotate-12">
              <Users className="text-primary w-9 h-9" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight italic uppercase">Soy Socio</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed font-medium">
              Accede a tu historial y verifica tu membresía.
            </p>
            <div className="flex items-center text-primary font-black uppercase tracking-widest text-sm">
              Entrar <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Admin Option */}
          <Link 
            href="/login?tab=admin"
            className="group relative p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.03] hover:bg-white/[0.08] hover:border-zinc-500/50 text-left shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-zinc-500/20 transition-colors" />
            <div className="w-16 h-16 bg-zinc-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-500/20 transition-all duration-500 group-hover:rotate-12">
              <Settings className="text-zinc-300 w-9 h-9" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight italic uppercase">Administración</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed font-medium">
              Gestión total pre-configurada para dueños y superadmins.
            </p>
            <div className="flex items-center text-zinc-300 font-black uppercase tracking-widest text-sm">
              Entrar <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-white/5">
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-6 h-6 text-zinc-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seguro</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Zap className="w-6 h-6 text-zinc-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rápido</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Target className="w-6 h-6 text-zinc-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preciso</span>
          </div>
        </div>

        <footer className="pt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
            GymControl &copy; {new Date().getFullYear()} - High Performance SaaS
          </p>
        </footer>
      </div>
    </div>
  )
}

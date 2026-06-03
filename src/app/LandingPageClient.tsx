'use client'

import React from 'react'
import Link from 'next/link'
import { Dumbbell, Users, Settings, ArrowRight, Shield, Zap, Target, BarChart3, CreditCard, QrCode, Smartphone, Globe, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
}

const easeOut = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } }
}

const features = [
  { icon: Users, title: 'Gestión de Socios', desc: 'Control total de membresías, pagos y asistencia.' },
  { icon: BarChart3, title: 'Reportes en Tiempo Real', desc: 'Dashboard inteligente con métricas clave de tu negocio.' },
  { icon: QrCode, title: 'QR Inteligente', desc: 'Acceso rápido con código QR para tus socios.' },
  { icon: CreditCard, title: 'Caja y Pagos', desc: 'Registra ingresos, egresos y mantén tu caja al día.' },
  { icon: Smartphone, title: 'Portal del Socio', desc: 'App web para que los socios gestionen su membresía.' },
  { icon: Globe, title: 'Multi-Sede', desc: 'Administra múltiples gimnasios desde un solo panel.' },
]

const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Soporte' },
  { value: '3s', label: 'Setup inicial' },
]

export default function LandingPageClient() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans"
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[45%] h-[45%] bg-primary/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[40%] h-[40%] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[20%] w-[20%] h-[20%] bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Nav */}
      <motion.header variants={fadeUp} className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Dumbbell className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="font-heading text-xl font-black tracking-tight text-foreground">
            Gym<span className="text-primary">Control</span>
          </span>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <motion.div variants={stagger} className="max-w-5xl mx-auto w-full text-center space-y-12">
          {/* Logo icon */}
          <motion.div variants={scaleIn} className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-[1.75rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,90,0,0.3)] border border-white/20">
                <Dumbbell className="text-white w-10 h-10" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h1 className="text-3xl min-[400px]:text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground uppercase leading-[0.85] text-center w-full">
              Gym<span className="text-primary">Control</span>
            </h1>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              La plataforma todo en uno para la gestión inteligente de tu gimnasio.
              <br />
              <span className="text-muted-foreground/60 text-sm sm:text-base">Preconfigurada, lista para usar.</span>
            </p>
          </motion.div>

          {/* CTA Cards */}
          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link href="/login?tab=socio" className="group relative p-8 bg-card/40 backdrop-blur-xl border border-border rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-card/60 hover:border-primary/30 text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl -mr-20 -mt-20 group-hover:bg-primary/15 transition-colors" />
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <Users className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-black text-foreground mb-2 tracking-tight uppercase">Soy Socio</h2>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                Accede a tu historial, renovaciones y más.
              </p>
              <div className="flex items-center text-primary font-bold uppercase tracking-widest text-xs gap-1">
                Entrar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/login?tab=admin" className="group relative p-8 bg-card/40 backdrop-blur-xl border border-border rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-card/60 hover:border-primary/30 text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl -mr-20 -mt-20 group-hover:bg-primary/15 transition-colors" />
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <Settings className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-black text-foreground mb-2 tracking-tight uppercase">Administración</h2>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                Gestión total para dueños y staff.
              </p>
              <div className="flex items-center text-primary font-bold uppercase tracking-widest text-xs gap-1">
                Entrar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="flex justify-center gap-8 md:gap-16 pt-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-heading font-black text-foreground">{s.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="relative z-10 px-6 pb-24"
      >
        <div className="max-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-foreground tracking-tight uppercase">
              Todo lo que necesitas
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Un ecosistema completo para administrar tu gimnasio desde un solo lugar.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="group p-6 bg-card/30 backdrop-blur-sm border border-border rounded-xl hover:bg-card/50 hover:border-primary/20 transition-all duration-300">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="text-primary w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Value Props Bar */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
        className="relative z-10 border-t border-border py-10 px-6"
      >
        <div className="max-w-2xl mx-auto flex justify-center gap-8 md:gap-16">
          {[
            { icon: Shield, label: 'Seguro' },
            { icon: Zap, label: 'Rápido' },
            { icon: Target, label: 'Preciso' },
          ].map((v) => (
            <motion.div key={v.label} variants={fadeUp} className="flex flex-col items-center gap-2">
              <v.icon className="w-6 h-6 text-primary" />
              <span className="text-[11px] font-heading font-bold uppercase tracking-widest text-muted-foreground">{v.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
        className="relative z-10 border-t border-border py-8 px-6"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <p className="text-[10px] font-heading font-bold uppercase tracking-[0.3em] text-muted-foreground/40 text-center leading-relaxed">
            GymControl v1.0.0 &copy; {new Date().getFullYear()} — High Performance SaaS <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            Diseñado por Ing. BarnafOS
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login?tab=saas" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors">
              SaaS Master
            </Link>
            <span className="text-muted-foreground/20">•</span>
            <Link href="/politica-de-privacidad" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors">
              Privacidad
            </Link>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  )
}

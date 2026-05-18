import { toast } from 'sonner';
import React from 'react';
import { Dumbbell, ShieldAlert, Fingerprint, Sparkles } from 'lucide-react';

/**
 * Animated Gym Icon for Notifications
 */
const AnimatedGymIcon = ({ className = "text-emerald-400", bg = "bg-emerald-500/20" }) => (
  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${bg} border border-white/10 shrink-0 overflow-hidden shadow-lg`}>
    <Dumbbell className={`w-4 h-4 ${className} animate-lift`} />
  </div>
);

/**
 * Premium notification system for GymControl
 * Provides high-quality, consistent toasts with animated gym icons and modern aesthetics.
 */
export const showPremiumToast = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      icon: React.createElement(AnimatedGymIcon, { className: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]", bg: "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]" }),
      duration: 4000,
    });
  },
  
  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      icon: React.createElement(AnimatedGymIcon, { className: "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]", bg: "bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(225,29,72,0.3)]" }),
      duration: 5000,
    });
  },
  
  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: React.createElement(AnimatedGymIcon, { className: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]", bg: "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]" }),
    });
  },
  
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: React.createElement(AnimatedGymIcon, { className: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]", bg: "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(217,119,6,0.3)]" }),
    });
  },
  
  auth: (title: string, description?: string) => {
    toast(title, {
      description,
      icon: React.createElement(Fingerprint, { className: "w-5 h-5 text-primary" }),
    });
  },

  admin: (title: string, description?: string) => {
    toast(title, {
      description,
      icon: React.createElement(ShieldAlert, { className: "w-5 h-5 text-orange-500" }),
    });
  },

  premium: (title: string, description?: string) => {
    toast(title, {
      description,
      icon: React.createElement(Sparkles, { className: "w-5 h-5 text-purple-400" }),
      style: {
        background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(9, 9, 11, 0.8))',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }
    });
  }
};

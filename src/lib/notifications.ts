import { toast } from 'sonner';
import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  Sparkles,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

/**
 * Premium notification system for GymControl
 * Provides high-quality, consistent toasts with icons and modern aesthetics.
 */
export const showPremiumToast = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      icon: React.createElement(CheckCircle2, { className: "w-5 h-5 text-green-400" }),
      duration: 4000,
    });
  },
  
  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      icon: React.createElement(AlertCircle, { className: "w-5 h-5 text-red-400" }),
      duration: 5000,
    });
  },
  
  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: React.createElement(Info, { className: "w-5 h-5 text-blue-400" }),
    });
  },
  
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: React.createElement(AlertTriangle, { className: "w-5 h-5 text-amber-400" }),
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

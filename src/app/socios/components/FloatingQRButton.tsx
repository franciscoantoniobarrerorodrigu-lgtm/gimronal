'use client'

import { useEffect, useState } from 'react'
import { QrCode, X } from 'lucide-react'

import QRScanner from '../QRScanner'
import { showPremiumToast } from '@/lib/notifications'

export default function FloatingQRButton({ hasMembresia }: { hasMembresia?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function openQr() {
      if (hasMembresia === false) {
        showPremiumToast.error('Acceso denegado', 'No tienes membresía activa para registrar entrada.')
        return
      }
      setIsOpen(true)
    }

    function openFromHash() {
      if (window.location.hash === '#qr') {
        if (hasMembresia === false) {
          showPremiumToast.error('Acceso denegado', 'No tienes membresía activa para registrar entrada.')
          window.history.replaceState(null, '', window.location.pathname)
          return
        }
        setIsOpen(true)
      }
    }

    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    window.addEventListener('open-socios-qr', openQr)

    return () => {
      window.removeEventListener('hashchange', openFromHash)
      window.removeEventListener('open-socios-qr', openQr)
    }
  }, [hasMembresia])

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (!nextOpen && window.location.hash === '#qr') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  return (
    <QRScanner
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    />
  )
}

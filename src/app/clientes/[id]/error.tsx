'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('PROFILE PAGE ERROR:', error)
  }, [error])

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'monospace', 
      backgroundColor: '#0a0a0a', 
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '20px' }}>
        ⚠️ Error en Perfil del Cliente
      </h1>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        border: '1px solid #333', 
        borderRadius: '8px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        <p style={{ color: '#f97316', fontSize: '14px', marginBottom: '8px' }}>
          <strong>Mensaje:</strong>
        </p>
        <pre style={{ 
          color: '#fbbf24', 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all',
          fontSize: '13px'
        }}>
          {error.message}
        </pre>
      </div>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        border: '1px solid #333', 
        borderRadius: '8px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        <p style={{ color: '#f97316', fontSize: '14px', marginBottom: '8px' }}>
          <strong>Digest:</strong> {error.digest || 'N/A'}
        </p>
        <p style={{ color: '#f97316', fontSize: '14px', marginBottom: '8px' }}>
          <strong>Stack:</strong>
        </p>
        <pre style={{ 
          color: '#a1a1aa', 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-all',
          fontSize: '11px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {error.stack}
        </pre>
      </div>
      <button
        onClick={reset}
        style={{
          backgroundColor: '#f97316',
          color: '#000',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        Reintentar
      </button>
    </div>
  )
}

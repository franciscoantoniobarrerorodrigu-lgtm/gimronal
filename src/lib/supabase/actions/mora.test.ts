import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hasPendingDebt } from './mora'

vi.mock('@/lib/supabase/server', () => ({
  requireAuth: vi.fn()
}))

import { requireAuth } from '@/lib/supabase/server'

describe('Mora Actions - hasPendingDebt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe retornar false si no hay gimnasio activo', async () => {
    (requireAuth as any).mockResolvedValue({ activeGymId: null })
    const result = await hasPendingDebt('cliente-1')
    expect(result).toBe(false)
  })

  it('debe retornar false si el cliente no tiene deudas de membresia', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'mem-1',
            planes: { precio: 100000 },
            pagos: [{ monto: 50000 }, { monto: 50000 }]
          }
        ]
      })
    }

    ;(requireAuth as any).mockResolvedValue({ 
      activeGymId: 'gym-1',
      supabase: mockSupabase
    })

    const result = await hasPendingDebt('cliente-1')
    expect(result).toBe(false)
  })

  it('debe retornar true si el cliente tiene pagos pendientes (precio > suma pagos)', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'mem-1',
            planes: { precio: 100000 },
            pagos: [{ monto: 50000 }] // Solo pagó 50k, debe 50k
          }
        ]
      })
    }

    ;(requireAuth as any).mockResolvedValue({ 
      activeGymId: 'gym-1',
      supabase: mockSupabase
    })

    const result = await hasPendingDebt('cliente-1')
    expect(result).toBe(true)
  })
})

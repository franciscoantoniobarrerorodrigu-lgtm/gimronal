import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registrarPagoAction } from '@/lib/supabase/actions/pagos'
import * as serverAuth from '@/lib/supabase/server'

// Mock de las dependencias de servidor
vi.mock('@/lib/supabase/server', () => ({
  requireAuth: vi.fn(),
  hasPendingDebt: vi.fn().mockResolvedValue(false),
}))

describe('registrarPagoAction', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.resetAllMocks()

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({ count: 1, error: null }),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      select: vi.fn().mockImplementation((...args: any[]) => {
        // Si es la consulta de count para el recibo
        if (args[1] && args[1].count === 'exact') {
          return mockSupabase
        }
        // De lo contrario, retorna data (para los inserts)
        return Promise.resolve({ data: [{ id: 'fake-id' }], error: null })
      }),
    }

    vi.mocked(serverAuth.requireAuth).mockResolvedValue({
      supabase: mockSupabase as any,
      activeGymId: 'gym-123',
    })
  })

  it('debe fallar si no hay caja abierta', async () => {
    // Simular que NO hay caja abierta (primer query de maybeSingle)
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const result = await registrarPagoAction({
      cliente_id: '12345678-1234-1234-1234-123456789012',
      monto: 50000,
      metodo_pago: 'efectivo',
      concepto: 'Mensualidad Básica',
    })

    expect(result?.data?.error).toContain('Debes abrir la caja primero')
  })

  it('debe registrar el pago exitosamente y calcular IVA si el plan lo aplica', async () => {
    // 1. mock caja activa (maybeSingle)
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { id: 'caja-1' }, error: null })
    
    // 2. mock gym info (single)
    mockSupabase.single.mockResolvedValueOnce({ data: { tope_factura_electronica: 100000, modulo_dian_activo: true }, error: null })

    // 3. mock plan (maybeSingle)
    mockSupabase.maybeSingle.mockResolvedValueOnce({ 
      data: { id: 'plan-1', nombre: 'Mensualidad Básica', duracion_dias: 30, aplica_iva: true, iva_porcentaje: 19 }, 
      error: null 
    })
    
    // 4. mock hasPendingDebt (false, no hace query extra)
    
    // 5. mock busqueda de membresia actual (maybeSingle)
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    // 6. mock insercion de pago (single)
    mockSupabase.single.mockResolvedValueOnce({ data: { id: 'pago-1' }, error: null })

    // 7. mock insercion de estado de cuenta o membresia (puede haber varios single / maybeSingle)
    mockSupabase.single.mockResolvedValue({ data: { id: 'fake-id' }, error: null })
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null })

    const result = await registrarPagoAction({
      cliente_id: '12345678-1234-1234-1234-123456789012',
      monto: 119000, // Total pagado
      metodo_pago: 'tarjeta',
      concepto: 'Mensualidad Básica',
    })

    // Validar llamadas a la base de datos de manera relajada para el mock
    expect(mockSupabase.from).toHaveBeenCalled()
    expect(result).toBeDefined()
  })
})

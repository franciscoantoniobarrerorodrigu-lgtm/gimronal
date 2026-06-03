import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock de process.env
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'

// Limpiar mocks después de cada prueba
afterEach(() => {
  vi.clearAllMocks()
})

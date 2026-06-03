import { describe, it, expect } from 'vitest'
import { formatInColombiaTime } from './date-utils'

describe('formatInColombiaTime formats dates correctly', () => {
  it('formats full date and time correctly', () => {
    const input = '2024-05-08T20:30:00.000'
    const result = formatInColombiaTime(input, 'full')
    expect(result).toBe('8 de mayo de 2024, 8:30 p. m.')
  })

  it('formats shortDate correctly', () => {
    const input = '2024-05-08T20:30:00.000'
    const result = formatInColombiaTime(input, 'shortDate')
    expect(result).toBe('08/05/2024')
  })

  it('formats time correctly (PM)', () => {
    const input = '2024-05-08T20:30:00.000'
    const result = formatInColombiaTime(input, 'time')
    expect(result).toBe('8:30 p. m.')
  })

  it('formats time correctly (AM)', () => {
    const input = '2024-05-08T08:15:00.000'
    const result = formatInColombiaTime(input, 'time')
    expect(result).toBe('8:15 a. m.')
  })

  it('handles empty or null input', () => {
    expect(formatInColombiaTime(null)).toBe('')
    expect(formatInColombiaTime('')).toBe('')
  })
})

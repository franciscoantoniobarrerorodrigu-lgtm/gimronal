import { describe, it, expect } from 'vitest'
import { logger } from './logger'

describe('Logger functionality', () => {
  it('logger instance exists and has logging methods', () => {
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  it('logger methods execute without throwing', () => {
    expect(() => {
      logger.info('Test info message', { test: true })
      logger.debug('Test debug message')
      logger.warn('Test warn message', { test: true }, new Error('Test warn error'))
      logger.error('Test error message', { error: new Error('Test error') })
    }).not.toThrow()
  })
})

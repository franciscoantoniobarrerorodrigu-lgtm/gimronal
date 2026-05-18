import test from 'node:test'
import assert from 'node:assert'
import { logger } from './logger'

test('Logger functionality', async (t) => {
  await t.test('logger instance exists and has logging methods', () => {
    assert.strictEqual(typeof logger.debug, 'function')
    assert.strictEqual(typeof logger.info, 'function')
    assert.strictEqual(typeof logger.warn, 'function')
    assert.strictEqual(typeof logger.error, 'function')
  })

  await t.test('logger methods execute without throwing', () => {
    assert.doesNotThrow(() => {
      logger.info('Test info message', { test: true })
      logger.debug('Test debug message')
      logger.warn('Test warn message', { test: true }, new Error('Test warn error'))
      logger.error('Test error message', { error: new Error('Test error') })
    })
  })
})

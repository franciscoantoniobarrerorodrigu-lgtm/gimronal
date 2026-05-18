import test from 'node:test'
import assert from 'node:assert'
import { formatInColombiaTime } from './date-utils'

test('formatInColombiaTime formats dates correctly', async (t) => {
  await t.test('formats full date and time correctly', () => {
    const input = '2024-05-08T20:30:00.000'
    const result = formatInColombiaTime(input, 'full')
    assert.strictEqual(result, '8 de mayo de 2024, 8:30 p. m.')
  })

  await t.test('formats shortDate correctly', () => {
    const input = '2024-05-08T20:30:00.000'
    const result = formatInColombiaTime(input, 'shortDate')
    assert.strictEqual(result, '08/05/2024')
  })

  await t.test('formats time correctly (PM)', () => {
    const input = '2024-05-08T20:30:00.000'
    const result = formatInColombiaTime(input, 'time')
    assert.strictEqual(result, '8:30 p. m.')
  })

  await t.test('formats time correctly (AM)', () => {
    const input = '2024-05-08T08:15:00.000'
    const result = formatInColombiaTime(input, 'time')
    assert.strictEqual(result, '8:15 a. m.')
  })

  await t.test('handles empty or null input', () => {
    assert.strictEqual(formatInColombiaTime(null), '')
    assert.strictEqual(formatInColombiaTime(''), '')
  })
})

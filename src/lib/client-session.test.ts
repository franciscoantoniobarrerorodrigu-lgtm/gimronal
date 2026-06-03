import { describe, expect, it, beforeEach } from 'vitest'
import {
  createClientSessionToken,
  getClientIdFromVerifiedSession,
  isClientSessionTokenValid,
} from './client-session'

describe('client portal session tokens', () => {
  beforeEach(() => {
    process.env.CLIENT_SESSION_SECRET = 'test-client-session-secret'
  })

  it('accepts a valid signed token for the current password verifier', () => {
    const token = createClientSessionToken('cliente-1', 'password-hash', Date.now() + 60_000, true)

    expect(isClientSessionTokenValid(token)).toBe(true)
    expect(getClientIdFromVerifiedSession(token, 'password-hash')).toBe('cliente-1')
  })

  it('rejects a token after the password verifier changes', () => {
    const token = createClientSessionToken('cliente-1', 'old-password-hash', Date.now() + 60_000)

    expect(getClientIdFromVerifiedSession(token, 'new-password-hash')).toBeNull()
  })

  it('rejects tampered and expired tokens', () => {
    const token = createClientSessionToken('cliente-1', 'password-hash', Date.now() + 60_000)
    const [payload, signature] = token.split('.')
    const tampered = `${payload.slice(0, -1)}x.${signature}`
    const expired = createClientSessionToken('cliente-1', 'password-hash', Date.now() - 1_000)

    expect(isClientSessionTokenValid(tampered)).toBe(false)
    expect(isClientSessionTokenValid(expired)).toBe(false)
  })
})

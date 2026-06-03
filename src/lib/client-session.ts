import { createHmac, timingSafeEqual } from 'crypto'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

type ClientSessionPayload = {
  sub: string
  exp: number
  pv: string
  pc?: boolean
}

function getSessionSecret() {
  const secret =
    process.env.CLIENT_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV !== 'production' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined)

  if (!secret) {
    throw new Error('CLIENT_SESSION_SECRET or SESSION_SECRET is required for client portal sessions.')
  }

  return secret
}

function hmac(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
}

function encodePayload(payload: ClientSessionPayload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodePayload(value: string): ClientSessionPayload | null {
  try {
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    if (
      typeof payload?.sub !== 'string' ||
      typeof payload?.exp !== 'number' ||
      typeof payload?.pv !== 'string' ||
      (payload.pc !== undefined && typeof payload.pc !== 'boolean')
    ) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

function signPayload(payload: string) {
  return hmac(`client-session:${payload}`)
}

export function getClientSessionExpiresAt(now = Date.now()) {
  return now + SESSION_TTL_MS
}

export function createClientPasswordFingerprint(clienteId: string, passwordVerifier: string | null | undefined) {
  return hmac(`client-password:${clienteId}:${passwordVerifier || ''}`)
}

export function createClientSessionToken(
  clienteId: string,
  passwordVerifier: string | null | undefined,
  expiresAt = getClientSessionExpiresAt(),
  requiresPasswordChange = false
) {
  const payload = encodePayload({
    sub: clienteId,
    exp: expiresAt,
    pv: createClientPasswordFingerprint(clienteId, passwordVerifier),
    pc: requiresPasswordChange,
  })

  return `${payload}.${signPayload(payload)}`
}

export function verifyClientSessionToken(token: string | null | undefined) {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadPart, signature] = parts
  if (!payloadPart || !signature) return null

  const expectedSignature = signPayload(payloadPart)
  if (!safeEqual(signature, expectedSignature)) return null

  const payload = decodePayload(payloadPart)
  if (!payload || payload.exp <= Date.now()) return null

  return payload
}

export function isClientSessionTokenValid(token: string | null | undefined) {
  return verifyClientSessionToken(token) !== null
}

export function getClientIdFromVerifiedSession(
  token: string | null | undefined,
  passwordVerifier: string | null | undefined
) {
  const payload = verifyClientSessionToken(token)
  if (!payload) return null

  const expectedFingerprint = createClientPasswordFingerprint(payload.sub, passwordVerifier)
  if (!safeEqual(payload.pv, expectedFingerprint)) return null

  return payload.sub
}

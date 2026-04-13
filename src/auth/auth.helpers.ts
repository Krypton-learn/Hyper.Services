import { sign, verify } from 'hono/jwt'
import { env } from '../core/env.core'

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  const hashed = await hashPassword(password)
  return hashed === passwordHash
}

export async function createJWT(payload: Record<string, unknown>, expiresInSeconds: number = 900): Promise<string> {
  return await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      iat: Math.floor(Date.now() / 1000),
    },
    env.JWT_SECRET
  )
}

export async function decodeJWT(token: string): Promise<JWTPayload | null> {
  try {
    return await verify(token, env.JWT_SECRET, 'HS256');
  } catch {
    return null
  }
}

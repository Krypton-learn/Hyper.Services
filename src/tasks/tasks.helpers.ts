import { decodeJWT } from '../auth/auth.helpers'

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const payload = await decodeJWT(token)
  if (!payload) {
    return null
  }
  return payload.userId as string
}

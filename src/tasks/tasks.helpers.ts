import { decodeJWT } from '../auth/auth.helpers'

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const payload = await decodeJWT(token);
  console.log(token)
  if (!payload) {
    return null
  }
  console.log(payload)
  console.log(payload['userId'])
  return payload.userId as string
}

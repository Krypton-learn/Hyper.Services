import { Context } from 'hono'
import { verifyToken } from '@/lib/jwt'

export const verifyAuth = async (c: Context) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.replace('Bearer ', '')
  const payload = await verifyToken(token)
  if (!payload || payload.type !== 'access') return null

  c.set('userId', payload.sub as string)
  c.set('userEmail', payload.email as string)
  c.set('accountType', (payload.accountType as string) || 'Personal')

  return payload
}
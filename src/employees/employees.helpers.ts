import { ObjectId } from 'mongodb'
import { decodeJWT } from '../auth/auth.helpers'
import { getDB } from '../core/db.core'

export interface JWTPayload {
  userId: string
  email: string
  organization?: string
  role?: string
}

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const payload = await decodeJWT(token)
  if (!payload) {
    return null
  }
  return payload.userId as string
}

export async function getUserOrganizationId(userId: string): Promise<string | null> {
  const db = getDB()
  const employee = await db.collection('users').findOne(
    { _id: new ObjectId(userId) },
    { projection: { organization: 1 } }
  )
  return employee?.organization?.toString() || null
}

export async function isUserAdminOrFounder(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const db = getDB()
  const org = await db.collection('employees').findOne(
    { _id: new ObjectId(organizationId) },
    { projection: { founder: 1, admin: 1 } }
  )

  if (!org) {
    return false
  }

  const founderId = org.founder?.toString()
  const adminIds = org.admin?.map((id: ObjectId) => id.toString()) || []

  return founderId === userId || adminIds.includes(userId)
}

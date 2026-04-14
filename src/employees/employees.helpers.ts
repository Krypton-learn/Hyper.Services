import { ObjectId } from 'mongodb'
import { decodeJWT, JWTPayload } from '../auth/auth.helpers'
import { getDB } from '../core/db.core'

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const payload = await decodeJWT(token)
  if (!payload) {
    return null
  }
  return payload.userId as string
}

export async function getUserOrganizationId(userId: string): Promise<string | null> {
  const db = getDB()
  const employee = await db.collection('employees').findOne(
    { userId: new ObjectId(userId) },
    { projection: { organization: 1 } }
  )
  if (!employee || !employee.organization || employee.organization.length === 0) {
    return null
  }
  return employee.organization[0].toString()
}

export async function isUserAdminOrFounder(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const db = getDB()
  const employee = await db.collection('employees').findOne(
    { userId: new ObjectId(userId), organization: { $elemMatch: { $eq: new ObjectId(organizationId) } } },
    { projection: { isAdmin: 1, isFounder: 1 } }
  )

  if (!employee) {
    return false
  }

  return employee.isAdmin === true || employee.isFounder === true
}

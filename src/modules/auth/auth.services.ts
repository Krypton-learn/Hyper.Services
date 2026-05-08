import { D1Database } from '@cloudflare/workers-types'
import { createUserCRUD, getUserByEmailCRUD, getUserByUsernameCRUD, getUserByIdCRUD, getOrganizationByUserIdCRUD } from './auth.crud'
import { RegisterInput, LoginInput } from '@packages/schemas/auth.schemas'
import { checkPassword } from '@/lib/hash'
import { createAccessToken, createRefreshToken, verifyToken } from '@/lib/jwt'

export const registerService = async (db: D1Database, data: RegisterInput) => {
  const existingEmail = await getUserByEmailCRUD(db, data.email)
  if (existingEmail) {
    throw new Error('Email already exists')
  }
  
  const existingUsername = await getUserByUsernameCRUD(db, data.username)
  if (existingUsername) {
    throw new Error('Username already exists')
  }
  
  const user = await createUserCRUD(db, data)
  
  if (data.accountType === 'Organization') {
    const orgStmt = db.prepare(
      `INSERT INTO organizations (user_id, name, is_admin)
       VALUES (?, ?, ?)`
    )
    await orgStmt.bind(user.id, `${data.username}'s Organization`, 1)
  }
  
  return user
}

export const loginService = async (db: D1Database, data: LoginInput) => {
  const user = await getUserByEmailCRUD(db, data.email)
  if (!user) throw new Error('Invalid email or password')

  const isValid = await checkPassword(data.password, user.password as string)
  if (!isValid) throw new Error('Invalid email or password')

  let accountType = 'Personal'
  try {
    if (user.account_type && String(user.account_type).toLowerCase() === 'organization') {
      accountType = 'Organization'
    }
  } catch (e) {}

  const accessToken = await createAccessToken(user.id as string, user.email as string, accountType)
  const refreshToken = await createRefreshToken(user.id as string, user.email as string, accountType)

  const { password, ...userWithoutPassword } = user
  return {
    user: { ...userWithoutPassword, accountType },
    accessToken,
    refreshToken,
    message: 'Login successful',
  }
}

export const refreshService = async (db: D1Database, refreshToken: string) => {
  const payload = await verifyToken(refreshToken)
  if (!payload) throw new Error('Invalid or expired refresh token')
  if (payload.type !== 'refresh') throw new Error('Invalid token type')

  const user = await getUserByIdCRUD(db, payload.sub as string)
  if (!user) throw new Error('User not found')

  let accountType = 'Personal'
  try {
    if (user.account_type && String(user.account_type).toLowerCase() === 'organization') {
      accountType = 'Organization'
    }
  } catch (e) {}

  const newAccessToken = await createAccessToken(user.id as string, user.email as string, accountType)
  const newRefreshToken = await createRefreshToken(user.id as string, user.email as string, accountType)

  const { password, ...userWithoutPassword } = user
  return {
    user: { ...userWithoutPassword, accountType },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    message: 'Token refreshed successfully',
  }
}
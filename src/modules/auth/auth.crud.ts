import { D1Database } from '@cloudflare/workers-types'
import { RegisterInput } from '@packages/schemas/auth.schemas'
import { hashPassword } from '@/lib/hash'
import { generateUUID } from '@/lib/uuid'

export const createUserCRUD = async (db: D1Database, data: RegisterInput) => {
  const id = generateUUID()
  const hash = await hashPassword(data.password)
  const accountType = data.accountType || 'Personal'
  
  // Try to insert with account_type, fallback to without if column doesn't exist
  try {
    const stmt = db.prepare(
      `INSERT INTO users (id, username, email, password, account_type)
       VALUES (?, ?, ?, ?, ?)`
    )
    await stmt.bind(id, data.username, data.email, hash, accountType).run()
  } catch (e) {
    // Fallback: insert without account_type
    const stmt = db.prepare(
      `INSERT INTO users (id, username, email, password)
       VALUES (?, ?, ?, ?)`
    )
    await stmt.bind(id, data.username, data.email, hash).run()
  }
  
  return { id, username: data.username, email: data.email, accountType }
}

export const getUserByEmailCRUD = async (db: D1Database, email: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.bind(email).first()
}

export const getUserByUsernameCRUD = async (db: D1Database, username: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
  return stmt.bind(username).first()
}

export const getUserByIdCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.bind(id).first()
}

export const getOrganizationByUserIdCRUD = async (db: D1Database, userId: string) => {
  const stmt = db.prepare('SELECT * FROM organizations WHERE user_id = ?')
  return stmt.bind(userId).first()
}
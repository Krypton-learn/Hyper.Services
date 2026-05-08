import { D1Database } from '@cloudflare/workers-types'
import { generateUUID } from '@/lib/uuid'
import { AddWaitlistInput } from '@packages/schemas/waitlist.schemas'
import { WaitlistEntry } from '@packages/schemas/waitlist.responses'

export const createWaitlistCRUD = async (
  db: D1Database,
  data: AddWaitlistInput
): Promise<WaitlistEntry> => {
  const id = generateUUID()
  const createdAt = new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO waitlist (id, firstname, lastname, email, desc, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, data.firstname, data.lastname, data.email, data.desc ?? null, createdAt)
    .run()

  return {
    id,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    desc: data.desc ?? null,
    createdAt,
  }
}

export const getAllWaitlistCRUD = async (
  db: D1Database
): Promise<WaitlistEntry[]> => {
  const { results } = await db
    .prepare(`SELECT id, firstname, lastname, email, desc, created_at FROM waitlist ORDER BY created_at DESC`)
    .all<WaitlistEntry & { created_at: string }>()

  return results.map((row) => ({
    id: row.id,
    firstname: row.firstname,
    lastname: row.lastname,
    email: row.email,
    desc: row.desc,
    createdAt: row.created_at,
  }))
}

export const waitlistEntryExistsByEmail = async (
  db: D1Database,
  email: string
): Promise<boolean> => {
  const { results } = await db
    .prepare(`SELECT id FROM waitlist WHERE email = ?`)
    .bind(email)
    .all()

  return results.length > 0 
}
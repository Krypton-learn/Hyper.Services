import { D1Database } from '@cloudflare/workers-types'
import { generateUUID } from '@/lib/uuid'

export const getStoresCRUD = async (db: D1Database, userId: string) => {
  const stmt = db.prepare(
    `SELECT id, user_id, b2_key, file_name, file_size, link, uploaded_at 
     FROM stores 
     WHERE user_id = ? 
     ORDER BY uploaded_at DESC`
  )
  return stmt.bind(userId).all()
}

export const getStoreByIdCRUD = async (db: D1Database, id: string, userId: string) => {
  const stmt = db.prepare(
    `SELECT id, user_id, b2_key, file_name, file_size, link, uploaded_at 
     FROM stores 
     WHERE id = ? AND user_id = ?`
  )
  return stmt.bind(id, userId).all()
}

export const deleteStoreCRUD = async (db: D1Database, id: string, userId: string) => {
  const stmt = db.prepare(`DELETE FROM stores WHERE id = ? AND user_id = ?`)
  return stmt.bind(id, userId).run()
}

export const createStoreCRUD = async (
  db: D1Database,
  userId: string,
  b2Key: string,
  fileName: string,
  fileSize: number,
  link: string
) => {
  const id = generateUUID()
  const uploadedAt = new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO stores (id, user_id, b2_key, file_name, file_size, link, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, userId, b2Key, fileName, fileSize, link, uploadedAt)
    .run()

  return { id, user_id: userId, b2_key: b2Key, file_name: fileName, file_size: fileSize, link, uploaded_at: uploadedAt }
}

export const getOrganizationStoresCRUD = async (db: D1Database) => {
  const stmt = db.prepare(
    `SELECT id, user_id, b2_key, file_name, file_size, link, uploaded_at 
     FROM organizations_stores 
     ORDER BY uploaded_at DESC`
  )
  return stmt.all()
}

export const getOrganizationStoreByIdCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare(
    `SELECT id, user_id, b2_key, file_name, file_size, link, uploaded_at 
     FROM organizations_stores 
     WHERE id = ?`
  )
  return stmt.bind(id).all()
}

export const deleteOrganizationStoreCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare(`DELETE FROM organizations_stores WHERE id = ?`)
  return stmt.bind(id).run()
}

export const createOrganizationStoreCRUD = async (
  db: D1Database,
  userId: string,
  b2Key: string,
  fileName: string,
  fileSize: number,
  link: string,
  organizationId?: string
) => {
  const id = generateUUID()
  const uploadedAt = new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO organizations_stores (id, user_id, organization_id, b2_key, file_name, file_size, link, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, userId, organizationId || null, b2Key, fileName, fileSize, link, uploadedAt)
    .run()

  return {
    id,
    user_id: userId,
    organization_id: organizationId || null,
    b2_key: b2Key,
    file_name: fileName,
    file_size: fileSize,
    link,
    uploaded_at: uploadedAt,
  }
}

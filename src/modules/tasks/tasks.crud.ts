import { D1Database } from '@cloudflare/workers-types'
import { CreateTaskInput, UpdateTaskInput } from '@packages/schemas/tasks.schema'
import { generateUUID } from '@/lib/uuid'

export const createTasksCRUD = async (db: D1Database, data: CreateTaskInput, userId: string) => {
  const id = generateUUID()
  const stmt = db.prepare(
    `INSERT INTO tasks (id, title, desc, isCompleted, createdBy, assignedTo, startingDate, deadline, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )

  await stmt.bind(
    id,
    data.title,
    data.desc || null,
    data.isCompleted ? 1 : 0,
    userId,
    data.assignedTo || null,
    data.startingDate || null,
    data.deadline || null,
    data.status || 'Common'
  ).run()

  return { id, ...data, createdBy: userId, createdAt: new Date() }
}

export const getTaskCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt, t.status,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.id = ?
  `)
  const result = await stmt.bind(id).first()
  return result
}

export const getTasksCRUD = async (db: D1Database, page = 0, userId?: string) => {
  const limit = 20
  const offset = page * limit

  const query = `
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt, t.status,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.createdBy = ? OR t.assignedTo = ?
    ORDER BY t.createdAt DESC LIMIT ? OFFSET ?
  `

  const stmt = db.prepare(query)
  return stmt.bind(userId, userId, limit, offset).all()
}

export const updateTaskCRUD = async (db: D1Database, id: string, data: UpdateTaskInput) => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (data.title !== undefined) {
    fields.push('title = ?')
    values.push(data.title)
  }
  if (data.desc !== undefined) {
    fields.push('desc = ?')
    values.push(data.desc || null)
  }
  if (data.isCompleted !== undefined) {
    fields.push('isCompleted = ?')
    values.push(data.isCompleted ? 1 : 0)
  }
  if (data.assignedTo !== undefined) {
    fields.push('assignedTo = ?')
    values.push(data.assignedTo || null)
  }
  if (data.startingDate !== undefined) {
    fields.push('startingDate = ?')
    values.push(data.startingDate || null)
  }
  if (data.deadline !== undefined) {
    fields.push('deadline = ?')
    values.push(data.deadline || null)
  }
  if (data.status !== undefined) {
    fields.push('status = ?')
    values.push(data.status)
  }

  if (fields.length === 0) return null

  values.push(id)
  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`)
  return stmt.bind(...values).run()
}

export const completeTaskCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare('UPDATE tasks SET isCompleted = 1 WHERE id = ?')
  return stmt.bind(id).run()
}

export const deleteTaskCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?')
  return stmt.bind(id).run()
}

export const createOrganizationTaskCRUD = async (db: D1Database, data: CreateTaskInput, userId: string) => {
  const id = generateUUID()
  await db.prepare(
    `INSERT INTO organizations_tasks (id, title, desc, isCompleted, createdBy, assignedTo, startingDate, deadline, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    data.title,
    data.desc || null,
    data.isCompleted ? 1 : 0,
    userId,
    data.assignedTo || null,
    data.startingDate || null,
    data.deadline || null,
    data.status || 'Common'
  ).run()

  return { id, ...data, createdBy: userId, createdAt: new Date() }
}

export const getOrganizationTaskCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt, t.status,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM organizations_tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.id = ?
  `)
  const result = await stmt.bind(id).first()
  return result
}

export const getOrganizationTasksCRUD = async (db: D1Database, page = 0) => {
  const limit = 20
  const offset = page * limit

  const query = `
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt, t.status,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM organizations_tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    ORDER BY t.createdAt DESC LIMIT ? OFFSET ?
  `

  const stmt = db.prepare(query)
  return stmt.bind(limit, offset).all()
}

export const updateOrganizationTaskCRUD = async (db: D1Database, id: string, data: UpdateTaskInput) => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (data.title !== undefined) {
    fields.push('title = ?')
    values.push(data.title)
  }
  if (data.desc !== undefined) {
    fields.push('desc = ?')
    values.push(data.desc || null)
  }
  if (data.isCompleted !== undefined) {
    fields.push('isCompleted = ?')
    values.push(data.isCompleted ? 1 : 0)
  }
  if (data.assignedTo !== undefined) {
    fields.push('assignedTo = ?')
    values.push(data.assignedTo || null)
  }
  if (data.startingDate !== undefined) {
    fields.push('startingDate = ?')
    values.push(data.startingDate || null)
  }
  if (data.deadline !== undefined) {
    fields.push('deadline = ?')
    values.push(data.deadline || null)
  }
  if (data.status !== undefined) {
    fields.push('status = ?')
    values.push(data.status)
  }

  if (fields.length === 0) return null

  values.push(id)
  const stmt = db.prepare(`UPDATE organizations_tasks SET ${fields.join(', ')} WHERE id = ?`)
  return stmt.bind(...values).run()
}

export const deleteOrganizationTaskCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare('DELETE FROM organizations_tasks WHERE id = ?')
  return stmt.bind(id).run()
}

export const completeOrganizationTaskCRUD = async (db: D1Database, id: string) => {
  const stmt = db.prepare('UPDATE organizations_tasks SET isCompleted = 1 WHERE id = ?')
  return stmt.bind(id).run()
}

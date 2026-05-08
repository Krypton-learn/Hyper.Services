import { D1Database } from '@cloudflare/workers-types'

export const getPendingTasksCRUD = async (db: D1Database, userId: string) => {
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.isCompleted = 0 AND (t.createdBy = ? OR t.assignedTo = ?)
    ORDER BY t.deadline ASC
  `)
  return stmt.bind(userId, userId).all()
}

export const getCompletedTasksCRUD = async (db: D1Database, userId: string) => {
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.isCompleted = 1 AND (t.createdBy = ? OR t.assignedTo = ?)
    ORDER BY t.createdAt DESC
  `)
  return stmt.bind(userId, userId).all()
}

export const getOverdueTasksCRUD = async (db: D1Database, userId: string) => {
  const now = new Date().toISOString()
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.isCompleted = 0 AND t.deadline < ? AND (t.createdBy = ? OR t.assignedTo = ?)
    ORDER BY t.deadline ASC
  `)
  return stmt.bind(now, userId, userId).all()
}

export const getTotalStatsCRUD = async (db: D1Database, userId: string) => {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN isCompleted = 1 THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN isCompleted = 0 THEN 1 ELSE 0 END) as pending
    FROM tasks
    WHERE createdBy = ? OR assignedTo = ?
  `)
  const result = await stmt.bind(userId, userId).first()
  return result
}

// Organization-specific CRUD functions
export const getOrganizationPendingTasksCRUD = async (db: D1Database) => {
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM organizations_tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.isCompleted = 0
    ORDER BY t.deadline ASC
  `)
  return stmt.all()
}

export const getOrganizationCompletedTasksCRUD = async (db: D1Database) => {
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM organizations_tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.isCompleted = 1
    ORDER BY t.createdAt DESC
  `)
  return stmt.all()
}

export const getOrganizationOverdueTasksCRUD = async (db: D1Database) => {
  const now = new Date().toISOString()
  const stmt = db.prepare(`
    SELECT 
      t.id, t.title, t.desc, t.isCompleted, t.startingDate, t.deadline, t.createdAt,
      creator.id as creator_id, creator.username as creator_username, creator.email as creator_email,
      assignee.id as assignee_id, assignee.username as assignee_username, assignee.email as assignee_email
    FROM organizations_tasks t
    LEFT JOIN users creator ON t.createdBy = creator.id
    LEFT JOIN users assignee ON t.assignedTo = assignee.id
    WHERE t.isCompleted = 0 AND t.deadline < ?
    ORDER BY t.deadline ASC
  `)
  return stmt.bind(now).all()
}

export const getOrganizationTotalStatsCRUD = async (db: D1Database) => {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN isCompleted = 1 THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN isCompleted = 0 THEN 1 ELSE 0 END) as pending
    FROM organizations_tasks
  `)
  const result = await stmt.first()
  return result
}
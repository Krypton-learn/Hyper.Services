import { D1Database } from '@cloudflare/workers-types';
import { Task, TaskPriority } from './tasks.schema';

export async function createTask(
  db: D1Database,
  task: Task
): Promise<void> {
  await db.prepare(`
    INSERT INTO tasks (id, milestone_id, token, title, description, starting_date, due_date, priority, team, temp_team, assigned_to, is_completed, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    task.id,
    task.milestoneId,
    task.token,
    task.title,
    task.description || null,
    task.startingDate || null,
    task.dueDate || null,
    task.priority || null,
    JSON.stringify(task.team || []),
    JSON.stringify(task.tempTeam || []),
    task.assignedTo,
    task.isCompleted ? 1 : 0,
    task.createdBy,
    task.createdAt.toISOString()
  ).run();
}

export async function findTaskById(
  db: D1Database,
  id: string
): Promise<Task | null> {
  const result = await db.prepare(`
    SELECT * FROM tasks WHERE id = ?
  `).bind(id).first();

  if (!result) return null;

  return {
    id: result.id as string,
    milestoneId: result.milestone_id as string,
    token: result.token as string,
    title: result.title as string,
    description: result.description as string | undefined,
    startingDate: result.starting_date as string | undefined,
    dueDate: result.due_date as string | undefined,
    priority: result.priority as TaskPriority | undefined,
    team: result.team ? JSON.parse(result.team as string) : [],
    tempTeam: result.temp_team ? JSON.parse(result.temp_team as string) : [],
    assignedTo: result.assigned_to as string,
    isCompleted: result.is_completed === 1,
    createdBy: result.created_by as string,
    createdAt: new Date(result.created_at as string),
  };
}

export async function findTasksByMilestoneId(
  db: D1Database,
  milestoneId: string
): Promise<Task[]> {
  const results = await db.prepare(`
    SELECT * FROM tasks WHERE milestone_id = ? ORDER BY created_at DESC
  `).bind(milestoneId).all();

  return (results.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    milestoneId: row.milestone_id as string,
    token: row.token as string,
    title: row.title as string,
    description: row.description as string | undefined,
    startingDate: row.starting_date as string | undefined,
    dueDate: row.due_date as string | undefined,
    priority: row.priority as Task['priority'],
    team: row.team ? JSON.parse(row.team as string) : [],
    tempTeam: row.temp_team ? JSON.parse(row.temp_team as string) : [],
    assignedTo: row.assigned_to as string,
    isCompleted: row.is_completed === 1,
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string),
  }));
}

export async function findTasksByToken(
  db: D1Database,
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<Task[]> {
  const offset = (page - 1) * limit;

  const results = await db.prepare(`
    SELECT * FROM tasks WHERE token = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).bind(token, limit, offset).all();

  return (results.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    milestoneId: row.milestone_id as string,
    token: row.token as string,
    title: row.title as string,
    description: row.description as string | undefined,
    startingDate: row.starting_date as string | undefined,
    dueDate: row.due_date as string | undefined,
    priority: row.priority as Task['priority'],
    team: row.team ? JSON.parse(row.team as string) : [],
    tempTeam: row.temp_team ? JSON.parse(row.temp_team as string) : [],
    assignedTo: row.assigned_to as string,
    isCompleted: row.is_completed === 1,
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string),
  }));
}

export async function countTasksByToken(
  db: D1Database,
  token: string
): Promise<number> {
  const result = await db.prepare(`
    SELECT COUNT(*) as total FROM tasks WHERE token = ?
  `).bind(token).first() as { total: number } | undefined;

  return result?.total || 0;
}

export async function deleteTasksByToken(
  db: D1Database,
  token: string
): Promise<void> {
  await db.prepare('DELETE FROM tasks WHERE token = ?').bind(token).run();
}

export async function updateTask(
  db: D1Database,
  id: string,
  data: {
    title?: string;
    description?: string | null;
    startingDate?: string | null;
    dueDate?: string | null;
    priority?: TaskPriority | null;
    team?: string[];
    tempTeam?: string[];
    assignedTo?: string | null;
    isCompleted?: boolean;
  }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.startingDate !== undefined) {
    updates.push('starting_date = ?');
    values.push(data.startingDate);
  }
  if (data.dueDate !== undefined) {
    updates.push('due_date = ?');
    values.push(data.dueDate);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    values.push(data.priority);
  }
  if (data.team !== undefined) {
    updates.push('team = ?');
    values.push(JSON.stringify(data.team));
  }
  if (data.tempTeam !== undefined) {
    updates.push('temp_team = ?');
    values.push(JSON.stringify(data.tempTeam));
  }
  if (data.assignedTo !== undefined) {
    updates.push('assigned_to = ?');
    values.push(data.assignedTo);
  }
  if (data.isCompleted !== undefined) {
    updates.push('is_completed = ?');
    values.push(data.isCompleted ? 1 : 0);
  }

  if (updates.length === 0) return;

  values.push(id);
  await db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
}

export async function deleteTask(
  db: D1Database,
  id: string
): Promise<void> {
  await db.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
}

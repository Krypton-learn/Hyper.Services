import { D1Database } from '@cloudflare/workers-types';
import { Milestone, MilestoneWithCreator, MilestoneCategory, UpdateMilestoneInput } from './milestones.schema';

export async function createMilestone(
  db: D1Database,
  milestone: Milestone
): Promise<void> {
  await db.prepare(`
    INSERT INTO milestones (id, name, description, budget, category, org_id, created_by, created_at, starting_date, ending_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    milestone.id,
    milestone.name,
    milestone.description || null,
    milestone.budget ?? null,
    milestone.category || null,
    milestone.orgId,
    milestone.createdBy,
    milestone.createdAt.toISOString(),
    milestone.startingDate || null,
    milestone.endingDate || null
  ).run();
}

export async function findMilestoneById(
  db: D1Database,
  id: string
): Promise<Milestone | null> {
  const result = await db.prepare('SELECT * FROM milestones WHERE id = ?').bind(id).first();
  
  if (!result) return null;
  
  return {
    id: result.id as string,
    name: result.name as string,
    description: result.description as string | undefined,
    budget: result.budget as number | undefined,
    category: result.category as MilestoneCategory | undefined,
    orgId: result.org_id as string,
    createdBy: result.created_by as string,
    createdAt: new Date(result.created_at as string),
    startingDate: result.starting_date as string | undefined,
    endingDate: result.ending_date as string | undefined,
  };
}

export async function updateMilestone(
  db: D1Database,
  id: string,
  data: { name?: string; description?: string | null; budget?: number | null; category?: string | null; startingDate?: string | null; endingDate?: string | null }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.budget !== undefined) {
    updates.push('budget = ?');
    values.push(data.budget);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category);
  }
  if (data.startingDate !== undefined) {
    updates.push('starting_date = ?');
    values.push(data.startingDate);
  }
  if (data.endingDate !== undefined) {
    updates.push('ending_date = ?');
    values.push(data.endingDate);
  }

  if (updates.length === 0) return;

  values.push(id);
  await db.prepare(`UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
}

export async function findMilestonesByOrgId(
  db: D1Database,
  orgId: string
): Promise<MilestoneWithCreator[]> {
  const results = await db.prepare(`
    SELECT 
      m.id,
      m.name,
      m.description,
      m.budget,
      m.category,
      m.org_id,
      m.created_by,
      m.created_at,
      m.starting_date,
      m.ending_date,
      u.id as u_id,
      u.name as u_name,
      u.email as u_email,
      u.profile as u_profile
    FROM milestones m
    JOIN users u ON m.created_by = u.id
    WHERE m.org_id = ?
    ORDER BY m.created_at DESC
  `).bind(orgId).all();

  return (results.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    budget: row.budget as number | undefined,
    category: row.category as MilestoneCategory | undefined,
    orgId: row.org_id as string,
    createdAt: new Date(row.created_at as string),
    startingDate: row.starting_date as string | undefined,
    endingDate: row.ending_date as string | undefined,
    createdBy: {
      id: row.u_id as string,
      name: row.u_name as string,
      email: row.u_email as string,
      profile: row.u_profile ? JSON.parse(row.u_profile as string) : null,
    },
  }));
}

export async function deleteMilestone(
  db: D1Database,
  id: string
): Promise<void> {
  await db.prepare('DELETE FROM milestones WHERE id = ?').bind(id).run();
}


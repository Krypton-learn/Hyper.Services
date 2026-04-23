import { D1Database } from '@cloudflare/workers-types';
import { Employee, EmployeeWithUser } from '../../../packages/schemas/employees.schema';

export async function findEmployeesByOrgId(
  db: D1Database,
  orgId: string
): Promise<EmployeeWithUser[]> {
  const results = await db.prepare(`
    SELECT
      e.id,
      e.org_id,
      e.user_id,
      e.is_founder,
      e.is_admin,
      e.department,
      e.role,
      e.joined_at,
      u.id as u_id,
      u.name as u_name,
      u.email as u_email,
      u.profile as u_profile
    FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE e.org_id = ?
    ORDER BY e.joined_at ASC
  `).bind(orgId).all();

  return (results.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    orgId: row.org_id as string,
    isFounder: Boolean(row.is_founder),
    isAdmin: Boolean(row.is_admin),
    department: row.department as string | null,
    role: row.role as 'Head' | 'Member',
    joinedAt: new Date(row.joined_at as string),
    user: {
      id: row.u_id as string,
      name: row.u_name as string,
      email: row.u_email as string,
      profile: row.u_profile ? JSON.parse(row.u_profile as string) : null,
    },
  }));
}

export async function findEmployeeById(
  db: D1Database,
  employeeId: string
): Promise<Employee | null> {
  const result = await db.prepare('SELECT * FROM employees WHERE id = ?').bind(employeeId).first();

  if (!result) return null;

  return {
    id: result.id as string,
    orgId: result.org_id as string,
    userId: result.user_id as string,
    isFounder: Boolean(result.is_founder),
    isAdmin: Boolean(result.is_admin),
    department: result.department as string | null,
    role: result.role as 'Head' | 'Member',
    joinedAt: new Date(result.joined_at as string),
  };
}

export async function findEmployeeByUserAndOrg(
  db: D1Database,
  userId: string,
  orgId: string
): Promise<Employee | null> {
  const result = await db.prepare(
    'SELECT * FROM employees WHERE user_id = ? AND org_id = ?'
  ).bind(userId, orgId).first();

  if (!result) return null;

  return {
    id: result.id as string,
    orgId: result.org_id as string,
    userId: result.user_id as string,
    isFounder: Boolean(result.is_founder),
    isAdmin: Boolean(result.is_admin),
    department: result.department as string | null,
    role: result.role as 'Head' | 'Member',
    joinedAt: new Date(result.joined_at as string),
  };
}

export async function updateEmployee(
  db: D1Database,
  employeeId: string,
  data: { isAdmin?: boolean; department?: string | null; role?: 'Head' | 'Member' }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (data.isAdmin !== undefined) {
    updates.push('is_admin = ?');
    values.push(data.isAdmin ? '1' : '0');
  }
  if (data.department !== undefined) {
    updates.push('department = ?');
    values.push(data.department);
  }
  if (data.role !== undefined) {
    updates.push('role = ?');
    values.push(data.role);
  }

  if (updates.length === 0) return;

  values.push(employeeId);
  await db.prepare(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
}

export async function deleteEmployee(
  db: D1Database,
  employeeId: string
): Promise<void> {
  await db.prepare('DELETE FROM employees WHERE id = ?').bind(employeeId).run();
}

export async function deleteEmployeesByOrgId(
  db: D1Database,
  orgId: string
): Promise<void> {
  await db.prepare('DELETE FROM employees WHERE org_id = ?').bind(orgId).run();
}

export async function countEmployeesByOrgId(
  db: D1Database,
  orgId: string
): Promise<number> {
  const result = await db.prepare('SELECT COUNT(*) as count FROM employees WHERE org_id = ?').bind(orgId).first();
  return result?.count as number ?? 0;
}
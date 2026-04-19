import { D1Database } from '@cloudflare/workers-types';
import { Organization, OrganizationMember, OrganizationMemberWithUser } from './orgs.schema';

export async function createOrg(
  db: D1Database,
  org: Organization
): Promise<void> {
  await db.prepare(`
    INSERT INTO organizations (id, token, name, description, logo, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    org.id,
    org.token,
    org.name,
    org.description || null,
    org.logo || null,
    org.createdAt.toISOString()
  ).run();
}

export async function createOrgMember(
  db: D1Database,
  member: OrganizationMember
): Promise<void> {
  await db.prepare(`
    INSERT INTO organization_members (id, org_id, user_id, is_founder, is_admin, department, role, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    member.id,
    member.orgId,
    member.userId,
    member.isFounder ? 1 : 0,
    member.isAdmin ? 1 : 0,
    member.department,
    member.role,
    member.joinedAt.toISOString()
  ).run();
}

export async function findOrgById(
  db: D1Database,
  id: string
): Promise<Organization | null> {
  const result = await db.prepare('SELECT * FROM organizations WHERE id = ?').bind(id).first();

  if (!result) return null;

  return {
    id: result.id as string,
    token: result.token as string,
    name: result.name as string,
    description: result.description as string | undefined,
    logo: result.logo as string | undefined,
    createdAt: new Date(result.createdAt as string),
  };
}

export async function findOrgByToken(
  db: D1Database,
  token: string
): Promise<Organization | null> {
  const result = await db.prepare('SELECT * FROM organizations WHERE token = ?').bind(token).first();

  if (!result) return null;

  return {
    id: result.id as string,
    token: result.token as string,
    name: result.name as string,
    description: result.description as string | undefined,
    logo: result.logo as string | undefined,
    createdAt: new Date(result.createdAt as string),
  };
}

export async function findMemberByUserAndOrg(
  db: D1Database,
  userId: string,
  orgId: string
): Promise<OrganizationMember | null> {
  const result = await db.prepare(
    'SELECT * FROM organization_members WHERE user_id = ? AND org_id = ?'
  ).bind(userId, orgId).first();

  if (!result) return null;

  return {
    id: result.id as string,
    orgId: result.org_id as string,
    userId: result.user_id as string,
    isFounder: Boolean(result.is_founder),
    isAdmin: Boolean(result.is_admin),
    department: result.department as string | null,
    role: result.role as OrganizationRole,
    joinedAt: new Date(result.joined_at as string),
  };
}

export async function deleteOrgMembers(
  db: D1Database,
  orgId: string
): Promise<void> {
  await db.prepare('DELETE FROM organization_members WHERE org_id = ?').bind(orgId).run();
}

export async function deleteOrg(
  db: D1Database,
  orgId: string
): Promise<void> {
  await db.prepare('DELETE FROM organizations WHERE id = ?').bind(orgId).run();
}

export async function updateOrg(
  db: D1Database,
  orgId: string,
  data: { name?: string; description?: string | null; logo?: string | null }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.logo !== undefined) {
    updates.push('logo = ?');
    values.push(data.logo);
  }

  if (updates.length === 0) return;

  values.push(orgId);
  await db.prepare(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
}

export async function findOrgsByUserId(
  db: D1Database,
  userId: string
): Promise<Organization[]> {
  const results = await db.prepare(`
    SELECT o.* FROM organizations o
    JOIN organization_members om ON o.id = om.org_id
    WHERE om.user_id = ?
    ORDER BY om.joined_at DESC
  `).bind(userId).all();

  return (results.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    token: row.token as string,
    name: row.name as string,
    description: row.description as string | undefined,
    logo: row.logo as string | undefined,
    createdAt: new Date(row.createdAt as string),
  }));
}

export async function findOrgByIdWithMembers(
  db: D1Database,
  orgId: string
): Promise<{ org: Organization; members: OrganizationMemberWithUser[] } | null> {
  const orgResult = await db.prepare('SELECT * FROM organizations WHERE id = ?').bind(orgId).first();

  if (!orgResult) return null;

  const org: Organization = {
    id: orgResult.id as string,
    token: orgResult.token as string,
    name: orgResult.name as string,
    description: orgResult.description as string | undefined,
    logo: orgResult.logo as string | undefined,
    createdAt: new Date(orgResult.createdAt as string),
  };

  const membersResult = await db.prepare(`
    SELECT 
      om.id,
      om.org_id,
      om.user_id,
      om.is_founder,
      om.is_admin,
      om.department,
      om.role,
      om.joined_at,
      u.id as u_id,
      u.name as u_name,
      u.email as u_email,
      u.profile as u_profile
    FROM organization_members om
    JOIN users u ON om.user_id = u.id
    WHERE om.org_id = ?
    ORDER BY om.joined_at ASC
  `).bind(orgId).all();

  const members: OrganizationMemberWithUser[] = (membersResult.results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    orgId: row.org_id as string,
    isFounder: Boolean(row.is_founder),
    isAdmin: Boolean(row.is_admin),
    department: row.department as string | null,
    role: row.role as OrganizationRole,
    joinedAt: new Date(row.joined_at as string),
    user: {
      id: row.u_id as string,
      name: row.u_name as string,
      email: row.u_email as string,
      profile: row.u_profile ? JSON.parse(row.u_profile as string) : null,
    },
  }));

  return { org, members };
}

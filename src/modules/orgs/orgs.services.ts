import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../../lib/id.lib';
import { generateOrgKey } from '../../lib/token.lib';
import { CreateOrgInput, UpdateOrgInput, Organization, OrganizationMember, OrganizationWithMembersAndUser } from '../../../packages/schemas/orgs.schema';
import { createOrg, createOrgMember, findOrgsByUserId, findOrgByToken, findMemberByUserAndOrg, deleteOrgMembers, deleteOrg, updateOrg as updateOrgCrud, findOrgById, findOrgByIdWithMembers, countOrgsByUserId } from './orgs.crud';
import { deleteTasksByToken } from '../tasks/tasks.crud';
import { deleteMilestonesByOrgId } from '../milestones/milestones.crud';

export interface CreateOrgServiceParams {
  db: D1Database;
  input: CreateOrgInput;
  userId: string;
}

export async function createOrgService({ db, input, userId }: CreateOrgServiceParams): Promise<Organization> {
  const orgId = generateId();
  const org: Organization = {
    id: orgId,
    token: generateOrgKey(),
    name: input.name,
    description: input.description,
    logo: input.logo,
    createdAt: new Date(),
  };

  await createOrg(db, org);

  const member: OrganizationMember = {
    id: generateId(),
    orgId,
    userId,
    isFounder: true,
    isAdmin: true,
    department: null,
    role: 'Head',
    joinedAt: new Date(),
  };

  await createOrgMember(db, member);

  return org;
}

export async function createOrgWithMembersService({ db, input, userId }: CreateOrgServiceParams): Promise<OrganizationWithMembersAndUser> {
  const orgId = generateId();
  const org: Organization = {
    id: orgId,
    token: generateOrgKey(),
    name: input.name,
    description: input.description,
    logo: input.logo,
    createdAt: new Date(),
  };

  await createOrg(db, org);

  const member: OrganizationMember = {
    id: generateId(),
    orgId,
    userId,
    isFounder: true,
    isAdmin: true,
    department: null,
    role: 'Head',
    joinedAt: new Date(),
  };

  await createOrgMember(db, member);

  const result = await findOrgByIdWithMembers(db, orgId);

  if (!result) {
    throw new Error('Failed to create organization with members');
  }

  return {
    ...result.org,
    members: result.members,
  };
}

export interface GetUserOrgsServiceParams {
  db: D1Database;
  userId: string;
  page?: number;
  limit?: number;
}

export async function getUserOrgsService({ db, userId, page = 1, limit = 10 }: GetUserOrgsServiceParams): Promise<{ orgs: OrganizationWithMembersAndUser[]; total: number }> {
  const { orgs } = await findOrgsByUserId(db, userId, page, limit);
  const total = await countOrgsByUserId(db, userId);
  return { orgs, total };
}

export interface GetOrgServiceParams {
  db: D1Database;
  orgId: string;
}

export async function getOrgService({ db, orgId }: GetOrgServiceParams): Promise<OrganizationWithMembers> {
  const result = await findOrgByIdWithMembers(db, orgId);

  if (!result) {
    throw new Error('Organization not found');
  }

  return {
    ...result.org,
    members: result.members,
  };
}

export interface JoinOrgServiceParams {
  db: D1Database;
  token: string;
  userId: string;
}

export async function joinOrgService({ db, token, userId }: JoinOrgServiceParams): Promise<Organization> {
  const org = await findOrgByToken(db, token);

  if (!org) {
    throw new Error('Organization not found');
  }

  const existingMember = await findMemberByUserAndOrg(db, userId, org.id);
  if (existingMember) {
    throw new Error('Already a member');
  }

  const member: OrganizationMember = {
    id: generateId(),
    orgId: org.id,
    userId,
    isFounder: false,
    isAdmin: false,
    department: null,
    role: 'Member',
    joinedAt: new Date(),
  };

  await createOrgMember(db, member);

  return org;
}

export async function joinOrgWithMembersService({ db, token, userId }: JoinOrgServiceParams): Promise<OrganizationWithMembersAndUser> {
  const org = await findOrgByToken(db, token);

  if (!org) {
    throw new Error('Organization not found');
  }

  const existingMember = await findMemberByUserAndOrg(db, userId, org.id);
  if (existingMember) {
    throw new Error('Already a member');
  }

  const member: OrganizationMember = {
    id: generateId(),
    orgId: org.id,
    userId,
    isFounder: false,
    isAdmin: false,
    department: null,
    role: 'Member',
    joinedAt: new Date(),
  };

  await createOrgMember(db, member);

  const result = await findOrgByIdWithMembers(db, org.id);

  if (!result) {
    throw new Error('Failed to join organization');
  }

  return {
    ...result.org,
    members: result.members,
  };
}

export interface RemoveOrgServiceParams {
  db: D1Database;
  orgId: string;
  userId: string;
}

export async function removeOrgService({ db, orgId, userId }: RemoveOrgServiceParams): Promise<void> {
  const member = await findMemberByUserAndOrg(db, userId, orgId);

  if (!member) {
    throw new Error('Not a member of this organization');
  }

  if (!member.isFounder) {
    throw new Error('Only founders can remove the organization');
  }

  await deleteOrgMembers(db, orgId);
  await deleteOrg(db, orgId);
}

export interface UpdateOrgServiceParams {
  db: D1Database;
  orgId: string;
  userId: string;
  input: UpdateOrgInput;
}

export async function updateOrgService({ db, orgId, userId, input }: UpdateOrgServiceParams): Promise<Organization> {
  const member = await findMemberByUserAndOrg(db, userId, orgId);

  if (!member) {
    throw new Error('Not a member of this organization');
  }

  if (!member.isFounder && !member.isAdmin) {
    throw new Error('Only founders or admins can update the organization');
  }

  await updateOrgCrud(db, orgId, {
    name: input.name,
    description: input.description ?? null,
    logo: input.logo ?? null,
  });

  const updatedOrg = await findOrgById(db, orgId);
  if (!updatedOrg) {
    throw new Error('Organization not found');
  }

  return updatedOrg;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'milestone' | 'task';
}

export async function getOrgDashboardService({
  db,
  orgId,
}: {
  db: D1Database;
  orgId: string;
}): Promise<{ milestones: number; tasks: number; employees: number; calendarEvents: CalendarEvent[] }> {
  const { countMilestonesByOrgId, findMilestonesByOrgId } = await import('../milestones/milestones.crud');
  const { countTasksByToken, findTasksByToken } = await import('../tasks/tasks.crud');
  const { countEmployeesByOrgId } = await import('../employees/employees.crud');

  const org = await findOrgById(db, orgId);
  if (!org) {
    throw new Error('Organization not found');
  }

  const [milestones, tasks, employees, allMilestones, allTasks] = await Promise.all([
    countMilestonesByOrgId(db, orgId),
    countTasksByToken(db, org.token),
    countEmployeesByOrgId(db, orgId),
    findMilestonesByOrgId(db, orgId, 1, 100),
    findTasksByToken(db, org.token, 1, 100),
  ]);

  const calendarEvents: CalendarEvent[] = [];

  for (const milestone of allMilestones) {
    if (milestone.startingDate || milestone.endingDate) {
      calendarEvents.push({
        id: milestone.id,
        title: milestone.name,
        start: new Date(milestone.startingDate || milestone.endingDate),
        end: milestone.endingDate ? new Date(milestone.endingDate) : new Date(milestone.startingDate || milestone.endingDate),
        type: 'milestone',
      });
    }
  }

  for (const task of allTasks) {
    if (task.startingDate || task.dueDate) {
      calendarEvents.push({
        id: task.id,
        title: task.title,
        start: new Date(task.startingDate || task.dueDate),
        end: new Date(task.dueDate || task.startingDate),
        type: 'task',
      });
    }
  }

  return { milestones, tasks, employees, calendarEvents };
}

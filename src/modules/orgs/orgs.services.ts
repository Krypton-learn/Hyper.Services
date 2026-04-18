import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../../lib/id.lib';
import { generateOrgKey } from '../../lib/token.lib';
import { CreateOrgInput, UpdateOrgInput, Organization, OrganizationMember, OrganizationWithMembers } from './orgs.schema';
import { createOrg, createOrgMember, findOrgsByUserId, findOrgByToken, findMemberByUserAndOrg, deleteOrgMembers, deleteOrg, updateOrg as updateOrgCrud, findOrgById, findOrgByIdWithMembers } from './orgs.crud';

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

export interface GetUserOrgsServiceParams {
  db: D1Database;
  userId: string;
}

export async function getUserOrgsService({ db, userId }: GetUserOrgsServiceParams): Promise<Organization[]> {
  return await findOrgsByUserId(db, userId);
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
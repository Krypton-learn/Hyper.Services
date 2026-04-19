import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../../lib/id.lib';
import { CreateMilestoneInput, UpdateMilestoneInput, Milestone, MilestoneWithCreator } from './milestones.schema';
import { createMilestone, findMilestonesByOrgId, findMilestoneById, updateMilestone, deleteMilestone } from './milestones.crud';
import { findOrgByToken } from '../orgs/orgs.crud';

export interface CreateMilestoneServiceParams {
  db: D1Database;
  input: CreateMilestoneInput;
  userId: string;
}

export async function createMilestoneService({ db, input, userId }: CreateMilestoneServiceParams): Promise<Milestone> {
  const milestone: Milestone = {
    id: generateId(),
    name: input.name,
    description: input.description,
    budget: input.budget,
    category: input.category,
    orgId: input.orgId,
    createdBy: userId,
    createdAt: new Date(),
    startingDate: input.startingDate,
    endingDate: input.endingDate,
  };

  await createMilestone(db, milestone);

  return milestone;
}

export interface GetOrgMilestonesServiceParams {
  db: D1Database;
  orgToken: string;
}

export async function getOrgMilestonesService({ db, orgToken }: GetOrgMilestonesServiceParams): Promise<MilestoneWithCreator[]> {
  const org = await findOrgByToken(db, orgToken);
  if (!org) {
    throw new Error('Organization not found');
  }
  return await findMilestonesByOrgId(db, org.id);
}

export interface UpdateMilestoneServiceParams {
  db: D1Database;
  milestoneId: string;
  input: UpdateMilestoneInput;
  userId: string;
}

export async function updateMilestoneService({ db, milestoneId, input, userId }: UpdateMilestoneServiceParams): Promise<Milestone> {
  const milestone = await findMilestoneById(db, milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.createdBy !== userId) {
    throw new Error('Only the creator can update this milestone');
  }

  await updateMilestone(db, milestoneId, {
    name: input.name,
    description: input.description ?? null,
    budget: input.budget ?? null,
    category: input.category ?? null,
    startingDate: input.startingDate ?? null,
    endingDate: input.endingDate ?? null,
  });

  const updated = await findMilestoneById(db, milestoneId);
  if (!updated) {
    throw new Error('Milestone not found');
  }

  return updated;
}

export interface RemoveMilestoneServiceParams {
  db: D1Database;
  milestoneId: string;
  userId: string;
}

export async function removeMilestoneService({ db, milestoneId, userId }: RemoveMilestoneServiceParams): Promise<void> {
  const milestone = await findMilestoneById(db, milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.createdBy !== userId) {
    throw new Error('Only the creator can delete this milestone');
  }

  await deleteMilestone(db, milestoneId);
}
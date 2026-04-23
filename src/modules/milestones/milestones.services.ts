import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../../lib/id.lib';
import { CreateMilestoneInput, UpdateMilestoneInput, Milestone, MilestoneWithCreator } from '../../../packages/schemas/milestones.schema';
import { createMilestone, findMilestonesByOrgId, findMilestoneById, updateMilestone, deleteMilestone, countMilestonesByOrgId } from './milestones.crud';

export interface CreateMilestoneServiceParams {
  db: D1Database;
  input: CreateMilestoneInput;
  userId: string;
  orgId: string;
}

export async function createMilestoneService({ db, input, orgId, userId }: CreateMilestoneServiceParams): Promise<Milestone> {
  const milestone: Milestone = {
    id: generateId(),
    name: input.name,
    description: input.description,
    budget: input.budget,
    category: input.category,
    orgId: orgId,
    createdBy: userId,
    createdAt: new Date(),
    startingDate: input.startingDate,
    endingDate: input.endingDate,
  };

  await createMilestone(db, milestone);

  return milestone;
}

export interface GetMilestonesServiceParams {
  db: D1Database;
  orgId: string;
  page?: number;
  limit?: number;
}

export async function getMilestonesService({ db, orgId, page = 1, limit = 10 }: GetMilestonesServiceParams): Promise<{ milestones: MilestoneWithCreator[]; total: number }> {
  const milestones = await findMilestonesByOrgId(db, orgId, page, limit);
  const total = await countMilestonesByOrgId(db, orgId);
  return { milestones, total };
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

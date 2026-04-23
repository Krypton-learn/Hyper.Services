import { Context } from 'hono';
import { createMilestoneSchema, updateMilestoneSchema } from '../../../packages/schemas/milestones.schema';
import { createMilestoneService, getMilestonesService, updateMilestoneService, removeMilestoneService } from './milestones.services';
import { verifyJwt } from '../../lib/jwt.lib';
import { findMemberByUserAndOrg, findOrgById } from '../orgs/orgs.crud';

export async function createMilestoneController(c: Context) {
  const orgId = c.req.param('orgID');

  if (!orgId) {
    return c.json({
      error: "Organization Id required"
    }, 400);
  }

  const body = await c.req.json();

  const parsed = createMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;
  const org = await findOrgById(db, orgId);
  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  const member = await findMemberByUserAndOrg(db, jwt.sub, orgId);
  if (!member) {
    return c.json({ error: 'You are not a member of this organization' }, 403);
  }

  if (!member.isFounder) {
    return c.json({ error: 'Only founders can create milestones' }, 403);
  }

  const milestone = await createMilestoneService({
    db,
    input: parsed.data,
    orgId: orgId,
    userId: jwt.sub,
  });

  return c.json({ milestone }, 201);
}

export async function getMilestonesController(c: Context) {
  const orgId = c.req.param('orgId');
  const pages = c.req.query('pages');
  const offset = c.req.query('offset');

  if (!orgId) {
    return c.json({ error: 'Organization ID is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  const org = await findOrgById(db, orgId);
  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  const member = await findMemberByUserAndOrg(db, jwt.sub, orgId);
  if (!member) {
    return c.json({ error: 'You are not a member of this organization' }, 403);
  }

  if (pages && offset) {
    const page = parseInt(pages);
    const limit = parseInt(offset);

    const { milestones, total } = await getMilestonesService({
      db,
      orgId,
      page,
      limit,
    });

    return c.json({ milestones, total, page, limit }, 200);
  }

  const milestones = await getMilestonesService({
    db,
    orgId,
  });

  return c.json({ milestones }, 200);
}

export async function updateMilestoneController(c: Context) {
  const milestoneId = c.req.param('id');

  if (!milestoneId) {
    return c.json({ error: 'Milestone ID is required' }, 400);
  }

  const body = await c.req.json();

  const parsed = updateMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    const milestone = await updateMilestoneService({
      db,
      milestoneId,
      input: parsed.data,
      userId: jwt.sub,
    });

    return c.json({ milestone }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update milestone';
    if (message === 'Milestone not found') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Only the creator can update this milestone') {
      return c.json({ error: message }, 403);
    }
    return c.json({ error: message }, 400);
  }
}

export async function removeMilestoneController(c: Context) {
  const milestoneId = c.req.param('id');

  if (!milestoneId) {
    return c.json({ error: 'Milestone ID is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    await removeMilestoneService({
      db,
      milestoneId,
      userId: jwt.sub,
    });

    return c.json({ message: 'Milestone deleted successfully' }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to delete milestone';
    if (message === 'Milestone not found') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Only the creator can delete this milestone') {
      return c.json({ error: message }, 403);
    }
    return c.json({ error: message }, 400);
  }
}

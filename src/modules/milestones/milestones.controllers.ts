import { Context } from 'hono';
import { createMilestoneSchema, updateMilestoneSchema } from './milestones.schema';
import { createMilestoneService, getOrgMilestonesService, updateMilestoneService, removeMilestoneService } from './milestones.services';
import { verifyJwt } from '../../lib/jwt.lib';
import { findMemberByUserAndOrg, findOrgByToken } from '../orgs/orgs.crud';

export async function createMilestoneController(c: Context) {
  const body = await c.req.json();
  
  const parsed = createMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);
  
  const db = c.env.DB;
  const { orgId, ...milestoneInput } = parsed.data;
  
  const member = await findMemberByUserAndOrg(db, jwt.sub, orgId);
  if (!member) {
    return c.json({ error: 'You are not a member of this organization' }, 403);
  }

  if (!member.isFounder) {
    return c.json({ error: 'Only founders can create milestones' }, 403);
  }
  
  const milestone = await createMilestoneService({ 
    db, 
    input: {
      ...milestoneInput,
      orgId,
    },
    userId: jwt.sub,
  });
  
  return c.json({ milestone }, 201);
}

export async function getOrgMilestonesController(c: Context) {
  const body = await c.req.json();
  const orgToken = body.orgToken as string;

  if (!orgToken) {
    return c.json({ error: 'Organization token is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);
  
  const db = c.env.DB;
  
  const org = await findOrgByToken(db, orgToken);
  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  const member = await findMemberByUserAndOrg(db, jwt.sub, org.id);
  if (!member) {
    return c.json({ error: 'You are not a member of this organization' }, 403);
  }

  const milestones = await getOrgMilestonesService({ 
    db, 
    orgToken,
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
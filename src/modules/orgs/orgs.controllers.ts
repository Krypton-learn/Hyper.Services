import { Context } from 'hono';
import { createOrgSchema, joinOrgSchema, updateOrgSchema } from '../../../packages/schemas/orgs.schema';
import { createOrgService, getUserOrgsService, getOrgService, joinOrgService, removeOrgService, updateOrgService, createOrgWithMembersService, joinOrgWithMembersService } from './orgs.services';
import { verifyJwt } from '../../lib/jwt.lib';
import { findMemberByUserAndOrg, findOrgById } from './orgs.crud';

export async function createOrgController(c: Context) {
  const body = await c.req.json();

  const parsed = createOrgSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;
  const org = await createOrgWithMembersService({
    db,
    input: parsed.data,
    userId: jwt.sub,
  });

  return c.json({ org }, 201);
}

export async function getUserOrgsController(c: Context) {
  const jwt = await verifyJwt(c, c.env.JWT_SECRET);
  const pages = c.req.query('pages');
  const offset = c.req.query('offset');

  const db = c.env.DB;

  if (pages && offset) {
    const page = parseInt(pages);
    const limit = parseInt(offset);

    const { orgs, total } = await getUserOrgsService({
      db,
      userId: jwt.sub,
      page,
      limit,
    });

    return c.json({ orgs, total, page, limit }, 200);
  }

  const { orgs, total } = await getUserOrgsService({
    db,
    userId: jwt.sub,
  });

  return c.json({ orgs, total }, 200);
}

export async function getOrgController(c: Context) {
  const orgId = c.req.param('id');

  if (!orgId) {
    return c.json({ error: 'Organization ID is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    const org = await getOrgService({
      db,
      orgId,
    });

    return c.json({ org }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to get organization';
    if (message === 'Organization not found') {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: message }, 400);
  }
}

export async function joinOrgController(c: Context) {
  const body = await c.req.json();

  const parsed = joinOrgSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    const org = await joinOrgWithMembersService({
      db,
      token: parsed.data.token,
      userId: jwt.sub,
    });

    return c.json({ org, message: 'Successfully joined organization' }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid organization token';
    if (message === 'Already a member') {
      return c.json({ error: message }, 409);
    }
    return c.json({ error: message }, 400);
  }
}

export async function removeOrgController(c: Context) {
  const orgId = c.req.param('id');

  if (!orgId) {
    return c.json({ error: 'Organization ID is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    await removeOrgService({
      db,
      orgId,
      userId: jwt.sub,
    });

    return c.json({ message: 'Organization removed successfully' }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to remove organization';
    if (message === 'Only founders can remove the organization') {
      return c.json({ error: message }, 403);
    }
    if (message === 'Not a member of this organization') {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: message }, 400);
  }
}

export async function updateOrgController(c: Context) {
  const orgId = c.req.param('id');

  if (!orgId) {
    return c.json({ error: 'Organization ID is required' }, 400);
  }

  const body = await c.req.json();

  const parsed = updateOrgSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    const org = await updateOrgService({
      db,
      orgId,
      userId: jwt.sub,
      input: parsed.data,
    });

    return c.json({ org }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update organization';
    if (message === 'Only founders or admins can update the organization') {
      return c.json({ error: message }, 403);
    }
    if (message === 'Not a member of this organization') {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: message }, 400);
  }
}

export async function getOrgDashboardController(c: Context) {
  const orgId = c.req.param('orgId');

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

  const { getOrgDashboardService } = await import('./orgs.services');
  const stats = await getOrgDashboardService({ db, orgId });

  return c.json(stats, 200);
}

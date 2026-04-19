import { Context } from 'hono';
import { createOrgSchema, joinOrgSchema, updateOrgSchema } from './orgs.schema';
import { createOrgService, getUserOrgsService, getOrgService, joinOrgService, removeOrgService, updateOrgService } from './orgs.services';
import { verifyJwt } from '../../lib/jwt.lib';

export async function createOrgController(c: Context) {
  const body = await c.req.json();

  const parsed = createOrgSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;
  const org = await createOrgService({
    db,
    input: parsed.data,
    userId: jwt.sub,
  });

  return c.json({ org }, 201);
}

export async function getUserOrgsController(c: Context) {
  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;
  const orgs = await getUserOrgsService({
    db,
    userId: jwt.sub,
  });

  return c.json({ orgs }, 200);
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
    const org = await joinOrgService({
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

import type { Context } from 'hono'
import {
  createOrgsService,
  getOrgsService,
  getOrgsByIdService,
  removeOrgsService,
  editOrgsService,
} from './orgs.services'
import {
  createOrgSchema,
  updateOrgSchema,
  orgIdSchema,
} from 'packages/schemas'
import { getUserIdFromToken } from './orgs.helpers'

export async function createOrgController(c: Context) {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const body = await c.req.json()

    const validated = createOrgSchema.safeParse(body)
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const org = await createOrgsService({
      ...validated.data,
      founder: userId,
    })

    return c.json({ message: 'Organization created successfully', org }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create organization'
    return c.json({ error: message }, 400)
  }
}

export async function getAllOrgController(c: Context) {
  try {
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = 20
    const skip = (page - 1) * limit
    const populate = c.req.query('populate') === 'true'
    
    const orgs = await getOrgsService(skip, limit, populate)
    return c.json({ orgs, page, limit }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch organizations'
    return c.json({ error: message }, 400)
  }
}

export async function getOrgByIdController(c: Context) {
  try {
    const id = c.req.param('id')

    const validated = orgIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const org = await getOrgsByIdService(id)
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404)
    }

    return c.json({ org }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch organization'
    return c.json({ error: message }, 400)
  }
}

export async function deleteOrgController(c: Context) {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const id = c.req.param('id')

    const validated = orgIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const org = await getOrgsByIdService(id)
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404)
    }

    if (org.founder.toString() !== userId) {
      return c.json({ error: 'Only founder can delete the organization' }, 403)
    }

    const deleted = await removeOrgsService(id)
    if (!deleted) {
      return c.json({ error: 'Failed to delete organization' }, 400)
    }

    return c.json({ message: 'Organization deleted successfully' }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete organization'
    return c.json({ error: message }, 400)
  }
}

export async function editOrgController(c: Context) {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const id = c.req.param('id')
    const body = await c.req.json()

    const idValidated = orgIdSchema.safeParse({ id })
    if (!idValidated.success) {
      return c.json({ error: idValidated.error }, 400)
    }

    const bodyValidated = updateOrgSchema.safeParse(body)
    if (!bodyValidated.success) {
      return c.json({ error: bodyValidated.error }, 400)
    }

    const org = await getOrgsByIdService(id)
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404)
    }

    const isFounder = org.founder.toString() === userId
    const isAdmin = (org.admin as unknown as string[])?.includes(userId)

    if (!isFounder && !isAdmin) {
      return c.json({ error: 'Only founder or admin can update the organization' }, 403)
    }

    const updatedOrg = await editOrgsService(id, bodyValidated.data)
    if (!updatedOrg) {
      return c.json({ error: 'Failed to update organization' }, 400)
    }

    return c.json({ message: 'Organization updated successfully', org: updatedOrg }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update organization'
    return c.json({ error: message }, 400)
  }
}
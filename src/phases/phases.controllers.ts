import type { Context } from 'hono'
import {
  createPhaseService,
  getAllPhasesService,
  getPhaseByIdService,
  deletePhaseService,
  updatePhaseService,
} from './phases.services'
import {
  createPhaseSchema,
  updatePhaseSchema,
  phaseIdSchema,
} from './phases.validators'
import { getUserIdFromToken } from './phases.helpers'
import { getOrgsByIdService } from '../organizations/orgs.services'

async function validateOrganizationFounder(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const organization = await getOrgsByIdService(organizationId)
  if (!organization) {
    return false
  }
  return organization.founder.toString() === userId
}

export async function createPhaseController(c: Context) {
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

    const validated = createPhaseSchema.safeParse(body)
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const isFounder = await validateOrganizationFounder(
      validated.data.organization,
      userId
    )
    if (!isFounder) {
      return c.json({ error: 'Only organization founder can create phases' }, 403)
    }

    const phase = await createPhaseService(validated.data)

    return c.json({ message: 'Phase created successfully', phase }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create phase'
    return c.json({ error: message }, 400)
  }
}

export async function getAllPhasesController(c: Context) {
  try {
    const phases = await getAllPhasesService()
    return c.json({ phases }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch phases'
    return c.json({ error: message }, 400)
  }
}

export async function getPhaseByIdController(c: Context) {
  try {
    const id = c.req.param('id')

    const validated = phaseIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const phase = await getPhaseByIdService(id)
    if (!phase) {
      return c.json({ error: 'Phase not found' }, 404)
    }

    return c.json({ phase }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch phase'
    return c.json({ error: message }, 400)
  }
}

export async function deletePhaseController(c: Context) {
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

    const validated = phaseIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const phase = await getPhaseByIdService(id)
    if (!phase) {
      return c.json({ error: 'Phase not found' }, 404)
    }

    const organizationId = phase.organization.toString()
    const isFounder = await validateOrganizationFounder(organizationId, userId)
    if (!isFounder) {
      return c.json({ error: 'Only organization founder can delete phases' }, 403)
    }

    const deleted = await deletePhaseService(id)
    if (!deleted) {
      return c.json({ error: 'Failed to delete phase' }, 400)
    }

    return c.json({ message: 'Phase deleted successfully' }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete phase'
    return c.json({ error: message }, 400)
  }
}

export async function updatePhaseController(c: Context) {
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

    const idValidated = phaseIdSchema.safeParse({ id })
    if (!idValidated.success) {
      return c.json({ error: idValidated.error }, 400)
    }

    const bodyValidated = updatePhaseSchema.safeParse(body)
    if (!bodyValidated.success) {
      return c.json({ error: bodyValidated.error }, 400)
    }

    const phase = await getPhaseByIdService(id)
    if (!phase) {
      return c.json({ error: 'Phase not found' }, 404)
    }

    const organizationId = phase.organization.toString()
    const isFounder = await validateOrganizationFounder(organizationId, userId)
    if (!isFounder) {
      return c.json({ error: 'Only organization founder can update phases' }, 403)
    }

    const updatedPhase = await updatePhaseService(id, bodyValidated.data)
    if (!updatedPhase) {
      return c.json({ error: 'Failed to update phase' }, 400)
    }

    return c.json({ message: 'Phase updated successfully', phase: updatedPhase }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update phase'
    return c.json({ error: message }, 400)
  }
}
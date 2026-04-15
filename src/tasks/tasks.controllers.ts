import type { Context } from 'hono'
import {
  createTaskService,
  getAllTaskService,
  getTaskByIdService,
  deleteTaskService,
  editTaskService,
  type PopulateOptions,
} from './tasks.services'
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from 'packages/schemas'
import { getUserIdFromToken } from './tasks.helpers'

function parsePopulateQuery(c: Context): PopulateOptions | undefined {
  const populate = c.req.query('populate')
  if (!populate) return undefined

  return {
    created_by: populate.includes('created_by'),
    assigned_to: populate.includes('assigned_to'),
  }
}

export async function createTaskController(c: Context) {
  try {
    const body = await c.req.json()

    const validated = createTaskSchema.safeParse(body)
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const task = await createTaskService({
      ...validated.data,
      created_by: userId,
    })

    return c.json({ message: 'Task created successfully', task }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task'
    return c.json({ error: message }, 400)
  }
}

export async function getAllTaskController(c: Context) {
  try {
    const populate = parsePopulateQuery(c)
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = 20
    const skip = (page - 1) * limit
    
    const tasks = await getAllTaskService(populate, skip, limit)
    return c.json({ tasks, page, limit }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks'
    return c.json({ error: message }, 400)
  }
}

export async function getTaskByIdController(c: Context) {
  try {
    const id = c.req.param('id')

    const validated = taskIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const populate = parsePopulateQuery(c)
    const task = await getTaskByIdService(id, populate)
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ task }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch task'
    return c.json({ error: message }, 400)
  }
}

export async function deleteTaskController(c: Context) {
  try {
    const id = c.req.param('id')

    const validated = taskIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const deleted = await deleteTaskService(id)
    if (!deleted) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ message: 'Task deleted successfully' }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task'
    return c.json({ error: message }, 400)
  }
}

export async function editTaskController(c: Context) {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()

    const idValidated = taskIdSchema.safeParse({ id })
    if (!idValidated.success) {
      return c.json({ error: idValidated.error }, 400)
    }

    const bodyValidated = updateTaskSchema.safeParse(body)
    if (!bodyValidated.success) {
      return c.json({ error: bodyValidated.error }, 400)
    }

    const task = await editTaskService(id, bodyValidated.data)
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ message: 'Task updated successfully', task }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task'
    return c.json({ error: message }, 400)
  }
}

export async function completeTaskController(c: Context) {
  try {
    const id = c.req.param('id')

    const validated = taskIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const task = await editTaskService(id, { status: 'Completed' })
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ message: 'Task completed successfully', task }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete task'
    return c.json({ error: message }, 400)
  }
}

export async function addTeamMembersController(c: Context) {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()

    const validated = taskIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    // TODO: Update Controller to include actual ids' of the user!

    if (!body.tempTeamMembers || !Array.isArray(body.tempTeamMembers)) {
      return c.json({ error: 'tempTeamMembers array is required' }, 400)
    }

    const task = await editTaskService(id, { tempTeamMembers: body.tempTeamMembers })
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ message: 'Team members added successfully', task }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add team members'
    return c.json({ error: message }, 400)
  }
}

export async function joinTeamController(c: Context) {
  try {
    const id = c.req.param('id')

    const validated = taskIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const task = await editTaskService(id, { team: [userId] })
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    return c.json({ message: 'Joined team successfully', task }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join team'
    return c.json({ error: message }, 400)
  }
}

export async function rejectTeamController(c: Context) {
  try {
    const id = c.req.param('id')

    const validated = taskIdSchema.safeParse({ id })
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const task = await getTaskByIdService(id)
    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const currentTempMembers = (task.tempTeamMembers as unknown as string[]) || []
    const updatedTempMembers = currentTempMembers.filter(
      (memberId) => memberId.toString() !== userId
    )

    const updatedTask = await editTaskService(id, { tempTeamMembers: updatedTempMembers })

    return c.json({ message: 'Rejected team invitation successfully', task: updatedTask }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject team invitation'
    return c.json({ error: message }, 400)
  }
}

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
} from './tasks.validators'
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
		const tasks = await getAllTaskService(populate)
		return c.json({ tasks }, 200)
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
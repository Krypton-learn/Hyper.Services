import { Context } from 'hono'
import { createTaskSchema, CreateTaskInput, updateTaskSchema, UpdateTaskInput, taskParamsSchema, TaskParams, paginationSchema, completeTaskSchema, CompleteTaskInput } from '@packages/schemas/tasks.schema'
import { createTasksCRUD, getTaskCRUD, getTasksCRUD, updateTaskCRUD, deleteTaskCRUD, completeTaskCRUD, createOrganizationTaskCRUD, getOrganizationTaskCRUD, getOrganizationTasksCRUD, updateOrganizationTaskCRUD, deleteOrganizationTaskCRUD, completeOrganizationTaskCRUD } from './tasks.crud'
import { verifyAuth } from '@/lib/auth'
import { getTaskResponseSchema } from '@packages/schemas/tasks.responses'
import { NotificationService } from '@/modules/notification/notification.service'
import type { NotificationEnv } from '@/modules/notification/notification.push'

const getRoutingInfo = (c: Context) => {
  const accountType = (c.get('accountType') as string) || 'Personal'
  const isOrgUser = accountType === 'Organization'
  return { accountType, isOrgUser }
}

export const createTasksController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  const body = await c.req.json()
  const parsed = createTaskSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const data = parsed.data as CreateTaskInput

  if (data.startingDate) {
    const startDate = new Date(data.startingDate)
    if (isNaN(startDate.getTime())) return c.json({ errors: { startingDate: ['Invalid date format'] } }, 400)
  }

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline)
    if (isNaN(deadlineDate.getTime())) return c.json({ errors: { deadline: ['Invalid date format'] } }, 400)
  }

  if (data.startingDate && data.deadline) {
    const startDate = new Date(data.startingDate)
    const deadlineDate = new Date(data.deadline)
    if (deadlineDate < startDate) return c.json({ errors: { deadline: ['Deadline must be after starting date'] } }, 400)
  }

  let task
  if (isOrgUser) {
    task = await createOrganizationTaskCRUD(c.env.DB, data, userId)
  } else {
    task = await createTasksCRUD(c.env.DB, data, userId)
  }

  return c.json(task)
}

export const getTasksController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  const query = c.req.query()
  const parsed = paginationSchema.safeParse(query)

  if (!parsed.success) {
    return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const { page } = parsed.data

  let tasks
  if (isOrgUser) {
    tasks = await getOrganizationTasksCRUD(c.env.DB, page, userId)
  } else {
    tasks = await getTasksCRUD(c.env.DB, page, userId)
  }

  return c.json({ results: tasks.results || [], success: true })
}

export const getTaskController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  const params = c.req.param()
  const parsed = taskParamsSchema.safeParse(params)

  if (!parsed.success) {
    return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const { id } = parsed.data as TaskParams

  if (isOrgUser) {
    const task = await getOrganizationTaskCRUD(c.env.DB, id)
    if (!task) return c.json({ errors: { id: ['Task not found'] } }, 404)
    return c.json(task)
  }

  const task = await getTaskCRUD(c.env.DB, id)
  if (!task) return c.json({ errors: { id: ['Task not found'] } }, 404)
  return c.json(task)
}

export const updateTaskController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  const params = c.req.param()
  const body = await c.req.json()

  const paramsParsed = taskParamsSchema.safeParse(params)
  if (!paramsParsed.success) {
    return c.json({ message: 'Validation failed', errors: paramsParsed.error.flatten().fieldErrors }, 400)
  }

  const dataParsed = updateTaskSchema.safeParse(body)
  if (!dataParsed.success) {
    return c.json({ message: 'Validation failed', errors: dataParsed.error.flatten().fieldErrors }, 400)
  }

  const { id } = paramsParsed.data as TaskParams
  const data = dataParsed.data as UpdateTaskInput

  let existing
  if (isOrgUser) {
    existing = await getOrganizationTaskCRUD(c.env.DB, id)
  } else {
    existing = await getTaskCRUD(c.env.DB, id)
  }

  if (!existing) return c.json({ errors: { id: ['Task not found'] } }, 404)

  if (data.startingDate || data.deadline) {
    if (data.startingDate) {
      const startDate = new Date(data.startingDate)
      if (isNaN(startDate.getTime())) return c.json({ errors: { startingDate: ['Invalid date format'] } }, 400)
    }
    if (data.deadline) {
      const deadlineDate = new Date(data.deadline)
      if (isNaN(deadlineDate.getTime())) return c.json({ errors: { deadline: ['Invalid date format'] } }, 400)
    }

    const startDate = data.startingDate ? new Date(data.startingDate) : new Date(existing.startingDate as string)
    const deadlineDate = data.deadline ? new Date(data.deadline) : new Date(existing.deadline as string)
    if (deadlineDate < startDate) return c.json({ errors: { deadline: ['Deadline must be after starting date'] } }, 400)
  }

  const task = isOrgUser
    ? await updateOrganizationTaskCRUD(c.env.DB, id, data)
    : await updateTaskCRUD(c.env.DB, id, data)

  if (!task) return c.json({ errors: { id: ['Task not found'] } }, 404)
  return c.json(task)
}

export const deleteTaskController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  const params = c.req.param()
  const parsed = taskParamsSchema.safeParse(params)

  if (!parsed.success) {
    return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const { id } = parsed.data as TaskParams

  if (isOrgUser) {
    const task = await deleteOrganizationTaskCRUD(c.env.DB, id)
    if (!task) return c.json({ errors: { id: ['Task not found'] } }, 404)
    return c.json({ message: 'Task deleted successfully' })
  }

  const task = await deleteTaskCRUD(c.env.DB, id)
  if (!task) return c.json({ errors: { id: ['Task not found'] } }, 404)
  return c.json({ message: 'Task deleted successfully' })
}

export const completeTaskController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  const params = c.req.param()
  const parsed = completeTaskSchema.safeParse(params)

  if (!parsed.success) {
    return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const { id } = parsed.data as CompleteTaskInput

  let existing
  if (isOrgUser) {
    existing = await getOrganizationTaskCRUD(c.env.DB, id)
  } else {
    existing = await getTaskCRUD(c.env.DB, id)
  }

  if (!existing) return c.json({ errors: { id: ['Task not found'] } }, 404)

  let updated
  if (isOrgUser) {
    await completeOrganizationTaskCRUD(c.env.DB, id)
    updated = await getOrganizationTaskCRUD(c.env.DB, id)
  } else {
    await completeTaskCRUD(c.env.DB, id)
    updated = await getTaskCRUD(c.env.DB, id)
  }

  const validated = getTaskResponseSchema.safeParse(updated)
  if (!validated.success) return c.json({ errors: { general: ['Failed to validate task'] } }, 500)

  try {
    const notificationService = new NotificationService(c.env.DB, c.env as NotificationEnv)
    await notificationService.sendNotification({ title: 'Task Completed!', body: `${updated?.title || 'A task'} has been completed` })
  } catch (err) {
    console.error('Notification error:', err)
  }

  return c.json({ message: 'Task completed successfully', task: validated.data })
}

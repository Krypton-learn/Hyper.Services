import { ObjectId } from 'mongodb'
import { taskSchema } from './tasks.schemas'
import {
  insertTask,
  findAllTasks,
  aggregateTasks,
  findTaskById,
  findTaskByIdWithAggregate,
  deleteTaskById,
  updateTaskById,
} from './tasks.crud'

const DEFAULT_ASSIGNED_TO = '69dc781521409728aa1a84b1'

export interface CreateTaskInput {
  title: string
  created_by: string
  assigned_to?: string
  starting_date?: Date
  due_date?: Date
  status?: 'Due' | 'Upcoming' | 'Completed'
  team?: string[]
  phase?: string
  tempTeamMembers?: string[]
  description?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
}

export interface UpdateTaskInput {
  title?: string
  assigned_to?: string
  starting_date?: Date
  due_date?: Date
  status?: 'Due' | 'Upcoming' | 'Completed'
  team?: string[]
  phase?: string
  tempTeamMembers?: string[]
  description?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
}

export interface PopulateOptions {
  created_by?: boolean
  assigned_to?: boolean
}

const EMPLOYEE_COLLECTION = 'employees'

function buildLookupStage(
  field: 'created_by' | 'assigned_to',
  as: string
): Record<string, unknown> {
  return {
    $lookup: {
      from: EMPLOYEE_COLLECTION,
      localField: field,
      foreignField: '_id',
      as,
    },
  }
}

function buildUnwindStage(as: string, preserveNull: boolean = false): Record<string, unknown> {
  return {
    $unwind: {
      path: `$${as}`,
      preserveNullAndEmptyArrays: preserveNull,
    },
  }
}

export async function createTaskService(input: CreateTaskInput) {
  const task = {
    title: input.title,
    created_by: new ObjectId(input.created_by),
    created_at: new Date(),
    assigned_to: input.assigned_to
      ? new ObjectId(input.assigned_to)
      : new ObjectId(DEFAULT_ASSIGNED_TO),
    starting_date: input.starting_date || null,
    due_date: input.due_date || null,
    status: input.status || 'Upcoming',
    team: input.team ? input.team.map((id) => new ObjectId(id)) : [new ObjectId(input.created_by)],
    phase: input.phase ? new ObjectId(input.phase) : null,
    tempTeamMembers: input.tempTeamMembers
      ? input.tempTeamMembers.map((id) => new ObjectId(id))
      : [],
    description: input.description || null,
    priority: input.priority || 'Medium',
  }

  return insertTask(task)
}

export async function getAllTaskService(populate?: PopulateOptions, skip: number = 0, limit: number = 20) {
  if (!populate) {
    return findAllTasks(skip, limit)
  }

  const pipeline: Record<string, unknown>[] = [{ $match: {} }]

  if (populate.created_by) {
    pipeline.push(buildLookupStage('created_by', 'created_by_user'))
    pipeline.push(buildUnwindStage('created_by_user', true))
  }

  if (populate.assigned_to) {
    pipeline.push(buildLookupStage('assigned_to', 'assigned_to_user'))
    pipeline.push(buildUnwindStage('assigned_to_user', true))
  }

  const tasks = await aggregateTasks(pipeline, skip, limit)

  return tasks.map((task) => {
    if (populate.created_by && task.created_by_user) {
      const { passwordHash, ...user } = task.created_by_user
      task.created_by = user
      delete task.created_by_user
    }
    if (populate.assigned_to && task.assigned_to_user) {
      const { passwordHash, ...user } = task.assigned_to_user
      task.assigned_to = user
      delete task.assigned_to_user
    }
    return task
  })
}

export async function getTaskByIdService(id: string, populate?: PopulateOptions) {
  const objectId = new ObjectId(id)

  if (!populate) {
    return findTaskById(objectId)
  }

  const pipeline: Record<string, unknown>[] = [{ $match: { _id: objectId } }]

  if (populate.created_by) {
    pipeline.push(buildLookupStage('created_by', 'created_by_user'))
    pipeline.push(buildUnwindStage('created_by_user', true))
  }

  if (populate.assigned_to) {
    pipeline.push(buildLookupStage('assigned_to', 'assigned_to_user'))
    pipeline.push(buildUnwindStage('assigned_to_user', true))
  }

  const tasks = await findTaskByIdWithAggregate(objectId, pipeline)
  const task = tasks[0]

  if (!task) return null

  if (populate.created_by && task.created_by_user) {
    const { passwordHash, ...user } = task.created_by_user
    task.created_by = user
    delete task.created_by_user
  }
  if (populate.assigned_to && task.assigned_to_user) {
    const { passwordHash, ...user } = task.assigned_to_user
    task.assigned_to = user
    delete task.assigned_to_user
  }

  return task
}

export async function deleteTaskService(id: string) {
  return deleteTaskById(new ObjectId(id))
}

export async function editTaskService(id: string, input: UpdateTaskInput) {
  const updateFields: Record<string, unknown> = {}

  if (input.title) updateFields.title = input.title
  if (input.assigned_to) updateFields.assigned_to = new ObjectId(input.assigned_to)
  if (input.starting_date) updateFields.starting_date = input.starting_date
  if (input.due_date) updateFields.due_date = input.due_date
  if (input.status) updateFields.status = input.status
  if (input.team) updateFields.team = input.team.map((id) => new ObjectId(id))
  if (input.phase) updateFields.phase = new ObjectId(input.phase)
  if (input.tempTeamMembers)
    updateFields.tempTeamMembers = input.tempTeamMembers.map((id) => new ObjectId(id))
  if (input.description) updateFields.description = input.description
  if (input.priority) updateFields.priority = input.priority

  return updateTaskById(new ObjectId(id), updateFields)
}
import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'
import { taskSchema } from './tasks.schemas'

const TASK_COLLECTION = 'tasks'
const EMPLOYEE_COLLECTION = 'employees'
const DEFAULT_ASSIGNED_TO = '69dc781521409728aa1a84b1'

export interface CreateTaskInput {
  title: string
  created_by: string
  assigned_to?: string
  starting_date?: Date
  due_date?: Date
  status?: 'Due' | 'Upcoming' | 'Completed'
}

export interface UpdateTaskInput {
  title?: string
  assigned_to?: string
  starting_date?: Date
  due_date?: Date
  status?: 'Due' | 'Upcoming' | 'Completed'
}

export interface PopulateOptions {
  created_by?: boolean
  assigned_to?: boolean
}

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
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)

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
  }

  const result = await collection.insertOne(task)
  return { ...task, _id: result.insertedId }
}

export async function getAllTaskService(populate?: PopulateOptions) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)

  if (!populate) {
    return await collection.find({}).toArray()
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

  const tasks = await collection.aggregate(pipeline).toArray()

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
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)

  if (!populate) {
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  const pipeline: Record<string, unknown>[] = [{ $match: { _id: new ObjectId(id) } }]

  if (populate.created_by) {
    pipeline.push(buildLookupStage('created_by', 'created_by_user'))
    pipeline.push(buildUnwindStage('created_by_user', true))
  }

  if (populate.assigned_to) {
    pipeline.push(buildLookupStage('assigned_to', 'assigned_to_user'))
    pipeline.push(buildUnwindStage('assigned_to_user', true))
  }

  const tasks = await collection.aggregate(pipeline).toArray()
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
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export async function editTaskService(id: string, input: UpdateTaskInput) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)

  const updateFields: Record<string, unknown> = {}

  if (input.title) updateFields.title = input.title
  if (input.assigned_to) updateFields.assigned_to = new ObjectId(input.assigned_to)
  if (input.starting_date) updateFields.starting_date = input.starting_date
  if (input.due_date) updateFields.due_date = input.due_date
  if (input.status) updateFields.status = input.status

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateFields },
    { returnDocument: 'after' }
  )

  return result
}

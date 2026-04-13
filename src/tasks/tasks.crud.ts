import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'

const TASK_COLLECTION = 'tasks'
const EMPLOYEE_COLLECTION = 'employees'

export async function insertTask(task: Record<string, unknown>) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  const result = await collection.insertOne(task)
  return { ...task, _id: result.insertedId }
}

export async function findAllTasks() {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  return collection.find({}).toArray()
}

export async function aggregateTasks(pipeline: Record<string, unknown>[]) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  return collection.aggregate(pipeline).toArray()
}

export async function findTaskById(id: ObjectId) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  return collection.findOne({ _id: id })
}

export async function findTaskByIdWithAggregate(id: ObjectId, pipeline: Record<string, unknown>[]) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  return collection.aggregate(pipeline).toArray()
}

export async function deleteTaskById(id: ObjectId) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  const result = await collection.deleteOne({ _id: id })
  return result.deletedCount > 0
}

export async function updateTaskById(
  id: ObjectId,
  updateFields: Record<string, unknown>
) {
  const db = getDB()
  const collection = db.collection(TASK_COLLECTION)
  return collection.findOneAndUpdate(
    { _id: id },
    { $set: updateFields },
    { returnDocument: 'after' }
  )
}
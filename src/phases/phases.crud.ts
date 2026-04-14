import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'

const PHASE_COLLECTION = 'phases'

export async function insertPhase(phase: Record<string, unknown>) {
  const db = getDB()
  const collection = db.collection(PHASE_COLLECTION)
  const result = await collection.insertOne(phase)
  return { ...phase, _id: result.insertedId }
}

export async function findAllPhases(skip: number = 0, limit: number = 20) {
  const db = getDB()
  const collection = db.collection(PHASE_COLLECTION)
  return collection.find({}).skip(skip).limit(limit).toArray()
}

export async function findPhaseById(id: ObjectId) {
  const db = getDB()
  const collection = db.collection(PHASE_COLLECTION)
  return collection.findOne({ _id: id })
}

export async function deletePhaseById(id: ObjectId) {
  const db = getDB()
  const collection = db.collection(PHASE_COLLECTION)
  const result = await collection.deleteOne({ _id: id })
  return result.deletedCount > 0
}

export async function updatePhaseById(
  id: ObjectId,
  updateFields: Record<string, unknown>
) {
  const db = getDB()
  const collection = db.collection(PHASE_COLLECTION)
  return collection.findOneAndUpdate(
    { _id: id },
    { $set: updateFields },
    { returnDocument: 'after' }
  )
}
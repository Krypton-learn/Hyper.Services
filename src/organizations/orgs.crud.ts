import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'

const ORG_COLLECTION = 'organizations'

export async function insertOrg(org: Record<string, unknown>) {
  const db = getDB()
  const collection = db.collection(ORG_COLLECTION)
  const result = await collection.insertOne(org)
  return { ...org, _id: result.insertedId }
}

export async function findAllOrgs(skip: number = 0, limit: number = 20) {
  const db = getDB()
  const collection = db.collection(ORG_COLLECTION)
  return collection.find({}).skip(skip).limit(limit).toArray()
}

export async function findOrgById(id: ObjectId) {
  const db = getDB()
  const collection = db.collection(ORG_COLLECTION)
  return collection.findOne({ _id: id })
}

export async function deleteOrgById(id: ObjectId) {
  const db = getDB()
  const collection = db.collection(ORG_COLLECTION)
  const result = await collection.deleteOne({ _id: id })
  return result.deletedCount > 0
}

export async function updateOrgById(
  id: ObjectId,
  updateFields: Record<string, unknown>
) {
  const db = getDB()
  const collection = db.collection(ORG_COLLECTION)
  return collection.findOneAndUpdate(
    { _id: id },
    { $set: updateFields },
    { returnDocument: 'after' }
  )
}
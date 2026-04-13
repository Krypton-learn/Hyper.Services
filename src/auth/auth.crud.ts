import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'

const collectionName = 'users'

export async function findUserByEmail(email: string) {
  const db = getDB()
  const collection = db.collection(collectionName)
  return collection.findOne({ email })
}

export async function findUserByUsernameOrEmail(username: string, email: string) {
  const db = getDB()
  const collection = db.collection(collectionName)
  return collection.findOne({
    $or: [{ username }, { email }],
  })
}

export async function createUser(user: { username: string; email: string; passwordHash: string }) {
  const db = getDB()
  const collection = db.collection(collectionName)
  const result = await collection.insertOne(user)
  return result.insertedId
}

export async function updateUserById(id: string, updateFields: Record<string, unknown>) {
  const db = getDB()
  const collection = db.collection(collectionName)
  return collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateFields },
    { returnDocument: 'after' }
  )
}

export async function findUserById(id: string) {
  const db = getDB()
  const collection = db.collection(collectionName)
  return collection.findOne({ _id: new ObjectId(id) })
}
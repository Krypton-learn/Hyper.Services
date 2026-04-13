import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'

const EMPLOYEE_COLLECTION = 'employees'

export async function createEmployee(
  model: unknown,
  createEmployeeDto: Record<string, unknown>
) {
  const db = getDB()
  const result = await db.collection(EMPLOYEE_COLLECTION).insertOne(createEmployeeDto)
  return { ...createEmployeeDto, _id: result.insertedId }
}

export async function findAllEmployees(model: unknown) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).find({}).toArray()
}

export async function findEmployeeById(model: unknown, id: string) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function findEmployeeByEmail(model: unknown, email: string) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).findOne({ email })
}

export async function findEmployeeByUsername(model: unknown, username: string) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).findOne({ username })
}

export async function updateEmployee(
  model: unknown,
  id: string,
  updateEmployeeDto: Record<string, unknown>
) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateEmployeeDto },
    { returnDocument: 'after' }
  )
}

export async function deleteEmployee(model: unknown, id: string) {
  const db = getDB()
  const result = await db.collection(EMPLOYEE_COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

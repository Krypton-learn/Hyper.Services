import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'

const EMPLOYEE_COLLECTION = 'employees'

export interface CreateEmployeeInput {
  username: string
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  phone?: string
  position?: string
  department?: string
  organization?: string
  role?: string
  profilePicture?: string
  address?: string
  joiningDate?: Date
}

export interface UpdateEmployeeInput {
  username?: string
  email?: string
  passwordHash?: string
  firstName?: string
  lastName?: string
  phone?: string
  position?: string
  department?: string
  organization?: string
  role?: string
  profilePicture?: string
  address?: string
  joiningDate?: Date
}

export async function createEmployeeService(input: CreateEmployeeInput) {
  const db = getDB()
  const employee = {
    ...input,
    organization: input.organization ? new ObjectId(input.organization) : undefined,
  }
  const result = await db.collection(EMPLOYEE_COLLECTION).insertOne(employee)
  return { ...employee, _id: result.insertedId }
}

export async function getAllEmployeesService() {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).find({}).toArray()
}

export async function getEmployeeByIdService(id: string) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function getEmployeesByOrganizationService(organizationId: string) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).find({ organization: new ObjectId(organizationId) }).toArray()
}

export async function updateEmployeeService(id: string, input: UpdateEmployeeInput) {
  const db = getDB()
  const updateFields: Record<string, unknown> = { ...input }
  if (input.organization) {
    updateFields.organization = new ObjectId(input.organization)
  }
  return db.collection(EMPLOYEE_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateFields },
    { returnDocument: 'after' }
  )
}

export async function deleteEmployeeService(id: string) {
  const db = getDB()
  const result = await db.collection(EMPLOYEE_COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

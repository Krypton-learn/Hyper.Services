import { ObjectId } from 'mongodb'
import { getDB } from '../core/db.core'
import type { CreateEmployeeDto, UpdateEmployeeDto } from 'packages/schemas'

const EMPLOYEE_COLLECTION = 'employees'

export type CreateEmployeeInput = CreateEmployeeDto
export type UpdateEmployeeInput = UpdateEmployeeDto & { userId?: string }

export async function createEmployeeService(input: CreateEmployeeInput) {
  const db = getDB()
  const employee = {
    userId: input.userId ? new ObjectId(input.userId) : undefined,
    isAdmin: input.isAdmin ?? false,
    isFounder: input.isFounder ?? false,
    department: input.department,
    organization: input.organization ? input.organization.map(id => new ObjectId(id)) : [],
    role: input.role ?? 'employee',
    joiningDate: input.joiningDate,
  }
  const result = await db.collection(EMPLOYEE_COLLECTION).insertOne(employee)
  return { ...employee, _id: result.insertedId }
}

export async function getAllEmployeesService(skip: number = 0, limit: number = 20) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).find({}).skip(skip).limit(limit).toArray()
}

export async function getEmployeeByIdService(id: string) {
  const db = getDB()
  return db.collection(EMPLOYEE_COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function getEmployeesByOrganizationService(organizationId: string, skip: number = 0, limit: number = 20, populate: boolean = false) {
  const db = getDB()
  const employees = await db.collection(EMPLOYEE_COLLECTION)
    .find({ organization: { $elemMatch: { $eq: new ObjectId(organizationId) } } })
    .skip(skip)
    .limit(limit)
    .toArray()
  
  if (populate) {
    return populateEmployeeFields(employees)
  }
  return employees
}

async function populateEmployeeFields(employees: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  const db = getDB()
  const userIds = new Set<string>()

  employees.forEach(emp => {
    if (emp.userId) userIds.add(emp.userId.toString())
  })

  const users = await db.collection('users')
    .find({ _id: { $in: Array.from(userIds).map(id => new ObjectId(id)) } })
    .project({ passwordHash: 0 })
    .toArray()

  const userMap = new Map(users.map(u => [u._id.toString(), u]))

  return employees.map(emp => {
    const populated = { ...emp }
    if (emp.userId) {
      populated.userId = userMap.get(emp.userId.toString()) || emp.userId
    }
    return populated
  })
}

export async function updateEmployeeService(id: string, input: UpdateEmployeeInput) {
  const db = getDB()
  const updateFields: Record<string, unknown> = {}
  if (input.userId) updateFields.userId = new ObjectId(input.userId)
  if (input.isAdmin !== undefined) updateFields.isAdmin = input.isAdmin
  if (input.isFounder !== undefined) updateFields.isFounder = input.isFounder
  if (input.department) updateFields.department = input.department
  if (input.organization) updateFields.organization = input.organization.map(id => new ObjectId(id))
  if (input.role) updateFields.role = input.role
  if (input.joiningDate) updateFields.joiningDate = input.joiningDate
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

import { ObjectId } from 'mongodb'
import {
  insertOrg,
  findAllOrgs,
  findOrgById,
  deleteOrgById,
  updateOrgById,
} from './orgs.crud'
import { createEmployeeService } from '../employees/employees.services'
import { getDB } from '../core/db.core'
import type { createOrgInput, updateOrgInput } from 'packages/schemas'

export type CreateOrgInput = createOrgInput
export type UpdateOrgInput = updateOrgInput

export async function createOrgsService(input: createOrgInput) {
  const founderId = new ObjectId(input.founder)
  const adminIds = input.admin
    ? input.admin.map((id) => new ObjectId(id))
    : []

  if (!adminIds.some(id => id.toString() === founderId.toString())) {
    adminIds.push(founderId)
  }

  const org = {
    name: input.name,
    founder: founderId,
    admin: adminIds,
    departments: input.departments || [],
  }

  const createdOrg = await insertOrg(org)
  
  await createEmployeeService({
    userId: input.founder,
    isAdmin: true,
    isFounder: true,
    organization: [createdOrg._id.toString()],
    role: 'Head',
  })

  return createdOrg
}

async function populateOrgFields(orgs: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  const db = getDB()
  const userIds = new Set<string>()

  orgs.forEach(org => {
    if (org.founder) userIds.add(org.founder.toString())
    if (org.admin) {
      (org.admin as unknown as string[]).forEach(id => userIds.add(id.toString()))
    }
  })

  const users = await db.collection('users')
    .find({ _id: { $in: Array.from(userIds).map(id => new ObjectId(id)) } })
    .project({ passwordHash: 0 })
    .toArray()

  const userMap = new Map(users.map(u => [u._id.toString(), u]))

  return orgs.map(org => {
    const populated = { ...org }
    if (org.founder) {
      populated.founder = userMap.get(org.founder.toString()) || org.founder
    }
    if (org.admin) {
      populated.admin = (org.admin as unknown as string[]).map(id => 
        userMap.get(id.toString()) || id
      )
    }
    return populated
  })
}

export async function getOrgsService(skip: number = 0, limit: number = 20, populate: boolean = false) {
  const orgs = await findAllOrgs(skip, limit)
  if (populate) {
    return populateOrgFields(orgs as unknown as Record<string, unknown>[])
  }
  return orgs
}

export async function getOrgsByIdService(id: string) {
  return findOrgById(new ObjectId(id))
}

export async function removeOrgsService(id: string) {
  return deleteOrgById(new ObjectId(id))
}

export async function editOrgsService(id: string, input: updateOrgInput) {
  const updateFields: Record<string, unknown> = {}

  if (input.name) updateFields.name = input.name
  if (input.founder) updateFields.founder = new ObjectId(input.founder)
  if (input.admin) updateFields.admin = input.admin.map((id) => new ObjectId(id))
  if (input.departments) updateFields.departments = input.departments

  return updateOrgById(new ObjectId(id), updateFields)
}

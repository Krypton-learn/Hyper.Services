import { ObjectId } from 'mongodb'
import {
  insertOrg,
  findAllOrgs,
  findOrgById,
  deleteOrgById,
  updateOrgById,
} from './orgs.crud'

export interface createOrgInput {
  name: string
  founder: string
  admin?: string[]
  departments?: string[]
}

export interface updateOrgInput {
  name?: string
  founder?: string
  admin?: string[]
  departments?: string[]
}

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

  return insertOrg(org)
}

export async function getOrgsService() {
  return findAllOrgs()
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

import { ObjectId } from 'mongodb'
import {
  insertPhase,
  findAllPhases,
  findPhaseById,
  deletePhaseById,
  updatePhaseById,
} from './phases.crud'
import { getDB } from '../core/db.core'

export interface createPhaseInput {
  name: string
  description?: string
  tasks?: string[]
  budget?: number
  starting_date?: Date
  ending_date?: Date
  sops?: string[]
  organization: string
}

export interface updatePhaseInput {
  name?: string
  description?: string
  tasks?: string[]
  budget?: number
  starting_date?: Date
  ending_date?: Date
  sops?: string[]
}

export async function createPhaseService(input: createPhaseInput) {
  const phase = {
    name: input.name,
    description: input.description || null,
    tasks: input.tasks ? input.tasks.map((id) => new ObjectId(id)) : [],
    budget: input.budget || null,
    starting_date: input.starting_date || null,
    ending_date: input.ending_date || null,
    sops: input.sops ? input.sops.map((id) => new ObjectId(id)) : [],
    organization: new ObjectId(input.organization),
  }

  return insertPhase(phase)
}

async function populatePhaseFields(phases: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  const db = getDB()
  const orgIds = new Set<string>()
  const taskIds = new Set<string>()

  phases.forEach(phase => {
    if (phase.organization) orgIds.add(phase.organization.toString())
    if (phase.tasks) {
      (phase.tasks as unknown as string[]).forEach(id => taskIds.add(id.toString()))
    }
  })

  const [organizations, tasks] = await Promise.all([
    db.collection('organizations').find({ _id: { $in: Array.from(orgIds).map(id => new ObjectId(id)) } }).toArray(),
    db.collection('tasks').find({ _id: { $in: Array.from(taskIds).map(id => new ObjectId(id)) } }).toArray(),
  ])

  const orgMap = new Map(organizations.map(o => [o._id.toString(), o]))
  const taskMap = new Map(tasks.map(t => [t._id.toString(), t]))

  return phases.map(phase => {
    const populated = { ...phase }
    if (phase.organization) {
      populated.organization = orgMap.get(phase.organization.toString()) || phase.organization
    }
    if (phase.tasks) {
      populated.tasks = (phase.tasks as unknown as string[]).map(id =>
        taskMap.get(id.toString()) || id
      )
    }
    return populated
  })
}

export async function getAllPhasesService(skip: number = 0, limit: number = 20, populate: boolean = false) {
  const phases = await findAllPhases(skip, limit)
  if (populate) {
    return populatePhaseFields(phases as unknown as Record<string, unknown>[])
  }
  return phases
}

export async function getPhaseByIdService(id: string) {
  return findPhaseById(new ObjectId(id))
}

export async function deletePhaseService(id: string) {
  return deletePhaseById(new ObjectId(id))
}

export async function updatePhaseService(id: string, input: updatePhaseInput) {
  const updateFields: Record<string, unknown> = {}

  if (input.name) updateFields.name = input.name
  if (input.description) updateFields.description = input.description
  if (input.tasks) updateFields.tasks = input.tasks.map((id) => new ObjectId(id))
  if (input.budget) updateFields.budget = input.budget
  if (input.starting_date) updateFields.starting_date = input.starting_date
  if (input.ending_date) updateFields.ending_date = input.ending_date
  if (input.sops) updateFields.sops = input.sops.map((id) => new ObjectId(id))

  return updatePhaseById(new ObjectId(id), updateFields)
}
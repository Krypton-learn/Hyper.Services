import { ObjectId } from 'mongodb'
import {
  insertPhase,
  findAllPhases,
  findPhaseById,
  deletePhaseById,
  updatePhaseById,
} from './phases.crud'

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

export async function getAllPhasesService() {
  return findAllPhases()
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
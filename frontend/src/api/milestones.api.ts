import type { CreateMilestoneInput, UpdateMilestoneInput, Milestone } from '@packages/schemas/milestones.schema'
import { apiClient } from './client'

export async function getMilestones(orgId: string): Promise<Milestone[]> {
  const response = await apiClient(`/milestones/get-all/${orgId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch milestones')
  }

  const json = await response.json()
  const milestones = json.milestones?.milestones ?? json.milestones ?? []
  return Array.isArray(milestones) ? milestones : []
}

export async function createMilestone(orgId: string, data: CreateMilestoneInput): Promise<Milestone> {
  const response = await apiClient(`/milestones/create-milestone/${orgId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create milestone' }))
    throw new Error(error.message || 'Failed to create milestone')
  }

  const result = await response.json()
  return result.milestone
}

export async function updateMilestone(id: string, data: UpdateMilestoneInput): Promise<Milestone> {
  const response = await apiClient(`/milestones/edit-milestone/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update milestone' }))
    throw new Error(error.message || 'Failed to update milestone')
  }

  const result = await response.json()
  return result.milestone
}

export async function deleteMilestone(id: string): Promise<void> {
  const response = await apiClient(`/milestones/remove-milestone/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete milestone' }))
    throw new Error(error.message || 'Failed to delete milestone')
  }
}

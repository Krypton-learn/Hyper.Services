import type { CreateOrgInput, UpdateOrgInput, OrganizationWithMembers } from '@packages/schemas/orgs.schema'
import { apiClient } from './client'

export async function getOrgs(): Promise<OrganizationWithMembers[]> {
  const response = await apiClient('/orgs/get-orgs/me')

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch organizations' }))
    throw new Error(error.message || 'Failed to fetch organizations')
  }

  const data = await response.json()
  return data.orgs || []
}

export async function getOrg(id: string): Promise<OrganizationWithMembers> {
  const response = await apiClient(`/orgs/get-org/${id}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Organization not found' }))
    throw new Error(error.message || 'Organization not found')
  }

  const data = await response.json()
  return data.org
}

export type CreateOrgResponse = OrganizationWithMembers

export async function createOrg(data: CreateOrgInput): Promise<CreateOrgResponse> {
  const response = await apiClient('/orgs/create-org', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create organization' }))
    throw new Error(error.message || 'Failed to create organization')
  }

  return response.json()
}

export async function updateOrg(id: string, data: UpdateOrgInput): Promise<OrganizationWithMembers> {
  const response = await apiClient(`/orgs/edit-org/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update organization' }))
    throw new Error(error.message || 'Failed to update organization')
  }

  return response.json()
}

export async function deleteOrg(id: string): Promise<void> {
  const response = await apiClient(`/orgs/remove-org/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete organization' }))
    throw new Error(error.message || 'Failed to delete organization')
  }
}

export async function joinOrg(token: string): Promise<CreateOrgResponse> {
  const response = await apiClient('/orgs/join-org', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to join organization' }))
    throw new Error(error.message || 'Failed to join organization')
  }

  return response.json()
}

export interface OrgDashboardStats {
  milestones: number;
  tasks: number;
  employees: number;
  calendarEvents?: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'milestone' | 'task';
}

export async function getOrgDashboard(orgId: string): Promise<OrgDashboardStats> {
  const response = await apiClient(`/orgs/dashboard/${orgId}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch dashboard' }))
    throw new Error(error.message || 'Failed to fetch dashboard')
  }

  const data = await response.json()
  return data
}
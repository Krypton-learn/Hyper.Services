import type { CreateOrgInput, UpdateOrgInput, Organization } from '../../../packages/schemas/orgs.schema'
import { useAuthStore } from '../stores/auth.store'

const API_BASE = '/api'

function getHeaders(): HeadersInit {
  const accessToken = useAuthStore.getState().accessToken
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }
}

export async function getOrgs(): Promise<Organization[]> {
  const response = await fetch(`${API_BASE}/orgs/get-orgs/me`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch organizations' }))
    throw new Error(error.message || 'Failed to fetch organizations')
  }

  const data = await response.json()
  return data.orgs || []
}

export async function getOrg(id: string): Promise<Organization> {
  const response = await fetch(`${API_BASE}/orgs/get-org/${id}`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Organization not found' }))
    throw new Error(error.message || 'Organization not found')
  }

  const data = await response.json()
  return data.org
}

export interface CreateOrgResponse {
  org: Organization
  token: string
}

export async function createOrg(data: CreateOrgInput): Promise<CreateOrgResponse> {
  const response = await fetch(`${API_BASE}/orgs/create-org`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create organization' }))
    throw new Error(error.message || 'Failed to create organization')
  }

  return response.json()
}

export async function updateOrg(id: string, data: UpdateOrgInput): Promise<Organization> {
  const response = await fetch(`${API_BASE}/orgs/edit-org/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update organization' }))
    throw new Error(error.message || 'Failed to update organization')
  }

  return response.json()
}

export async function deleteOrg(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/orgs/remove-org/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete organization' }))
    throw new Error(error.message || 'Failed to delete organization')
  }
}
import type { UpdateEmployeeInput, EmployeeWithUser } from '@packages/schemas/employees.schema'
import { apiClient } from './client'

export async function getEmployees(orgId: string): Promise<EmployeeWithUser[]> {
  const response = await apiClient(`/employees/get-employees/${orgId}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch employees' }))
    throw new Error(error.message || 'Failed to fetch employees')
  }

  const data = await response.json()
  return data.employees || []
}

export async function getEmployee(id: string): Promise<EmployeeWithUser | null> {
  const response = await apiClient(`/employees/get-employee/${id}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch employee' }))
    throw new Error(error.message || 'Failed to fetch employee')
  }

  const data = await response.json()
  return data.employee || null
}

export async function updateEmployee(orgId: string, id: string, data: UpdateEmployeeInput): Promise<void> {
  const response = await apiClient(`/employees/edit-employee/${orgId}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update employee' }))
    throw new Error(error.message || 'Failed to update employee')
  }
}

export async function deleteEmployee(orgId: string, id: string): Promise<void> {
  const response = await apiClient(`/employees/remove-employee/${orgId}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete employee' }))
    throw new Error(error.message || 'Failed to delete employee')
  }
}
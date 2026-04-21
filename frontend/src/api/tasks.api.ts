import type { CreateTaskInput, UpdateTaskInput, Task } from '../../../packages/schemas/tasks.schema'
import { apiClient } from './client'

export async function getTasks(token: string): Promise<Task[]> {
  const response = await apiClient(`/tasks/get-all/${token}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch tasks' }))
    throw new Error(error.message || 'Failed to fetch tasks')
  }

  const data = await response.json()
  return data.tasks || []
}

export async function createTask(token: string, data: CreateTaskInput): Promise<Task> {
  const response = await apiClient(`/tasks/create-task/${token}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create task' }))
    throw new Error(error.message || 'Failed to create task')
  }

  const result = await response.json()
  return result.task
}

export async function updateTask(token: string, id: string, data: UpdateTaskInput): Promise<Task> {
  const response = await apiClient(`/tasks/update-task/${token}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update task' }))
    throw new Error(error.message || 'Failed to update task')
  }

  const result = await response.json()
  return result.task
}

export async function deleteTask(token: string, id: string): Promise<void> {
  const response = await apiClient(`/tasks/remove-task/${token}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete task' }))
    throw new Error(error.message || 'Failed to delete task')
  }
}
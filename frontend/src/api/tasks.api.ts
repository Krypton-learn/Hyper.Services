import api from './api'
import type { CreateTaskInput, UpdateTaskInput } from '../lib/schemas'

interface PopulatedUser {
  _id: string
  userId: string
  firstName?: string
  lastName?: string
}

export interface Task {
  _id: string
  title: string
  created_by: string | PopulatedUser
  assigned_to: string | PopulatedUser
  starting_date: Date | null
  due_date: Date | null
  status: 'Due' | 'Upcoming' | 'Completed'
  team: string[]
  phase: string | null
  description: string | null
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  created_at: Date
}

export interface GetTasksParams {
  populate?: ('created_by' | 'assigned_to')[]
  page?: number
  limit?: number
}

export interface GetTasksResponse {
  tasks: Task[]
  page: number
  limit: number
}

export const tasksApi = {
  getAll: async (params?: GetTasksParams): Promise<GetTasksResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params?.populate?.length) {
      searchParams.set('populate', params.populate.join(','))
    }
    if (params?.page) {
      searchParams.set('page', String(params.page))
    }
    if (params?.limit) {
      searchParams.set('limit', String(params.limit))
    }

    const query = searchParams.toString()
    const url = query ? `/tasks/get/all?${query}` : '/tasks/get/all'
    
    const response = await api.get<GetTasksResponse>(url)
    return response.data
  },

  getById: async (id: string, populate?: string[]): Promise<Task> => {
    const searchParams = new URLSearchParams()
    if (populate?.length) {
      searchParams.set('populate', populate.join(','))
    }
    const query = searchParams.toString()
    const url = query ? `/tasks/${id}?${query}` : `/tasks/${id}`
    
    const response = await api.get<{ task: Task }>(url)
    return response.data.task
  },

create: async (data: CreateTaskInput): Promise<Task> => {
    const response = await api.post<{ message: string; task: Task }>('/tasks/create', data)
    return response.data.task
  },

  update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const response = await api.patch<{ message: string; task: Task }>(`/tasks/edit/${id}`, data)
    return response.data.task
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/delete/${id}`)
  },
}
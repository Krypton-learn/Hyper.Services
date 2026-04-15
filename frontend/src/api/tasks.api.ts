import api from './api'
import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  created_by: z.string().optional(),
  assigned_to: z.string().optional(),
  starting_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  status: z.enum(['Due', 'Upcoming', 'Completed']).optional(),
  team: z.array(z.string()).optional(),
  phase: z.string().optional(),
  tempTeamMembers: z.array(z.string()).optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  assigned_to: z.string().optional(),
  starting_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  status: z.enum(['Due', 'Upcoming', 'Completed']).optional(),
  team: z.array(z.string()).optional(),
  phase: z.string().optional(),
  tempTeamMembers: z.array(z.string()).optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

interface PopulatedUser {
  _id: string
  userId: string
  firstName?: string
  lastName?: string
  username?: string
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
  tempTeamMembers: string[]
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
    const validated = createTaskSchema.parse(data)
    const response = await api.post<{ message: string; task: Task }>('/tasks/create', validated)
    return response.data.task
  },

  update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const validated = updateTaskSchema.parse(data)
    const response = await api.patch<{ message: string; task: Task }>(`/tasks/edit/${id}`, validated)
    return response.data.task
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/delete/${id}`)
  },
}
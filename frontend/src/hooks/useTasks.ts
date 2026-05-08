import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from './api'
import type { Task } from '../store/tasksStore'
import { useTasksStore } from '../store/tasksStore'

export type { Task }

interface CreateTaskRequest {
  title: string
  desc?: string
  startingDate?: string
  deadline?: string
  assignedTo?: string
  status?: 'Urgent' | 'Common'
}

interface UpdateTaskRequest {
  title?: string
  desc?: string
  isCompleted?: number
  startingDate?: string
  deadline?: string
  assignedTo?: string
  status?: 'Urgent' | 'Common'
}

interface TasksResponse {
  results: Task[]
  success: boolean
}

interface TaskResponse {
  id: string
  title: string
  desc: string
  isCompleted: number
  startingDate: string
  deadline: string
  createdAt: string
  creator_id: string
  creator_username: string
  creator_email: string
  assignee_id: string | null
  assignee_username: string | null
  assignee_email: string | null
  status: 'Urgent' | 'Common'
}

interface ErrorResponse {
  errors: Record<string, string[]>
}

const handleError = (error: unknown) => {
  const axiosError = error as { response?: { data: ErrorResponse } }
  const errors = axiosError.response?.data?.errors
  
  if (errors) {
    const messages = Object.values(errors).flat()
    toast.error(messages[0])
  } else {
    toast.error('Something went wrong')
  }
}

export const useTasks = (page = 0) => {
  const setTasks = useTasksStore((state) => state.setTasks)

  return useQuery({
    queryKey: ['tasks', page],
    queryFn: async () => {
      const response = await api.get<TasksResponse>('/tasks/get-tasks', {
        params: { page },
      })
      const data = response.data
      setTasks(data.results)
      return data
    },
  })
}

export const useTask = (id: string) => {
  const setSelectedTask = useTasksStore((state) => state.setSelectedTask)

  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await api.get<TaskResponse>(`/tasks/get-task/${id}`)
      const data = response.data
      setSelectedTask(data)
      return data
    },
    enabled: !!id,
  })
}

export const useCreateTask = () => {
  const addTask = useTasksStore((state) => state.addTask)

  return useMutation({
    mutationFn: async (data: CreateTaskRequest): Promise<{ message: string; task: Task }> => {
      const response = await api.post('/tasks/create-task', data)
      return response.data
    },
    onSuccess: (data) => {
      addTask(data.task)
      toast.success(data.message)
    },
    onError: handleError,
  })
}

export const useUpdateTask = () => {
  const updateTask = useTasksStore((state) => state.updateTask)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskRequest }): Promise<TaskResponse> => {
      const response = await api.put(`/tasks/update-task/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      updateTask(data)
      toast.success('Task updated successfully')
    },
    onError: handleError,
  })
}

export const useCompleteTask = () => {
  const updateTask = useTasksStore((state) => state.updateTask)

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string; task: Task }> => {
      const response = await api.patch(`/tasks/complete/${id}`)
      return response.data
    },
    onSuccess: (data) => {
      updateTask(data.task)
      toast.success(data.message)
    },
    onError: handleError,
  })
}

export const useDeleteTask = () => {
  const removeTask = useTasksStore((state) => state.removeTask)

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await api.delete(`/tasks/delete-task/${id}`)
      return response.data
    },
    onSuccess: (_, id) => {
      removeTask(id)
      toast.success('Task deleted successfully')
    },
    onError: handleError,
  })
}
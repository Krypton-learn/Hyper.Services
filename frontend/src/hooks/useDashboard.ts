import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from './api'
import { useDashboardStore } from '../store/dashboardStore'
import type { Task } from '../store/tasksStore'

interface DashboardResponse {
  pending: Task[]
  completed: Task[]
  overdue: Task[]
  stats: {
    total: number
    completed: number
    pending: number
  }
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
    toast.error('Failed to load dashboard')
  }
}

export const useDashboard = () => {
  const setDashboardData = useDashboardStore((state) => state.setDashboardData)

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get<DashboardResponse>('/dashboard/overview')
        const data = response.data
        setDashboardData(data)
        return data
      } catch (error) {
        handleError(error)
        throw error
      }
    },
    retry: 2,
  })
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks.api'
import type { CreateTaskInput, UpdateTaskInput } from '../../packages/schemas/tasks.schema'

export function useTasks(token: string) {
  return useQuery({
    queryKey: ['tasks', token],
    queryFn: () => getTasks(token),
    enabled: !!token,
  })
}

export function useCreateTask(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', token] })
    },
  })
}

export function useUpdateTask(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      updateTask(token, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', token] })
    },
  })
}

export function useDeleteTask(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTask(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', token] })
    },
  })
}
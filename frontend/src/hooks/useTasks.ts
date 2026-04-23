import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks.api'
import { getMilestones } from '../api/milestones.api'
import type { CreateTaskInput, UpdateTaskInput, Task } from '@packages/schemas/tasks.schema'
import { useOrgsStore } from '../stores/orgs.store'
import { useMilestonesStore } from '../stores/milestones.store'

export function useTasks(token: string) {
  const setMilestones = useMilestonesStore((state) => state.setMilestones)
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)

  return useQuery<Task[]>({
    queryKey: ['tasks', token],
    queryFn: async () => {
      const tasks = await getTasks(token)
      
      if (currentOrgId) {
        const milestones = await getMilestones(currentOrgId)
        setMilestones(milestones)
      }
      
      return tasks ?? []
    },
    enabled: !!token,
    initialData: [],
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

export function useMilestones() {
  const milestones = useMilestonesStore((state) => state.milestones)
  return Array.isArray(milestones) ? milestones : []
}

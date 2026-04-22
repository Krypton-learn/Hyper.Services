import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../api/milestones.api'
import type { CreateMilestoneInput, UpdateMilestoneInput } from '../../packages/schemas/milestones.schema'
import { useOrgsStore } from '../stores/orgs.store'

export function useMilestones() {
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)

  return useQuery({
    queryKey: ['milestones', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return []
      return getMilestones(currentOrgId)
    },
    enabled: !!currentOrgId,
  })
}

export function useCreateMilestone() {
  const queryClient = useQueryClient()
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)

  return useMutation({
    mutationFn: (data: CreateMilestoneInput) => createMilestone(currentOrgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', currentOrgId] })
    },
  })
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient()
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMilestoneInput }) =>
      updateMilestone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', currentOrgId] })
    },
  })
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient()
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)

  return useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', currentOrgId] })
    },
  })
}

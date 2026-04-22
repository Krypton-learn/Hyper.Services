import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrgs, getOrg, createOrg, updateOrg, deleteOrg, joinOrg } from '../api/orgs.api'
import type { CreateOrgResponse } from '../api/orgs.api'
import type { CreateOrgInput, UpdateOrgInput } from '../../../packages/schemas/orgs.schema'
import { useOrgsStore } from '../stores/orgs.store'
import { useSidebarStore } from '../components/Sidebar'

export function useOrgs() {
  return useQuery({
    queryKey: ['orgs'],
    queryFn: getOrgs,
  })
}

export function useOrg(id: string) {
  return useQuery({
    queryKey: ['org', id],
    queryFn: () => getOrg(id),
    enabled: !!id,
  })
}

export function useCreateOrg() {
  const queryClient = useQueryClient()
  const { setCurrentOrg } = useOrgsStore()

  return useMutation({
    mutationFn: (data: CreateOrgInput) => createOrg(data),
    onSuccess: (response: CreateOrgResponse) => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
      setCurrentOrg(response.org.id, response.token, response.org)
      useSidebarStore.getState().closeRightSidebar()
    },
  })
}

export function useUpdateOrg() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgInput }) => updateOrg(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
    },
  })
}

export function useDeleteOrg() {
  const queryClient = useQueryClient()
  const { clearCurrentOrg } = useOrgsStore()

  return useMutation({
    mutationFn: (id: string) => deleteOrg(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
      clearCurrentOrg()
      useSidebarStore.getState().closeRightSidebar()
    },
  })
}

export function useJoinOrg() {
  const queryClient = useQueryClient()
  const { setCurrentOrg } = useOrgsStore()

  return useMutation({
    mutationFn: (token: string) => joinOrg(token),
    onSuccess: (response: CreateOrgResponse) => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
      setCurrentOrg(response.org.id, response.token, response.org)
    },
  })
}
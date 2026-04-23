import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEmployees, updateEmployee, deleteEmployee } from '../api/employees.api'
import type { UpdateEmployeeInput } from '@packages/schemas/employees.schema'

export function useEmployees(orgId: string) {
  return useQuery({
    queryKey: ['employees', orgId],
    queryFn: () => getEmployees(orgId),
    enabled: !!orgId,
  })
}

export function useUpdateEmployee(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeInput }) =>
      updateEmployee(orgId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', orgId] })
    },
  })
}

export function useDeleteEmployee(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEmployee(orgId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', orgId] })
    },
  })
}
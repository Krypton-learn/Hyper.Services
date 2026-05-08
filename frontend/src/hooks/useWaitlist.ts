import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from './api'
import { useWaitlistStore, type WaitlistEntry } from '../store/waitlistStore'

export type { WaitlistEntry }

interface WaitlistResponse {
  results: WaitlistEntry[]
  success: boolean
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

export const useWaitlist = () => {
  const setEntries = useWaitlistStore((state) => state.setEntries)

  return useQuery({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const response = await api.get<WaitlistResponse>('/waitlist')
      const data = response.data
      setEntries(data.results)
      return data
    },
  })
}

export const useAddToWaitlist = () => {
  const addEntry = useWaitlistStore((state) => state.addEntry)

  return useMutation({
    mutationFn: async (data: { firstname: string; lastname: string; email: string; desc: string }): Promise<{ message: string; entry: WaitlistEntry }> => {
      const response = await api.post('/waitlist', data)
      return response.data
    },
    onSuccess: (data) => {
      addEntry(data.entry)
      toast.success(data.message)
    },
    onError: handleError,
  })
}

export const useDeleteFromWaitlist = () => {
  const removeEntry = useWaitlistStore((state) => state.removeEntry)

  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await api.delete(`/waitlist/${id}`)
      return response.data
    },
    onSuccess: (_, id) => {
      removeEntry(id)
      toast.success('Entry removed from waitlist')
    },
    onError: handleError,
  })
}
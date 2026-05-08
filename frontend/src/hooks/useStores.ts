import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from './api'

export interface Store {
  id: string
  user_id: string
  b2_key: string
  file_name: string
  file_size: number
  uploaded_at: string
}

interface StoresResponse {
  results: Store[]
  success: boolean
}

interface UploadResponse {
  id: string
  b2_key: string
}

const handleError = (error: unknown) => {
  const axiosError = error as { response?: { data: { errors?: Record<string, string[]> } } }
  const errors = axiosError.response?.data?.errors
  
  if (errors) {
    const messages = Object.values(errors).flat()
    toast.error(messages[0])
  } else {
    toast.error('Something went wrong')
  }
}

export const useStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await api.get<StoresResponse>('/stores/get-stores')
      return response.data.results
    },
  })
}

export const useUploadStore = () => {
  return useMutation({
    mutationFn: async ({ file, fileName }: { file: File; fileName: string }): Promise<UploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', fileName)
      
      const response = await api.post('/stores/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('File uploaded successfully')
    },
    onError: handleError,
  })
}

export const useDeleteStore = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/stores/delete-store/${id}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('File deleted successfully')
    },
    onError: handleError,
  })
}

export const useDownloadStore = () => {
  return useMutation({
    mutationFn: async (id: string): Promise<Blob> => {
      const response = await api.get(`/stores/download/${id}`, {
        responseType: 'blob',
      })
      return response.data
    },
  })
}
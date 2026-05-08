import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { api } from './api'
import { useAuthStore } from '../store/authStore'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  accountType?: 'Personal' | 'Organization'
}

interface User {
  id: string
  username: string
  email: string
  accountType?: 'Personal' | 'Organization'
}

export interface LoginResponse {
  message: string
  user: User
  accessToken: string
  refreshToken: string
}

interface RegisterResponse {
  message: string
  user: User
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

export const useLogin = (options?: { onSuccess?: (data: LoginResponse) => void; onError?: (error: unknown) => void }) => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await api.post('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success(data.message)
      navigate({ to: '/' })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      handleError(error)
      options?.onError?.(error)
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<RegisterResponse> => {
      const response = await api.post('/auth/register', data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      navigate({ to: '/login' })
    },
    onError: handleError,
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  
  return () => {
    logout()
    toast.success('Logged out successfully')
    navigate({ to: '/login' })
  }
}
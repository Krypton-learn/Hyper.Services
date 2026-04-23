import type { LoginInput, RegisterUserInput, User } from '@packages/schemas/auth.schema'
import { apiClient } from './client'

export interface AuthResponse {
  user: User
  accessToken: string
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const response = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    requiresAuth: false,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }))
    throw new Error(error.message || 'Login failed')
  }

  return response.json()
}

export async function registerUser(data: RegisterUserInput): Promise<AuthResponse> {
  const response = await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    requiresAuth: false,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }))
    throw new Error(error.message || 'Registration failed')
  }

  return response.json()
}

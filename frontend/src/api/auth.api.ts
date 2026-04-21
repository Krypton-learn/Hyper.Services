import type { LoginInput, RegisterUserInput, User } from '../../../packages/schemas/auth.schema'

const API_BASE = '/api'

export interface AuthResponse {
  user: User
  accessToken: string
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }))
    throw new Error(error.message || 'Login failed')
  }

  return response.json()
}

export async function registerUser(data: RegisterUserInput): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }))
    throw new Error(error.message || 'Registration failed')
  }

  return response.json()
}

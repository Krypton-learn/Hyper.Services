import { useAuthStore } from '../stores/auth.store'
import { router } from '../router'

const API_BASE = '/api'

interface ApiClientOptions extends RequestInit {
  requiresAuth?: boolean
}

export async function apiClient(endpoint: string, options: ApiClientOptions = {}): Promise<Response> {
  const { requiresAuth = true, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (requiresAuth) {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (response.status === 401) {
    useAuthStore.getState().logout()
    router.navigate({ to: '/login' })
    throw new Error('Unauthorized')
  }

  return response
}

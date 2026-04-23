import { useAuthStore } from '../stores/auth.store'
import { router } from '../router'

const API_BASE = ' https://hyper_revise.ishannepal82.workers.dev/api'

interface ApiClientOptions extends RequestInit {
  requiresAuth?: boolean
}

function getExpiry(token: string): number {
  const payload = JSON.parse(
    atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
  )
  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = payload.exp - now;
  return secondsRemaining;

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
      if (getExpiry(accessToken) <= 40) {
        await fetch("auth/refresh", {
          method: "POST",
          credentials: "include",
        })
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
}

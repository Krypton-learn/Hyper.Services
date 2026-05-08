import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8787/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.request.use(async (config) => {
  const { accessToken, refreshToken, setTokens, logout } = useAuthStore.getState()

  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const exp = payload.exp * 1000
      const now = Date.now()
      const timeUntilExpiry = exp - now

      if (timeUntilExpiry < 60000 && refreshToken && !isRefreshing) {
        isRefreshing = true

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8787/api'}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          )

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
          setTokens(newAccessToken, newRefreshToken)
          processQueue(null, newAccessToken)
          config.headers.Authorization = `Bearer ${newAccessToken}`
        } catch (refreshError) {
          processQueue(refreshError, null)
          logout()
        } finally {
          isRefreshing = false
        }
      } else if (timeUntilExpiry <= 0) {
        if (!isRefreshing) {
          logout()
        }
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    } catch {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
      }

      originalRequest._retry = true

      const { refreshToken, setTokens, logout } = useAuthStore.getState()

      if (refreshToken) {
        isRefreshing = true

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8787/api'}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          )

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
          setTokens(newAccessToken, newRefreshToken)
          processQueue(null, newAccessToken)

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          logout()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        logout()
      }
    }

    return Promise.reject(error)
  }
)

export { api }

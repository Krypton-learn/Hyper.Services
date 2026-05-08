import { create } from 'zustand'

interface User {
  id: string
  username: string
  email: string
  accountType?: 'Personal' | 'Organization'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, accessToken, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  initialize: () => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User
        set({ user, accessToken: token, isAuthenticated: true })
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
    }
  },
}))
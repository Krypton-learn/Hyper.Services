import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  profile?: {
    avatar?: string
    bio?: string
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'user_123',
    email: 'user@example.com',
    name: 'John Doe',
    phone: '+1234567890',
    profile: {
      avatar: undefined,
      bio: 'Full stack developer',
    },
  },
  accessToken: 'mock_token',
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}))
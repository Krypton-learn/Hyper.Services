import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../api/api'

interface User {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  avatar?: string
}

interface Organization {
  _id: string
  name: string
}

interface AuthContextValue {
  user: User | null
  organizations: Organization[]
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('Auth: Token from storage:', token ? 'exists' : 'none')
    
    if (!token) {
      setIsLoading(false)
      return
    }

    api.get<{ user: User; organizations: Organization[] }>('/auth/me')
      .then((res) => {
        console.log('Auth: /auth/me success', res.data)
        setUser(res.data.user)
        setOrganizations(res.data.organizations || [])
      })
      .catch((err) => {
        console.log('Auth: /auth/me error', err.response?.status, err.response?.data)
        localStorage.removeItem('token')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, organizations, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
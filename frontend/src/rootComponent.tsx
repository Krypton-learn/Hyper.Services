import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { LayoutProvider } from './components/layout.component'
import { AuthProvider } from './hooks/useAuth'

export function RootComponent() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <Toaster position="top-center" />
        <Outlet />
      </LayoutProvider>
    </AuthProvider>
  )
}
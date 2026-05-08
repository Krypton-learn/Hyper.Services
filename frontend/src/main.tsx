import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { router } from './router'
import { useAuthStore } from './store/authStore'
import { useFontStore } from './store/fontStore'
import EnableNotifications from './components/EnableNotifications'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppInitializer() {
  const initialize = useAuthStore((state) => state.initialize)
  const font = useFontStore((state) => state.font)
  const isDarkMode = useFontStore((state) => state.isDarkMode)
  const primaryColor = useFontStore((state) => state.primaryColor)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', font)
  }, [font])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor)
  }, [primaryColor])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppInitializer />
      <EnableNotifications />
      <RouterProvider router={router} />
      <FontToaster />
    </QueryClientProvider>
  </StrictMode>,
)

function FontToaster() {
  const font = useFontStore((state) => state.font)
  return (
    <Toaster 
      position="top-right"
      richColors
      toastOptions={{
        style: {
          fontFamily: `${font}, sans-serif`,
        },
      }}
    />
  )
}
import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export function RootComponent() {
  return (
    <>
      <Toaster position="top-center" />
      <Outlet />
    </>
  )
}
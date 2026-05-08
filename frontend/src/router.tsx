import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import Waitlist from './pages/Waitlist'
import Stores from './pages/Stores'
import AI from './pages/AI'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    if (!token || !user) {
      throw redirect({ to: '/login' })
    }
  },
})

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Home,
})

const tasksRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/tasks',
  component: Tasks,
})

const calendarRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/calendar',
  component: Calendar,
})

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: Settings,
})

const waitlistRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/waitlist',
  component: Waitlist,
})

const storesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/stores',
  component: Stores,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
})

const aiRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/ai',
  component: AI,
})

const layoutRouteTree = layoutRoute.addChildren([indexRoute, tasksRoute, calendarRoute, waitlistRoute, storesRoute, aiRoute, settingsRoute])

const routeTree = rootRoute.addChildren([layoutRouteTree, loginRoute, registerRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
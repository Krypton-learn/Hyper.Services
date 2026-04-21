import { createRouter, createBrowserHistory, createRootRoute, createRoute, Outlet, RouterProvider } from '@tanstack/react-router'
import { useRouterState } from '@tanstack/react-router'
import { Layout } from './layout'
import { ProfilePage } from './pages/profile'
import { LoginPage } from './pages/auth/login.pages'
import { RegisterPage } from './pages/auth/register.pages'

export const authRoutes = ['/login', '/register']
export const definedRoutes = ['/', '/organizations', '/profile', '/settings', '/tasks', '/milestones']

const rootRoute = createRootRoute({
  component: () => {
    const location = useRouterState({ select: (s) => s.location })
    const isAuthRoute = authRoutes.includes(location.pathname)
    const isDefinedRoute = definedRoutes.includes(location.pathname)

    if (isAuthRoute) {
      return <Outlet />
    }

    return isDefinedRoute ? (
      <Layout>
        <Outlet />
      </Layout>
    ) : (
      <Outlet />
    )
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <LoginPage />,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => <RegisterPage />,
})

const organizationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations',
  component: () => <h1 className="text-3xl font-bold text-foreground">Organizations</h1>,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => <ProfilePage />,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <h1 className="text-3xl font-bold text-foreground">Settings</h1>,
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: () => <h1 className="text-3xl font-bold text-foreground">Tasks</h1>,
})

const milestonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/milestones',
  component: () => <h1 className="text-3xl font-bold text-foreground">Milestones</h1>,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  organizationsRoute,
  profileRoute,
  settingsRoute,
  tasksRoute,
  milestonesRoute,
])

const router = createRouter({ routeTree, history: createBrowserHistory() })

export { RouterProvider, router }
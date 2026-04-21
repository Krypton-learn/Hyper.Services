import { createRouter, createBrowserHistory, createRootRoute, createRoute, Outlet, RouterProvider } from '@tanstack/react-router'
import { Layout } from './layout'
import { LoginPage } from './pages/auth/login.pages'
import { RegisterPage } from './pages/auth/register.pages'
import { OrgsPage } from './pages/orgs/OrgsPage'
import { OrgDashboardPage } from './pages/orgs/OrgDashboardPage'
import { TasksPage } from './pages/orgs/TasksPage'
import { MilestonesPage } from './pages/orgs/MilestonesPage'

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <h1 className="text-3xl font-bold text-gray-900">Home</h1>,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
    </div>
  ),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const orgsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations',
  component: OrgsPage,
})

const orgDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations/dashboard',
  component: OrgDashboardPage,
})

const orgTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations/tasks/$token',
  component: TasksPage,
})

const orgMilestonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations/milestones',
  component: MilestonesPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  loginRoute,
  registerRoute,
  orgsRoute,
  orgDashboardRoute,
  orgTasksRoute,
  orgMilestonesRoute,
])

const router = createRouter({ routeTree, history: createBrowserHistory() })

export { RouterProvider, router }

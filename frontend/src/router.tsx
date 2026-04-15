import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { RootComponent } from './rootComponent'
import { LoginPage } from './pages/auth/login.pages'
import { SignUpPage } from './pages/auth/signup.pages'
import { InterestsPage } from './pages/auth/interests.pages'
import { ProfilePage } from './pages/profile.pages'
import { TasksPage } from './pages/tasks.pages'
import type { RegisterInput } from './lib/types'

declare module '@tanstack/react-router' {
  interface HistoryState {
    signupData?: RegisterInput;
  }
}

const rootRoute = createRootRoute({
  component: RootComponent,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return (
      <div className="p-8">
        <h1>Hello World!</h1>
      </div>
    )
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: SignUpPage,
})

const interestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/interests',
  component: InterestsPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: function Dashboard() {
    return (
      <div className="p-8">
        <h1>Dashboard</h1>
      </div>
    )
  },
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksPage,
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, signupRoute, interestsRoute, dashboardRoute, profileRoute, tasksRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { RootComponent } from './rootComponent'
import { AppLayout } from './components/app-layout.component'
import { LoginPage } from './pages/auth/login.pages'
import { SignUpPage } from './pages/auth/signup.pages'
import { InterestsPage } from './pages/auth/interests.pages'
import { ProfilePage } from './pages/profile.pages'
import { TasksPage } from './pages/tasks.pages'
import { OrganizationsPage } from './pages/organizations.pages'
import type { RegisterInput } from './lib/types'

declare module '@tanstack/react-router' {
  interface HistoryState {
    signupData?: RegisterInput;
  }
}

const rootRoute = createRootRoute({
  component: RootComponent,
})

const AuthPageLayout = ({ children }: { children: React.ReactNode }) => (
  <AppLayout hideRightSidebar>{children}</AppLayout>
)

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return (
      <AuthPageLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold">Hello World!</h1>
        </div>
      </AuthPageLayout>
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
      <AppLayout>
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-2">Welcome to your dashboard</p>
        </div>
      </AppLayout>
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

const organizationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations',
  component: OrganizationsPage,
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, signupRoute, interestsRoute, dashboardRoute, profileRoute, tasksRoute, organizationsRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

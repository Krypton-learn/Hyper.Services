import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { RootComponent } from './rootComponent'
import { LoginPage } from './pages/auth/login.pages'
import { SignUpPage } from './pages/auth/signup.pages'

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

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, signupRoute, dashboardRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
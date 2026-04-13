import { Hono } from 'hono'
import { connectDB } from './core/db.core'
import { authRoutes } from './auth/auth.routes'
import { taskRoutes } from './tasks/tasks.routes'
import { orgRoutes } from './organizations/orgs.routes'

export const app = new Hono()

connectDB().catch(console.error)

app.route('api/auth', authRoutes);

app.route('api/tasks', taskRoutes)

app.route('api/orgs', orgRoutes)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', (c) => {
  return c.json({ "status": "hey, everything is working!" })
});

app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${c.req.path} not found`,
      trace: new Error('Route not found').stack,
    },
  }, 404)
})

app.on('METHOD_NOT_ALLOWED', (c) => {
  return c.json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `Method ${c.req.method} not allowed for ${c.req.path}`,
    },
  }, 405)
});

export default {
  port: 3000,
  fetch: app.fetch
}

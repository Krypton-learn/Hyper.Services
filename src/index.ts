import { Hono } from 'hono'
import authRoutes from './modules/auth/auth.routes'
import orgsRoutes from './modules/orgs/orgs.routes'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello from Hyper.Services!')
})

app.route('/auth', authRoutes)
app.route('/orgs', orgsRoutes)


export default {
  port: 3000,
  fetch: app.fetch,
}

import { Hono } from 'hono'
import authRoutes from './modules/auth/auth.routes'
import orgsRoutes from './modules/orgs/orgs.routes'
import milestonesRoutes from './modules/milestones/milestones.routes'
import tasksRoutes from './modules/tasks/tasks.routes'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello from Hyper.Services!')
})

app.route('/auth', authRoutes)
app.route('/orgs', orgsRoutes)
app.route('/milestones', milestonesRoutes)
app.route('/tasks', tasksRoutes)


export default {
  port: 3000,
  fetch: app.fetch,
}

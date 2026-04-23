import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './modules/auth/auth.routes'
import orgsRoutes from './modules/orgs/orgs.routes'
import milestonesRoutes from './modules/milestones/milestones.routes'
import tasksRoutes from './modules/tasks/tasks.routes'
import employeesRoutes from './modules/employees/employees.routes'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello from Hyper.Services!')
})

app.route('/api/auth', authRoutes)
app.route('/api/orgs', orgsRoutes)
app.route('/api/milestones', milestonesRoutes)
app.route('/api/tasks', tasksRoutes)
app.route('/api/employees', employeesRoutes)


export default {
  port: 3000,
  fetch: app.fetch,
}

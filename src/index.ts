import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './modules/auth/auth.routes'
import tasks from './modules/tasks/tasks.routes'
import waitlist from './modules/waitlist/waitlist.routes'
import stores from './modules/stores/stores.routes'
import dashboard from './modules/dashboard/dashboard.routes'
import notification from './modules/notification/notification.routes'
import ai from './modules/ai/ai.routes'

const app = new Hono()

app.use('*', cors({
  origin: "*",
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => {
  return c.text('Hello from Hyper.services!')
})

app.route('/api/auth', auth)
app.route('/api/tasks', tasks)
app.route('/api/waitlist', waitlist)
app.route('/api/stores', stores)
app.route('/api/dashboard', dashboard)
app.route('/api/notification', notification)
app.route('/api/ai', ai)

export default app


import { Hono } from 'hono'
import { getOverviewController } from './dashboard.controllers'

const dashboard = new Hono()

dashboard.get('/overview', getOverviewController)

export default dashboard
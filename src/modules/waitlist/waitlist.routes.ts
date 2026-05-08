import { Hono } from 'hono'
import { addWaitlistController, getAllWaitlistController } from './waitlist.controllers'

const app = new Hono()

app.post('/add-waitlist', addWaitlistController)
app.get('/get-all-waitlist', getAllWaitlistController)

export default app
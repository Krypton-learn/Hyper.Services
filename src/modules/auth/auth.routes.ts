import { Hono } from 'hono'
import { registerController, loginController, refreshController } from './auth.controllers'

const auth = new Hono()

auth.post('/register', registerController)
auth.post('/login', loginController)
auth.post('/refresh', refreshController)

export default auth
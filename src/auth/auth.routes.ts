import { Hono } from 'hono'
import { registerUserController, loginUserController } from './auth.controllers'

export const authRoutes = new Hono()

authRoutes.post('/register', registerUserController)
authRoutes.post('/login', loginUserController)
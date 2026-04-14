import { Hono } from 'hono'
import { registerUserController, loginUserController, refreshTokenController } from './auth.controllers'

export const authRoutes = new Hono()

authRoutes.post('/register', registerUserController)
authRoutes.post('/login', loginUserController)
authRoutes.post('/refresh', refreshTokenController)
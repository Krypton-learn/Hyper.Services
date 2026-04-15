import { Hono } from 'hono'
import { registerUserController, loginUserController, refreshTokenController, getProfileController, updateProfileController } from './auth.controllers'

export const authRoutes = new Hono()

authRoutes.post('/register', registerUserController)
authRoutes.post('/login', loginUserController)
authRoutes.post('/refresh', refreshTokenController)
authRoutes.get('/me', getProfileController)
authRoutes.patch('/profile', updateProfileController)
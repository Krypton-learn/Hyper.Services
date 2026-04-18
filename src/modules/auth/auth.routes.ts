import { Hono } from 'hono';
import { registerUserController, loginUserController, refreshTokenController } from './auth.controllers';

const authRoutes = new Hono();

authRoutes.post('/register', registerUserController);
authRoutes.post('/login', loginUserController);
authRoutes.post('/refresh', refreshTokenController);

export default authRoutes;
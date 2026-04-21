import { getCookie, setCookie } from "hono/cookie";
import { Context } from 'hono';
import { registerUserSchema, loginSchema } from './auth.schema';
import { registerUserService, findUserByEmail, loginUserService } from './auth.services';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../lib/jwt.lib';

export async function registerUserController(c: Context) {
  const body = await c.req.json();
  
  const parsed = registerUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const db = c.env.DB;
  const existingUser = await findUserByEmail(db, parsed.data.email);

  if (existingUser) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  const user = await registerUserService({ db, input: parsed.data });
  return c.json({ user }, 201);
}

export async function loginUserController(c: Context) {
  const body = await c.req.json();
  
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const db = c.env.DB;
  const user = await loginUserService({ db, input: parsed.data });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = { sub: user.id, email: user.email };
  const accessToken = await generateAccessToken(c, payload);
  const refreshToken = await generateRefreshToken(c, payload);

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'Strict',
  });

  return c.json({ user, accessToken }, 200);
}

export async function refreshTokenController(c: Context) {
  const token = getCookie(c, 'refresh_token');

  if (!token) {
    return c.json({ error: 'No refresh token provided' }, 401);
  }

  try {
    const payload = await verifyRefreshToken(c, token);
    const user = await findUserByEmail(c.env.DB, payload.email);

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    const newAccessToken = await generateAccessToken(c, { sub: user.id, email: user.email });
    return c.json({ accessToken: newAccessToken }, 200);
  } catch (e) {
    return c.json({ error: 'Invalid or expired refresh token' }, 401);
  }
}
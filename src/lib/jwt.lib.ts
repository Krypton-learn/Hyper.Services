import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { auth } from 'hono/utils/basic-auth';

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export interface RefreshPayload {
  sub: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

export async function verifyJwt(c: Context, secret: string): Promise<JwtPayload> {
  const authHeader = c.req.header('Authorization');
  console.log(authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  console.log(token)

  try {
    const payload = await verify(token, secret, "HS256");
    console.log(payload)
    return payload;
  } catch (e) {
    console.log(e)
    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }
}

export async function verifyRefreshToken(c: Context, secret: string): Promise<RefreshPayload> {
  const token = getCookie(c, 'refresh_token');

  if (!token) {
    throw new HTTPException(401, { message: 'Missing refresh token' });
  }

  try {
    const payload = await c.env.JWT_SECRET.verify(secret, token) as RefreshPayload;
    if (payload.type !== 'refresh') {
      throw new HTTPException(401, { message: 'Invalid token type' });
    }
    return payload;
  } catch {
    throw new HTTPException(401, { message: 'Invalid or expired refresh token' });
  }
}

export async function generateAccessToken(c: Context, payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await sign(
    { ...payload, iat: now, exp: now + 50 * 60 },
    c.env.JWT_SECRET,
    'HS256'
  );
}

export async function generateRefreshToken(c: Context, payload: Pick<RefreshPayload, 'sub'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await sign(
    { ...payload, type: 'refresh', iat: now, exp: now + 7 * 24 * 60 * 60 },
    c.env.JWT_SECRET,
    'HS256'
  );
}

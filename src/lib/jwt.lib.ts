import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

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
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  
  try {
    const payload = await c.env.JWT_SECRET.verify(secret, token) as JwtPayload;
    return payload;
  } catch {
    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }
}

export async function verifyRefreshToken(c: Context, secret: string): Promise<RefreshPayload> {
  const token = c.req.cookie('refresh_token');
  
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

export async function generateAccessToken(c: Context, payload: object): Promise<string> {
  return await c.env.JWT_SECRET.sign(payload, { expiresIn: '50m' });
}

export async function generateRefreshToken(c: Context, payload: object): Promise<string> {
  return await c.env.JWT_SECRET.sign({ ...payload, type: 'refresh' }, { expiresIn: '7d' });
}
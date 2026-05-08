import { Context, Next } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { registerSchema, loginSchema } from '@packages/schemas/auth.schemas'
import { registerService, loginService, refreshService } from './auth.services'
import { getRefreshTokenExpiry } from '@/lib/jwt'

export const registerController = async (c: Context, next: Next) => {
  const body = await c.req.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  try {
    const user = await registerService(c.env.DB, parsed.data)
    return c.json(
      {
        message: 'User registered successfully',
        user,
      },
      201
    )
  } catch (e) {
    const error = e as Error
    return c.json({ errors: { general: [error.message] } }, 400)
  }
}

export const loginController = async (c: Context, next: Next) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  try {
    const result = await loginService(c.env.DB, parsed.data)

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: getRefreshTokenExpiry(),
      path: '/',
    })

    return c.json(
      {
        message: result.message,
        user: result.user,
        accessToken: result.accessToken,
      },
      200
    )
  } catch (e) {
    const error = e as Error
    return c.json({ errors: { general: [error.message] } }, 401)
  }
}

export const refreshController = async (c: Context, next: Next) => {
  const refreshToken = getCookie(c, 'refreshToken')

  if (!refreshToken) {
    return c.json({ errors: { general: ['Refresh token not found'] } }, 401)
  }

  try {
    const result = await refreshService(c.env.DB, refreshToken)

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: getRefreshTokenExpiry(),
      path: '/',
    })

    return c.json(
      {
        message: result.message,
        user: result.user,
        accessToken: result.accessToken,
      },
      200
    )
  } catch (e) {
    const error = e as Error
    return c.json({ errors: { general: [error.message] } }, 401)
  }
}

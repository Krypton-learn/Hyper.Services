import type { Context } from 'hono'
import { registerUserService, loginUserService } from './auth.serivces'
import { registerSchema, loginSchema } from './auth.validators'
import { setCookie } from 'hono/cookie'

export async function registerUserController(c: Context) {
  try {
    const body = await c.req.json()

    const validated = registerSchema.safeParse(body)
    if (!validated.success) {
      return c.json(
        { error: validated.error },
        400
      )
    }

    const { username, email, password } = validated.data

    const userId = await registerUserService(username, email, password)

    return c.json(
      { message: 'User registered successfully', userId },
      201
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return c.json({ error: message }, 400)
  }
}

export async function loginUserController(c: Context) {
  try {
    const body = await c.req.json()

    const validated = loginSchema.safeParse(body)
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const { email, password } = validated.data

    const loginData = await loginUserService(email, password)

    setCookie(c, 'refresh_token', loginData.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return c.json(
      { message: 'Login successful', accessToken: loginData.accessToken },
      200
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return c.json({ error: message }, 401)
  }
}

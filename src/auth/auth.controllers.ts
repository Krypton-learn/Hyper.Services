import type { Context } from 'hono'
import { registerUserService, loginUserService } from './auth.serivces'
import { registerSchema, loginSchema } from 'packages/schemas/auth.validators'
import { setCookie } from 'hono/cookie'
import { decodeJWT, createJWT } from './auth.helpers'

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

    const { username, email, password, firstName, lastName, phone, dob, interests, address } = validated.data

    const userId = await registerUserService({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      dob: dob ? new Date(dob) : undefined,
      interests,
      address,
    })

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

    const { identifier, password } = validated.data

    const loginData = await loginUserService(identifier, password)

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

export async function refreshTokenController(c: Context) {
  try {
    const refreshToken = c.req.cookie('refresh_token')

    if (!refreshToken) {
      return c.json({ error: 'Refresh token not found' }, 401)
    }

    const decoded = await decodeJWT(refreshToken)
    if (!decoded || !decoded.userId) {
      return c.json({ error: 'Invalid refresh token' }, 401)
    }

    const accessToken = await createJWT({ userId: decoded.userId }, 15 * 60)

    return c.json({ accessToken }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to refresh token'
    return c.json({ error: message }, 401)
  }
}

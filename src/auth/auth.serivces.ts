import { hashPassword, verifyPassword, createJWT } from './auth.helpers'
import { findUserByUsernameOrEmail, createUser, findUserByEmail } from './auth.crud'

export async function registerUserService(
  username: string,
  email: string,
  password: string
) {
  try {
    const existingUser = await findUserByUsernameOrEmail(username, email)

    if (existingUser) {
      throw new Error('Username or email already exists')
    }

    const passwordHash = await hashPassword(password)

    const employee = {
      username,
      email,
      passwordHash,
    }

    const result = await createUser(employee)
    return result
  } catch (error) {
    console.error('Register user error:', error)
    throw error
  }
}

export async function loginUserService(email: string, password: string) {
  try {
    const user = await findUserByEmail(email)

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    const accessToken = await createJWT({ userId: user._id.toString() }, '15m')
    const refreshToken = await createJWT({ userId: user._id.toString() }, '7d')

    return { accessToken, refreshToken, userId: user._id }
  } catch (error) {
    console.error('Login user error:', error)
    throw error
  }
}


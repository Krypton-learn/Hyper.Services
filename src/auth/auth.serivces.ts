import { getDB } from '../core/db.core'
import { hashPassword, verifyPassword, createJWT } from './auth.helpers'

const collectionName = 'employees'

export async function registerUserService(
  username: string,
  email: string,
  password: string
) {
  try {
    const db = getDB()
    const collection = db.collection(collectionName)

    const existingUser = await collection.findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      throw new Error('Username or email already exists')
    }

    const passwordHash = await hashPassword(password)

    const employee = {
      username,
      email,
      passwordHash,
    }

    const result = await collection.insertOne(employee)
    return result.insertedId
  } catch (error) {
    console.error('Register user error:', error)
    throw error
  }
}

export async function loginUserService(email: string, password: string) {
  try {
    const db = getDB()
    const collection = db.collection(collectionName)

    const user = await collection.findOne({ email })

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


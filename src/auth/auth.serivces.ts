import { ObjectId } from 'mongodb'
import { hashPassword, verifyPassword, createJWT } from './auth.helpers'
import { findUserByUsernameOrEmail, createUser, findUserByUsernameOrEmailForLogin, updateUserById } from './auth.crud'

export interface RegisterUserInput {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  dob?: Date
  interests?: string[]
  address?: string
}

export async function registerUserService(input: RegisterUserInput) {
  try {
    const existingUser = await findUserByUsernameOrEmail(input.username, input.email)

    if (existingUser) {
      throw new Error('Username or email already exists')
    }

    const passwordHash = await hashPassword(input.password)

    const user = {
      username: input.username,
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      dob: input.dob,
      interests: input.interests,
      address: input.address,
    }

    const result = await createUser(user)
    return result
  } catch (error) {
    console.error('Register user error:', error)
    throw error
  }
}

export async function loginUserService(identifier: string, password: string) {
  try {
    const user = await findUserByUsernameOrEmailForLogin(identifier)

    if (!user) {
      throw new Error('Invalid email/username or password')
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      throw new Error('Invalid email/username or password')
    }

    const accessToken = await createJWT({ userId: user._id.toString() }, 15 * 60)
    const refreshToken = await createJWT({ userId: user._id.toString() }, 7 * 24 * 60 * 60)

    return { accessToken, refreshToken, userId: user._id }
  } catch (error) {
    console.error('Login user error:', error)
    throw error
  }
}

export interface UpdateUserProfileInput {
  firstName?: string
  lastName?: string
  phone?: string
  dob?: Date
  interests?: string[]
  address?: string
  organization?: string
}

export async function updateUserProfileService(
  userId: string,
  updateFields: UpdateUserProfileInput
) {
  try {
    const updateData: Record<string, unknown> = {}
    if (updateFields.firstName) updateData.firstName = updateFields.firstName
    if (updateFields.lastName) updateData.lastName = updateFields.lastName
    if (updateFields.phone) updateData.phone = updateFields.phone
    if (updateFields.dob) updateData.dob = updateFields.dob
    if (updateFields.interests) updateData.interests = updateFields.interests
    if (updateFields.address) updateData.address = updateFields.address
    if (updateFields.organization) {
      updateData.organization = new ObjectId(updateFields.organization)
    }

    const updatedUser = await updateUserById(userId, updateData)
    return updatedUser
  } catch (error) {
    console.error('Update user profile error:', error)
    throw error
  }
}


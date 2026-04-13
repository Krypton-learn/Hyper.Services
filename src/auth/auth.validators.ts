import { z } from 'zod'

export const registerSchema = z.object({
	username: z.string().min(3).max(30),
	email: z.string().email(),
	password: z.string().min(8),
})

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

export const updateUserProfileSchema = z.object({
	organization: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
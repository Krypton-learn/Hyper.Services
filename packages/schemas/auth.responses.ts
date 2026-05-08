import { z } from 'zod'

export const registerResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
})

export type RegisterResponse = z.infer<typeof registerResponseSchema>

export const loginResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
  accessToken: z.string(),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const refreshResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
  }),
  accessToken: z.string(),
})

export type RefreshResponse = z.infer<typeof refreshResponseSchema>

export const errorResponseSchema = z.object({
  errors: z.record(z.string(), z.array(z.string())),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>
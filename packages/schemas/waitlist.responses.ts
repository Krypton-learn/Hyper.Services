import { z } from 'zod'

export const waitlistEntrySchema = z.object({
  id: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  desc: z.string().nullable(),
  createdAt: z.string(),
})

export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>

export const addWaitlistResponseSchema = z.object({
  message: z.string(),
  entry: waitlistEntrySchema,
})

export type AddWaitlistResponse = z.infer<typeof addWaitlistResponseSchema>

export const getAllWaitlistResponseSchema = z.object({
  results: z.array(waitlistEntrySchema),
  success: z.boolean(),
})

export type GetAllWaitlistResponse = z.infer<typeof getAllWaitlistResponseSchema>
import { z } from 'zod'

export const addWaitlistSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  desc: z.string().optional(),
})

export type AddWaitlistInput = z.infer<typeof addWaitlistSchema>
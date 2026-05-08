import { z } from 'zod'

export const chatResponseSchema = z.object({
  role: z.literal('assistant'),
  content: z.string(),
})

export type ChatResponse = z.infer<typeof chatResponseSchema>
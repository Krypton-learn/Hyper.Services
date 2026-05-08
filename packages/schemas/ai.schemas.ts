import { z } from 'zod'

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']).optional(),
  content: z.string(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>

export const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'At least one message is required'),
  context: z.string().optional(),
})

export type ChatInput = z.infer<typeof chatSchema>
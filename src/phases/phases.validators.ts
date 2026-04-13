import { z } from 'zod'

export const createPhaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tasks: z.array(z.string()).optional(),
  budget: z.number().optional(),
  starting_date: z.coerce.date().optional(),
  ending_date: z.coerce.date().optional(),
  sops: z.array(z.string()).optional(),
  organization: z.string().min(1, 'Organization is required'),
})

export const updatePhaseSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  tasks: z.array(z.string()).optional(),
  budget: z.number().optional(),
  starting_date: z.coerce.date().optional(),
  ending_date: z.coerce.date().optional(),
  sops: z.array(z.string()).optional(),
})

export const phaseIdSchema = z.object({
  id: z.string().min(1, 'Phase ID is required'),
})

export const getAllPhaseSchema = z.object({})

export type createPhaseInput = z.infer<typeof createPhaseSchema>
export type updatePhaseInput = z.infer<typeof updatePhaseSchema>
export type phaseIdInput = z.infer<typeof phaseIdSchema>
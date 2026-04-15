import { z } from 'zod'

export const createOrgSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  founder: z.string().min(1, 'Founder is required'),
  admin: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
})

export const updateOrgSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  founder: z.string().min(1, 'Founder is required').optional(),
  admin: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
})

export const orgIdSchema = z.object({
  id: z.string().min(1, 'Organization ID is required'),
})

export const getAllOrgSchema = z.object({})

export type createOrgInput = z.infer<typeof createOrgSchema>
export type updateOrgInput = z.infer<typeof updateOrgSchema>
export type orgIdInput = z.infer<typeof orgIdSchema>
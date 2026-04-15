import { z } from 'zod'

export const createEmployeeValidator = z.object({
  userId: z.string(),
  isAdmin: z.boolean().default(false),
  isFounder: z.boolean().default(false),
  department: z.string().optional(),
  organization: z.array(z.string()).optional(),
  role: z.enum(['employee', 'Head']).default('employee'),
  joiningDate: z.coerce.date().optional(),
})

export const updateEmployeeValidator = z.object({
  userId: z.string().optional(),
  isAdmin: z.boolean().optional(),
  isFounder: z.boolean().optional(),
  department: z.string().optional(),
  organization: z.array(z.string()).optional(),
  role: z.enum(['employee', 'Head']).optional(),
  joiningDate: z.coerce.date().optional(),
})

export type CreateEmployeeDto = z.infer<typeof createEmployeeValidator>
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeValidator>
import { z } from 'zod'

export const createEmployeeValidator = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  organization: z.string().optional(),
  role: z.enum(['employee', 'Head']).optional(),
  profilePicture: z.string().optional(),
  address: z.string().optional(),
  joiningDate: z.string().datetime().optional(),
})

export const updateEmployeeValidator = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  passwordHash: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  organization: z.string().optional(),
  role: z.enum(['employee', 'Head']).optional(),
  profilePicture: z.string().optional(),
  address: z.string().optional(),
  joiningDate: z.string().datetime().optional(),
})

export type CreateEmployeeDto = z.infer<typeof createEmployeeValidator>
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeValidator>

import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  created_by: z.string().optional(),
  assigned_to: z.string().optional(),
  starting_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  status: z.enum(['Due', 'Upcoming', 'Completed']).optional(),
  team: z.array(z.string()).optional(),
  phase: z.string().optional(),
  tempTeamMembers: z.array(z.string()).optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  assigned_to: z.string().optional(),
  starting_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  status: z.enum(['Due', 'Upcoming', 'Completed']).optional(),
  team: z.array(z.string()).optional(),
  phase: z.string().optional(),
  tempTeamMembers: z.array(z.string()).optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1),
})

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  interests: z.array(z.string()).optional(),
  address: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
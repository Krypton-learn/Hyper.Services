import { z } from 'zod'

const dateSchema = z.string().refine((val) => {
  if (!val) return true
  const date = new Date(val)
  return !isNaN(date.getTime())
}, 'Invalid date format')

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  desc: z.string().optional(),
  isCompleted: z.boolean().default(false),
  assignedTo: z.string().optional(),
  startingDate: dateSchema.optional(),
  deadline: dateSchema.optional(),
  status: z.enum(['Urgent', 'Common']).default('Common'),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  desc: z.string().optional(),
  isCompleted: z.boolean().optional(),
  assignedTo: z.string().optional(),
  startingDate: dateSchema.optional(),
  deadline: dateSchema.optional(),
  status: z.enum(['Urgent', 'Common']).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const completeTaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
})

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>

export const taskParamsSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
})

export type TaskParams = z.infer<typeof taskParamsSchema>

export const paginationSchema = z.object({
  page: z.coerce.number().default(0),
})

export type PaginationParams = z.infer<typeof paginationSchema>
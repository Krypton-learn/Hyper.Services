import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  created_by: z.string().min(1, 'Created by is required'),
  assigned_to: z.string().optional(),
  starting_date: z.coerce.date(),
  due_date: z.coerce.date(),
  status: z.enum(['Due', 'Upcoming', 'Completed']).optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  assigned_to: z.string().optional(),
  starting_date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  status: z.enum(['Due', 'Upcoming', 'Completed']).optional(),
})

export const taskIdSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
})

export const getAllTaskSchema = z.object({})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskIdInput = z.infer<typeof taskIdSchema>

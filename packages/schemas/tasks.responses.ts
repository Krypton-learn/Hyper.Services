import { z } from 'zod'

export const taskUserSchema = z.object({
  creator_id: z.string().nullable(),
  creator_username: z.string().nullable(),
  creator_email: z.string().nullable(),
  assignee_id: z.string().nullable(),
  assignee_username: z.string().nullable(),
  assignee_email: z.string().nullable(),
})

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  desc: z.string().nullable(),
  isCompleted: z.number(),
  startingDate: z.string(),
  deadline: z.string(),
  createdAt: z.string(),
})

export const taskWithUserSchema = taskSchema.merge(taskUserSchema)

export type Task = z.infer<typeof taskSchema>
export type TaskWithUser = z.infer<typeof taskWithUserSchema>

export const createTaskResponseSchema = z.object({
  message: z.string(),
  task: taskWithUserSchema,
})

export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>

export const getTasksResponseSchema = z.object({
  results: z.array(taskWithUserSchema),
  success: z.boolean(),
})

export type GetTasksResponse = z.infer<typeof getTasksResponseSchema>

export const getTaskResponseSchema = taskWithUserSchema

export type GetTaskResponse = z.infer<typeof getTaskResponseSchema>

export const updateTaskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  desc: z.string().nullable(),
  isCompleted: z.number(),
  startingDate: z.string(),
  deadline: z.string(),
})

export type UpdateTaskResponse = z.infer<typeof updateTaskResponseSchema>

export const deleteTaskResponseSchema = z.object({
  message: z.string(),
})

export type DeleteTaskResponse = z.infer<typeof deleteTaskResponseSchema>

export const completeTaskResponseSchema = z.object({
  message: z.string(),
  task: taskWithUserSchema,
})

export type CompleteTaskResponse = z.infer<typeof completeTaskResponseSchema>
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

export const dashboardStatsSchema = z.object({
  total: z.number().nullable().transform(v => v ?? 0),
  completed: z.number().nullable().transform(v => v ?? 0),
  pending: z.number().nullable().transform(v => v ?? 0),
})

export const overviewResponseSchema = z.object({
  pending: z.array(taskWithUserSchema),
  completed: z.array(taskWithUserSchema),
  overdue: z.array(taskWithUserSchema),
  stats: dashboardStatsSchema,
})

export type OverviewResponse = z.infer<typeof overviewResponseSchema>
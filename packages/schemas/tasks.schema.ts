import { z } from 'zod';

export const taskPriority = ['Low', 'Medium', 'High', 'Urgent'] as const;
export type TaskPriority = typeof taskPriority[number];

export const createTaskSchema = z.object({
  milestoneId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startingDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(taskPriority).optional(),
  team: z.array(z.string()).optional(),
  tempTeam: z.array(z.string()).optional(),
  token: z.string().min(1),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullish(),
  startingDate: z.string().datetime().nullish(),
  dueDate: z.string().datetime().nullish(),
  priority: z.enum(taskPriority).nullish(),
  team: z.array(z.string()).optional(),
  tempTeam: z.array(z.string()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export type Task = {
  id: string;
  milestoneId: string;
  token: string;
  title: string;
  description: string | undefined;
  startingDate: string | undefined;
  dueDate: string | undefined;
  priority: TaskPriority | undefined;
  team: string[];
  tempTeam: string[];
  createdBy: string;
  createdAt: Date;
};
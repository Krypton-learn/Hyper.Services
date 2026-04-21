import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../../lib/id.lib';
import { CreateTaskInput, UpdateTaskInput, Task } from '../../../packages/schemas/tasks.schema';
import { createTask, findTaskById, findTasksByToken, updateTask, deleteTask } from './tasks.crud';
import { findOrgByToken } from '../orgs/orgs.crud';
import { findMilestoneById } from '../milestones/milestones.crud';

export interface CreateTaskServiceParams {
  db: D1Database;
  input: CreateTaskInput;
  userId: string;
}

export async function createTaskService({ db, input, userId }: CreateTaskServiceParams): Promise<Task> {
  const org = await findOrgByToken(db, input.token);
  if (!org) {
    throw new Error('Organization not found');
  }

  const milestone = await findMilestoneById(db, input.milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  const task: Task = {
    id: generateId(),
    milestoneId: input.milestoneId,
    token: input.token,
    title: input.title,
    description: input.description,
    startingDate: input.startingDate,
    dueDate: input.dueDate,
    priority: input.priority,
    team: input.team || [],
    tempTeam: input.tempTeam || [],
    createdBy: userId,
    createdAt: new Date(),
  };

  await createTask(db, task);

  return task;
}

export interface GetTasksServiceParams {
  db: D1Database;
  token: string;
}

export async function getTasksService({ db, token }: GetTasksServiceParams): Promise<Task[]> {
  const org = await findOrgByToken(db, token);
  if (!org) {
    throw new Error('Organization not found');
  }

  return await findTasksByToken(db, token);
}

export interface UpdateTaskServiceParams {
  db: D1Database;
  taskId: string;
  token: string;
  input: UpdateTaskInput;
  userId: string;
}

export async function updateTaskService({ db, taskId, token, input, userId }: UpdateTaskServiceParams): Promise<Task> {
  const task = await findTaskById(db, taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  if (task.token !== token) {
    throw new Error('Task does not belong to this organization');
  }

  if (task.createdBy !== userId) {
    throw new Error('Only the creator can update this task');
  }

  await updateTask(db, taskId, {
    title: input.title,
    description: input.description ?? null,
    startingDate: input.startingDate ?? null,
    dueDate: input.dueDate ?? null,
    priority: input.priority ?? null,
    team: input.team,
    tempTeam: input.tempTeam,
  });

  const updated = await findTaskById(db, taskId);
  if (!updated) {
    throw new Error('Task not found');
  }

  return updated;
}

export interface RemoveTaskServiceParams {
  db: D1Database;
  taskId: string;
  token: string;
  userId: string;
}

export async function removeTaskService({ db, taskId, token, userId }: RemoveTaskServiceParams): Promise<void> {
  const task = await findTaskById(db, taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  if (task.token !== token) {
    throw new Error('Task does not belong to this organization');
  }

  if (task.createdBy !== userId) {
    throw new Error('Only the creator can delete this task');
  }

  await deleteTask(db, taskId);
}
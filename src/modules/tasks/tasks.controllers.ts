import { Context } from 'hono';
import { createTaskSchema, updateTaskSchema } from './tasks.schema';
import { createTaskService, getTasksService, updateTaskService, removeTaskService } from './tasks.services';
import { verifyJwt } from '../../lib/jwt.lib';
import { findMemberByUserAndOrg, findOrgByToken } from '../orgs/orgs.crud';

export async function createTaskController(c: Context) {
  const body = await c.req.json();
  
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);
  
  const db = c.env.DB;
  const { token, ...taskInput } = parsed.data;
  
  const org = await findOrgByToken(db, token);
  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }
  
  const member = await findMemberByUserAndOrg(db, jwt.sub, org.id);
  if (!member) {
    return c.json({ error: 'You are not a member of this organization' }, 403);
  }
  
  try {
    const task = await createTaskService({ 
      db, 
      input: {
        ...taskInput,
        token,
      },
      userId: jwt.sub,
    });
    
    return c.json({ task }, 201);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create task';
    return c.json({ error: message }, 400);
  }
}

export async function getTasksController(c: Context) {
  const body = await c.req.json();
  const { token } = body;

  if (!token) {
    return c.json({ error: 'Organization token is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);
  
  const db = c.env.DB;
  
  const org = await findOrgByToken(db, token);
  if (!org) {
    return c.json({ error: 'Organization not found' }, 404);
  }

  const member = await findMemberByUserAndOrg(db, jwt.sub, org.id);
  if (!member) {
    return c.json({ error: 'You are not a member of this organization' }, 403);
  }

  try {
    const tasks = await getTasksService({ 
      db, 
      token,
    });
    
    return c.json({ tasks }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to get tasks';
    return c.json({ error: message }, 400);
  }
}

export async function updateTaskController(c: Context) {
  const taskId = c.req.param('id');
  
  if (!taskId) {
    return c.json({ error: 'Task ID is required' }, 400);
  }

  const body = await c.req.json();
  const { token, ...updateData } = body;
  
  if (!token) {
    return c.json({ error: 'Organization token is required' }, 400);
  }
  
  const parsed = updateTaskSchema.safeParse(updateData);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);
  
  const db = c.env.DB;
  
  try {
    const task = await updateTaskService({ 
      db, 
      taskId,
      token,
      input: parsed.data,
      userId: jwt.sub,
    });
    
    return c.json({ task }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update task';
    if (message === 'Task not found') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Only the creator can update this task') {
      return c.json({ error: message }, 403);
    }
    if (message === 'Task does not belong to this organization') {
      return c.json({ error: message }, 403);
    }
    return c.json({ error: message }, 400);
  }
}

export async function removeTaskController(c: Context) {
  const taskId = c.req.param('id');
  
  if (!taskId) {
    return c.json({ error: 'Task ID is required' }, 400);
  }

  const body = await c.req.json();
  const { token } = body;
  
  if (!token) {
    return c.json({ error: 'Organization token is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);
  
  const db = c.env.DB;
  
  try {
    await removeTaskService({ 
      db, 
      taskId,
      token,
      userId: jwt.sub,
    });
    
    return c.json({ message: 'Task deleted successfully' }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to delete task';
    if (message === 'Task not found') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Only the creator can delete this task') {
      return c.json({ error: message }, 403);
    }
    if (message === 'Task does not belong to this organization') {
      return c.json({ error: message }, 403);
    }
    return c.json({ error: message }, 400);
  }
}
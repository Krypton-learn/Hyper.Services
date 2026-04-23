import { Context } from 'hono';
import { updateEmployeeSchema } from '../../../packages/schemas/employees.schema';
import { getEmployeesService, getEmployeeService, updateEmployeeService, removeEmployeeService } from './employees.services';
import { verifyJwt } from '../../lib/jwt.lib';

export async function getEmployeesController(c: Context) {
  const orgId = c.req.param('orgId');

  if (!orgId) {
    return c.json({ error: 'Organization ID is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    const employees = await getEmployeesService({ db, orgId });

    return c.json({ employees }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to get employees';
    return c.json({ error: message }, 400);
  }
}

export async function getEmployeeController(c: Context) {
  const employeeId = c.req.param('id');

  if (!employeeId) {
    return c.json({ error: 'Employee ID is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    const employee = await getEmployeeService({ db, employeeId });

    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    return c.json({ employee }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to get employee';
    return c.json({ error: message }, 400);
  }
}

export async function updateEmployeeController(c: Context) {
  const employeeId = c.req.param('id');
  const orgId = c.req.param('orgId');

  if (!employeeId) {
    return c.json({ error: 'Employee ID is required' }, 400);
  }

  if (!orgId) {
    return c.json({ error: 'Organization ID is required' }, 400);
  }

  const body = await c.req.json();

  const parsed = updateEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    await updateEmployeeService({
      db,
      employeeId,
      userId: jwt.sub,
      orgId,
      input: parsed.data,
    });

    return c.json({ message: 'Employee updated successfully' }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update employee';
    if (message === 'Not a member of this organization') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Only founders or admins can update employees') {
      return c.json({ error: message }, 403);
    }
    if (message === 'Employee not found') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Cannot update the founder') {
      return c.json({ error: message }, 403);
    }
    return c.json({ error: message }, 400);
  }
}

export async function removeEmployeeController(c: Context) {
  const employeeId = c.req.param('id');
  const orgId = c.req.param('orgId');

  if (!employeeId) {
    return c.json({ error: 'Employee ID is required' }, 400);
  }

  if (!orgId) {
    return c.json({ error: 'Organization ID is required' }, 400);
  }

  const jwt = await verifyJwt(c, c.env.JWT_SECRET);

  const db = c.env.DB;

  try {
    await removeEmployeeService({
      db,
      employeeId,
      userId: jwt.sub,
      orgId,
    });

    return c.json({ message: 'Employee removed successfully' }, 200);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to remove employee';
    if (message === 'Not a member of this organization') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Only founders or admins can remove employees') {
      return c.json({ error: message }, 403);
    }
    if (message === 'Employee not found') {
      return c.json({ error: message }, 404);
    }
    if (message === 'Cannot remove the founder') {
      return c.json({ error: message }, 403);
    }
    if (message === 'Cannot remove yourself') {
      return c.json({ error: message }, 400);
    }
    return c.json({ error: message }, 400);
  }
}
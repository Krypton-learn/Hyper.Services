import type { Context } from 'hono'
import {
  createEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService,
  getEmployeesByOrganizationService,
} from './employees.services'
import {
  createEmployeeValidator,
  updateEmployeeValidator,
} from './employees.validators'
import {
  getUserIdFromToken,
  getUserOrganizationId,
  isUserAdminOrFounder,
} from './employees.helpers'

function getTokenFromHeader(c: Context): string | null {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

export async function createEmployeeController(c: Context) {
  try {
    const token = getTokenFromHeader(c)
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const body = await c.req.json()

    const validated = createEmployeeValidator.safeParse(body)
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const userOrgId = await getUserOrganizationId(userId)
    if (!userOrgId) {
      return c.json({ error: 'User has no organization' }, 403)
    }

    const isAuthorized = await isUserAdminOrFounder(userId, userOrgId)
    if (!isAuthorized) {
      return c.json({ error: 'Only admin or founder can create employees' }, 403)
    }

    const employee = await createEmployeeService({
      ...validated.data,
      organization: [userOrgId],
    })

    return c.json({ message: 'Employee created successfully', employee }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create employee'
    return c.json({ error: message }, 400)
  }
}

export async function getAllEmployeesController(c: Context) {
  try {
    const token = getTokenFromHeader(c)
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const userOrgId = await getUserOrganizationId(userId)
    if (!userOrgId) {
      return c.json({ error: 'User has no organization' }, 403)
    }

    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = 20
    const skip = (page - 1) * limit
    const populate = c.req.query('populate') === 'true'

    const employees = await getEmployeesByOrganizationService(userOrgId, skip, limit, populate)

    return c.json({ employees, page, limit }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch employees'
    return c.json({ error: message }, 400)
  }
}

export async function getEmployeeByIdController(c: Context) {
  try {
    const token = getTokenFromHeader(c)
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'Employee ID required' }, 400)
    }

    const userOrgId = await getUserOrganizationId(userId)
    if (!userOrgId) {
      return c.json({ error: 'User has no organization' }, 403)
    }

    const employee = await getEmployeeByIdService(id)
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404)
    }

    const employeeOrgId = employee.organization?.toString()
    if (employeeOrgId !== userOrgId) {
      return c.json({ error: 'Employee does not belong to your organization' }, 403)
    }

    return c.json({ employee }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch employee'
    return c.json({ error: message }, 400)
  }
}

export async function updateEmployeeController(c: Context) {
  try {
    const token = getTokenFromHeader(c)
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'Employee ID required' }, 400)
    }

    const userOrgId = await getUserOrganizationId(userId)
    if (!userOrgId) {
      return c.json({ error: 'User has no organization' }, 403)
    }

    const isAuthorized = await isUserAdminOrFounder(userId, userOrgId)
    if (!isAuthorized) {
      return c.json({ error: 'Only admin or founder can update employees' }, 403)
    }

    const employee = await getEmployeeByIdService(id)
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404)
    }

    const employeeOrgId = employee.organization?.toString()
    if (employeeOrgId !== userOrgId) {
      return c.json({ error: 'Employee does not belong to your organization' }, 403)
    }

    const body = await c.req.json()

    const validated = updateEmployeeValidator.safeParse(body)
    if (!validated.success) {
      return c.json({ error: validated.error }, 400)
    }

    const updated = await updateEmployeeService(id, validated.data)

    return c.json({ message: 'Employee updated successfully', employee: updated }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update employee'
    return c.json({ error: message }, 400)
  }
}

export async function deleteEmployeeController(c: Context) {
  try {
    const token = getTokenFromHeader(c)
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'Employee ID required' }, 400)
    }

    const userOrgId = await getUserOrganizationId(userId)
    if (!userOrgId) {
      return c.json({ error: 'User has no organization' }, 403)
    }

    const isAuthorized = await isUserAdminOrFounder(userId, userOrgId)
    if (!isAuthorized) {
      return c.json({ error: 'Only admin or founder can delete employees' }, 403)
    }

    const employee = await getEmployeeByIdService(id)
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404)
    }

    const employeeOrgId = employee.organization?.toString()
    if (employeeOrgId !== userOrgId) {
      return c.json({ error: 'Employee does not belong to your organization' }, 403)
    }

    const deleted = await deleteEmployeeService(id)

    return c.json({ message: 'Employee deleted successfully', deleted }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete employee'
    return c.json({ error: message }, 400)
  }
}

import { D1Database } from '@cloudflare/workers-types';
import { UpdateEmployeeInput, EmployeeWithUser } from '../../../packages/schemas/employees.schema';
import { findEmployeesByOrgId, findEmployeeById, findEmployeeByUserAndOrg, updateEmployee, deleteEmployee, deleteEmployeesByOrgId } from './employees.crud';

export interface GetEmployeesServiceParams {
  db: D1Database;
  orgId: string;
}

export async function getEmployeesService({ db, orgId }: GetEmployeesServiceParams): Promise<EmployeeWithUser[]> {
  return findEmployeesByOrgId(db, orgId);
}

export interface GetEmployeeServiceParams {
  db: D1Database;
  employeeId: string;
}

export async function getEmployeeService({ db, employeeId }: GetEmployeeServiceParams): Promise<EmployeeWithUser | null> {
  const employee = await findEmployeeById(db, employeeId);
  if (!employee) return null;

  const userResult = await db.prepare(`
    SELECT id, name, email, profile FROM users WHERE id = ?
  `).bind(employee.userId).first();

  if (!userResult) return null;

  return {
    id: employee.id,
    orgId: employee.orgId,
    isFounder: employee.isFounder,
    isAdmin: employee.isAdmin,
    department: employee.department,
    role: employee.role,
    joinedAt: employee.joinedAt,
    user: {
      id: userResult.id as string,
      name: userResult.name as string,
      email: userResult.email as string,
      profile: userResult.profile ? JSON.parse(userResult.profile as string) : null,
    },
  };
}

export interface UpdateEmployeeServiceParams {
  db: D1Database;
  employeeId: string;
  userId: string;
  orgId: string;
  input: UpdateEmployeeInput;
}

export async function updateEmployeeService({ db, employeeId, userId, orgId, input }: UpdateEmployeeServiceParams): Promise<void> {
  const requester = await findEmployeeByUserAndOrg(db, userId, orgId);

  if (!requester) {
    throw new Error('Not a member of this organization');
  }

  if (!requester.isFounder && !requester.isAdmin) {
    throw new Error('Only founders or admins can update employees');
  }

  const targetEmployee = await findEmployeeById(db, employeeId);
  if (!targetEmployee) {
    throw new Error('Employee not found');
  }

  if (targetEmployee.isFounder) {
    throw new Error('Cannot update the founder');
  }

  await updateEmployee(db, employeeId, {
    isAdmin: input.isAdmin,
    department: input.department,
    role: input.role,
  });
}

export interface RemoveEmployeeServiceParams {
  db: D1Database;
  employeeId: string;
  userId: string;
  orgId: string;
}

export async function removeEmployeeService({ db, employeeId, userId, orgId }: RemoveEmployeeServiceParams): Promise<void> {
  const requester = await findEmployeeByUserAndOrg(db, userId, orgId);

  if (!requester) {
    throw new Error('Not a member of this organization');
  }

  if (!requester.isFounder && !requester.isAdmin) {
    throw new Error('Only founders or admins can remove employees');
  }

  const targetEmployee = await findEmployeeById(db, employeeId);
  if (!targetEmployee) {
    throw new Error('Employee not found');
  }

  if (targetEmployee.isFounder) {
    throw new Error('Cannot remove the founder');
  }

  if (targetEmployee.userId === userId) {
    throw new Error('Cannot remove yourself');
  }

  await deleteEmployee(db, employeeId);
}

export interface RemoveEmployeesByOrgServiceParams {
  db: D1Database;
  orgId: string;
}

export async function removeEmployeesByOrgService({ db, orgId }: RemoveEmployeesByOrgServiceParams): Promise<void> {
  await deleteEmployeesByOrgId(db, orgId);
}
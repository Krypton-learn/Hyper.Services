import { z } from 'zod';

export const updateEmployeeSchema = z.object({
  isAdmin: z.boolean().optional(),
  department: z.string().optional().nullable(),
  role: z.enum(['Head', 'Member']).optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export type Employee = {
  id: string;
  orgId: string;
  userId: string;
  isFounder: boolean;
  isAdmin: boolean;
  department: string | null;
  role: 'Head' | 'Member';
  joinedAt: Date;
};

export type EmployeeWithUser = Omit<Employee, 'userId'> & {
  user: {
    id: string;
    name: string;
    email: string;
    profile: {
      avatar: string | null;
      bio: string | null;
    } | null;
  };
};
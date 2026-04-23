import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export const joinOrgSchema = z.object({
  token: z.string().min(1),
});

export const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type JoinOrgInput = z.infer<typeof joinOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;

export type OrganizationRole = 'Head' | 'Member';

export type Organization = CreateOrgInput & {
  id: string;
  token: string;
  createdAt: Date;
};

export type OrganizationMember = {
  id: string;
  orgId: string;
  userId: string;
  isFounder: boolean;
  isAdmin: boolean;
  department: string | null;
  role: OrganizationRole;
  joinedAt: Date;
};

export type OrganizationWithMembers = Organization & {
  members: OrganizationMemberWithUser[];
};

export type OrganizationMemberWithUser = Omit<OrganizationMember, 'userId'> & {
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

export type OrganizationWithMembersAndUser = Organization & {
  members: OrganizationMemberWithUser[];
};

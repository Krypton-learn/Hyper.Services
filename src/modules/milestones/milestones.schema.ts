import { z } from 'zod';

export const milestoneCategories = ['Planning', 'Development', 'Administrative'] as const;
export type MilestoneCategory = typeof milestoneCategories[number];

export const createMilestoneSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  budget: z.number().min(0).optional(),
  category: z.enum(milestoneCategories).optional(),
  token: z.string().min(1),
  startingDate: z.string().datetime().optional(),
  endingDate: z.string().datetime().optional(),
});

export const updateMilestoneSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  budget: z.number().min(0).optional(),
  category: z.enum(milestoneCategories).optional(),
  startingDate: z.string().datetime().optional(),
  endingDate: z.string().datetime().optional(),
});

export type CreateMilestoneInput = Omit<z.infer<typeof createMilestoneSchema>, 'token'> & { token: string };
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export type Milestone = {
  id: string;
  name: string;
  description: string | undefined;
  budget: number | undefined;
  category: MilestoneCategory | undefined;
  token: string;
  createdBy: string;
  createdAt: Date;
  startingDate: string | undefined;
  endingDate: string | undefined;
};

export type MilestoneWithCreator = Omit<Milestone, 'createdBy'> & {
  createdBy: {
    id: string;
    name: string;
    email: string;
    profile: {
      avatar: string | null;
      bio: string | null;
    } | null;
  };
};
import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  password: z.string().min(6),
  organizations: z.array(z.string()).default([]),
  profile: z.object({
    avatar: z.string().optional(),
    bio: z.string().optional(),
  }).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type User = RegisterUserInput & {
  id: string;
  password: string;
  createdAt: Date;
};
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  interests: z.array(z.string()).optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dob: z.string().datetime().optional(),
  interests: z.array(z.string()).optional(),
  address: z.string().optional(),
  organization: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export interface RegisterResponse {
  message: string;
  userId?: string;
}

export interface LoginResponse {
  message: string;
  accessToken?: string;
}

export interface ApiError {
  message: string;
  error?: unknown;
  status?: number;
}
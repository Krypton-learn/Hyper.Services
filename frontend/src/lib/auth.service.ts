import api from '../api/api';
import { registerSchema, loginSchema, type RegisterInput, type LoginInput, type RegisterResponse, type LoginResponse } from './types';

export const register = async (data: RegisterInput): Promise<RegisterResponse> => {
  const validated = registerSchema.parse(data);
  const response = await api.post('/auth/register', validated);
  return response.data as RegisterResponse;
};

export const login = async (data: LoginInput): Promise<LoginResponse> => {
  const validated = loginSchema.parse(data);
  const response = await api.post<LoginResponse>('/auth/login', validated);
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }
  return response.data;
};

export type { RegisterInput, LoginInput };
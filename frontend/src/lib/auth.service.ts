import api from '../api/api';
import { registerSchema, loginSchema, type RegisterInput, type LoginInput, type RegisterResponse, type LoginResponse } from './types';

export const register = async (data: RegisterInput): Promise<RegisterResponse> => {
  const validated = registerSchema.parse(data);
  const response = await api.post('/auth/register', validated);
  return response.data as RegisterResponse;
};

export const login = async (data: LoginInput): Promise<LoginResponse> => {
  const validated = loginSchema.parse(data);
  console.log('Login: Sending request to /auth/login')
  const response = await api.post<LoginResponse>('/auth/login', validated);
  console.log('Login: Response', response.data)
  if (response.data.accessToken) {
    const expiry = Date.now() + 15 * 60 * 1000;
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('token_expiry', String(expiry));
    console.log('Login: Token saved to localStorage')
  }
  return response.data;
};

export type { RegisterInput, LoginInput };
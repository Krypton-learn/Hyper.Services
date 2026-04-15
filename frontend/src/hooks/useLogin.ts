import { useMutation } from '@tanstack/react-query';
import { login } from '../lib/auth.service';
import type { LoginInput, LoginResponse } from '../lib/types';

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: login,
  });
};
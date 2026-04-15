import { useMutation } from '@tanstack/react-query';
import { register } from '../lib/auth.service';
import type { RegisterInput, RegisterResponse } from '../lib/types';

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: register,
  });
};
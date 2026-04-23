import { useMutation } from '@tanstack/react-query'
import { loginUser, registerUser } from '../api/auth.api'
import { useAuthStore } from '../stores/auth.store'
import type { LoginInput, RegisterUserInput } from '@packages/schemas/auth.schema'

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken)
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (data: RegisterUserInput) => registerUser(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken)
    },
  })
}

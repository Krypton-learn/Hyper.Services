import { useState } from 'react'
import { Form, FormField, FormLabel, FormInput, FormButton, FormError } from '../../components/form/Form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/Card'
import { useNavigate } from '@tanstack/react-router'
import { useLogin } from '../../hooks/useAuth'
import { toast } from 'sonner'

export function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const login = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!identifier || !password) {
      return
    }

    login.mutate(
      { identifier, password },
      {
        onSuccess: () => {
          toast.success('Login successful')
          navigate({ to: '/dashboard' })
        },
        onError: (error) => {
          toast.error(error.message || 'Login failed')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit} className="space-y-4">
            <FormField>
              <FormLabel htmlFor="identifier">Email or Phone</FormLabel>
              <FormInput
                id="identifier"
                type="text"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormInput
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                showPasswordToggle
              />
            </FormField>

            {login.error && <FormError>{login.error.message}</FormError>}

            <FormButton type="submit" variant="primary" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </FormButton>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
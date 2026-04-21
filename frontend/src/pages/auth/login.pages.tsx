import { useState } from 'react'
import { Form, FormField, FormLabel, FormInput, FormButton, FormError } from '../../components/form/Form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/Card'
import { useNavigate } from '@tanstack/react-router'

export function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Mock login - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!identifier || !password) {
        setError('Please fill in all fields')
        return
      }

      // Navigate to dashboard on success
      navigate({ to: '/dashboard' })
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
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

            {error && <FormError>{error}</FormError>}

            <FormButton type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
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
import { useState } from 'react'
import { Form, FormField, FormLabel, FormInput, FormButton, FormError } from '../../components/form/Form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/Card'
import { useNavigate } from '@tanstack/react-router'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password) {
      setError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Mock register - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      navigate({ to: '/dashboard' })
    } catch {
      setError('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join HyperRevise today</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit} className="space-y-4">
            <FormField>
              <FormLabel htmlFor="name">Name *</FormLabel>
              <FormInput
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="email">Email *</FormLabel>
              <FormInput
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="phone">Phone</FormLabel>
              <FormInput
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="password">Password *</FormLabel>
              <FormInput
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                showPasswordToggle
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="confirmPassword">Confirm Password *</FormLabel>
              <FormInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                showPasswordToggle
              />
            </FormField>

            {error && <FormError>{error}</FormError>}

            <FormButton type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </FormButton>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
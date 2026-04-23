import { useState } from 'react'
import { Form, FormField, FormLabel, FormInput, FormButton, FormError } from '../../components/form/Form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/Card'
import { useNavigate } from '@tanstack/react-router'
import { useRegister } from '../../hooks/useAuth'
import { toast } from 'sonner'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const register = useRegister()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!name || !email || !password) {
      setLocalError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    register.mutate(
      { name, email, phone, password, organizations: [] },
      {
        onSuccess: () => {
          toast.success('Account created successfully')
          navigate({ to: '/login' })
        },
        onError: (error) => {
          console.log(error)
          toast.error(error.message || 'Registration failed')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Create Account</CardTitle>
          <CardDescription className="text-sm sm:text-base">Join HyperRevise today</CardDescription>
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

            {(localError || register.error) && <FormError>{localError || register.error?.message}</FormError>}

            <FormButton type="submit" variant="primary" className="w-full" disabled={register.isPending}>
              {register.isPending ? 'Creating account...' : 'Create Account'}
            </FormButton>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted text-center">
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

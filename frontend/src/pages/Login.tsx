import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Layers } from 'lucide-react'
import { useLogin } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const login = useLogin({
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      navigate({ to: '/' })
    },
    onError: (err: Error) => {
      setError(err.message || 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    login.mutate({ email, password })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Layers className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-neutral">HyperRevise</span>
        </div>

        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-8">
          <h1 className="text-2xl font-bold text-neutral text-center mb-2">Welcome back</h1>
          <p className="text-neutral/60 text-center mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral/20 dark:border-neutral/30 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-neutral/60 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
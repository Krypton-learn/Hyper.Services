import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Layers } from 'lucide-react'
import { useRegister } from '../hooks/useAuth'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'Personal' | 'Organization'>('Personal')
  
  const register = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({ username, email, password, accountType })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Layers className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-neutral">HyperRevise</span>
        </div>

        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-8">
          <h1 className="text-2xl font-bold text-neutral text-center mb-2">Create account</h1>
          <p className="text-neutral/60 text-center mb-8">Start your learning journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral dark:text-[var(--neutral)] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral/20 dark:border-neutral/30 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="john"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral dark:text-[var(--neutral)] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral/20 dark:border-neutral/30 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral dark:text-[var(--neutral)] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral/20 dark:border-neutral/30 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral dark:text-[var(--neutral)] mb-2">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as 'Personal' | 'Organization')}
                className="w-full px-4 py-3 rounded-lg border border-neutral/20 dark:border-neutral/30 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="Personal">Personal</option>
                <option value="Organization">Organization</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={register.isPending}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {register.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-neutral/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
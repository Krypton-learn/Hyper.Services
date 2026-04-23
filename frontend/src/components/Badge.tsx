import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    outline: 'border-muted/30 text-muted-foreground bg-transparent',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

import type { ReactNode } from 'react'

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({
  type = 'button',
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-secondary text-white hover:opacity-90',
    outline: 'border border-muted/30 text-foreground hover:bg-muted/20',
    ghost: 'text-foreground hover:bg-muted/20',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={`bg-white rounded-xl border border-muted/20 shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return <h3 className={`text-lg font-bold text-foreground ${className}`}>{children}</h3>
}

export interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return <p className={`text-sm text-muted ${className}`}>{children}</p>
}

export interface CardContentProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function CardContent({ children, className = '', padding = 'md' }: CardContentProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  return <div className={`${paddingClasses[padding]} ${className}`}>{children}</div>
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`mt-4 pt-4 border-t border-muted/20 ${className}`}>{children}</div>
}
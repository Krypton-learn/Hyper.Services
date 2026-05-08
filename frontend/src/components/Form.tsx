import type { ReactNode } from 'react'

interface FormProps {
  onSubmit: (e: React.FormEvent) => void
  children: ReactNode
  className?: string
}

export function Form({ onSubmit, children, className = '' }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  label: string
  children: ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral dark:text-[var(--neutral)]">{label}</label>
      {children}
    </div>
  )
}

interface FormActionsProps {
  children: ReactNode
}

export function FormActions({ children }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      {children}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-lg border border-neutral/20 dark:border-neutral/30 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
        props.className || ''
      }`}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-lg border border-neutral/20 dark:border-neutral/30 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none ${
        props.className || ''
      }`}
    />
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning'
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'text-neutral dark:text-[var(--neutral)] hover:bg-neutral/5 dark:hover:bg-neutral/10 border border-neutral/20 dark:border-neutral/30',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    warning: 'bg-primary text-white hover:bg-primary/90',
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
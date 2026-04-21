import { useState } from 'react'
import type { ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FormProps {
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export function Form({ children, onSubmit, className = '' }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  children: ReactNode
  className?: string
}

export function FormField({ children, className = '' }: FormFieldProps) {
  return <div className={className}>{children}</div>
}

interface FormLabelProps {
  children: ReactNode
  htmlFor?: string
  className?: string
}

export function FormLabel({ children, htmlFor, className = '' }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-foreground mb-1 ${className}`}
    >
      {children}
    </label>
  )
}

interface FormInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search'
  id?: string
  name?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
  className?: string
  showPasswordToggle?: boolean
}

export function FormInput({
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  disabled,
  required,
  className = '',
  showPasswordToggle = false,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="relative">
      <input
        type={isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border border-muted/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted/20 disabled:cursor-not-allowed text-foreground bg-white placeholder:text-muted pr-10 ${className}`}
      />
      {showPasswordToggle && isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}

interface FormButtonProps {
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FormButton({
  type = 'button',
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
}: FormButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-secondary text-white hover:opacity-90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
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
      className={`font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

interface FormErrorProps {
  children: ReactNode
  className?: string
}

export function FormError({ children, className = '' }: FormErrorProps) {
  return <p className={`text-sm text-red-500 mt-1 ${className}`}>{children}</p>
}
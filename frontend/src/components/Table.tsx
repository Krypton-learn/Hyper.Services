import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`rounded-xl border border-border shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export function TableHeader({ children, className = '' }: TableProps) {
  return (
    <div className={`bg-muted/30 ${className}`}>
      {children}
    </div>
  )
}

export function TableBody({ children, className = '' }: TableProps) {
  return <div className={`divide-y divide-border ${className}`}>{children}</div>
}

export function TableRow({ children, className = '', onClick }: TableProps & { onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex w-full hover:bg-muted/50 transition-colors cursor-pointer ${className}`}
    >
      {children}
    </div>
  )
}

export function TableHead({ children, className = '' }: TableProps) {
  return (
    <div className={`flex-1 min-w-0 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground ${className}`}>
      {children}
    </div>
  )
}

interface TableCellProps extends TableProps {
  colSpan?: number
}

export function TableCell({ children, className = '', colSpan }: TableCellProps) {
  return (
    <div 
      className={`flex-1 min-w-0 px-4 py-3 text-sm text-foreground truncate ${className}`}
      style={colSpan ? { flex: colSpan } : undefined}
    >
      {children}
    </div>
  )
}

export function TableActions({ children, className = '' }: TableProps) {
  return (
    <div className={`flex-1 min-w-0 px-4 py-3 flex justify-end ${className}`}>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
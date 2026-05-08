import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps {
  children: ReactNode
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="border-b border-neutral/10">
      {children}
    </thead>
  )
}

interface TableBodyProps {
  children: ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody>
      {children}
    </tbody>
  )
}

interface TableRowProps {
  children: ReactNode
}

export function TableRow({ children }: TableRowProps) {
  return (
    <tr className="border-b border-neutral/5 hover:bg-neutral/5 transition-colors">
      {children}
    </tr>
  )
}

interface TableHeadProps {
  children: ReactNode
  className?: string
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th className={`px-4 py-3 text-left text-sm font-semibold text-neutral/60 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 py-4 text-sm text-neutral ${className}`}>
      {children}
    </td>
  )
}
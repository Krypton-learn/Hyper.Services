import type { ReactNode } from 'react'

interface TableProps {
  children?: ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full min-w-[600px] border-collapse ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-gray-100 ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={className}>{children}</tbody>
}

export function TableRow({ children, className = '', onClick }: TableProps & { onClick?: () => void }) {
  return (
    <tr 
      onClick={onClick}
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
    >
      {children}
    </tr>
  )
}

export function TableHead({ children, className = '' }: TableProps) {
  return (
    <th className={`px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${className}`}>
      {children}
    </th>
  )
}

interface TableCellProps extends TableProps {
  colSpan?: number
}

export function TableCell({ children, className = '', colSpan }: TableCellProps) {
  return (
    <td 
      className={`px-3 sm:px-4 py-3 text-sm text-gray-900 truncate ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  )
}

export function TableActions({ children, className = '' }: TableProps) {
  return (
    <td className={`px-3 sm:px-4 py-3 flex justify-end ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2">{children}</div>
    </td>
  )
}
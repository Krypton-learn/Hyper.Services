import React from 'react'

export interface TableColumn<T = unknown> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

export interface TableProps<T = unknown> {
  title?: string
  description?: string
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  isLoading?: boolean
  className?: string
  onRowClick?: (row: T) => void
}

export function Table<T>({
  title,
  description,
  columns,
  data,
  emptyMessage = 'No data available',
  isLoading = false,
  className = '',
  onRowClick,
}: TableProps<T>) {
  const getValue = (row: T, key: string): unknown => {
    return (row as Record<string, unknown>)[key]
  }

  const renderCell = (row: T, column: TableColumn<T>): React.ReactNode => {
    if (column.render) {
      return column.render(row)
    }
    const value = getValue(row, column.key)
    return value !== undefined && value !== null ? String(value) : '-'
  }

  return (
    <div className={`bg-card border rounded-lg overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/10 border-b">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-sm font-medium text-muted uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/20">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-muted/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-foreground ${column.className || ''}`}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
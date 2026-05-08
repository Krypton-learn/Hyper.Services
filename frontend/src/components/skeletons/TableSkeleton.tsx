import './Skeletons.css'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 7 }: TableSkeletonProps) {
  return (
    <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 overflow-hidden">
      <div className="w-full">
        <div className="grid gap-4 p-4 border-b border-neutral/10 dark:border-neutral/20" style={{ gridTemplateColumns: `repeat(${columns}, minmax(100px, 1fr))` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="skeleton skeleton-base h-4 rounded" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 p-4 border-b border-neutral/5 dark:border-neutral/10"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(100px, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="skeleton skeleton-base h-4 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableSkeleton
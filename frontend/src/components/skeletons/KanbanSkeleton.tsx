import './Skeletons.css'

interface KanbanSkeletonProps {
  columns?: number
  cardsPerColumn?: number
}

export function KanbanSkeleton({ columns = 2, cardsPerColumn = 3 }: KanbanSkeletonProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 w-80">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full skeleton skeleton-base" />
            <div className="skeleton skeleton-base h-4 w-16 rounded" />
            <div className="skeleton skeleton-base h-3 w-6 rounded" />
          </div>
          <div className="space-y-3 min-h-[200px] rounded-xl p-3 bg-neutral/5 dark:bg-[var(--background-secondary)]">
            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="bg-white dark:bg-[var(--background)] rounded-lg border border-neutral/10 dark:border-neutral/20 p-4"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="skeleton skeleton-base h-4 w-3/4 rounded" />
                  <div className="w-4 h-4 skeleton skeleton-base rounded" />
                </div>
                <div className="skeleton skeleton-base h-3 w-full rounded mb-2" />
                <div className="flex justify-between items-center">
                  <div className="skeleton skeleton-base h-5 w-14 rounded-full" />
                  <div className="skeleton skeleton-base h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanSkeleton
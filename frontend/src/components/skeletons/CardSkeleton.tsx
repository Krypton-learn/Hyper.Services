import './Skeletons.css'

interface CardSkeletonProps {
  count?: number
}

export function CardSkeleton({ count = 6 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[var(--background-secondary)] rounded-xl border border-neutral/10 dark:border-neutral/20 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg skeleton skeleton-base" />
            <div className="flex-1 space-y-2">
              <div className="skeleton skeleton-base h-4 w-3/4 rounded" />
              <div className="skeleton skeleton-base h-3 w-1/2 rounded" />
              <div className="skeleton skeleton-base h-3 w-1/3 rounded" />
            </div>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-neutral/10 dark:border-neutral/20">
            <div className="flex-1 skeleton skeleton-base h-8 rounded-lg" />
            <div className="w-8 skeleton skeleton-base h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardSkeleton
import './Skeletons.css'

interface TextSkeletonProps {
  lines?: number
  className?: string
}

export function TextSkeleton({ lines = 3, className = '' }: TextSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton skeleton-base h-4 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="skeleton skeleton-base h-6 w-32 rounded mb-2" />
          <div className="skeleton skeleton-base h-4 w-48 rounded" />
        </div>
        <div className="skeleton skeleton-base h-10 w-32 rounded-lg" />
      </div>
      <div className="skeleton skeleton-base h-64 w-full rounded-2xl" />
    </div>
  )
}

export default TextSkeleton
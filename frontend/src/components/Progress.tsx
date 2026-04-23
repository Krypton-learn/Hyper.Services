interface ProgressProps {
  value: number // 0 to 100
  max?: number
  className?: string
  color?: string
}

export function Progress({ value, max = 100, className = '', color = 'bg-primary' }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`w-full bg-muted/20 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`h-full transition-all duration-500 ease-out ${color}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

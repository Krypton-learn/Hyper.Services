interface PageContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function PageContainer({ title, description, children, actions }: PageContainerProps) {
  return (
    <div className="p-8">
      {(title || actions) && (
        <div className="flex items-center justify-between mb-8">
          <div>
            {title && <h1 className="text-3xl font-bold text-neutral">{title}</h1>}
            {description && <p className="text-neutral/60 mt-1">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
import { LayoutGrid, List } from 'lucide-react'

export type TaskView = 'table' | 'kanban'

interface TaskViewToggleProps {
  view: TaskView
  onChange: (view: TaskView) => void
}

export function TaskViewToggle({ view, onChange }: TaskViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-neutral/5 dark:bg-neutral/10 rounded-lg p-1">
      <button
        onClick={() => onChange('table')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === 'table'
            ? 'bg-white dark:bg-[var(--background-secondary)] text-primary shadow-sm'
            : 'text-neutral/60 dark:text-[var(--neutral-muted)] hover:text-neutral dark:hover:text-[var(--neutral)]'
        }`}
      >
        <List className="w-4 h-4" />
        Table
      </button>
      <button
        onClick={() => onChange('kanban')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === 'kanban'
            ? 'bg-white dark:bg-[var(--background-secondary)] text-primary shadow-sm'
            : 'text-neutral/60 dark:text-[var(--neutral-muted)] hover:text-neutral dark:hover:text-[var(--neutral)]'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Kanban
      </button>
    </div>
  )
}

export default TaskViewToggle
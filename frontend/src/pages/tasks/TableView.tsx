import { Check, Trash2, Clock, Calendar, Pencil } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table'
import type { Task } from '../../store/tasksStore'

interface TableViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onCompleteTask: (task: Task) => void
}

export function TableView({ tasks, onEditTask, onDeleteTask, onCompleteTask }: TableViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-8 text-center">
        <p className="text-neutral/60 dark:text-[var(--neutral-muted)]">No tasks yet. Create your first task to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Done</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task: Task) => (
            <TableRow key={task.id}>
              <TableCell>
                <button
                  onClick={() => onCompleteTask(task)}
                  disabled={task.isCompleted === 1}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.isCompleted 
                      ? 'bg-primary border-primary' 
                      : 'border-neutral/30 hover:border-primary hover:bg-primary/10'
                  }`}
                >
                  {task.isCompleted === 1 && <Check className="w-4 h-4 text-white" />}
                </button>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Urgent' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                    : 'bg-neutral/10 text-neutral/60 dark:bg-neutral/80 dark:text-neutral/40'
                }`}>
                  {task.status || 'Common'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`font-medium ${task.isCompleted ? 'line-through text-neutral/50' : ''}`}>
                  {task.title}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-neutral/60 dark:text-[var(--neutral-muted)] line-clamp-1">
                  {task.desc || '-'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                    {task.creator_username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{task.creator_username}</span>
                </div>
              </TableCell>
              <TableCell>
                {task.assignee_username ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                      {task.assignee_username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{task.assignee_username}</span>
                  </div>
                ) : (
                  <span className="text-neutral/40">-</span>
                )}
              </TableCell>
              <TableCell>
                {task.startingDate ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4 text-neutral/40" />
                    {new Date(task.startingDate).toLocaleDateString()}
                  </div>
                ) : (
                  <span className="text-neutral/40">-</span>
                )}
              </TableCell>
              <TableCell>
                {task.deadline ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4 text-neutral/40" />
                    {new Date(task.deadline).toLocaleDateString()}
                  </div>
                ) : (
                  <span className="text-neutral/40">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-2 text-neutral/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task)}
                    className="p-2 text-neutral/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TableView
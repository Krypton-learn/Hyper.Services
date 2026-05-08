import { useState } from 'react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../store/tasksStore'
import ConfirmModal from './ConfirmModal'

interface KanbanColumn {
  id: string
  title: string
  tasks: Task[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onAddTask: (columnId: string) => void
}

export function KanbanBoard({ columns, onEditTask, onDeleteTask, onAddTask }: KanbanBoardProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onAddTask={() => onAddTask(column.id)}
        />
      ))}
    </div>
  )
}

interface KanbanColumnComponentProps {
  column: KanbanColumn
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onAddTask: () => void
}

function KanbanColumnComponent({ column, onEditTask, onDeleteTask, onAddTask }: KanbanColumnComponentProps) {
  const isUrgent = column.id === 'Urgent'
  
  return (
    <div className="flex-shrink-0 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${
          isUrgent 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-neutral dark:text-[var(--neutral)]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-primary'}`}></span>
          {column.title}
          <span className="text-sm text-neutral/50 dark:text-[var(--neutral-muted)] font-normal">
            ({column.tasks.length})
          </span>
        </h3>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] rounded-xl p-3 transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-primary/5 dark:bg-primary/10'
                : 'bg-neutral/5 dark:bg-[var(--background-secondary)]'
            }`}
          >
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                  >
                    <KanbanCard
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <button
        onClick={onAddTask}
        className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-neutral/60 dark:text-[var(--neutral-muted)] hover:text-primary hover:bg-neutral/5 dark:hover:bg-neutral/10 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add Task</span>
      </button>
    </div>
  )
}

interface KanbanCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
}

function KanbanCard({ task, onEdit, onDelete }: KanbanCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-[var(--background)] rounded-lg border border-neutral/10 dark:border-neutral/20 p-4 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className={`font-medium text-neutral dark:text-[var(--neutral)] ${task.isCompleted ? 'line-through text-neutral/50' : ''}`}>
            {task.title}
          </h4>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-neutral/40 hover:text-neutral dark:text-[var(--neutral-muted)] dark:hover:text-[var(--neutral)] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 bg-white dark:bg-[var(--background-secondary)] rounded-lg shadow-lg border border-neutral/10 dark:border-neutral/20 py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => { setShowMenu(false); onEdit() }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral dark:text-[var(--neutral)] hover:bg-neutral/5 dark:hover:bg-neutral/10 flex items-center gap-2"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteModal(true) }}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {task.desc && (
          <p className="text-sm text-neutral/60 dark:text-[var(--neutral-muted)] line-clamp-2 mb-3">
            {task.desc}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            task.status === 'Urgent' 
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-neutral/10 text-neutral/60 dark:bg-neutral/80 dark:text-neutral/40'
          }`}>
            {task.status || 'Common'}
          </span>
          
          {task.deadline && (
            <span className="text-xs text-neutral/40 dark:text-[var(--neutral-muted)]">
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {(task.assignee_username || task.creator_username) && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
              {(task.assignee_username || task.creator_username)?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-neutral/50 dark:text-[var(--neutral-muted)]">
              {task.assignee_username || task.creator_username}
            </span>
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}

export default KanbanBoard
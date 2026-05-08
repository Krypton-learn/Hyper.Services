import { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import KanbanBoard from '../../components/KanbanBoard'
import TaskFormModal from '../../components/TaskFormModal'
import type { Task } from '../../store/tasksStore'
import { useUpdateTask } from '../../hooks/useTasks'

interface KanbanViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  refetch: () => void
}

export function KanbanView({ tasks, onEditTask, onDeleteTask, refetch }: KanbanViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const updateTask = useUpdateTask()

  // Sync from props only on mount or when task count changes (not during drag)
  if (localTasks.length !== tasks.length) {
    setLocalTasks(tasks)
  }

  const urgentTasks = localTasks.filter(t => t.status === 'Urgent' && t.isCompleted !== 1)
  const commonTasks = localTasks.filter(t => t.status === 'Common' && t.isCompleted !== 1)

  const columns = [
    { id: 'Urgent', title: 'Urgent', tasks: urgentTasks },
    { id: 'Common', title: 'Common', tasks: commonTasks },
  ]

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as 'Urgent' | 'Common'
    
    const task = localTasks.find(t => t.id === draggableId)
    if (!task) return

    const optimisticTask = { ...task, status: newStatus }
    setLocalTasks(prev => prev.map(t => t.id === draggableId ? optimisticTask : t))

    updateTask.mutate({ id: draggableId, data: { status: newStatus } })
  }

  const handleAddTask = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateTask = () => {
    setIsCreateModalOpen(false)
    refetch()
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <KanbanBoard
          columns={columns}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onAddTask={handleAddTask}
        />
      </DragDropContext>

      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        isLoading={false}
      />
    </>
  )
}

export default KanbanView
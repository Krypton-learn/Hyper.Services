import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageContainer from '../components/PageContainer'
import ConfirmModal from '../components/ConfirmModal'
import TaskFormModal from '../components/TaskFormModal'
import TaskViewToggle from '../components/TaskViewToggle'
import type { TaskView } from '../components/TaskViewToggle'
import TableView from './tasks/TableView'
import KanbanView from './tasks/KanbanView'
import { TableSkeleton, KanbanSkeleton } from '../components/skeletons'
import { useTasks, useUpdateTask, useCompleteTask, useDeleteTask } from '../hooks/useTasks'
import type { Task } from '../store/tasksStore'
import { useCreateTaskModalStore } from '../store/createTaskModalStore'

interface TaskFormData {
  title: string
  desc: string
  startingDate: string
  deadline: string
  status: 'Urgent' | 'Common'
}

export default function Tasks() {
  const [view, setView] = useState<TaskView>('table')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const openCreateTaskModal = useCreateTaskModalStore((state) => state.open)

  const { data: tasksData, isLoading, refetch } = useTasks()
  const updateTask = useUpdateTask()
  const completeTask = useCompleteTask()
  const deleteTask = useDeleteTask()

  const handleEdit = (data: TaskFormData) => {
    if (!selectedTask) return
    updateTask.mutate(
      { id: selectedTask.id, data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
          setSelectedTask(null)
          refetch()
        },
      }
    )
  }

  const handleDelete = () => {
    if (!selectedTask) return
    deleteTask.mutate(selectedTask.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        setSelectedTask(null)
        refetch()
      },
    })
  }

  const handleComplete = () => {
    if (!selectedTask) return
    completeTask.mutate(selectedTask.id, { 
      onSuccess: () => {
        setIsCompleteModalOpen(false)
        setSelectedTask(null)
        refetch()
      }
    })
  }

  const openCompleteModal = (task: Task) => {
    setSelectedTask(task)
    setIsCompleteModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteModalOpen(true)
  }

  const tasks = tasksData?.results || []

  if (isLoading) {
    return (
      <PageContainer 
        title="Tasks" 
        description="Manage your tasks and to-dos"
        actions={
          <div className="flex items-center gap-4">
            <TaskViewToggle view={view} onChange={setView} />
          </div>
        }
      >
        {view === 'table' ? <TableSkeleton /> : <KanbanSkeleton />}
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Tasks" 
      description="Manage your tasks and to-dos"
      actions={
        <div className="flex items-center gap-4">
          <TaskViewToggle view={view} onChange={setView} />
          <button 
            onClick={openCreateTaskModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      }
    >

      <TaskFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedTask(null) }}
        onSubmit={handleEdit}
        task={selectedTask}
        isLoading={updateTask.isPending}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedTask(null) }}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteTask.isPending}
        variant="danger"
      />

      <ConfirmModal
        isOpen={isCompleteModalOpen}
        onClose={() => { setIsCompleteModalOpen(false); setSelectedTask(null) }}
        onConfirm={handleComplete}
        title="Complete Task"
        message={`Mark "${selectedTask?.title}" as completed?`}
        confirmText="Complete"
        isLoading={completeTask.isPending}
        variant="warning"
      />

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-8 text-center">
          <p className="text-neutral/60 dark:text-[var(--neutral-muted)]">No tasks yet. Create your first task to get started.</p>
        </div>
      ) : view === 'table' ? (
        <TableView 
          tasks={tasks}
          onEditTask={openEditModal}
          onDeleteTask={openDeleteModal}
          onCompleteTask={openCompleteModal}
        />
      ) : (
        <KanbanView 
          tasks={tasks}
          onEditTask={openEditModal}
          onDeleteTask={openDeleteModal}
          refetch={refetch}
        />
      )}
    </PageContainer>
  )
}
import TaskFormModal from './TaskFormModal'
import type { TaskFormData } from './TaskFormModal'
import { useCreateTask } from '../hooks/useTasks'
import { useCreateTaskModalStore } from '../store/createTaskModalStore'
import { useQueryClient } from '@tanstack/react-query'

export default function GlobalCreateTaskModal() {
  const { isOpen, defaultStatus, close } = useCreateTaskModalStore()
  const createTask = useCreateTask()
  const queryClient = useQueryClient()

  const handleCreate = (data: TaskFormData) => {
    createTask.mutate(data, {
      onSuccess: () => {
        close()
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      },
    })
  }

  return (
    <TaskFormModal
      isOpen={isOpen}
      onClose={close}
      onSubmit={handleCreate}
      isLoading={createTask.isPending}
      defaultStatus={defaultStatus}
    />
  )
}

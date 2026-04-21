import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useTasks, useCreateTask, useDeleteTask } from '../../hooks/useTasks'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../../components/Table'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { TaskPriority } from '../../../packages/schemas/tasks.schema'

export function TasksPage() {
  const { token } = useParams({ from: '/organizations/tasks/$token' })
  
  console.log('TasksPage - token from URL:', token)
  
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    milestoneId: '',
    priority: 'Medium' as TaskPriority,
  })

  const { data: tasks, isLoading, error } = useTasks(token || '')
  const createTaskMutation = useCreateTask(token || '')
  const deleteTaskMutation = useDeleteTask(token || '')

  const handleCreate = async () => {
    if (!formData.title || !formData.milestoneId) {
      toast.error('Title and milestone are required')
      return
    }
    try {
      await createTaskMutation.mutateAsync(formData)
      toast.success('Task created')
      setIsModalOpen(false)
      setFormData({ title: '', description: '', milestoneId: '', priority: 'Medium' })
    } catch {
      toast.error('Failed to create task')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTaskMutation.mutateAsync(id)
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/organizations/dashboard' })}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {isLoading && <p className="text-muted">Loading tasks...</p>}
      {error && <p className="text-red-500">Failed to load tasks</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableActions></TableActions>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks?.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.description || '-'}</TableCell>
              <TableCell>{task.priority || '-'}</TableCell>
              <TableActions>
                <button
                  onClick={() => handleDelete(task.id)}
                  disabled={deleteTaskMutation.isPending}
                  className="p-1 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableActions>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {tasks?.length === 0 && !isLoading && (
        <p className="text-muted text-center py-8">No tasks yet. Create your first task!</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Task description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Milestone ID</label>
            <input
              type="text"
              value={formData.milestoneId}
              onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Milestone ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
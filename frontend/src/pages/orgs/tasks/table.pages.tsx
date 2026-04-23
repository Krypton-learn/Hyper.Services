import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useMilestones } from '@/hooks/useTasks'
import { useEmployees } from '@/hooks/useEmployees'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Trash2, Edit2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { TaskPriority, Task } from '@packages/schemas/tasks.schema'
import { useOrgsStore } from '@/stores/orgs.store'
import { useDetailStore } from '@/stores/detail.store'
import { useSidebarStore } from '@/components/Sidebar'

interface TaskTableViewProps {
  showCreateModal: boolean
  onCloseCreateModal: () => void
}

export function TaskTableView({ showCreateModal, onCloseCreateModal }: TaskTableViewProps) {
  const { token } = useParams({ from: '/organizations/tasks/$token' })
  const setSelectedTask = useDetailStore((state) => state.setSelectedTask)
  const openRightSidebar = useSidebarStore((state) => state.openRightSidebar)

  const [isCreateModal, setIsCreateModal] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    setIsCreateModal(showCreateModal)
  }, [showCreateModal])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    milestoneId: '',
    priority: 'Medium' as TaskPriority,
    startingDate: '',
    dueDate: '',
    assignedTo: '',
  })

  const { data: tasks, isLoading, error } = useTasks(token || '')
  const milestones = useMilestones()
  const createTaskMutation = useCreateTask(token || '')
  const updateTaskMutation = useUpdateTask(token || '')
  const deleteTaskMutation = useDeleteTask(token || '')
  
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)
  const { data: employees = [] } = useEmployees(currentOrgId || '')

  const safeTasks = Array.isArray(tasks) ? tasks : []
  const safeMilestones = Array.isArray(milestones) ? milestones : []

  const toDatetime = (date: string) => date ? `${date}T00:00:00Z` : undefined

  const resetForm = () => {
    setFormData({ title: '', description: '', milestoneId: '', priority: 'Medium', startingDate: '', dueDate: '', assignedTo: '' })
  }

  const handleCloseCreate = () => {
    setIsCreateModal(false)
    resetForm()
    onCloseCreateModal()
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.milestoneId) {
      toast.error('Title and milestone are required')
      return
    }
    if (!formData.assignedTo) {
      toast.error('Please assign the task to a team member')
      return
    }
    try {
      await createTaskMutation.mutateAsync({
        ...formData,
        startingDate: toDatetime(formData.startingDate),
        dueDate: toDatetime(formData.dueDate),
      })
      toast.success('Task created!')
      handleCloseCreate()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      toast.error(message)
    }
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      milestoneId: task.milestoneId || '',
      priority: task.priority || 'Medium',
      startingDate: task.startingDate ? task.startingDate.split('T')[0] : '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo || '',
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingTask || !formData.title || !formData.milestoneId) {
      toast.error('Title and milestone are required')
      return
    }
    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        data: {
          ...formData,
          startingDate: toDatetime(formData.startingDate),
          dueDate: toDatetime(formData.dueDate),
          assignedTo: formData.assignedTo || null,
        },
      })
      toast.success('Task updated')
      setIsEditModalOpen(false)
      setEditingTask(null)
      resetForm()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      toast.error(message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTaskMutation.mutateAsync(id)
      toast.success('Task deleted')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      toast.error(message)
    }
  }

  const getMilestoneName = (milestoneId: string) => {
    const milestone = safeMilestones.find(m => m.id === milestoneId)
    return milestone?.name || '-'
  }

  const getEmployeeName = (employeeId: string | undefined) => {
    if (!employeeId) return '-'
    const employee = employees.find(e => e.user.id === employeeId)
    return employee?.user?.name || '-'
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { isCompleted: !task.isCompleted },
      })
      toast.success(task.isCompleted ? 'Task marked as incomplete' : 'Task completed!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      toast.error(message)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Milestone</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableActions></TableActions>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeTasks.map((task) => (
            <TableRow key={task.id} onClick={() => { setSelectedTask(task); openRightSidebar(null); }} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleComplete(task)
                  }}
                  className={`p-1 ${task.isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </TableCell>
              <TableCell className={task.isCompleted ? 'line-through text-muted' : ''}>{task.title}</TableCell>
              <TableCell>{task.description || '-'}</TableCell>
              <TableCell>{getMilestoneName(task.milestoneId)}</TableCell>
              <TableCell>{task.priority || '-'}</TableCell>
              <TableCell>{getEmployeeName(task.assignedTo)}</TableCell>
              <TableCell>{task.startingDate ? new Date(task.startingDate).toLocaleDateString() : '-'}</TableCell>
              <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</TableCell>
              <TableActions>
                <button onClick={() => openEditModal(task)} className="p-1 hover:text-blue-500">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(task.id)} disabled={deleteTaskMutation.isPending} className="p-1 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableActions>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {safeTasks.length === 0 && !isLoading && (
        <p className="text-muted text-center py-8">No tasks yet. Click "Add Task" to create one!</p>
      )}

      <Modal isOpen={isCreateModal} onClose={handleCloseCreate} title="Add Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Milestone *</label>
            <select
              value={formData.milestoneId}
              onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select milestone</option>
              {safeMilestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>{milestone.name}</option>
              ))}
            </select>
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
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To *</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select team member</option>
              {employees.map((emp) => (
                <option key={emp.user.id} value={emp.user.id}>{emp.user?.name || emp.user.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startingDate}
              onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleCloseCreate}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Milestone *</label>
            <select
              value={formData.milestoneId}
              onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select milestone</option>
              {safeMilestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>{milestone.name}</option>
              ))}
            </select>
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
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.user.id} value={emp.user.id}>{emp.user?.name || emp.user.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startingDate}
              onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateTaskMutation.isPending}>
              {updateTaskMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
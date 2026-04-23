import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useTasks, useCreateTask, useUpdateTask, useMilestones } from '@/hooks/useTasks'
import { useEmployees } from '@/hooks/useEmployees'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { toast } from 'sonner'
import type { TaskPriority, Task } from '@packages/schemas/tasks.schema'
import { useDetailStore } from '@/stores/detail.store'
import { useSidebarStore } from '@/components/Sidebar'
import { useOrgsStore } from '@/stores/orgs.store'

interface TaskKanbanViewProps {
  showCreateModal: boolean
  onCloseCreateModal: () => void
}

export function TaskKanbanView({ showCreateModal, onCloseCreateModal }: TaskKanbanViewProps) {
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

  const { data: tasks } = useTasks(token || '')
  const milestones = useMilestones()
  const createTaskMutation = useCreateTask(token || '')
  const updateTaskMutation = useUpdateTask(token || '')
  
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)
  const { data: employees = [] } = useEmployees(currentOrgId || '')

  const safeTasks = Array.isArray(tasks) ? tasks : []
  const safeMilestones = Array.isArray(milestones) ? milestones : []

  const tasksByPriority = {
    Urgent: safeTasks.filter(t => t.priority === 'Urgent'),
    High: safeTasks.filter(t => t.priority === 'High'),
    Medium: safeTasks.filter(t => t.priority === 'Medium' || !t.priority),
    Low: safeTasks.filter(t => t.priority === 'Low'),
  }

  const getMilestoneName = (milestoneId: string) => {
    const milestone = safeMilestones.find(m => m.id === milestoneId)
    return milestone?.name || '-'
  }

  const handleCloseCreate = () => {
    setIsCreateModal(false)
    setFormData({ title: '', description: '', milestoneId: '', priority: 'Medium', startingDate: '', dueDate: '', assignedTo: '' })
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
        startingDate: formData.startingDate ? `${formData.startingDate}T00:00:00Z` : undefined,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00Z` : undefined,
      })
      toast.success('Task created!')
      handleCloseCreate()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      toast.error(message)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newPriority = destination.droppableId as TaskPriority
    const task = safeTasks.find(t => t.id === draggableId)
    if (!task) return

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { ...task, priority: newPriority },
      })
      toast.success(`Moved to ${newPriority}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update'
      toast.error(message)
    }
  }

  const openEditModal = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation()
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
          startingDate: formData.startingDate ? `${formData.startingDate}T00:00:00Z` : undefined,
          dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00Z` : undefined,
          assignedTo: formData.assignedTo || null,
        },
      })
      toast.success('Task updated')
      setIsEditModalOpen(false)
      setEditingTask(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update'
      toast.error(message)
    }
  }

  const priorities = ['Urgent', 'High', 'Medium', 'Low'] as const

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {priorities.map((priority) => (
            <div key={priority} className="bg-muted/20 rounded-lg p-3 min-h-[500px] min-w-[280px] sm:min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold capitalize">{priority}</h3>
                <span className="text-sm text-muted bg-muted px-2 py-0.5 rounded-full">
                  {tasksByPriority[priority].length}
                </span>
              </div>
              <Droppable droppableId={priority}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-2 min-h-[400px] ${snapshot.isDraggingOver ? 'bg-muted/30 rounded-lg' : ''}`}>
                    {tasksByPriority[priority].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => { setSelectedTask(task); openRightSidebar(null); }}
                            onDoubleClick={(e) => openEditModal(task, e)}
                            className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                          >
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{task.title}</h4>
                            {task.description && <p className="text-xs text-muted line-clamp-2 mb-2">{task.description}</p>}
                            <div className="flex items-center justify-between text-xs text-muted">
                              <span className="truncate">{getMilestoneName(task.milestoneId)}</span>
                              {task.dueDate && <span className={new Date(task.dueDate) < new Date() ? 'text-red-500 font-medium' : ''}>{new Date(task.dueDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {tasksByPriority[priority].length === 0 && <div className="text-xs text-muted text-center py-8 border-2 border-dashed rounded-lg">Drop here</div>}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal isOpen={isCreateModal} onClose={handleCloseCreate} title="Add Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter task title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter description" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Milestone *</label>
            <select value={formData.milestoneId} onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select milestone</option>
              {safeMilestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} className="w-full px-3 py-2 border rounded-lg">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To *</label>
            <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select team member</option>
              {employees.map((emp) => (
                <option key={emp.user.id} value={emp.user.id}>{emp.user?.name || emp.user.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={formData.startingDate} onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleCloseCreate}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createTaskMutation.isPending}>{createTaskMutation.isPending ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Milestone *</label>
            <select value={formData.milestoneId} onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select milestone</option>
              {safeMilestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} className="w-full px-3 py-2 border rounded-lg">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assigned To</label>
            <select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.user.id} value={emp.user.id}>{emp.user?.name || emp.user.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={formData.startingDate} onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateTaskMutation.isPending}>{updateTaskMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
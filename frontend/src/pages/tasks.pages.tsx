import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, type TableColumn } from '../components/table.component'
import { Modal } from '../components/modal.component'
import { Form, type FormField, type FormButton } from '../components/form.component'
import { MainLayout, useLayout } from '../components/layout.component'
import { tasksApi, type Task, createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from '../api/tasks.api'
import { toast } from 'sonner'
import { useState } from 'react'
import { Pencil, Trash2, User, Calendar, Clock, Tag } from 'lucide-react'
import Avatar from 'react-avatar'

interface PopulatedUser {
  _id: string
  userId: string
  firstName?: string
  lastName?: string
  username?: string
}

type PopulatedTask = Task & {
  created_by: PopulatedUser | string
  assigned_to: PopulatedUser | string
}

const getUserName = (user: PopulatedUser | string): string => {
  if (typeof user === 'string') return user
  if (!user) return '-'
  const name = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`.trim()
    : user.firstName || user.lastName || user.username || (user as unknown as { name?: string }).name || user.userId || '-'
  return name
}

const formatDate = (date: Date | string | null): string => {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

const getTaskColumns = (
  onEdit: (task: PopulatedTask) => void,
  onDelete: (task: PopulatedTask) => void
): TableColumn<PopulatedTask>[] => [
  {
    key: 'title',
    header: 'Task',
    render: (row) => <span className="font-medium text-foreground">{row.title}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const statusStyles = {
        Due: 'bg-red-100 text-red-700',
        Upcoming: 'bg-yellow-100 text-yellow-700',
        Completed: 'bg-green-100 text-green-700',
      }
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status]}`}>
          {row.status}
        </span>
      )
    },
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (row) => {
      const priorityStyles = {
        Low: 'text-muted',
        Medium: 'text-blue-600',
        High: 'text-orange-600',
        Urgent: 'text-red-600 font-medium',
      }
      return <span className={priorityStyles[row.priority]}>{row.priority}</span>
    },
  },
  {
    key: 'starting_date',
    header: 'Start Date',
    render: (row) => formatDate(row.starting_date),
  },
  {
    key: 'due_date',
    header: 'Due Date',
    render: (row) => formatDate(row.due_date),
  },
  {
    key: 'assigned_to',
    header: 'Assigned To',
    render: (row) => getUserName(row.assigned_to),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(row)
          }}
          className="p-1.5 text-muted hover:text-foreground hover:bg-muted/10 rounded transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(row)
          }}
          className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
]

const taskFormFields: FormField[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Enter task title',
    required: true,
    helperText: 'Required, minimum 1 character',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter task description',
  },
  {
    name: 'assigned_to',
    label: 'Assign To',
    type: 'text',
    placeholder: 'Employee ID (optional)',
  },
  {
    name: 'starting_date',
    label: 'Start Date',
    type: 'date',
  },
  {
    name: 'due_date',
    label: 'Due Date',
    type: 'date',
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'Low', label: 'Low' },
      { value: 'Medium', label: 'Medium' },
      { value: 'High', label: 'High' },
      { value: 'Urgent', label: 'Urgent' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Due', label: 'Due' },
      { value: 'Upcoming', label: 'Upcoming' },
      { value: 'Completed', label: 'Completed' },
    ],
  },
  ]

const taskFormButtons: FormButton[] = [
  { type: 'submit', label: 'Save', variant: 'primary', size: 'md' },
  { type: 'reset', label: 'Cancel', variant: 'outline', size: 'md' },
]

export const TasksPage = () => {
  const [populate, setPopulate] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<PopulatedTask | null>(null)
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<PopulatedTask | null>(null)

  const { rightSidebarOpen, setRightSidebarOpen, setSelectedItem: setLayoutSelectedItem } = useLayout()

  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', populate],
    queryFn: () => tasksApi.getAll({ populate: populate as ('created_by' | 'assigned_to')[] }),
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsCreateModalOpen(false)
      toast.success('Task created successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create task')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsEditModalOpen(false)
      toast.success('Task updated successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete task')
    },
  })

  const handlePopulateChange = (field: string) => {
    setPopulate(prev => (prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]))
    refetch()
  }

  const handleCreateSubmit = (formData: Record<string, unknown>) => {
    const submitData: Record<string, unknown> = {
      title: String(formData.title || '').trim(),
    }

    if (formData.description && String(formData.description).trim()) {
      submitData.description = String(formData.description).trim()
    }
    if (formData.assigned_to && String(formData.assigned_to).trim()) {
      submitData.assigned_to = String(formData.assigned_to).trim()
    }
    if (formData.starting_date) {
      const dateVal = formData.starting_date
      if (dateVal instanceof Date) {
        submitData.starting_date = dateVal
      } else if (typeof dateVal === 'string') {
        const parsed = new Date(dateVal)
        if (!isNaN(parsed.getTime())) {
          submitData.starting_date = parsed
        }
      }
    }
    if (formData.due_date) {
      const dateVal = formData.due_date
      if (dateVal instanceof Date) {
        submitData.due_date = dateVal
      } else if (typeof dateVal === 'string') {
        const parsed = new Date(dateVal)
        if (!isNaN(parsed.getTime())) {
          submitData.due_date = parsed
        }
      }
    }
    if (formData.priority && String(formData.priority).trim()) {
      submitData.priority = String(formData.priority).trim()
    }
    if (formData.status && String(formData.status).trim()) {
      submitData.status = String(formData.status).trim()
    }

    const result = createTaskSchema.safeParse(submitData)
    
    if (!result.success) {
      const errors = result.error.issues.map(i => i.message).join(', ')
      toast.error(errors)
      return
    }
    
    createTaskMutation.mutate(result.data)
  }

  const handleEditSubmit = (formData: Record<string, unknown>) => {
    if (!selectedTaskForEdit) return

    const submitData: Record<string, unknown> = {}

    if (formData.title && String(formData.title).trim()) {
      submitData.title = String(formData.title).trim()
    }
    if (formData.description && String(formData.description).trim()) {
      submitData.description = String(formData.description).trim()
    }
    if (formData.assigned_to && String(formData.assigned_to).trim()) {
      submitData.assigned_to = String(formData.assigned_to).trim()
    }
    if (formData.starting_date) {
      const dateVal = formData.starting_date
      if (dateVal instanceof Date) {
        submitData.starting_date = dateVal
      } else if (typeof dateVal === 'string') {
        const parsed = new Date(dateVal)
        if (!isNaN(parsed.getTime())) {
          submitData.starting_date = parsed
        }
      }
    }
    if (formData.due_date) {
      const dateVal = formData.due_date
      if (dateVal instanceof Date) {
        submitData.due_date = dateVal
      } else if (typeof dateVal === 'string') {
        const parsed = new Date(dateVal)
        if (!isNaN(parsed.getTime())) {
          submitData.due_date = parsed
        }
      }
    }
    if (formData.priority && String(formData.priority).trim()) {
      submitData.priority = String(formData.priority).trim()
    }
    if (formData.status && String(formData.status).trim()) {
      submitData.status = String(formData.status).trim()
    }

    const result = updateTaskSchema.safeParse(submitData)
    
    if (!result.success) {
      const errors = result.error.issues.map(i => i.message).join(', ')
      toast.error(errors)
      return
    }
    
    updateTaskMutation.mutate({ id: selectedTaskForEdit._id, data: result.data })
  }

  const handleEdit = (task: PopulatedTask) => {
    setSelectedTaskForEdit(task)
    setIsEditModalOpen(true)
  }

  const handleDelete = (task: PopulatedTask) => {
    setSelectedTaskForEdit(task)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (selectedTaskForEdit) {
      deleteTaskMutation.mutate(selectedTaskForEdit._id)
      setIsDeleteModalOpen(false)
      closeRightSidebar()
    }
  }

  const handleRowClick = (task: PopulatedTask) => {
    setSelectedTask(task)
    setLayoutSelectedItem(task)
    setRightSidebarOpen(true)
  }

  const closeRightSidebar = () => {
    setRightSidebarOpen(false)
    setSelectedTask(null)
    setLayoutSelectedItem(null)
  }

  const rightSidebarContent = selectedTask ? (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar
          name={selectedTask.title}
          size="48"
          round
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">{selectedTask.title}</h3>
          <p className="text-xs text-muted">Task ID: {selectedTask._id}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted">{selectedTask.description || 'No description provided'}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Status</p>
            <p className="text-sm font-medium">{selectedTask.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Priority</p>
            <p className="text-sm font-medium">{selectedTask.priority}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Assigned To</p>
            <p className="text-sm font-medium">{getUserName(selectedTask.assigned_to)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Start Date</p>
            <p className="text-sm font-medium">{formatDate(selectedTask.starting_date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Due Date</p>
            <p className="text-sm font-medium">{formatDate(selectedTask.due_date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Created At</p>
            <p className="text-sm font-medium">{formatDate(selectedTask.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => handleEdit(selectedTask)}
          className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(selectedTask)}
          className="flex-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  ) : null

  if (error) {
    toast.error('Failed to fetch tasks')
  }

  return (
    <MainLayout
      rightSidebar={rightSidebarContent}
      rightSidebarTitle={selectedTask ? `Task: ${selectedTask._id}` : ''}
      rightSidebarOpen={rightSidebarOpen}
      onRightSidebarClose={closeRightSidebar}
    >
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
              <p className="text-sm text-muted">Manage your tasks and track progress</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Task
            </button>
          </div>

          <div className="mb-4 flex gap-4 items-center">
            <span className="text-sm text-muted">Populate:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={populate.includes('created_by')}
                onChange={() => handlePopulateChange('created_by')}
                className="w-4 h-4 rounded border-muted text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Created By</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={populate.includes('assigned_to')}
                onChange={() => handlePopulateChange('assigned_to')}
                className="w-4 h-4 rounded border-muted text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Assigned To</span>
            </label>
          </div>

          <Table
            title="All Tasks"
            description="A list of all your tasks"
            columns={getTaskColumns(handleEdit, handleDelete)}
            data={data?.tasks || []}
            isLoading={isLoading}
            emptyMessage="No tasks found"
            onRowClick={handleRowClick}
          />

          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create New Task"
            description="Fill in the task details"
            size="lg"
          >
            <Form
              fields={taskFormFields}
              buttons={taskFormButtons}
              onSubmit={handleCreateSubmit}
              layout="vertical"
            />
          </Modal>

          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedTaskForEdit(null)
            }}
            title="Edit Task"
            description="Update task details"
            size="lg"
          >
            {selectedTaskForEdit && (
              <Form
                fields={taskFormFields}
                buttons={taskFormButtons}
                onSubmit={handleEditSubmit}
                layout="vertical"
                initialValues={{
                  title: selectedTaskForEdit.title,
                  description: selectedTaskForEdit.description || '',
                  assigned_to: typeof selectedTaskForEdit.assigned_to === 'string' ? selectedTaskForEdit.assigned_to : selectedTaskForEdit.assigned_to?._id || '',
                  due_date: selectedTaskForEdit.due_date ? formatDate(selectedTaskForEdit.due_date) : '',
                  priority: selectedTaskForEdit.priority,
                  status: selectedTaskForEdit.status,
                }}
              />
            )}
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedTaskForEdit(null)
            }}
            title="Delete Task"
            description={`Are you sure you want to delete "${selectedTaskForEdit?.title}"? This action cannot be undone.`}
            size="sm"
          >
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedTask(null)
                }}
                className="px-4 py-2 border border-muted text-foreground rounded-lg hover:bg-muted/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteTaskMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </MainLayout>
  )
}

export default TasksPage
import { useState, useEffect } from 'react'
import Modal from './Modal'
import { Form, FormField, FormActions, Input, Textarea, Button } from './Form'
import type { Task } from '../store/tasksStore'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => void
  task?: Task | null
  isLoading?: boolean
  defaultStatus?: 'Urgent' | 'Common'
}

export interface TaskFormData {
  title: string
  desc: string
  startingDate: string
  deadline: string
  status: 'Urgent' | 'Common'
}

export default function TaskFormModal({ isOpen, onClose, onSubmit, task, isLoading, defaultStatus }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    desc: '',
    startingDate: '',
    deadline: '',
    status: 'Common',
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        desc: task.desc || '',
        startingDate: task.startingDate ? task.startingDate.split('T')[0] : '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        status: task.status || 'Common',
      })
    } else if (isOpen) {
      setFormData({ title: '', desc: '', startingDate: '', deadline: '', status: defaultStatus || 'Common' })
    }
  }, [task, isOpen, defaultStatus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    onSubmit(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
    >
      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormField label="Title">
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              required
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Task description (optional)"
              rows={3}
            />
          </FormField>

          <FormField label="Status">
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Urgent' | 'Common' })}
              className="w-full px-3 py-2 border border-neutral/20 dark:border-neutral/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)]"
            >
              <option value="Common">Common</option>
              <option value="Urgent">Urgent</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date">
              <Input
                type="date"
                value={formData.startingDate}
                onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
              />
            </FormField>

            <FormField label="Deadline">
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </FormField>
          </div>
        </div>

        <FormActions>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </FormActions>
      </Form>
    </Modal>
  )
}

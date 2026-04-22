import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '../../hooks/useMilestones'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../../components/Table'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import type { MilestoneCategory } from '../../../packages/schemas/milestones.schema'

export function MilestonesPage() {
  const navigate = useNavigate()
  
  const { data: milestones, isLoading, error } = useMilestones()
  const createMilestoneMutation = useCreateMilestone()
  const updateMilestoneMutation = useUpdateMilestone()
  const deleteMilestoneMutation = useDeleteMilestone()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<{ id: string; name: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    category: '' as MilestoneCategory | '',
    startingDate: '',
    endingDate: '',
  })

  const toDatetime = (date: string) => date ? `${date}T00:00:00Z` : undefined

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Name is required')
      return
    }
    try {
      await createMilestoneMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        category: formData.category as MilestoneCategory || undefined,
        startingDate: toDatetime(formData.startingDate),
        endingDate: toDatetime(formData.endingDate),
      })
      toast.success('Milestone created')
      setIsCreateModalOpen(false)
      setFormData({ name: '', description: '', budget: '', category: '', startingDate: '', endingDate: '' })
    } catch {
      toast.error('Failed to create milestone')
    }
  }

  const handleEdit = async () => {
    if (!selectedMilestone || !formData.name) {
      toast.error('Name is required')
      return
    }
    try {
      await updateMilestoneMutation.mutateAsync({
        id: selectedMilestone.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          budget: formData.budget ? Number(formData.budget) : undefined,
          category: formData.category as MilestoneCategory || undefined,
          startingDate: toDatetime(formData.startingDate),
          endingDate: toDatetime(formData.endingDate),
        },
      })
      toast.success('Milestone updated')
      setIsEditModalOpen(false)
      setSelectedMilestone(null)
      setFormData({ name: '', description: '', budget: '', category: '', startingDate: '', endingDate: '' })
    } catch {
      toast.error('Failed to update milestone')
    }
  }

  const handleDelete = async () => {
    if (!selectedMilestone) return
    try {
      await deleteMilestoneMutation.mutateAsync(selectedMilestone.id)
      toast.success('Milestone deleted')
      setIsDeleteModalOpen(false)
      setSelectedMilestone(null)
    } catch {
      toast.error('Failed to delete milestone')
    }
  }

  const openEditModal = (milestone: typeof milestones extends (infer T)[] | undefined ? T : never) => {
    setSelectedMilestone({ id: milestone.id, name: milestone.name })
    setFormData({
      name: milestone.name,
      description: milestone.description || '',
      budget: milestone.budget?.toString() || '',
      category: milestone.category || '',
      startingDate: milestone.startingDate ? milestone.startingDate.split('T')[0] : '',
      endingDate: milestone.endingDate ? milestone.endingDate.split('T')[0] : '',
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (milestone: typeof milestones extends (infer T)[] | undefined ? T : never) => {
    setSelectedMilestone({ id: milestone.id, name: milestone.name })
    setIsDeleteModalOpen(true)
  }

  const categories = ['Planning', 'Development', 'Administrative'] as const

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
          <h1 className="text-2xl font-bold">Milestones</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {isLoading && <p className="text-muted">Loading milestones...</p>}
      {error && <p className="text-red-500">Failed to load milestones</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableActions></TableActions>
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones?.map((milestone) => (
            <TableRow key={milestone.id}>
              <TableCell>{milestone.name}</TableCell>
              <TableCell>{milestone.description || '-'}</TableCell>
              <TableCell>{milestone.category || '-'}</TableCell>
              <TableCell>{milestone.budget ? `$${milestone.budget}` : '-'}</TableCell>
              <TableCell>{milestone.startingDate ? new Date(milestone.startingDate).toLocaleDateString() : '-'}</TableCell>
              <TableCell>{milestone.endingDate ? new Date(milestone.endingDate).toLocaleDateString() : '-'}</TableCell>
              <TableActions>
                <button
                  onClick={() => openEditModal(milestone)}
                  className="p-1 hover:text-blue-500"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(milestone)}
                  disabled={deleteMilestoneMutation.isPending}
                  className="p-1 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableActions>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {milestones?.length === 0 && !isLoading && (
        <p className="text-muted text-center py-8">No milestones yet. Create your first milestone!</p>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Milestone">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Milestone name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Milestone description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as MilestoneCategory })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0"
              min="0"
            />
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
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={formData.endingDate}
              onChange={(e) => setFormData({ ...formData, endingDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMilestoneMutation.isPending}>
              {createMilestoneMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Milestone">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Milestone name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Milestone description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as MilestoneCategory })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0"
              min="0"
            />
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
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={formData.endingDate}
              onChange={(e) => setFormData({ ...formData, endingDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMilestoneMutation.isPending}>
              {updateMilestoneMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Milestone">
        <div className="space-y-4">
          <p>Are you sure you want to delete milestone "{selectedMilestone?.name}"?</p>
          <p className="text-sm text-muted">This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={deleteMilestoneMutation.isPending} variant="danger">
              {deleteMilestoneMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

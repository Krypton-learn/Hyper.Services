import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '@/api/milestones.api'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '@/components/Table'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Milestone, MilestoneCategory } from '@packages/schemas/milestones.schema'
import { useDetailStore } from '@/stores/detail.store'
import { useSidebarStore } from '@/components/Sidebar'

export function MilestonesPage() {
  const navigate = useNavigate()
  const params = useParams({ from: '/organizations/milestones/$orgId' })
  const orgId = params.orgId
  const queryClient = useQueryClient()
  const setSelectedMilestone = useDetailStore((state) => state.setSelectedMilestone)
  const openRightSidebar = useSidebarStore((state) => state.openRightSidebar)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string>('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    budget: '',
    category: '' as MilestoneCategory | '',
    startingDate: '',
    endingDate: '',
  })

  const { data: milestones, isLoading, error } = useQuery<Milestone[]>({
    queryKey: ['milestones', orgId],
    queryFn: () => getMilestones(orgId),
  })

  const milestoneList = Array.isArray(milestones) ? milestones : []
  const milestoneCount = milestoneList.length

  const createMut = useMutation({
    mutationFn: (data: Parameters<typeof createMilestone>[1]) => createMilestone(orgId!, data),
    onSuccess: (newMilestone) => {
      queryClient.setQueryData<Milestone[]>(['milestones', orgId], (old) => {
        if (!old) return [newMilestone]
        return [...old, newMilestone]
      })
      toast.success('Milestone created')
      setIsCreateOpen(false)
      setForm({ name: '', description: '', budget: '', category: '', startingDate: '', endingDate: '' })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMilestone>[1] }) => updateMilestone(id, data),
    onSuccess: (updatedMilestone) => {
      queryClient.setQueryData<Milestone[]>(['milestones', orgId], (old) => {
        if (!old) return old
        return old.map((m) => (m.id === updatedMilestone.id ? updatedMilestone : m))
      })
      toast.success('Milestone updated')
      setIsEditOpen(false)
      setSelectedId(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Milestone[]>(['milestones', orgId], (old) => {
        if (!old) return old
        return old.filter((m) => m.id !== deletedId)
      })
      toast.success('Milestone deleted')
      setIsDeleteOpen(false)
      setSelectedId(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleCreate = () => {
    if (!form.name) return toast.error('Name is required')
    createMut.mutate({
      name: form.name,
      description: form.description || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      category: form.category as MilestoneCategory || undefined,
      startingDate: form.startingDate ? `${form.startingDate}T00:00:00Z` : undefined,
      endingDate: form.endingDate ? `${form.endingDate}T00:00:00Z` : undefined,
    })
  }

  const handleUpdate = () => {
    if (!selectedId || !form.name) return
    updateMut.mutate({ id: selectedId, data: { name: form.name, description: form.description || undefined, budget: form.budget ? Number(form.budget) : undefined, category: form.category as MilestoneCategory || undefined, startingDate: form.startingDate ? `${form.startingDate}T00:00:00Z` : undefined, endingDate: form.endingDate ? `${form.endingDate}T00:00:00Z` : undefined } })
  }

  const handleDelete = () => {
    if (!selectedId) return
    deleteMut.mutate(selectedId)
  }

  const openEdit = (m: Milestone) => {
    setSelectedId(m.id)
    setSelectedName(m.name)
    setForm({
      name: m.name,
      description: m.description || '',
      budget: m.budget?.toString() || '',
      category: (m.category as MilestoneCategory) || '',
      startingDate: m.startingDate?.split('T')[0] || '',
      endingDate: m.endingDate?.split('T')[0] || ''
    })
    setIsEditOpen(true)
  }

  const openDelete = (m: Milestone) => {
    setSelectedId(m.id)
    setSelectedName(m.name)
    setIsDeleteOpen(true)
  }

  const categories = ['Planning', 'Development', 'Administrative'] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => orgId && navigate({ to: '/organizations/dashboard/$orgId', params: { orgId } })} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Milestones</h1>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />Add
        </Button>
      </div>

      {isLoading && <p className="text-muted">Loading milestones...</p>}
      {error && <p className="text-red-500">{error.message}</p>}

      <p className="text-green-500 font-bold text-sm sm:text-base">Total milestones: {milestoneCount}</p>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableActions></TableActions>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestoneList.map((m: Milestone) => (
              <TableRow key={m.id} onClick={() => { setSelectedMilestone(m); openRightSidebar(null); }} className="cursor-pointer hover:bg-muted/50">
                <TableCell>{m.name}</TableCell>
                <TableCell className="max-w-[150px] truncate">{m.description || '-'}</TableCell>
                <TableCell>{m.category || '-'}</TableCell>
                <TableCell>{m.budget ? `$${m.budget}` : '-'}</TableCell>
                <TableCell>{m.startingDate ? new Date(m.startingDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{m.endingDate ? new Date(m.endingDate).toLocaleDateString() : '-'}</TableCell>
                <TableActions>
                  <button onClick={() => openEdit(m)} className="p-1 hover:text-blue-500">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => openDelete(m)} className="p-1 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableActions>
              </TableRow>
            ))}
            {(!milestones || milestones.length === 0) && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted">
                  No milestones yet. Click "Add Milestone" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Milestone">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Milestone name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Description" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MilestoneCategory })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select category</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={form.startingDate} onChange={(e) => setForm({ ...form, startingDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" value={form.endingDate} onChange={(e) => setForm({ ...form, endingDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>{createMut.isPending ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Milestone">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Milestone name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Description" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MilestoneCategory })} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select category</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={form.startingDate} onChange={(e) => setForm({ ...form, startingDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" value={form.endingDate} onChange={(e) => setForm({ ...form, endingDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMut.isPending}>{updateMut.isPending ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Milestone">
        <p>Are you sure you want to delete milestone "{selectedName}"?</p>
        <p className="text-sm text-muted mt-1">This action cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteMut.isPending}>{deleteMut.isPending ? 'Deleting...' : 'Delete'}</Button>
        </div>
      </Modal>
    </div>
  )
}

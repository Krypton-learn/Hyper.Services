import { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../../components/Table'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Form, FormField, FormLabel, FormInput, FormButton } from '../../components/form/Form'
import { Plus, Pencil, Trash2, Users, Calendar, Hash, AlertTriangle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useOrgs, useCreateOrg, useDeleteOrg, useUpdateOrg } from '../../hooks/useOrgs'
import { useSidebarStore } from '../../components/Sidebar'

type Organization = {
  id: string
  name: string
  description?: string
  token: string
  createdAt: Date
}

export function OrgsPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null)

  const { data: orgs = [], isLoading } = useOrgs()
  const createOrg = useCreateOrg()
  const updateOrg = useUpdateOrg()
  const deleteOrg = useDeleteOrg()

  const openRightSidebar = useSidebarStore((s) => s.openRightSidebar)
  const closeRightSidebar = useSidebarStore((s) => s.closeRightSidebar)
  const navigate = useNavigate()

  const handleRowClick = (org: Organization, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    openRightSidebar(
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{org.name}</h3>
          <button onClick={closeRightSidebar} className="p-1 hover:bg-muted rounded">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Hash className="w-4 h-4 text-muted" />
            <span className="text-muted">ID:</span>
            <span className="font-mono text-xs">{org.id}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-muted" />
            <span className="text-muted">Token:</span>
            <span className="font-mono text-xs">{org.token}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted" />
            <span className="text-muted">Created:</span>
            <span>{new Date(org.createdAt).toLocaleDateString()}</span>
          </div>
          {org.description && (
            <div className="pt-2">
              <p className="text-sm text-muted mb-1">Description</p>
              <p className="text-sm">{org.description}</p>
            </div>
          )}
        </div>

        <Button
          onClick={() => navigate({ to: '/organizations/dashboard' })}
          className="w-full"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Go to {org.name}
        </Button>
      </div>
    )
  }

  const resetCreateForm = () => {
    setName('')
    setDescription('')
    setShowCreateModal(false)
  }

  const openEditModal = (org: Organization, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingOrg(org)
    setName(org.name)
    setDescription(org.description || '')
    setShowEditModal(true)
  }

  const resetEditForm = () => {
    setName('')
    setDescription('')
    setEditingOrg(null)
    setShowEditModal(false)
  }

  const openDeleteModal = (orgId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingOrgId(orgId)
    setShowDeleteModal(true)
  }

  const resetDeleteForm = () => {
    setDeletingOrgId(null)
    setShowDeleteModal(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createOrg.mutate(
      { name, description },
      {
        onSuccess: () => {
          toast.success('Organization created')
          resetCreateForm()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !editingOrg) return

    updateOrg.mutate(
      { id: editingOrg.id, data: { name, description } },
      {
        onSuccess: () => {
          toast.success('Organization updated')
          resetEditForm()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  const handleDelete = () => {
    if (!deletingOrgId) return

    deleteOrg.mutate(deletingOrgId, {
      onSuccess: () => {
        toast.success('Organization deleted')
        resetDeleteForm()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={resetCreateForm} title="Create Organization">
        <Form onSubmit={handleCreate} className="space-y-4">
          <FormField>
            <FormLabel htmlFor="org-name">Name</FormLabel>
            <FormInput
              id="org-name"
              type="text"
              placeholder="Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="org-description">Description</FormLabel>
            <FormInput
              id="org-description"
              type="text"
              placeholder="Organization description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <FormButton type="submit" disabled={createOrg.isPending}>
              {createOrg.isPending ? 'Creating...' : 'Create'}
            </FormButton>
            <FormButton type="button" variant="outline" onClick={resetCreateForm}>
              Cancel
            </FormButton>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={resetEditForm} title="Edit Organization">
        <Form onSubmit={handleEdit} className="space-y-4">
          <FormField>
            <FormLabel htmlFor="edit-org-name">Name</FormLabel>
            <FormInput
              id="edit-org-name"
              type="text"
              placeholder="Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="edit-org-description">Description</FormLabel>
            <FormInput
              id="edit-org-description"
              type="text"
              placeholder="Organization description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <FormButton type="submit" disabled={updateOrg.isPending}>
              {updateOrg.isPending ? 'Saving...' : 'Save'}
            </FormButton>
            <FormButton type="button" variant="outline" onClick={resetEditForm}>
              Cancel
            </FormButton>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={resetDeleteForm} title="Delete Organization">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p>Are you sure you want to delete this organization? This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="danger" onClick={handleDelete} disabled={deleteOrg.isPending}>
              {deleteOrg.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="outline" onClick={resetDeleteForm}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No organizations found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              orgs?.map((org) => (
                <TableRow 
                  key={org.id}
                  onClick={() => handleRowClick(org)}
                >
                  <TableCell className="font-semibold text-foreground">{org.name}</TableCell>
                  <TableCell className="text-muted-foreground">{org.description || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableActions>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => openEditModal(org, e)}
                        className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => openDeleteModal(org.id, e)}
                        className="p-2 rounded-lg bg-muted/50 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableActions>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
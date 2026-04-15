import { useQuery } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { Modal } from '../components/modal.component'
import { Table, type TableColumn } from '../components/table.component'
import { Form, type FormField, type FormButton } from '../components/form.component'
import { MainLayout, useLayout } from '../components/layout.component'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'
import { orgsApi as organizationsApi } from '../api/orgs.api'

interface PopulatedOrganization {
  _id: string
  name: string
  founder: string | {
    _id: string
    username: string
    firstName?: string
    lastName?: string
  }
  admin?: string[]
  employees?: ({
    _id: string
    userId?: string
    username?: string
    firstName?: string
    lastName?: string
    role?: string
    department?: string
    user?: { username?: string; firstName?: string; lastName?: string }
  } | string)[]
  departments?: string[]
  created_at?: Date | string
}

const organizationFields: FormField[] = [
  {
    name: 'name',
    label: 'Organization Name',
    type: 'text',
    placeholder: 'Enter organization name',
    required: true,
  },
]

const organizationButtons: FormButton[] = [
  { type: 'submit', label: 'Save', variant: 'primary', size: 'md' },
  { type: 'reset', label: 'Cancel', variant: 'outline', size: 'md' },
]

const getOrganizationColumns = (
  onEdit: (org: PopulatedOrganization) => void,
  onDelete: (org: PopulatedOrganization) => void
): TableColumn<PopulatedOrganization>[] => [
  {
    key: 'name',
    header: 'Name',
    render: (row) => <span className="font-medium text-foreground">{row.name}</span>,
  },
  {
    key: 'founder',
    header: 'Founder',
    render: (row) => {
      const founder = row.founder
      if (!founder) return '-'
      if (typeof founder === 'string') return founder
      return founder.username || founder.firstName || (founder as unknown as { name?: string }).name || '-'
    },
  },
  {
    key: 'employees',
    header: 'Employees',
    render: (row) => {
      const emp = row.employees as any[]
      if (!emp || emp.length === 0) return '-'
      const count = emp.length
      if (typeof emp[0] === 'string') return String(count) + ' (raw)'
      return String(count)
    },
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
          className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
]

export const OrganizationsPage = () => {
  const { user } = useAuth()
  const [selectedOrg, setSelectedOrg] = useState<PopulatedOrganization | null>(null)
  const [populate, setPopulate] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState<PopulatedOrganization | null>(null)

  const { rightSidebarOpen, setRightSidebarOpen, setSelectedItem: setLayoutSelectedItem } = useLayout()

  const queryResult = useQuery({
    queryKey: ['organizations', populate.join(',')],
    queryFn: async () => {
      const shouldPopulate = populate.length > 0
      const result = await organizationsApi.getAll(shouldPopulate)
      return result || []
    },
  })

  const { data, isLoading, refetch } = queryResult
  const allOrganizations = Array.isArray(data) ? data : []

  const handlePopulateChange = (field: string) => {
    setPopulate(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field])
  }

  const handleRowClick = (org: PopulatedOrganization) => {
    setSelectedOrg(org)
    setLayoutSelectedItem(org)
    setRightSidebarOpen(true)
  }

  const handleEdit = (org: PopulatedOrganization) => {
    setSelectedForEdit(org)
    setIsEditModalOpen(true)
  }

  const handleDelete = (org: PopulatedOrganization) => {
    setSelectedOrg(org)
    setIsDeleteModalOpen(true)
  }

  const handleCreateSubmit = async (formData: Record<string, unknown>) => {
    const name = String(formData.name || '').trim()
    if (!name) {
      toast.error('Organization name is required')
      return
    }

    if (!user?._id) {
      toast.error('User not authenticated')
      return
    }

    try {
      await organizationsApi.create({
        name,
        founder: user._id,
      })
      toast.success('Organization created successfully')
      setIsCreateModalOpen(false)
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create organization')
    }
  }

  const handleEditSubmit = async (formData: Record<string, unknown>) => {
    if (!selectedForEdit) return

    try {
      await organizationsApi.update(selectedForEdit._id, {
        name: String(formData.name || '').trim(),
      })
      toast.success('Organization updated successfully')
      setIsEditModalOpen(false)
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update organization')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOrg) return

    try {
      await organizationsApi.delete(selectedOrg._id)
      toast.success('Organization deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedOrg(null)
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete organization')
    }
  }

  const rightSidebarContent = selectedOrg ? (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground truncate">{selectedOrg.name}</h3>
        <p className="text-xs text-muted">Organization ID: {selectedOrg._id}</p>
      </div>

      <div>
        <p className="text-xs text-muted">Founder</p>
        <p className="text-sm font-medium">
          {(() => {
            const f = selectedOrg.founder
            if (!f) return '-'
            if (typeof f === 'string') return f
            return f.username || f.firstName || (f as unknown as { name?: string }).name || '-'
          })()}
        </p>
      </div>

      {selectedOrg.employees && selectedOrg.employees.length > 0 && (
        <div>
          <p className="text-xs text-muted">Employees</p>
          <div className="space-y-2 mt-1">
            {selectedOrg.employees.map((emp: any, idx: number) => {
              let empName = '-'
              if (typeof emp === 'string') {
                empName = emp
              } else if (emp?.user) {
                empName = emp.user?.username || emp.user?.firstName || emp.user?.lastName || emp.userId || '-'
              } else if (emp?.username || emp?.firstName || emp?.lastName) {
                empName = emp.username || emp.firstName || emp.lastName || '-'
              } else if (emp?.userId) {
                empName = emp.userId
              }
              return (
                <div key={idx} className="text-sm font-medium">
                  {empName} {emp?.role && <span className="text-muted">({emp.role})</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-muted">Created At</p>
        <p className="text-sm font-medium">
          {selectedOrg.created_at ? new Date(selectedOrg.created_at).toLocaleDateString() : '-'}
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => handleEdit(selectedOrg)}
          className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(selectedOrg)}
          className="flex-1 px-3 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  ) : null

  return (
    <MainLayout
      rightSidebar={rightSidebarContent}
      rightSidebarOpen={rightSidebarOpen}
      onRightSidebarClose={() => setRightSidebarOpen(false)}
      rightSidebarTitle={selectedOrg ? `Organization: ${selectedOrg._id}` : ''}
    >
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
        <p className="text-sm text-muted mt-1 mb-6">Manage your organizations</p>
        <div className="mb-4 flex gap-4 items-center">
          <span className="text-sm text-muted">Populate:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={populate.includes('founder')}
              onChange={() => handlePopulateChange('founder')}
              className="w-4 h-4 rounded border-muted text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">Founder</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={populate.includes('employees')}
              onChange={() => handlePopulateChange('employees')}
              className="w-4 h-4 rounded border-muted text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">Employees</span>
          </label>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mb-4"
        >
          Create Organization
        </button>

        <Table
          title=""
          description=""
          columns={getOrganizationColumns(handleEdit, handleDelete)}
          data={allOrganizations as PopulatedOrganization[]}
          isLoading={isLoading}
          emptyMessage="No organizations found"
          onRowClick={handleRowClick}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Organization"
        >
          <Form
            fields={organizationFields}
            buttons={organizationButtons}
            onSubmit={handleCreateSubmit}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedForEdit(null)
          }}
          title="Edit Organization"
        >
          {selectedForEdit && (
            <Form
              fields={organizationFields}
              buttons={organizationButtons}
              onSubmit={handleEditSubmit}
              initialValues={{
                name: selectedForEdit.name,
              }}
            />
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedOrg(null)
          }}
          title="Delete Organization"
        >
          <div className="p-4">
            <p className="text-sm text-foreground mb-4">
              Are you sure you want to delete "{selectedOrg?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm border border-muted/30 rounded-lg text-foreground hover:bg-muted/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  )
}

export default OrganizationsPage
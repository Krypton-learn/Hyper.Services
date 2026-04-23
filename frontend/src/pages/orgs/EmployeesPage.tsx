import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useEmployees, useUpdateEmployee, useDeleteEmployee } from '../../hooks/useEmployees'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../../components/Table'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { ArrowLeft, Trash2, Edit, Shield, ShieldOff, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import type { UpdateEmployeeInput } from '@packages/schemas/employees.schema'
import { useDetailStore } from '../../stores/detail.store'
import { useSidebarStore } from '../../components/Sidebar'

export function EmployeesPage() {
  const { orgId } = useParams({ from: '/organizations/employees/$orgId' })
  const navigate = useNavigate()
  const setSelectedEmployee = useDetailStore((state) => state.setSelectedEmployee)
  const openRightSidebar = useSidebarStore((state) => state.openRightSidebar)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateEmployeeInput>({
    isAdmin: false,
    department: null,
    role: 'Member',
  })

  const { data: employees, isLoading, error } = useEmployees(orgId || '')
  const updateEmployeeMutation = useUpdateEmployee(orgId || '')
  const deleteEmployeeMutation = useDeleteEmployee(orgId || '')

  const handleEdit = (employeeId: string) => {
    const employee = employees?.find(e => e.id === employeeId)
    if (employee) {
      setFormData({
        isAdmin: employee.isAdmin,
        department: employee.department,
        role: employee.role,
      })
      setEditingEmployeeId(employeeId)
      setIsModalOpen(true)
    }
  }

  const handleUpdate = async () => {
    if (!editingEmployeeId) return
    try {
      await updateEmployeeMutation.mutateAsync({
        id: editingEmployeeId,
        data: formData,
      })
      toast.success('Employee updated')
      setIsModalOpen(false)
      setEditingEmployeeId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update employee')
    }
  }

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployeeMutation.mutateAsync(employeeId)
      toast.success('Employee removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove employee')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => orgId && navigate({ to: '/organizations/dashboard/$orgId', params: { orgId } })}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">Employees</h1>
      </div>

      {isLoading && <p className="text-muted">Loading employees...</p>}
      {error && <p className="text-red-500">Failed to load employees</p>}

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Department</TableHead>
              <TableHead className="hidden md:table-cell">Admin</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableActions></TableActions>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.map((employee) => (
              <TableRow key={employee.id} onClick={() => { setSelectedEmployee(employee); openRightSidebar(null); }} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                      {employee.user.name.charAt(0)}
                    </div>
                    <div className="sm:hidden">
                      <p className="font-medium text-sm">{employee.user.name}</p>
                      <p className="text-xs text-muted">{employee.user.email}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="font-medium">{employee.user.name}</p>
                      <p className="text-xs text-muted">{employee.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.role === 'Head' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.role}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{employee.department || '-'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {employee.isAdmin ? (
                    <Shield className="w-4 h-4 text-green-500" />
                  ) : (
                    <ShieldOff className="w-4 h-4 text-gray-400" />
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {new Date(employee.joinedAt).toLocaleDateString()}
                </TableCell>
                <TableActions>
                  {!employee.isFounder && (
                    <>
                      <button
                        onClick={() => handleEdit(employee.id)}
                        className="p-1 hover:text-blue-500"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        disabled={deleteEmployeeMutation.isPending}
                        className="p-1 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </TableActions>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {employees?.length === 0 && !isLoading && (
        <p className="text-muted text-center py-8">No employees found.</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Employee">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Head' | 'Member' })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Member">Member</option>
              <option value="Head">Head</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value || null })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Department name"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.isAdmin || false}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isAdmin" className="text-sm font-medium">Grant Admin Access</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateEmployeeMutation.isPending}>
              {updateEmployeeMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
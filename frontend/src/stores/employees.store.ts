import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EmployeeWithUser } from '@packages/schemas/employees.schema'

interface EmployeesState {
  employees: EmployeeWithUser[]
  setEmployees: (employees: EmployeeWithUser[]) => void
  addEmployee: (employee: EmployeeWithUser) => void
  updateEmployee: (employeeId: string, data: Partial<EmployeeWithUser>) => void
  removeEmployee: (employeeId: string) => void
}

export const useEmployeesStore = create<EmployeesState>()(
  persist(
    (set) => ({
      employees: [],
      setEmployees: (employees) => set({ employees }),
      addEmployee: (employee) => set((state) => ({ employees: [employee, ...state.employees] })),
      updateEmployee: (employeeId, data) =>
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === employeeId ? { ...e, ...data } : e
          ),
        })),
      removeEmployee: (employeeId) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== employeeId),
        })),
    }),
    {
      name: 'employees-storage',
    }
  )
)
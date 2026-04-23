import { create } from 'zustand'
import type { Task } from '@packages/schemas/tasks.schema'
import type { Milestone } from '@packages/schemas/milestones.schema'
import type { EmployeeWithUser } from '@packages/schemas/employees.schema'

interface DetailStore {
  selectedTask: Task | null
  selectedMilestone: Milestone | null
  selectedEmployee: EmployeeWithUser | null
  setSelectedTask: (task: Task | null) => void
  setSelectedMilestone: (milestone: Milestone | null) => void
  setSelectedEmployee: (employee: EmployeeWithUser | null) => void
  clearSelection: () => void
}

export const useDetailStore = create<DetailStore>((set) => ({
  selectedTask: null,
  selectedMilestone: null,
  selectedEmployee: null,
  setSelectedTask: (task) => set({ selectedTask: task, selectedMilestone: null, selectedEmployee: null }),
  setSelectedMilestone: (milestone) => set({ selectedMilestone: milestone, selectedTask: null, selectedEmployee: null }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee, selectedTask: null, selectedMilestone: null }),
  clearSelection: () => set({ selectedTask: null, selectedMilestone: null, selectedEmployee: null }),
}))
import { create } from 'zustand'
import type { Task } from './tasksStore'

interface DashboardStats {
  total: number
  completed: number
  pending: number
}

interface DashboardState {
  pending: Task[]
  completed: Task[]
  overdue: Task[]
  stats: DashboardStats
  setDashboardData: (data: { pending: Task[]; completed: Task[]; overdue: Task[]; stats: DashboardStats }) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  pending: [],
  completed: [],
  overdue: [],
  stats: { total: 0, completed: 0, pending: 0 },

  setDashboardData: (data) => set({
    pending: data.pending,
    completed: data.completed,
    overdue: data.overdue,
    stats: data.stats,
  }),
}))
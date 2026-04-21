import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task } from '../../../packages/schemas/tasks.schema'

interface TasksState {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, data: Partial<Task>) => void
  removeTask: (taskId: string) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, data) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
        })),
      removeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),
    }),
    {
      name: 'tasks-storage',
    }
  )
)
import { create } from 'zustand'

export interface Task {
  id: string
  title: string
  desc: string
  isCompleted: number
  startingDate: string
  deadline: string
  createdAt: string
  creator_id: string
  creator_username: string
  creator_email: string
  assignee_id: string | null
  assignee_username: string | null
  assignee_email: string | null
  status: 'Urgent' | 'Common'
}

interface TasksState {
  tasks: Task[]
  selectedTask: Task | null
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (id: string) => void
  setSelectedTask: (task: Task | null) => void
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  selectedTask: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks] 
  })),

  updateTask: (task) => set((state) => ({ 
    tasks: state.tasks.map((t) => t.id === task.id ? task : t),
    selectedTask: state.selectedTask?.id === task.id ? task : state.selectedTask,
  })),

  removeTask: (id) => set((state) => ({ 
    tasks: state.tasks.filter((t) => t.id !== id),
    selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
  })),

  setSelectedTask: (task) => set({ selectedTask: task }),
}))
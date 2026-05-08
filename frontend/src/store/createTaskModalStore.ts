import { create } from 'zustand'

interface CreateTaskModalState {
  isOpen: boolean
  defaultStatus: 'Common' | 'Urgent'
  open: () => void
  openWithStatus: (status: 'Common' | 'Urgent') => void
  close: () => void
}

export const useCreateTaskModalStore = create<CreateTaskModalState>((set) => ({
  isOpen: false,
  defaultStatus: 'Common',
  open: () => set({ isOpen: true, defaultStatus: 'Common' }),
  openWithStatus: (status) => set({ isOpen: true, defaultStatus: status }),
  close: () => set({ isOpen: false }),
}))

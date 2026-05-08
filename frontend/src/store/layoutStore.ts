import { create } from 'zustand'

interface LayoutState {
  isRightSidebarOpen: boolean
  isRightSidebarDisabled: boolean
  openRightSidebar: () => void
  closeRightSidebar: () => void
  toggleRightSidebar: () => void
  enableRightSidebar: () => void
  disableRightSidebar: () => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isRightSidebarOpen: false,
  isRightSidebarDisabled: true,
  openRightSidebar: () => set({ isRightSidebarOpen: true }),
  closeRightSidebar: () => set({ isRightSidebarOpen: false }),
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  enableRightSidebar: () => set({ isRightSidebarDisabled: false }),
  disableRightSidebar: () => set({ isRightSidebarDisabled: true, isRightSidebarOpen: false }),
}))

import { create } from 'zustand'

export interface WaitlistEntry {
  id: string
  firstname: string
  lastname: string
  email: string
  desc: string
  createdAt: string
}

interface WaitlistState {
  entries: WaitlistEntry[]
  setEntries: (entries: WaitlistEntry[]) => void
  addEntry: (entry: WaitlistEntry) => void
  removeEntry: (id: string) => void
}

export const useWaitlistStore = create<WaitlistState>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
  removeEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
}))
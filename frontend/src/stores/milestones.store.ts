import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Milestone } from '../../../packages/schemas/milestones.schema'

interface MilestonesState {
  milestones: Milestone[]
  setMilestones: (milestones: Milestone[]) => void
  addMilestone: (milestone: Milestone) => void
  updateMilestone: (milestoneId: string, data: Partial<Milestone>) => void
  removeMilestone: (milestoneId: string) => void
}

export const useMilestonesStore = create<MilestonesState>()(
  persist(
    (set) => ({
      milestones: [],
      setMilestones: (milestones) => set({ milestones }),
      addMilestone: (milestone) => set((state) => ({ milestones: [milestone, ...state.milestones] })),
      updateMilestone: (milestoneId, data) =>
        set((state) => ({
          milestones: state.milestones.map((m) => (m.id === milestoneId ? { ...m, ...data } : m)),
        })),
      removeMilestone: (milestoneId) =>
        set((state) => ({
          milestones: state.milestones.filter((m) => m.id !== milestoneId),
        })),
    }),
    {
      name: 'milestones-storage',
    }
  )
)

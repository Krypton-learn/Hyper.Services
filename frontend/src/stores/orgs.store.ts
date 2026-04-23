import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrganizationWithMembers } from '@packages/schemas/orgs.schema'

interface OrgsState {
  orgs: OrganizationWithMembers[]
  currentOrgId: string | null
  currentOrgToken: string | null
  currentOrg: OrganizationWithMembers | null
  setOrgs: (orgs: OrganizationWithMembers[]) => void
  setCurrentOrg: (id: string, token: string, org: OrganizationWithMembers) => void
  clearCurrentOrg: () => void
}

export const useOrgsStore = create<OrgsState>()(
  persist(
    (set) => ({
      orgs: [],
      currentOrgId: null,
      currentOrgToken: null,
      currentOrg: null,
      setOrgs: (orgs) => set({ orgs }),
      setCurrentOrg: (id, token, org) => set({ currentOrgId: id, currentOrgToken: token, currentOrg: org }),
      clearCurrentOrg: () => set({ currentOrgId: null, currentOrgToken: null, currentOrg: null }),
    }),
    {
      name: 'orgs-storage',
      partialize: (state) => ({
        orgs: state.orgs,
        currentOrgId: state.currentOrgId,
        currentOrgToken: state.currentOrgToken,
        currentOrg: state.currentOrg,
      }),
    }
  )
)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Organization } from '../../../packages/schemas/orgs.schema'

interface OrgsState {
  currentOrgId: string | null
  currentOrgToken: string | null
  currentOrg: Organization | null
  setCurrentOrg: (id: string, token: string, org: Organization) => void
  clearCurrentOrg: () => void
}

export const useOrgsStore = create<OrgsState>()(
  persist(
    (set) => ({
      currentOrgId: null,
      currentOrgToken: null,
      currentOrg: null,
      setCurrentOrg: (id, token, org) => set({ currentOrgId: id, currentOrgToken: token, currentOrg: org }),
      clearCurrentOrg: () => set({ currentOrgId: null, currentOrgToken: null, currentOrg: null }),
    }),
    {
      name: 'orgs-storage',
    }
  )
)
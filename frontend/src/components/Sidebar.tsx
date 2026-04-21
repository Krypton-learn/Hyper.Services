import { create } from 'zustand'
import type { ReactNode } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

export type SidebarPosition = 'left' | 'right'
export type SidebarState = 'open' | 'closed'

interface SidebarConfig {
  position: SidebarPosition
  width: string
  backgroundColor: string
  textColor: string
  borderColor: string
}

interface SidebarStore {
  leftSidebar: SidebarState
  rightSidebar: SidebarState
  leftConfig: SidebarConfig
  rightConfig: SidebarConfig
  rightContent: ReactNode | null

  toggleRightSidebar: () => void
  openRightSidebar: (content: ReactNode, config?: Partial<SidebarConfig>) => void
  closeRightSidebar: () => void
  setRightSidebar: (state: SidebarState) => void
  updateRightConfig: (config: Partial<SidebarConfig>) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  leftSidebar: 'open',
  rightSidebar: 'closed',
  leftConfig: {
    position: 'left',
    width: 'w-64',
    backgroundColor: 'bg-white',
    textColor: 'text-foreground',
    borderColor: 'border-r border-muted/20',
  },
  rightConfig: {
    position: 'right',
    width: 'w-96',
    backgroundColor: 'bg-white',
    textColor: 'text-foreground',
    borderColor: 'border-l border-muted/20',
  },
  rightContent: null,

  toggleRightSidebar: () =>
    set((state) => ({
      rightSidebar: state.rightSidebar === 'open' ? 'closed' : 'open',
    })),

  openRightSidebar: (content, config) =>
    set((state) => ({
      rightSidebar: 'open',
      rightContent: content,
      rightConfig: { ...state.rightConfig, ...config },
    })),

  closeRightSidebar: () =>
    set({
      rightSidebar: 'closed',
      rightContent: null,
    }),

  setRightSidebar: (state) => set({ rightSidebar: state }),

  updateRightConfig: (config) =>
    set((state) => ({ rightConfig: { ...state.rightConfig, ...config } })),
}))

interface SidebarProps {
  position: 'left' | 'right'
  children: ReactNode
  className?: string
}

export function Sidebar({ position, children, className = '' }: SidebarProps) {
  const store = useSidebarStore()

  const isOpen = position === 'left' ? store.leftSidebar === 'open' : store.rightSidebar === 'open'
  const config = position === 'left' ? store.leftConfig : store.rightConfig

  if (!isOpen) return null

  const translate = isOpen ? 'translateX(0)' : position === 'left' ? 'translateX(-100%)' : 'translateX(100%)'

  return (
    <aside
      className={`fixed top-0 h-screen ${config.width} ${config.backgroundColor} ${config.textColor} ${config.borderColor} shadow-lg z-40 transition-transform duration-300 ${className}`}
      style={{
        [position]: 0,
        transform: translate,
      }}
    >
      <div className="h-full overflow-y-auto p-4">{children}</div>
    </aside>
  )
}

export function RightSidebarToggle({ className = '' }: { className?: string }) {
  const store = useSidebarStore()
  const isOpen = store.rightSidebar === 'open'

  return (
    <button
      onClick={store.toggleRightSidebar}
      className={`p-2 hover:bg-muted/20 rounded-lg transition-colors ${className}`}
      aria-label={isOpen ? 'Close right sidebar' : 'Open right sidebar'}
    >
      {isOpen ? <PanelRightClose className="w-6 h-6" /> : <PanelRightOpen className="w-6 h-6" />}
    </button>
  )
}

export function RightSidebarContent() {
  const store = useSidebarStore()
  return <>{store.rightContent}</>
}
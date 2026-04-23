import { create } from 'zustand'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { PanelRightClose, PanelRightOpen, X } from 'lucide-react'
import { useDetailStore } from '../stores/detail.store'
import { Tag, Calendar, Clock, Mail, Shield, Flag, DollarSign } from 'lucide-react'
import ReactAvatar from 'react-avatar'

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

  const isRightSidebar = position === 'right'
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const sidebarStyle = isRightSidebar
    ? { right: 0, left: 'auto' }
    : { left: 0, right: 'auto' }

  if (isRightSidebar && isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div className="fixed inset-0 bg-black/50" onClick={() => useSidebarStore.getState().closeRightSidebar()} />
        <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b bg-white">
            <h2 className="text-lg font-bold">Details</h2>
            <button
              onClick={() => {
                useSidebarStore.getState().closeRightSidebar()
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <aside
      className={`fixed top-0 h-screen ${isRightSidebar ? 'w-96' : 'w-64'} bg-white text-gray-900 border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ${className} hidden lg:block`}
      style={sidebarStyle}
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
  const { selectedTask, selectedMilestone, selectedEmployee } = useDetailStore()
  const { rightSidebar, rightContent, setRightSidebar } = useSidebarStore()

  useEffect(() => {
    if (selectedTask || selectedMilestone || selectedEmployee) {
      if (rightSidebar !== 'open') {
        setRightSidebar('open')
      }
    }
  }, [selectedTask, selectedMilestone, selectedEmployee, rightSidebar, setRightSidebar])

  if (selectedTask || selectedMilestone || selectedEmployee) {
    return <DetailContent />
  }

  return <>{rightContent}</>
}

function DetailContent() {
  const { selectedTask, selectedMilestone, selectedEmployee, clearSelection } = useDetailStore()

  if (selectedTask) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{selectedTask.title}</h3>
          <p className="text-sm text-muted">Task</p>
        </div>
        <div className="space-y-3">
          {selectedTask.description && (
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm">{selectedTask.description}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted" />
            <span className="text-sm">{selectedTask.priority || 'No priority'}</span>
          </div>
          {selectedTask.startingDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted" />
              <span className="text-sm">Started: {new Date(selectedTask.startingDate).toLocaleDateString()}</span>
            </div>
          )}
          {selectedTask.dueDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              <span className="text-sm">Due: {new Date(selectedTask.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {selectedTask.team && selectedTask.team.length > 0 && (
            <div>
              <p className="text-sm font-medium">Team</p>
              <div className="flex flex-wrap gap-1">
                {selectedTask.team.map((member, i) => (
                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{member}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (selectedMilestone) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{selectedMilestone.name}</h3>
          <p className="text-sm text-muted">Milestone</p>
        </div>
        <div className="space-y-3">
          {selectedMilestone.description && (
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm">{selectedMilestone.description}</p>
            </div>
          )}
          {selectedMilestone.category && (
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-muted" />
              <span className="text-sm">{selectedMilestone.category}</span>
            </div>
          )}
          {selectedMilestone.budget !== undefined && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted" />
              <span className="text-sm">${selectedMilestone.budget}</span>
            </div>
          )}
          {selectedMilestone.startingDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted" />
              <span className="text-sm">Start: {new Date(selectedMilestone.startingDate).toLocaleDateString()}</span>
            </div>
          )}
          {selectedMilestone.endingDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              <span className="text-sm">End: {new Date(selectedMilestone.endingDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (selectedEmployee) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ReactAvatar name={selectedEmployee.user?.name} email={selectedEmployee.user?.email} size="48" round />
          <div>
            <h3 className="text-xl font-bold">{selectedEmployee.user?.name}</h3>
            <p className="text-sm text-muted">Employee</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted" />
            <span className="text-sm">{selectedEmployee.user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted" />
            <span className="text-sm">{selectedEmployee.isAdmin ? 'Admin' : 'Member'}</span>
          </div>
          {selectedEmployee.role && (
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm">{selectedEmployee.role}</p>
            </div>
          )}
          {selectedEmployee.department && (
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm">{selectedEmployee.department}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted" />
            <span className="text-sm">Joined: {new Date(selectedEmployee.joinedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
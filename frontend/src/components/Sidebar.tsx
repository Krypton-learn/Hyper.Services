import { X } from 'lucide-react'
import { useLayoutStore } from '../store/layoutStore'

interface SidebarProps {
  position: 'left' | 'right'
  children?: React.ReactNode
}

export default function Sidebar({ position, children }: SidebarProps) {
  const { isRightSidebarOpen, isRightSidebarDisabled, closeRightSidebar } = useLayoutStore()

  if (position === 'right' && (isRightSidebarDisabled || !isRightSidebarOpen)) {
    return null
  }

  return (
    <aside
      className={`fixed top-0 h-screen bg-background border-neutral/10 z-40 ${
        position === 'left'
          ? 'left-0 w-64 border-r shadow-sm'
          : 'right-0 w-80 border-l shadow-lg'
      }`}
    >
      {position === 'right' && (
        <div className="flex items-center justify-between p-4 border-b border-neutral/10">
          <h2 className="font-semibold text-neutral">Panel</h2>
          <button
            onClick={closeRightSidebar}
            className="p-2 hover:bg-neutral/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral/70" />
          </button>
        </div>
      )}
      <div className="h-[calc(100%-56px)] overflow-y-auto">
        {children}
      </div>
    </aside>
  )
}
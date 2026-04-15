import { useState, createContext, useContext, type ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import Avatar from 'react-avatar'
import {
  LayoutDashboard,
  CheckSquare,
  User,
  Settings,
  Building2,
  FolderKanban,
  Plus,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface LayoutContextValue {
  rightSidebarOpen: boolean
  setRightSidebarOpen: (open: boolean) => void
  selectedItem: unknown | null
  setSelectedItem: (item: unknown | null) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used within LayoutProvider')
  return context
}

interface LayoutProviderProps {
  children: ReactNode
}

export const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<unknown | null>(null)

  return (
    <LayoutContext.Provider
      value={{
        rightSidebarOpen,
        setRightSidebarOpen,
        selectedItem,
        setSelectedItem,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

interface NavItem {
  icon: typeof LayoutDashboard
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: FolderKanban, label: 'Phases', href: '/phases' },
  { icon: Building2, label: 'Organizations', href: '/organizations' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export const LeftSidebar = () => {
  const location = useLocation()
  const pathname = location.pathname
  const { user, logout } = useAuth()

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Guest'
  const userEmail = user?.email || ''

  return (
    <aside className="w-64 h-screen bg-background border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          HyperRevise
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted hover:bg-muted/10 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar
            name={userName}
            email={userEmail}
            size="36"
            round
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted truncate">{userEmail}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

interface RightSidebarProps {
  title: string
  children: ReactNode
  onClose?: () => void
}

export const RightSidebar = ({ title, children, onClose }: RightSidebarProps) => {
  return (
    <aside className="w-80 h-screen bg-background border-l border-border flex flex-col fixed right-0 top-0 transform transition-transform duration-200">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground truncate">{title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-muted hover:text-foreground hover:bg-muted/10 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </aside>
  )
}

interface MainLayoutProps {
  children: ReactNode
  rightSidebar?: ReactNode
  rightSidebarTitle?: string
  rightSidebarOpen?: boolean
  onRightSidebarClose?: () => void
}

export const MainLayout = ({
  children,
  rightSidebar,
  rightSidebarTitle,
  rightSidebarOpen = false,
  onRightSidebarClose,
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-muted/5">
      <LeftSidebar />

      <main
        className={`flex-1 transition-all duration-200 ${
          rightSidebarOpen ? 'mr-80' : ''
        }`}
        style={{ marginLeft: '16rem' }}
      >
        {children}
      </main>

      {rightSidebarOpen && rightSidebar && (
        <RightSidebar title={rightSidebarTitle || ''} onClose={onRightSidebarClose}>
          {rightSidebar}
        </RightSidebar>
      )}
    </div>
  )
}
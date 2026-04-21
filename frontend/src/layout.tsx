import type { ReactNode } from 'react'
import { useSidebarStore, Sidebar, RightSidebarToggle, RightSidebarContent } from './components/Sidebar'
import { X, Settings, User, Building2, LogOut } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from './store/auth'
import ReactAvatar from 'react-avatar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const rightOpen = useSidebarStore((s) => s.rightSidebar === 'open')
  const { user, logout } = useAuthStore()

  const marginRight = rightOpen ? 'mr-96' : 'mr-0'

  const navItems: { icon: typeof User; label: string; href: string; gap?: boolean }[] = [
    { icon: Building2, label: 'Organizations', href: '/organizations', gap: true },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Right Sidebar Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <RightSidebarToggle />
      </div>

      {/* Left Sidebar */}
      <Sidebar position="left">
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="font-bold text-lg">HyperRevise</span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted/20 rounded-lg transition-colors ${item.gap ? 'mt-6' : ''}`}
                  activeProps={{ className: 'bg-primary/10 text-primary' }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Card at bottom */}
          <div className="border-t border-muted/20 pt-4 mt-4">
            <div className="flex items-center gap-3 p-2">
              <ReactAvatar
                name={user?.name}
                email={user?.email}
                size="40"
                round
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Sidebar>

      {/* Right Detail Sidebar */}
      <Sidebar position="right">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Details</h2>
          <button
            onClick={useSidebarStore.getState().closeRightSidebar}
            className="p-1 hover:bg-muted/20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <RightSidebarContent />
      </Sidebar>

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-4 ml-64 ${marginRight}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

export function useRightSidebar() {
  return useSidebarStore()
}
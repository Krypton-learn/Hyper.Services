import type { ReactNode } from 'react'
import { useSidebarStore, Sidebar, RightSidebarContent } from './components/Sidebar'
import { useDetailStore } from './stores/detail.store'
import { X, Settings, User, Building2, LogOut, Menu, Home } from 'lucide-react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuthStore } from './stores/auth.store'
import { useOrgsStore } from './stores/orgs.store'
import ReactAvatar from 'react-avatar'
import { useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const rightOpen = useSidebarStore((s) => s.rightSidebar === 'open')
  const leftOpen = useSidebarStore((s) => s.leftSidebar === 'open')
  const { user, logout } = useAuthStore()
  const currentOrgToken = useOrgsStore((s) => s.currentOrgToken)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const marginLeft = leftOpen ? 'lg:ml-64' : 'lg:ml-0'
  const marginRight = rightOpen ? 'lg:mr-96' : 'lg:mr-0'
  const currentPath = typeof routerState === 'object' && routerState !== null ? (routerState as { location?: { pathname?: string } }).location?.pathname || '' : ''

  const isOrgPage = currentPath === '/organizations' || currentPath.startsWith('/organizations/')
  const isAuthPage = currentPath === '/login' || currentPath === '/register'

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const navItems: { icon: typeof User; label: string; href: string; gap?: boolean }[] = [
    { icon: Building2, label: 'Organizations', href: '/organizations', gap: true },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {!isAuthPage && (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-muted/20 z-50 flex items-center justify-between px-4">
          <Link to="/organizations" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="font-bold text-sm">HyperRevise</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-muted/20 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      {!isAuthPage && mobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-14 left-0 w-64 bg-white border-r border-muted/20 shadow-lg z-50 transition-transform">
            <div className="p-4 space-y-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted/20 rounded-lg transition-colors ${item.gap ? 'mt-6' : ''}`}
                    activeProps={{ className: 'bg-primary/10 text-primary' }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              {user && (
                <div className="border-t border-muted/20 pt-4 mt-4">
                  <div className="flex items-center gap-3 p-2 bg-muted/10 rounded-lg">
                    <ReactAvatar
                      name={user.name}
                      email={user.email}
                      size="40"
                      round
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Left Sidebar - Desktop */}
      {!isAuthPage && (
        <Sidebar position="left" className="hidden lg:flex">
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Link to="/organizations" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="font-bold text-lg">HyperRevise</span>
              </Link>
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
          {user && (
            <div className="border-t border-muted/20 pt-4 mt-4">
              <div className="flex items-center gap-3 p-2 bg-muted/10 rounded-lg">
                <ReactAvatar
                  name={user.name}
                  email={user.email}
                  size="40"
                  round
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Sidebar>)}
      
      {/* Right Detail Sidebar */}
      {!isAuthPage && (
        <Sidebar position="right">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Details</h2>
            <button
              onClick={() => {
                useSidebarStore.getState().closeRightSidebar()
                useDetailStore.getState().clearSelection()
              }}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <RightSidebarContent />
        </Sidebar>
      )}

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isAuthPage ? 'pt-0' : 'pt-14 lg:pt-0'} ${isAuthPage ? '' : 'px-4 pb-4 lg:px-6 lg:pb-6'} ${marginLeft} ${marginRight}`}>
        <div className={isAuthPage ? '' : ''}>{children}</div>
      </main>
    </div>
  )
}

export function useRightSidebar() {
  return useSidebarStore()
}
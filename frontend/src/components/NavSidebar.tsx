import { Link } from '@tanstack/react-router'
import { 
  Home, 
  ListTodo, 
  Calendar, 
  Settings, 
  Plus,
  ChevronRight,
  Layers,
  LogOut,
  Store,
  Users,
  Bot
} from 'lucide-react'
import Avatar from 'react-avatar'
import { useAuthStore } from '../store/authStore'
import { useLogout } from '../hooks/useAuth'
import { useCreateTaskModalStore } from '../store/createTaskModalStore'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/ai', icon: Bot, label: 'AI Chat' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/waitlist', icon: Users, label: 'Waitlist' },
  { to: '/stores', icon: Store, label: 'Stores' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function NavSidebar() {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const openCreateTaskModal = useCreateTaskModalStore((state) => state.open)

  const isOrganization = user?.accountType === 'Organization'

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral/10 shrink-0">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Layers className="w-6 h-6" />
          HyperRevise
        </h1>
      </div>

      <div className="p-4 shrink-0">
        <button
          onClick={openCreateTaskModal}
          className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral/50 uppercase tracking-wider px-4 py-2">
          Menu
        </div>
        {navItems.filter((item) => item.to !== '/waitlist' || isOrganization).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 text-neutral/70 hover:bg-neutral/5 hover:text-primary rounded-lg transition-all group"
            activeProps={{ 
              className: 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
            }}
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-neutral/10 shrink-0">
        {bottomItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 text-neutral/70 hover:bg-neutral/5 hover:text-primary rounded-lg transition-colors"
            activeProps={{ 
              className: 'bg-primary/10 text-primary font-medium' 
            }}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-3 border-t border-neutral/10 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral/5 transition-colors group">
          <Avatar 
            name={user?.username || 'User'} 
            size="36" 
            round 
            color="#9810fa"
            fgColor="white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-neutral/50 truncate">{user?.email || ''}</p>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-neutral/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
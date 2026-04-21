import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card'
import { useAuthStore } from '../store/auth'
import ReactAvatar from 'react-avatar'
import { LogOut } from 'lucide-react'

export function ProfilePage() {
  const { user, logout } = useAuthStore()

  return (
    <div className="max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ReactAvatar
            name={user?.name}
            email={user?.email}
            size="100"
            round
            className="mb-4"
          />
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-muted">{user?.email}</p>
          {user?.phone && <p className="text-muted text-sm mt-1">{user.phone}</p>}
          {user?.profile?.bio && (
            <p className="text-foreground/80 text-sm mt-2">{user.profile.bio}</p>
          )}
        </CardContent>
        <CardFooter>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
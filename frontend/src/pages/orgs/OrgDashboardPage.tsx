import { useNavigate } from '@tanstack/react-router'
import { Clock, ArrowLeft } from 'lucide-react'

export function OrgDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: '/organizations' })}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Organization Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate({ to: '/organizations/milestones' })}
          className="p-6 border rounded-xl hover:bg-muted/50 transition-colors text-left"
        >
          <Clock className="w-8 h-8 mb-2" />
          <h3 className="font-semibold">Milestones</h3>
          <p className="text-sm text-muted">Track project milestones</p>
        </button>
      </div>
    </div>
  )
}
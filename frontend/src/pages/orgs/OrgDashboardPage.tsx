import { useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Clock, ArrowLeft, Users, Target, CheckCircle2, ListTodo, Calendar as CalendarIcon } from 'lucide-react'
import { useOrgsStore } from '../../stores/orgs.store'
import { getOrgDashboard, type OrgDashboardStats } from '../../api/orgs.api'
import { OrgCalendar } from '../../components/Calendar'

export function OrgDashboardPage() {
  const navigate = useNavigate()
  const params = useParams({ from: '/organizations/dashboard/$orgId' })
  const orgId = params.orgId
  const currentOrgId = useOrgsStore((state) => state.currentOrgId)
  const currentOrgToken = useOrgsStore((state) => state.currentOrgToken)
  const orgs = useOrgsStore((state) => state.orgs)
  const setCurrentOrg = useOrgsStore((state) => state.setCurrentOrg)

  useEffect(() => {
    if (orgId && orgId !== currentOrgId && orgs.length > 0) {
      const org = orgs.find((o) => o.id === orgId)
      if (org) {
        setCurrentOrg(org.id, org.token, org)
      }
    }
  }, [orgId, currentOrgId, orgs, setCurrentOrg])

  const { data: stats, isLoading } = useQuery<OrgDashboardStats>({
    queryKey: ['org-dashboard', orgId],
    queryFn: () => getOrgDashboard(orgId),
    enabled: !!orgId,
  })

  return (
<div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/organizations' })}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Organization Dashboard</h1>
        </div>

        {isLoading && <p className="text-muted">Loading...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => orgId && navigate({ to: '/organizations/milestones/$orgId', params: { orgId } })}
            disabled={!orgId}
            className="p-4 sm:p-6 border rounded-xl hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
          >
            <Clock className="w-6 sm:w-8 h-6 sm:h-8 mb-2" />
            <h3 className="font-semibold text-sm sm:text-base">Milestones</h3>
            <p className="text-xs sm:text-sm text-muted">{stats?.milestones ?? 0} milestone{stats?.milestones !== 1 ? 's' : ''}</p>
          </button>

          <button
            onClick={() => orgId && navigate({ to: '/organizations/employees/$orgId', params: { orgId } })}
            disabled={!orgId}
            className="p-4 sm:p-6 border rounded-xl hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
          >
            <Users className="w-6 sm:w-8 h-6 sm:h-8 mb-2" />
            <h3 className="font-semibold text-sm sm:text-base">Employees</h3>
            <p className="text-xs sm:text-sm text-muted">{stats?.employees ?? 0} member{stats?.employees !== 1 ? 's' : ''}</p>
          </button>

          <button
            onClick={() => currentOrgToken && navigate({ to: '/organizations/tasks/$token', params: { token: currentOrgToken } })}
            disabled={!currentOrgToken}
            className="p-4 sm:p-6 border rounded-xl hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
          >
            <Target className="w-6 sm:w-8 h-6 sm:h-8 mb-2" />
            <h3 className="font-semibold text-sm sm:text-base">Tasks</h3>
            <p className="text-xs sm:text-sm text-muted">{stats?.tasks ?? 0} task{stats?.tasks !== 1 ? 's' : ''}</p>
          </button>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar
          </h2>
          <OrgCalendar orgId={orgId} token={currentOrgToken || ''} />
        </div>
      </div>
  )
}
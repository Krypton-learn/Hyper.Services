import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, LayoutGrid, List, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { useOrgsStore } from '@/stores/orgs.store'
import { TaskTableView } from './table.pages'
import { TaskKanbanView } from './kanban.pages'

type TaskView = 'table' | 'kanban'

export function TasksPage() {
  const { token } = useParams({ from: '/organizations/tasks/$token' })
  const currentOrgId = useOrgsStore((state: { currentOrgId: string | null }) => state.currentOrgId)
  const navigate = useNavigate()
  const [view, setView] = useState<TaskView>('table')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => currentOrgId && navigate({ to: '/organizations/dashboard/$orgId', params: { orgId: currentOrgId } })}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
          <Button
            variant={view === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'kanban' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('kanban')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {view === 'table' ? <TaskTableView showCreateModal={isCreateModalOpen} onCloseCreateModal={() => setIsCreateModalOpen(false)} /> : <TaskKanbanView showCreateModal={isCreateModalOpen} onCloseCreateModal={() => setIsCreateModalOpen(false)} />}
    </div>
  )
}
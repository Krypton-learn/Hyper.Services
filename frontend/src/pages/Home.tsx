import { CheckCircle2, Clock, AlertCircle, ListTodo, Calendar, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import PageContainer from '../components/PageContainer'
import { Table, TableBody, TableRow, TableCell } from '../components/Table'
import { useDashboard } from '../hooks/useDashboard'
import { useDashboardStore } from '../store/dashboardStore'
import type { Task } from '../store/tasksStore'

export default function Home() {
  const { isLoading } = useDashboard()
  const { pending, overdue, stats } = useDashboardStore()

  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  return (
    <PageContainer 
      title="Dashboard" 
      description="Welcome back! Here's an overview of your tasks."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-neutral/60">Total Tasks</span>
          </div>
          <div className="text-3xl font-bold text-neutral">{stats.total}</div>
        </div>

        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-neutral/60">Pending</span>
          </div>
          <div className="text-3xl font-bold text-primary">{stats.pending}</div>
        </div>

        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-neutral/60">Completed</span>
          </div>
          <div className="text-3xl font-bold text-primary">{stats.completed}</div>
        </div>

        <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 p-6 hover:border-red-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-neutral/60">Overdue</span>
          </div>
          <div className="text-3xl font-bold text-red-500">{overdue.length}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-neutral/60">Loading dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral/10 dark:border-neutral/20">
              <h3 className="font-semibold text-neutral">Pending Tasks</h3>
              <Link 
                to="/tasks" 
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {pending.length === 0 ? (
              <div className="p-8 text-center text-neutral/60">No pending tasks</div>
            ) : (
              <Table>
                <TableBody>
                  {pending.slice(0, 5).map((task: Task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {task.deadline && (
                          <span className="text-sm text-neutral/50 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.deadline)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="bg-white dark:bg-[var(--background-secondary)] rounded-2xl border border-neutral/10 dark:border-neutral/20 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral/10 dark:border-neutral/20">
              <h3 className="font-semibold text-neutral">Overdue Tasks</h3>
              <Link 
                to="/tasks" 
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {overdue.length === 0 ? (
              <div className="p-8 text-center text-primary flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>No overdue tasks</span>
              </div>
            ) : (
              <Table>
                <TableBody>
                  {overdue.slice(0, 5).map((task: Task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium text-red-500">{task.title}</TableCell>
                      <TableCell>
                        {task.deadline && (
                          <span className="text-sm text-red-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.deadline)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
import { D1Database } from '@cloudflare/workers-types'
import { 
  getPendingTasksCRUD, 
  getCompletedTasksCRUD, 
  getOverdueTasksCRUD, 
  getTotalStatsCRUD,
  getOrganizationPendingTasksCRUD,
  getOrganizationCompletedTasksCRUD,
  getOrganizationOverdueTasksCRUD,
  getOrganizationTotalStatsCRUD
} from './dashboard.crud'

export const getPendingTasksService = async (db: D1Database, userId: string) => {
  return getPendingTasksCRUD(db, userId)
}

export const getCompletedTasksService = async (db: D1Database, userId: string) => {
  return getCompletedTasksCRUD(db, userId)
}

export const getOverdueTasksService = async (db: D1Database, userId: string) => {
  return getOverdueTasksCRUD(db, userId)
}

export const getTotalStatsService = async (db: D1Database, userId: string) => {
  return getTotalStatsCRUD(db, userId)
}

export const getOverviewService = async (
  db: D1Database,
  isOrgUser: boolean,
  userId?: string
) => {
  try {
    console.log('getOverviewService - received:', { isOrgUser, userId })

    if (isOrgUser) {
      console.log('getOverviewService - fetching ORGANIZATION tasks from entire database')
      const [pending, completed, overdue, stats] = await Promise.all([
        getOrganizationPendingTasksCRUD(db),
        getOrganizationCompletedTasksCRUD(db),
        getOrganizationOverdueTasksCRUD(db),
        getOrganizationTotalStatsCRUD(db)
      ])

      return {
        pending: pending.results || [],
        completed: completed.results || [],
        overdue: overdue.results || [],
        stats: stats || { total: 0, completed: 0, pending: 0 },
      }
    }

    if (!userId) {
      throw new Error('User ID is required for personal tasks')
    }

    console.log('getOverviewService - fetching PERSONAL tasks for specific user')
    const [pending, completed, overdue, stats] = await Promise.all([
      getPendingTasksCRUD(db, userId),
      getCompletedTasksCRUD(db, userId),
      getOverdueTasksCRUD(db, userId),
      getTotalStatsCRUD(db, userId)
    ])

    return {
      pending: pending.results || [],
      completed: completed.results || [],
      overdue: overdue.results || [],
      stats: stats || { total: 0, completed: 0, pending: 0 },
    }
  } catch (error) {
    console.error('getOverviewService error:', error)
    throw new Error('Failed to fetch overview data')
  }
}
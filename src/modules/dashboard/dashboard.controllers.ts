import { Context } from 'hono'
import { getOverviewService } from './dashboard.services'
import { verifyAuth } from '@/lib/auth'
import { overviewResponseSchema } from '@packages/schemas/dashboard.responses'

export const getOverviewController = async (c: Context) => {
  try {
    const payload = await verifyAuth(c)
    if (!payload) {
      return c.json({ errors: { general: ['Authorization header required'] } }, 401)
    }

    const userId = c.get('userId') as string
    const accountType = (c.get('accountType') as string) || 'Personal'
    const isOrgUser = accountType === 'Organization'

    console.log('Dashboard - userId:', userId, 'accountType:', accountType, 'isOrgUser:', isOrgUser)

    console.log('Dashboard - Calling service with:', { userId, isOrgUser })
    const overview = await getOverviewService(c.env.DB, isOrgUser, userId)

    const validated = overviewResponseSchema.safeParse(overview)
    if (!validated.success) {
      console.error('Validation error:', validated.error.flatten().fieldErrors)
      return c.json(
        {
          message: 'Validation failed',
          errors: validated.error.flatten().fieldErrors,
        },
        500
      )
    }

    return c.json(validated.data)
  } catch (error) {
    console.error('Dashboard controller error:', error)
    return c.json({ errors: { general: ['Internal server error'] } }, 500)
  }
}
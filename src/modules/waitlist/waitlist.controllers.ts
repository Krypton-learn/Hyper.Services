import { Context } from 'hono'
import { addWaitlistSchema } from '@packages/schemas/waitlist.schemas'
import { addWaitlistService, getAllWaitlistService } from './waitlist.services'
import { verifyAuth } from '@/lib/auth'

export const addWaitlistController = async (c: Context) => {
  const body = await c.req.json()
  const parsed = addWaitlistSchema.safeParse(body)

  if (!parsed.success) {
    return c.json(
      {
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      },
      400
    )
  }

  const entry = await addWaitlistService(c.env.DB, parsed.data)

  return c.json(
    {
      message: 'Successfully added to waitlist',
      entry,
    },
    201
  )
}

export const getAllWaitlistController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const entries = await getAllWaitlistService(c.env.DB)

  return c.json({
    results: entries,
    success: true,
  })
}
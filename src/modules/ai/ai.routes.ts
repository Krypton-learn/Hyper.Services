import { Hono } from 'hono'
import { verifyAuth } from '@/lib/auth'
import { chatSchema } from '@packages/schemas/ai.schemas'
import { createGroqChatService, createGroqStreamingChatService, clearRateLimits } from './ai.services'
import { clearSessionCache } from './ai.lib'

const getRoutingInfo = (c: Hono.Context) => {
  const accountType = (c.get('accountType') as string) || 'Personal'
  const isOrgUser = accountType === 'Organization'
  return { accountType, isOrgUser }
}

const ai = new Hono()

ai.post('/chat', async (c) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { accountType, isOrgUser } = getRoutingInfo(c)

  let organizationId: string | undefined
  if (isOrgUser) {
    const org = await c.env.DB.prepare('SELECT user_id FROM organizations WHERE user_id = ?').bind(userId).first()
    organizationId = org?.user_id
  }

  const body = await c.req.json()
  const parsed = chatSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const { messages } = parsed.data
  const isFirstMessage = messages.length <= 1 || messages[0].role === 'user'

  try {
    const response = await createGroqChatService(
      c.env as any,
      messages,
      userId,
      accountType,
      organizationId,
      isFirstMessage
    )

    return c.json({
      role: 'assistant',
      content: response
    })
  } catch (error: any) {
    const message = error.message || 'Chat failed'
    return c.json({ errors: { general: [message] } }, 500)
  }
})

ai.post('/stream-chat', async (c) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { accountType, isOrgUser } = getRoutingInfo(c)

  let organizationId: string | undefined
  if (isOrgUser) {
    const org = await c.env.DB.prepare('SELECT user_id FROM organizations WHERE user_id = ?').bind(userId).first()
    organizationId = org?.user_id
  }

  const body = await c.req.json()
  const parsed = chatSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const { messages } = parsed.data

  try {
    const stream = await createGroqStreamingChatService(
      c.env as any,
      messages,
      userId,
      accountType,
      organizationId
    )

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    const message = error.message || 'Chat failed'
    return c.json({ errors: { general: [message] } }, 500)
  }
})

ai.delete('/clear-rate-limits', async (c) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  clearRateLimits()
  return c.json({ message: 'Rate limits cleared' })
})

ai.delete('/clear-session-cache', async (c) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  clearSessionCache(`chat:${userId}`)
  return c.json({ message: 'Session cache cleared' })
})

export default ai
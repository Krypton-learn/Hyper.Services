import { D1Database } from '@cloudflare/workers-types'
import { Groq } from 'groq-sdk'
import { fetchRecentTasks, fetchRecentStoreFiles, buildSystemPrompt, readPdfContent } from './ai.lib'

interface ChatMessage {
  role?: 'user' | 'assistant' | 'system'
  content: string
}

interface Env {
  GROQ_API_KEY?: string
  GROQ_API_KEY2?: string
  GROQ_API_KEY3?: string
  GROQ_API_KEY4?: string
  GROQ_API_KEY5?: string
  DB?: D1Database
  B2_KEY_ID?: string
  B2_APP_KEY?: string
  B2_BUCKET?: string
  B2_ENDPOINT?: string
}

const RATE_LIMITED_KEYS = new Set<string>()
const SESSION_KEY_PREFIX = 'chat:'

let sessionInitialized = false

const getAvailableApiKey = (env: Env): string | null => {
  const keys = [
    env.GROQ_API_KEY,
    env.GROQ_API_KEY2,
    env.GROQ_API_KEY3,
    env.GROQ_API_KEY4,
    env.GROQ_API_KEY5,
  ].filter(Boolean) as string[]

  for (const key of keys) {
    if (!RATE_LIMITED_KEYS.has(key)) {
      return key
    }
  }

  return keys[0] || null
}

const markKeyAsRateLimited = (key: string) => {
  RATE_LIMITED_KEYS.add(key)
}

export const clearRateLimits = () => {
  RATE_LIMITED_KEYS.clear()
}

export const createGroqChatService = async (
  env: Env,
  messages: ChatMessage[],
  userId?: string,
  accountType?: string,
  organizationId?: string,
  isFirstMessage = false
): Promise<string> => {
  const apiKey = getAvailableApiKey(env)
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const sessionKey = `${SESSION_KEY_PREFIX}${userId}`

  let tasks: any[] = []
  let storeFiles: any[] = []

  if (env.DB && userId) {
    try {
      const forceRefresh = isFirstMessage || !sessionInitialized
      tasks = await fetchRecentTasks(env.DB, userId, accountType || 'Personal', organizationId, forceRefresh, sessionKey)
      storeFiles = await fetchRecentStoreFiles(env.DB, userId, accountType || 'Personal', organizationId, forceRefresh, sessionKey)
      sessionInitialized = true
    } catch (error) {
      console.error('Failed to fetch user context:', error)
    }
  }

  const systemPrompt = buildSystemPrompt(tasks, storeFiles, accountType || 'Personal', userId || '', organizationId)

  const recentMessages = messages.slice(-10)

  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...recentMessages.map((m) => ({
      role: m.role || 'user' as const,
      content: m.content,
    })),
  ]

  const groq = new Groq({ apiKey })

  try {
    const isFirstMessage = messages.length <= 1 || messages[0].role === 'user'

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      tools: [
        {
          type: 'function',
          function: {
            name: 'pdf_reader',
            description: `Read the content of a PDF file. 
              ONLY call this when the user explicitly asks about the content of a specific PDF file by name.
              DO NOT call this for task questions, greetings, workload summaries, or anything not related to reading a specific file's content.`,
            parameters: {
              type: 'object',
              properties: {
                pdf_id: {
                  type: 'string',
                  description: 'The ID of the PDF file to read'
                }
              },
              required: ['pdf_id']
            }
          }
        },
      ],
    })

    const toolCalls = chatCompletion.choices[0]?.message?.tool_calls

    if (toolCalls && toolCalls.length > 0) {
      const toolArgs = JSON.parse(toolCalls[0].function.arguments || '{}')
      const pdfId = toolArgs.pdf_id

      if (pdfId) {
        const pdfContent = await readPdfContent(env, pdfId, userId, accountType, organizationId, env.DB)

        const followUpMessages = [
          ...formattedMessages,
          { role: 'assistant', content: chatCompletion.choices[0].message.content || '' },
          { role: 'tool', tool_call_id: toolCalls[0].id, content: pdfContent }
        ]

        const followUpKey = getAvailableApiKey(env)
        const followUpGroq = new Groq({ apiKey: followUpKey || apiKey })

        const followUpCompletion = await followUpGroq.chat.completions.create({
          messages: followUpMessages,
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        })

        return followUpCompletion.choices[0]?.message?.content || 'No response'
      }
    }

    return chatCompletion.choices[0]?.message?.content || 'No response'
  } catch (error: any) {
    if (error.status === 429) {
      markKeyAsRateLimited(apiKey)
      const nextKey = getAvailableApiKey(env)
      if (nextKey && nextKey !== apiKey) {
        return createGroqChatService(env, messages, userId, accountType, organizationId)
      }
    }
    throw new Error(error.message || 'Groq API error')
  }
}

export const createGroqStreamingChatService = async (
  env: Env,
  messages: ChatMessage[],
  userId?: string,
  accountType?: string,
  organizationId?: string
): Promise<ReadableStream> => {
  const apiKey = getAvailableApiKey(env)
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  let tasks: any[] = []
  let storeFiles: any[] = []

  if (env.DB && userId) {
    try {
      tasks = await fetchRecentTasks(env.DB, userId, accountType || 'Personal', organizationId)
      storeFiles = await fetchRecentStoreFiles(env.DB, userId, accountType || 'Personal', organizationId)
    } catch (error) {
      console.error('Failed to fetch user context:', error)
    }
  }

  const systemPrompt = buildSystemPrompt(tasks, storeFiles, accountType || 'Personal', userId || '', organizationId)

  const recentMessages = messages.slice(-10)

  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...recentMessages.map((m) => ({
      role: m.role || 'user' as const,
      content: m.content,
    })),
  ]

  const groq = new Groq({ apiKey })

  const chatCompletion = await groq.chat.completions.create({
    messages: formattedMessages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    stream: true,
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      chatCompletion.on('content', (chunk) => {
        controller.enqueue(encoder.encode(chunk))
      })

      chatCompletion.on('end', () => {
        controller.close()
      })

      chatCompletion.on('error', (error) => {
        controller.error(error)
      })
    },
  })

  return stream
}
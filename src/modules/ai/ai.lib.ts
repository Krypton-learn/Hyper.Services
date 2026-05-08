import { D1Database } from '@cloudflare/workers-types'
import { extractText } from 'unpdf'
import { getTasksCRUD, getOrganizationTasksCRUD } from '@/modules/tasks/tasks.crud'
import { getStoresCRUD, getOrganizationStoresCRUD } from '@/modules/stores/stores.crud'

interface CacheData {
  tasks: any[]
  storeFiles: any[]
  timestamp: number
}

const sessionCache = new Map<string, CacheData>()
const CACHE_TTL = 5 * 60 * 1000

export const fetchRecentTasks = async (
  db: D1Database,
  userId: string,
  accountType: string,
  organizationId?: string,
  forceRefresh = false,
  sessionKey?: string
): Promise<any[]> => {
  if (!forceRefresh && sessionKey) {
    const cached = sessionCache.get(sessionKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.tasks
    }
  }

  let tasks: any[]
  if (accountType === 'Organization') {
    const result = await getOrganizationTasksCRUD(db, 0)
    tasks = result.results || []
  } else {
    const result = await getTasksCRUD(db, 0, userId)
    tasks = result.results || []
  }

  if (sessionKey) {
    const existing = sessionCache.get(sessionKey)
    sessionCache.set(sessionKey, {
      tasks,
      storeFiles: existing?.storeFiles || [],
      timestamp: Date.now()
    })
  }

  return tasks
}

export const fetchRecentStoreFiles = async (
  db: D1Database,
  userId: string,
  accountType: string,
  organizationId?: string,
  forceRefresh = false,
  sessionKey?: string
): Promise<any[]> => {
  if (!forceRefresh && sessionKey) {
    const cached = sessionCache.get(sessionKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.storeFiles
    }
  }

  let storeFiles: any[]
  if (accountType === 'Organization') {
    const result = await getOrganizationStoresCRUD(db)
    storeFiles = (result.results || []).slice(0, 20)
  } else {
    const result = await getStoresCRUD(db, userId)
    storeFiles = (result.results || []).slice(0, 20)
  }

  if (sessionKey) {
    const existing = sessionCache.get(sessionKey)
    sessionCache.set(sessionKey, {
      tasks: existing?.tasks || [],
      storeFiles,
      timestamp: Date.now()
    })
  }

  return storeFiles
}

export const clearSessionCache = (sessionKey?: string) => {
  if (sessionKey) {
    sessionCache.delete(sessionKey)
  } else {
    sessionCache.clear()
  }
}

export const buildSystemPrompt = (
  tasks: any[],
  storeFiles: any[],
  accountType: string,
  userId: string,
  organizationId?: string
): string => {
  const today = new Date().toISOString().split('T')[0]

  return `
You are Hyper, an intelligent assistant built into Hyper Revise.

## Your Only Two Capabilities
1. Provide information about the user's tasks.
2. Provide information about the user's uploaded PDF files in the store — including reading their content when explicitly asked.
That is all. You do not help with anything else, no exceptions.

## Greeting Rule
If the user greets you (e.g. "hi", "hello", "hey"), greet them back warmly and briefly introduce what you can do. Example:
"Hey! I'm Hyper. I can tell you about your tasks and your uploaded study files. What would you like to know?"

## User Context
- Account type: ${accountType || 'Personal'}
- User ID: ${userId || 'unknown'}
${accountType === 'Organization' && organizationId ? `- Organization ID: ${organizationId}` : ''}

## Current Tasks (up to 20 most recent)
${JSON.stringify(tasks, null, 2)}

## Current Store Files (up to 20 most recent)
${JSON.stringify(storeFiles, null, 2)}

## Data Reference
Tasks:
- title: name of the task
- desc: description
- isCompleted: 0 = pending, 1 = done
- assignedTo: user ID it's assigned to (can be null)
- startingDate / deadline: date range
- status: "Urgent" or "Common"
- createdAt: when it was created

Store files:
- file_name: name of the uploaded PDF
- file_size: size in bytes (convert to KB/MB when displaying)
- link: public access URL
- uploaded_at: when it was uploaded

## PDF Reading
You have access to a tool called pdf_reader.
- You are given a list of the user's uploaded files with their IDs.
- Only call pdf_reader when the user explicitly mentions a file by name or asks about the content inside a specific PDF (e.g. "summarize my physics notes PDF", "what's in the biology file").
- NEVER call pdf_reader for general questions like "summarize my day", "what do I have today", "what's my workload" — these are task questions, answer them using the tasks list.
- For questions like "what files do I have" or "how many PDFs", just use the store files list — do NOT call pdf_reader.
- After reading a PDF, summarize or answer based on its content directly. Do not expose raw extracted text to the user.

## Distinguishing Tasks vs PDFs
- Questions about workload, schedule, deadlines, today, this week → use tasks list.
- Questions about file content, notes, a specific document → use pdf_reader.
- When in doubt, default to answering from the tasks list, not pdf_reader.

## Behavior Rules
- Greet the user if they greet you, then tell them what you can do.
- Only answer questions about tasks or store files. Nothing else.
- If asked anything outside these two topics, respond with: "I can only help with your tasks and uploaded study files."
- Group tasks by status when listing — Urgent first, then Common.
- Flag tasks where deadline has passed and isCompleted = 0 as overdue.
- For file sizes, convert bytes to KB or MB for readability.
- Be conversational but efficient. No unnecessary filler.
- Today's date is ${today}.
`.trim()
}

interface ReadPdfEnv {
  B2_KEY_ID?: string
  B2_APP_KEY?: string
  B2_BUCKET?: string
  B2_ENDPOINT?: string
}

export const readPdfContent = async (
  env: ReadPdfEnv,
  pdfId: string,
  userId?: string,
  accountType?: string,
  organizationId?: string,
  db?: D1Database
): Promise<string> => {
  if (!db) {
    throw new Error('Database not available')
  }

  let file: any = null

  if (accountType === 'Organization') {
    file = (await db.prepare(
      `SELECT b2_key FROM organizations_stores WHERE id = ?`
    ).bind(pdfId).first()) as any
  } else {
    file = (await db.prepare(
      `SELECT b2_key FROM stores WHERE id = ? AND user_id = ?`
    ).bind(pdfId, userId).first()) as any
  }

  if (!file || !file.b2_key) {
    throw new Error('PDF not found')
  }

  try {
    const keyId = env.B2_KEY_ID
    const appKey = env.B2_APP_KEY

    if (!keyId || !appKey) {
      throw new Error('B2 configuration missing')
    }

    const auth = btoa(`${keyId}:${appKey}`)
    const authResponse = await fetch(`https://api.backblazeb2.com/b2api/v2/b2_authorize_account`, {
      headers: { Authorization: `Basic ${auth}` }
    })

    if (!authResponse.ok) {
      throw new Error('B2 authorization failed')
    }

    const authData = await authResponse.json() as any
    const downloadUrl = authData.downloadUrl
    const authToken = authData.authorizationToken

    const downloadResponse = await fetch(`${downloadUrl}/file/${env.B2_BUCKET}/${file.b2_key}`, {
      headers: { Authorization: authToken }
    })

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text()
      throw new Error(`Failed to fetch PDF: ${downloadResponse.status} ${errorText}`)
    }

    const contentType = downloadResponse.headers.get('content-type') || ''
    if (!contentType.includes('pdf')) {
      const bodyText = await downloadResponse.text()
      throw new Error(
        `Unexpected PDF response content-type=${contentType}: ${bodyText.slice(0, 200)}`
      )
    }

    const arrayBuffer = await downloadResponse.arrayBuffer()
    const { text } = await extractText(arrayBuffer, { mergePages: true })
    return text.slice(0, 10000)
  } catch (error: any) {
    throw new Error(`Failed to read PDF: ${error.message}`)
  }
}

const extractTextFromPDF = (data: Uint8Array): string => {
  const bytes = Array.from(data)
  let text = ''

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] >= 32 && bytes[i] <= 126) {
      text += String.fromCharCode(bytes[i])
    }
  }

  const lines = text.split('\n')
  const readableLines = lines.filter((line) => {
    const trimmed = line.trim()
    return trimmed.length > 3 && /[a-zA-Z0-9]/.test(trimmed)
  })

  return readableLines.join('\n').slice(0, 50000)
}

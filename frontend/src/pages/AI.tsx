import { useState, useRef, useEffect } from 'react'
import { api } from '../hooks/api'
import { Send, Loader2, Bot, User, Trash2, RotateCcw } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const autoAskedRef = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (autoAskedRef.current) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('ask') === 'tasks') {
      autoAskedRef.current = true
      sendMessage('Tell me about my tasks')
    }
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return
    setIsLoading(true)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim()
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const history = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }))
      
      const response = await api.post('/ai/chat', { messages: history })

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.content || 'No response'
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error: any) {
      console.error('Error:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.response?.data?.errors?.general?.[0] || 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const content = input.trim()
    setInput('')
    await sendMessage(content)
  }

  const clearChat = async () => {
    try {
      await api.delete('/ai/clear-session-cache')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
    setMessages([])
  }

  const clearRateLimits = async () => {
    try {
      await api.delete('/ai/clear-rate-limits')
      alert('Rate limits cleared')
    } catch (error) {
      console.error('Failed to clear rate limits:', error)
      alert('Failed to clear rate limits')
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral/10 dark:border-neutral/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral dark:text-[var(--neutral)]">Hyper</h1>
            <p className="text-xs text-neutral/50 dark:text-[var(--neutral-muted)]">Tasks & Files Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 text-neutral/50 dark:text-[var(--neutral-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={clearRateLimits}
            className="p-2 text-neutral/50 dark:text-[var(--neutral-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Clear rate limits"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-neutral dark:text-[var(--neutral)] mb-2">Hyper</h2>
            <p className="text-neutral/60 dark:text-[var(--neutral-muted)] text-center max-w-md mb-6">
              Ask about your tasks or uploaded PDF files. How can I help you today?
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {['What tasks do I have?', 'Show my urgent tasks', 'What files have I uploaded?', 'What deadlines do I have?'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-neutral/5 dark:bg-[var(--background)] hover:bg-neutral/10 text-neutral/70 dark:text-[var(--neutral-muted)] rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-neutral/5 dark:bg-[var(--background)] text-neutral dark:text-[var(--neutral)]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-neutral/5 dark:bg-[var(--background)] px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-neutral/10 dark:border-neutral/20">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your tasks or files..."
            className="flex-1 px-4 py-3 bg-neutral/5 dark:bg-[var(--background)] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-neutral dark:text-[var(--neutral)] placeholder:text-neutral/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { EscalationButton } from './EscalationButton'
import { useChatStore } from '../store/chatStore'
import type { SupportMessage } from '../types'

interface ChatPanelProps {
  onClose: () => void
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { currentConversationId, setConversationId, resetUnread } = useChatStore()

  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: '¡Hola! Soy el asistente virtual de RecepcionistAI. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }, [])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    const userMessage: SupportMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    resetUnread()

    // Prepare messages for API
    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: currentConversationId,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get conversation ID from response headers
      const convId = response.headers.get('x-conversation-id')
      if (convId && !currentConversationId) {
        setConversationId(convId)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: SupportMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })

          // Parse SSE data - handle different formats
          const lines = chunk.split('\n')
          for (const line of lines) {
            // Handle data stream format
            if (line.startsWith('0:')) {
              // Text content in format: 0:"text"
              try {
                const textContent = line.slice(2).trim()
                if (textContent.startsWith('"') && textContent.endsWith('"')) {
                  const parsed = JSON.parse(textContent)
                  fullContent += parsed
                }
              } catch {
                // If parsing fails, just append the raw content
                fullContent += line.slice(2)
              }
            }
          }

          // Update the assistant message with accumulated content
          setMessages((prev) => {
            const updated = [...prev]
            const lastIdx = updated.length - 1
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: fullContent,
              }
            }
            return updated
          })
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return // Request was cancelled
      }

      console.error('Chat error:', error)

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="glass-card overflow-hidden flex flex-col shadow-glass-lg"
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        width: '380px',
        height: '550px',
        zIndex: 9998,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="glass-metric-icon w-10 h-10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <h2 className="font-semibold text-sky-800">Soporte RecepcionistAI</h2>
            <p className="text-xs text-sky-600">Asistente virtual 24/7</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sky-100 transition-colors"
          aria-label="Cerrar chat"
        >
          <X className="h-5 w-5 text-sky-600" />
        </button>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Escalation Button */}
      {messages.length > 3 && currentConversationId && (
        <div className="px-4 pb-2">
          <EscalationButton
            conversationId={currentConversationId}
            onSuccess={() => {
              // Optionally close chat or show confirmation
            }}
          />
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Escribe tu pregunta..."
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/20 text-center">
        <p className="text-xs text-sky-600/70">
          Powered by AI
        </p>
      </div>
    </div>
  )
}

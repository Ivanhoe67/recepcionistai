'use client'

import { Bot, User } from 'lucide-react'
import { SupportMessage } from '../types'

interface ChatMessageProps {
  message: SupportMessage
  isLast?: boolean
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3 px-4 py-3 ${isLast ? 'animate-fade-in' : ''} ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-sky-500 to-sky-600'
            : 'bg-gradient-to-br from-violet-500 to-purple-600'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`flex-1 ${
          isUser ? 'flex justify-end' : ''
        } max-w-[80%]`}
      >
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
              : 'glass-card'
          }`}
        >
          <p className={`text-sm ${isUser ? 'text-white' : 'text-sky-900'}`}>
            {message.content}
          </p>
          <p
            className={`text-xs mt-1 ${
              isUser ? 'text-sky-100' : 'text-sky-500'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString('es', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, FormEvent, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Escribe tu pregunta...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    onSend(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/20">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="glass-input flex-1 resize-none min-h-[44px] max-h-[120px] py-3"
          style={{
            height: 'auto',
            overflow: message.length > 100 ? 'auto' : 'hidden',
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="glass-button px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Send className="h-5 w-5 text-white" />
          )}
        </button>
      </div>
      <p className="text-xs text-sky-600/70 mt-2">
        Presiona Enter para enviar, Shift+Enter para nueva línea
      </p>
    </form>
  )
}

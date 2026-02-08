'use client'

import { MessageCircle, X } from 'lucide-react'

interface ChatButtonProps {
  isOpen: boolean
  unreadCount: number
  onClick: () => void
}

export function ChatButton({ isOpen, unreadCount, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="glass-button w-16 h-16 rounded-full flex items-center justify-center shadow-glass-lg hover:scale-110 transition-transform duration-200"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
      }}
      aria-label={isOpen ? 'Cerrar chat de soporte' : 'Abrir chat de soporte'}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <>
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  )
}

'use client'

import { ChatButton } from './ChatButton'
import { ChatPanel } from './ChatPanel'
import { useChatStore } from '../store/chatStore'

/**
 * Main Chat Widget Component
 *
 * Renders floating chat button and panel.
 * Manages open/close state via Zustand store.
 */
export function ChatWidget() {
  const { isOpen, unreadCount, toggle, close, resetUnread } = useChatStore()

  const handleToggle = () => {
    if (!isOpen) {
      resetUnread() // Reset unread when opening
    }
    toggle()
  }

  return (
    <>
      <ChatButton isOpen={isOpen} unreadCount={unreadCount} onClick={handleToggle} />
      {isOpen && <ChatPanel onClose={close} />}
    </>
  )
}

import { create } from 'zustand'

interface ChatStore {
  // Widget state
  isOpen: boolean
  unreadCount: number

  // Current conversation
  currentConversationId: string | null

  // Actions
  open: () => void
  close: () => void
  toggle: () => void
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  resetUnread: () => void
  setConversationId: (id: string | null) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  isOpen: false,
  unreadCount: 0,
  currentConversationId: null,

  // Actions
  open: () => set({ isOpen: true }),

  close: () => set({ isOpen: false }),

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  resetUnread: () => set({ unreadCount: 0 }),

  setConversationId: (id) => set({ currentConversationId: id }),
}))

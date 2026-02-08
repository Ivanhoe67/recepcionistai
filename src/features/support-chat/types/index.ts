/**
 * Support Chat Type Definitions
 */

export interface SupportMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface SupportConversation {
  id: string
  user_id: string
  title: string | null
  status: 'active' | 'escalated' | 'resolved'
  messages: SupportMessage[]
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface SupportTicket {
  id: string
  conversation_id: string
  user_id: string
  subject: string
  description: string | null
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface SupportAnalytics {
  id: string
  user_id: string | null
  conversation_id: string
  question_category: string | null
  question_summary: string | null
  was_answered: boolean
  was_escalated: boolean
  response_time_seconds: number | null
  satisfaction_rating: number | null
  created_at: string
}

// API Request/Response types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  conversationId?: string
}

export interface ChatResponse {
  message: SupportMessage
  conversationId: string
}

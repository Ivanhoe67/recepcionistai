import { createClient } from '@/lib/supabase/server'
import { updateConversationStatus } from './conversation.service'
import type { SupportTicket } from '../types'

/**
 * Ticket Service
 *
 * Handles human escalation by creating support tickets.
 * Links tickets to conversations and updates conversation status.
 */

export async function createSupportTicket(
  conversationId: string
): Promise<SupportTicket> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get conversation to include context
  const { data: conversation, error: convError } = await supabase
    .from('support_conversations')
    .select('messages')
    .eq('id', conversationId)
    .single()

  if (convError) {
    throw new Error(`Failed to fetch conversation: ${convError.message}`)
  }

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      conversation_id: conversationId,
      status: 'open',
      priority: 'medium',
      messages: conversation.messages || [],
    })
    .select()
    .single()

  if (ticketError) {
    throw new Error(`Failed to create ticket: ${ticketError.message}`)
  }

  // Update conversation status to escalated
  await updateConversationStatus(conversationId, 'escalated')

  return ticket
}

export async function getTicketsByUser(userId: string): Promise<SupportTicket[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`)
  }

  return data
}

export async function updateTicketStatus(
  ticketId: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('support_tickets')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`)
  }
}

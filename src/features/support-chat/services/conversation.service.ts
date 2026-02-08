// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import type { SupportMessage, SupportConversation } from '../types'

/**
 * Conversation Service
 *
 * Manages support chat conversations in Supabase.
 * Handles creation, retrieval, and updates of conversation records.
 */

export async function findOrCreateConversation(
  userId: string,
  conversationId?: string | null
): Promise<SupportConversation> {
  const supabase = await createClient()

  // If conversationId provided, try to find it
  if (conversationId) {
    const { data, error } = await supabase
      .from('support_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single()

    if (!error && data) {
      return data
    }
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('support_conversations')
    .insert({
      user_id: userId,
      messages: [],
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`)
  }

  return data
}

export async function saveMessage(
  conversationId: string,
  message: SupportMessage
): Promise<void> {
  const supabase = await createClient()

  // Get current messages
  const { data: conversation, error: fetchError } = await supabase
    .from('support_conversations')
    .select('messages')
    .eq('id', conversationId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch conversation: ${fetchError.message}`)
  }

  // Append new message
  const messages = [...(conversation.messages || []), message]

  // Update conversation
  const { error: updateError } = await supabase
    .from('support_conversations')
    .update({
      messages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (updateError) {
    throw new Error(`Failed to save message: ${updateError.message}`)
  }
}

export async function updateConversationStatus(
  conversationId: string,
  status: 'active' | 'resolved' | 'escalated'
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('support_conversations')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`)
  }
}

export async function getConversation(
  conversationId: string,
  userId: string
): Promise<SupportConversation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('support_conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

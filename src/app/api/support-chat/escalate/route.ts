// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route: Create Support Ticket (Escalation)
 *
 * Creates a support ticket for human escalation.
 * Called from EscalationButton client component.
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Get conversation to include context
    const { data: conversation, error: convError } = await supabase
      .from('support_conversations')
      .select('messages')
      .eq('id', conversationId)
      .single()

    if (convError) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        subject: 'Escalación desde chat de soporte',
        status: 'open',
        priority: 'medium',
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Failed to create ticket:', ticketError)
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    // Update conversation status to escalated
    await supabase
      .from('support_conversations')
      .update({ status: 'escalated' })
      .eq('id', conversationId)

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Escalation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

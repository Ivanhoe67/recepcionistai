// @ts-nocheck
/**
 * Evolution API Webhook Handler
 * Receives WhatsApp messages from Evolution API and responds with AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppText, transcribeAudio } from '@/lib/evolution-api'
import { processAgentMessage, formatConversationHistory } from '@/features/whatsapp-agent/services/agent.service'
import { createAppointmentFromWebhook } from '@/features/appointments/services/appointments.service'

const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || ''

// Simple in-memory message buffer for grouping (resets on server restart)
// In production, use Redis or database
const messageBuffer: Map<string, { messages: string[]; timer: NodeJS.Timeout | null }> = new Map()
const MESSAGE_GROUP_DELAY = 8000 // 8 seconds

interface EvolutionWebhookPayload {
  apikey?: string
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    pushName?: string
    message?: {
      conversation?: string
      extendedTextMessage?: {
        text: string
      }
      audioMessage?: {
        mimetype: string
      }
    }
    messageType: string
    messageTimestamp: number
    base64?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: EvolutionWebhookPayload = await request.json()

    // Log incoming webhook for debugging
    console.log('Evolution webhook received:', JSON.stringify(payload, null, 2))

    // TODO: Re-enable API key check after debugging
    // Temporarily disabled to debug webhook flow
    // const headerApiKey = request.headers.get('apikey') || request.headers.get('x-api-key')
    // const bodyApiKey = payload.apikey
    // const receivedKey = headerApiKey || bodyApiKey
    // if (EVOLUTION_API_KEY && receivedKey !== EVOLUTION_API_KEY) {
    //   console.log('Invalid API key. Received:', receivedKey, 'Expected:', EVOLUTION_API_KEY)
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Only process incoming messages
    if (payload.event !== 'messages.upsert' && payload.event !== 'MESSAGES_UPSERT') {
      return NextResponse.json({ status: 'ignored', reason: 'not a message event' })
    }

    // Ignore messages from self
    if (payload.data.key.fromMe) {
      return NextResponse.json({ status: 'ignored', reason: 'own message' })
    }

    const remoteJid = payload.data.key.remoteJid
    const phoneNumber = remoteJid.split('@')[0]
    const senderName = payload.data.pushName || 'Usuario'

    // Extract message text
    let messageText = ''

    if (payload.data.messageType === 'conversation') {
      messageText = payload.data.message?.conversation || ''
    } else if (payload.data.messageType === 'extendedTextMessage') {
      messageText = payload.data.message?.extendedTextMessage?.text || ''
    } else if (payload.data.messageType === 'audioMessage' && payload.data.base64) {
      // Transcribe audio
      const mimeType = payload.data.message?.audioMessage?.mimetype || 'audio/ogg'
      const transcription = await transcribeAudio(payload.data.base64, mimeType)
      messageText = transcription || '[Audio no transcrito]'
    } else {
      // Unsupported message type
      return NextResponse.json({ status: 'ignored', reason: 'unsupported message type' })
    }

    if (!messageText.trim()) {
      return NextResponse.json({ status: 'ignored', reason: 'empty message' })
    }

    // Buffer messages to group rapid successive messages
    await bufferAndProcess(phoneNumber, messageText, senderName, remoteJid, payload.instance)

    return NextResponse.json({ status: 'received' })
  } catch (error) {
    console.error('Evolution webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function bufferAndProcess(
  phoneNumber: string,
  message: string,
  senderName: string,
  remoteJid: string,
  instance: string
) {
  const buffer = messageBuffer.get(phoneNumber) || { messages: [], timer: null }

  // Add message to buffer
  buffer.messages.push(message)

  // Clear existing timer
  if (buffer.timer) {
    clearTimeout(buffer.timer)
  }

  // Set new timer
  buffer.timer = setTimeout(async () => {
    const messages = buffer.messages
    messageBuffer.delete(phoneNumber)

    // Combine all buffered messages
    const combinedMessage = messages.join('\n')

    // Process with AI
    await processAndRespond(phoneNumber, combinedMessage, senderName, remoteJid, instance)
  }, MESSAGE_GROUP_DELAY)

  messageBuffer.set(phoneNumber, buffer)
}

async function processAndRespond(
  phoneNumber: string,
  message: string,
  senderName: string,
  remoteJid: string,
  instance: string
) {
  const supabase = createAdminClient()

  try {
    // 1. Find or create business (using BUSINESS_PHONE or first business)
    let businessId: string
    let userId: string

    if (BUSINESS_PHONE) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id, user_id, name')
        .eq('phone', BUSINESS_PHONE)
        .maybeSingle()

      if (business) {
        businessId = business.id
        userId = business.user_id
      } else {
        console.error('Business not found for phone:', BUSINESS_PHONE)
        return
      }
    } else {
      // Get first business (fallback for single-business setup)
      const { data: business } = await supabase
        .from('businesses')
        .select('id, user_id, name')
        .limit(1)
        .single()

      if (!business) {
        console.error('No business found')
        return
      }
      businessId = business.id
      userId = business.user_id
    }

    // 2. Find or create lead
    let { data: lead } = await supabase
      .from('leads')
      .select('id, name')
      .eq('business_id', businessId)
      .eq('phone', phoneNumber)
      .maybeSingle()

    if (!lead) {
      const { data: newLead } = await supabase
        .from('leads')
        .insert({
          business_id: businessId,
          phone: phoneNumber,
          name: senderName,
          source: 'whatsapp',
          status: 'new'
        })
        .select()
        .single()
      lead = newLead
    } else if (senderName && senderName !== 'Usuario' && !lead.name) {
      await supabase.from('leads').update({ name: senderName }).eq('id', lead.id)
    }

    if (!lead) {
      console.error('Failed to create/find lead')
      return
    }

    // 3. Get or create conversation
    let { data: conversation } = await supabase
      .from('sms_conversations')
      .select('*')
      .eq('lead_id', lead.id)
      .maybeSingle()

    if (!conversation) {
      const { data: newConv } = await supabase
        .from('sms_conversations')
        .insert({ lead_id: lead.id, messages: [] })
        .select()
        .single()
      conversation = newConv
    }

    if (!conversation) {
      console.error('Failed to create/find conversation')
      return
    }

    // 4. Add user message to history
    const messages = (conversation.messages as Array<{ role: string; content: string; timestamp: string }>) || []
    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })

    // 5. Get AI response
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single()

    const conversationHistory = formatConversationHistory(messages)
    const agentResponse = await processAgentMessage(
      conversationHistory,
      message,
      {
        businessName: business?.name || 'Nuestro Negocio',
        agentName: 'Asistente Virtual',
        timezone: process.env.CAL_TIMEZONE || 'America/Detroit'
      }
    )

    // 6. Add assistant message to history
    messages.push({
      role: 'assistant',
      content: agentResponse.text,
      timestamp: new Date().toISOString()
    })

    // 7. Update conversation
    await supabase
      .from('sms_conversations')
      .update({
        messages,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversation.id)

    // 8. Create appointment if booking was made
    if (agentResponse.bookingData) {
      await createAppointmentFromWebhook({
        leadId: lead.id,
        businessId,
        scheduledAt: agentResponse.bookingData.scheduledAt,
        durationMinutes: 30,
        source: 'whatsapp',
        notes: `Agendado por WhatsApp. ${agentResponse.bookingData.notes || ''}`
      })
    }

    // 9. Send response via WhatsApp
    await sendWhatsAppText({
      to: remoteJid,
      text: agentResponse.text,
      instance
    })

    // 10. Create notification
    await supabase.from('notifications').insert({
      user_id: userId,
      lead_id: lead.id,
      type: 'sms_received',
      channel: 'email',
      title: 'Conversación WhatsApp',
      body: `Mensaje de ${senderName}: "${message.substring(0, 100)}..."`
    })

  } catch (error) {
    console.error('Error processing message:', error)

    // Try to send error message
    try {
      await sendWhatsAppText({
        to: remoteJid,
        text: 'Disculpa, estoy teniendo problemas técnicos. Por favor intenta de nuevo en unos minutos.',
        instance
      })
    } catch {
      // Silent fail
    }
  }
}

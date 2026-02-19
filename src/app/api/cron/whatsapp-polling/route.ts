// @ts-nocheck
/**
 * WhatsApp Polling Cron Job
 * Polls Evolution API for new messages and processes them with AI
 * Runs every minute via Vercel Cron, polls multiple times within the minute
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppText } from '@/lib/evolution-api'
import { processAgentMessage, formatConversationHistory } from '@/features/whatsapp-agent/services/agent.service'
import { createAppointmentFromWebhook } from '@/features/appointments/services/appointments.service'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || ''
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || ''
const CRON_SECRET = process.env.CRON_SECRET || ''

// How many times to poll within a single cron execution (1 minute)
const POLLS_PER_MINUTE = 1 // Just once per call for now
const POLL_INTERVAL_MS = 10000 // 10 seconds

// Known bot responses to filter out (in case fromMe filter doesn't work)
const BOT_RESPONSE_PATTERNS = [
  'Gracias por tu mensaje',
  'Disculpa, estoy teniendo problemas',
  'Un representante te contactará',
  'Te responderemos pronto'
]

interface EvolutionMessage {
  id: string
  key: {
    id: string
    fromMe: boolean
    remoteJid: string
  }
  pushName?: string
  message?: {
    conversation?: string
    extendedTextMessage?: {
      text: string
    }
  }
  messageType: string
  messageTimestamp: number
}

export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  // Poll multiple times within this cron execution
  for (let i = 0; i < POLLS_PER_MINUTE; i++) {
    try {
      const pollResult = await pollAndProcessMessages()
      results.push(`Poll ${i + 1}: ${pollResult}`)

      // Wait before next poll (except for last iteration)
      if (i < POLLS_PER_MINUTE - 1) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
      }
    } catch (error) {
      results.push(`Poll ${i + 1}: Error - ${error}`)
    }
  }

  return NextResponse.json({
    status: 'completed',
    polls: results,
    timestamp: new Date().toISOString()
  })
}

async function pollAndProcessMessages(): Promise<string> {
  const supabase = createAdminClient()

  // Get last processed timestamp from database
  const { data: config } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'last_whatsapp_poll_timestamp')
    .maybeSingle()

  const lastTimestamp = config?.value ? parseInt(config.value) : Math.floor(Date.now() / 1000) - 60

  // Fetch recent messages from Evolution API
  const response = await fetch(
    `${EVOLUTION_API_URL}/chat/findMessages/${encodeURIComponent(EVOLUTION_INSTANCE)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        where: {
          key: { fromMe: false }
        },
        limit: 20
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Evolution API error: ${response.status}`)
  }

  const data = await response.json()
  const messages: EvolutionMessage[] = data.messages?.records || []

  // Filter messages newer than last processed AND not from the bot
  const botPhone = BUSINESS_PHONE.replace(/^\+/, '')
  const newMessages = messages.filter(m => {
    // Skip old messages
    if (m.messageTimestamp <= lastTimestamp) return false
    // Skip messages from our own number (bot responses)
    const senderPhone = m.key.remoteJid.split('@')[0]
    if (senderPhone === botPhone) return false
    // Skip messages marked as fromMe (shouldn't happen due to API filter, but double-check)
    if (m.key.fromMe) return false
    return true
  })

  if (newMessages.length === 0) {
    return 'No new messages'
  }

  let processedCount = 0
  let newestTimestamp = lastTimestamp

  for (const msg of newMessages) {
    try {
      // Extract message text first
      let messageText = ''
      if (msg.messageType === 'conversation') {
        messageText = msg.message?.conversation || ''
      } else if (msg.messageType === 'extendedTextMessage') {
        messageText = msg.message?.extendedTextMessage?.text || ''
      }

      if (!messageText.trim()) continue

      // Skip messages that look like bot responses (safety check)
      const looksLikeBotMessage = BOT_RESPONSE_PATTERNS.some(pattern =>
        messageText.includes(pattern)
      )
      if (looksLikeBotMessage) {
        console.log('Skipping bot-like message:', msg.key.id)
        continue
      }

      // Check cooldown - don't respond to same phone more than once per 30 seconds
      const thirtySecondsAgo = Math.floor(Date.now() / 1000) - 30
      const { data: recentMessage } = await supabase
        .from('processed_whatsapp_messages')
        .select('id')
        .eq('remote_jid', msg.key.remoteJid)
        .gt('timestamp', thirtySecondsAgo)
        .limit(1)
        .maybeSingle()

      if (recentMessage) {
        console.log('Cooldown active for:', msg.key.remoteJid)
        continue
      }

      // Try to insert FIRST (this will fail if already exists due to UNIQUE constraint)
      const { error: insertError } = await supabase.from('processed_whatsapp_messages').insert({
        message_id: msg.key.id,
        remote_jid: msg.key.remoteJid,
        timestamp: msg.messageTimestamp
      })

      // If insert failed (duplicate), skip this message
      if (insertError) {
        console.log('Message already processed:', msg.key.id)
        continue
      }

      console.log('Processing NEW message:', msg.key.id, messageText)

      // Process with AI agent and send response
      await processIncomingMessage(
        msg.key.remoteJid,
        messageText,
        msg.pushName || 'Usuario'
      )

      processedCount++
      newestTimestamp = Math.max(newestTimestamp, msg.messageTimestamp)
    } catch (error) {
      console.error('Error processing message:', msg.key.id, error)
    }
  }

  // Update last processed timestamp
  await supabase.from('system_config').upsert({
    key: 'last_whatsapp_poll_timestamp',
    value: newestTimestamp.toString(),
    updated_at: new Date().toISOString()
  })

  return `Processed ${processedCount} messages`
}

async function processIncomingMessage(
  remoteJid: string,
  message: string,
  senderName: string
) {
  const supabase = createAdminClient()
  const phoneNumber = remoteJid.split('@')[0]

  // Get the first business (simplified)
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, user_id, name')
    .limit(1)
    .single()

  if (!business || bizError) {
    console.error('No business found:', bizError)
    // Send fallback response
    await sendWhatsAppText({
      to: remoteJid,
      text: 'Gracias por tu mensaje. Un representante te contactará pronto.',
      instance: EVOLUTION_INSTANCE
    })
    return
  }

  const businessId = business.id
  const userId = business.user_id

  // Find or create lead
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

  // Get or create conversation
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
    await sendWhatsAppText({
      to: remoteJid,
      text: 'Gracias por tu mensaje. Te responderemos pronto.',
      instance: EVOLUTION_INSTANCE
    })
    return
  }

  // Add user message to history
  const messages = (conversation.messages as Array<{ role: string; content: string; timestamp: string }>) || []
  messages.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  })

  // Get AI response with error handling
  let agentResponse: { text: string; bookingData?: unknown }
  try {
    const conversationHistory = formatConversationHistory(messages)
    agentResponse = await processAgentMessage(
      conversationHistory,
      message,
      {
        businessName: business.name || 'Nuestro Negocio',
        agentName: 'Asistente Virtual',
        timezone: process.env.CAL_TIMEZONE || 'America/Detroit'
      }
    )
  } catch (aiError) {
    console.error('AI processing error:', aiError)
    agentResponse = { text: 'Gracias por tu mensaje. Un representante te contactará pronto.' }
  }

  // Add assistant message to history
  messages.push({
    role: 'assistant',
    content: agentResponse.text,
    timestamp: new Date().toISOString()
  })

  // Update conversation
  await supabase
    .from('sms_conversations')
    .update({
      messages,
      last_message_at: new Date().toISOString()
    })
    .eq('id', conversation.id)

  // Create appointment if booking was made
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

  // Send response via WhatsApp
  await sendWhatsAppText({
    to: remoteJid,
    text: agentResponse.text,
    instance: EVOLUTION_INSTANCE
  })

  // Create notification
  await supabase.from('notifications').insert({
    user_id: userId,
    lead_id: lead.id,
    type: 'sms_received',
    channel: 'email',
    title: 'Conversación WhatsApp',
    body: `Mensaje de ${senderName}: "${message.substring(0, 100)}..."`
  })
}

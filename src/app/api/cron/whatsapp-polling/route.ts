// @ts-nocheck
/**
 * WhatsApp Polling Cron Job - NUCLEAR VERSION
 * Has GLOBAL cooldown to absolutely prevent infinite loops
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppText } from '@/lib/evolution-api'
import { processAgentMessage, formatConversationHistory } from '@/features/whatsapp-agent/services/agent.service'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || ''
const CRON_SECRET = process.env.CRON_SECRET || ''

// GLOBAL cooldown in milliseconds (2 minutes)
const GLOBAL_COOLDOWN_MS = 120000

interface EvolutionMessage {
  key: {
    id: string
    fromMe: boolean
    remoteJid: string
  }
  pushName?: string
  message?: {
    conversation?: string
    extendedTextMessage?: { text: string }
  }
  messageType: string
  messageTimestamp: number
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pollAndProcessMessages()
    return NextResponse.json({
      status: 'completed',
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: String(error),
      timestamp: new Date().toISOString()
    })
  }
}

async function pollAndProcessMessages(): Promise<string> {
  const supabase = createAdminClient()

  // ============================================
  // STEP 1: CHECK GLOBAL COOLDOWN
  // Only allow 1 response every 2 minutes TOTAL
  // ============================================
  const { data: lastSent } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'last_whatsapp_response_time')
    .maybeSingle()

  if (lastSent?.value) {
    const lastSentTime = parseInt(lastSent.value)
    const timeSinceLastResponse = Date.now() - lastSentTime

    if (timeSinceLastResponse < GLOBAL_COOLDOWN_MS) {
      const secondsRemaining = Math.ceil((GLOBAL_COOLDOWN_MS - timeSinceLastResponse) / 1000)
      return `GLOBAL COOLDOWN ACTIVE - ${secondsRemaining}s remaining`
    }
  }

  // ============================================
  // STEP 2: FETCH MESSAGES FROM EVOLUTION API
  // ============================================
  const response = await fetch(
    `${EVOLUTION_API_URL}/chat/findMessages/${encodeURIComponent(EVOLUTION_INSTANCE)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        where: { key: { fromMe: false } },
        limit: 10
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Evolution API error: ${response.status}`)
  }

  const data = await response.json()
  const messages: EvolutionMessage[] = data.messages?.records || []

  if (messages.length === 0) {
    return 'No messages found'
  }

  // ============================================
  // STEP 3: GET LAST PROCESSED TIMESTAMP
  // ============================================
  const { data: config } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'last_whatsapp_poll_timestamp')
    .maybeSingle()

  const lastTimestamp = config?.value ? parseInt(config.value) : Math.floor(Date.now() / 1000) - 300

  // ============================================
  // STEP 4: FIND ONE NEW MESSAGE TO PROCESS
  // ============================================
  let messageToProcess: EvolutionMessage | null = null

  for (const msg of messages) {
    // Skip old messages
    if (msg.messageTimestamp <= lastTimestamp) continue

    // Skip if fromMe is true
    if (msg.key.fromMe === true) continue

    // Extract text
    let text = ''
    if (msg.messageType === 'conversation') {
      text = msg.message?.conversation || ''
    } else if (msg.messageType === 'extendedTextMessage') {
      text = msg.message?.extendedTextMessage?.text || ''
    }

    if (!text.trim()) continue

    // Skip messages that look like AI responses
    const aiPatterns = [
      'Gracias por',
      'Disculpa',
      'representante',
      'responderemos',
      'problemas',
      'Hola!',
      'Bienvenido',
      '?Podr',
      'ayudarte'
    ]

    const looksLikeAI = aiPatterns.some(p => text.includes(p))
    if (looksLikeAI) continue

    // Check if already processed
    const { data: existing } = await supabase
      .from('processed_whatsapp_messages')
      .select('id')
      .eq('message_id', msg.key.id)
      .maybeSingle()

    if (existing) continue

    // Found a valid message!
    messageToProcess = msg
    break
  }

  if (!messageToProcess) {
    return 'No new messages to process'
  }

  // ============================================
  // STEP 5: MARK AS PROCESSING (LOCK)
  // ============================================
  const { error: insertError } = await supabase
    .from('processed_whatsapp_messages')
    .insert({
      message_id: messageToProcess.key.id,
      remote_jid: messageToProcess.key.remoteJid,
      timestamp: messageToProcess.messageTimestamp
    })

  if (insertError) {
    return 'Message already being processed'
  }

  // ============================================
  // STEP 6: PROCESS THE MESSAGE
  // ============================================
  const text = messageToProcess.message?.conversation ||
               messageToProcess.message?.extendedTextMessage?.text || ''

  const phoneNumber = messageToProcess.key.remoteJid.split('@')[0]

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, user_id, name')
    .limit(1)
    .single()

  if (!business) {
    return 'No business configured'
  }

  // Get or create lead
  let { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('business_id', business.id)
    .eq('phone', phoneNumber)
    .maybeSingle()

  if (!lead) {
    const { data: newLead } = await supabase
      .from('leads')
      .insert({
        business_id: business.id,
        phone: phoneNumber,
        name: messageToProcess.pushName || 'WhatsApp User',
        source: 'whatsapp',
        status: 'new'
      })
      .select('id')
      .single()
    lead = newLead
  }

  if (!lead) {
    return 'Failed to create lead'
  }

  // Get or create conversation
  let { data: conversation } = await supabase
    .from('sms_conversations')
    .select('id, messages')
    .eq('lead_id', lead.id)
    .maybeSingle()

  if (!conversation) {
    const { data: newConv } = await supabase
      .from('sms_conversations')
      .insert({ lead_id: lead.id, messages: [] })
      .select('id, messages')
      .single()
    conversation = newConv
  }

  if (!conversation) {
    return 'Failed to create conversation'
  }

  // Build conversation history
  const msgHistory = (conversation.messages as Array<{ role: string; content: string }>) || []
  msgHistory.push({ role: 'user', content: text })

  // ============================================
  // STEP 7: GET AI RESPONSE
  // ============================================
  let aiResponse: string
  try {
    const result = await processAgentMessage(
      formatConversationHistory(msgHistory),
      text,
      {
        businessName: business.name || 'Nuestro Negocio',
        agentName: 'Asistente Virtual',
        timezone: process.env.CAL_TIMEZONE || 'America/Detroit'
      }
    )
    aiResponse = result.text
  } catch (err) {
    console.error('AI Error:', err)
    return 'AI processing failed - no response sent'
  }

  if (!aiResponse || aiResponse.length < 5) {
    return 'AI returned empty response - no message sent'
  }

  // ============================================
  // STEP 8: SET GLOBAL COOLDOWN BEFORE SENDING
  // ============================================
  await supabase.from('system_config').upsert({
    key: 'last_whatsapp_response_time',
    value: Date.now().toString(),
    updated_at: new Date().toISOString()
  })

  // ============================================
  // STEP 9: SEND RESPONSE
  // ============================================
  await sendWhatsAppText({
    to: messageToProcess.key.remoteJid,
    text: aiResponse,
    instance: EVOLUTION_INSTANCE
  })

  // ============================================
  // STEP 10: UPDATE CONVERSATION
  // ============================================
  msgHistory.push({ role: 'assistant', content: aiResponse })

  await supabase
    .from('sms_conversations')
    .update({
      messages: msgHistory,
      last_message_at: new Date().toISOString()
    })
    .eq('id', conversation.id)

  // Update last processed timestamp
  await supabase.from('system_config').upsert({
    key: 'last_whatsapp_poll_timestamp',
    value: messageToProcess.messageTimestamp.toString(),
    updated_at: new Date().toISOString()
  })

  return `SUCCESS: Responded to ${phoneNumber}`
}

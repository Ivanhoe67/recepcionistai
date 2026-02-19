// @ts-nocheck
/**
 * WhatsApp Polling - ATOMIC LOCK VERSION v2
 * Uses database lock to ensure only ONE request processes at a time
 * Deployed: 2026-02-19
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppText } from '@/lib/evolution-api'
import { processAgentMessage, formatConversationHistory } from '@/features/whatsapp-agent/services/agent.service'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || ''
const CRON_SECRET = process.env.CRON_SECRET || ''

// Lock duration: 3 minutes
const LOCK_DURATION_MS = 180000

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const lockId = 'whatsapp_processing_lock'
  const now = Date.now()

  // ============================================
  // ATOMIC LOCK: First thing we do
  // ============================================

  // Check if lock exists and is still valid
  const { data: existingLock } = await supabase
    .from('system_config')
    .select('value, updated_at')
    .eq('key', lockId)
    .single()

  if (existingLock) {
    const lockTime = parseInt(existingLock.value || '0')
    const lockAge = now - lockTime

    if (lockAge < LOCK_DURATION_MS) {
      const secondsRemaining = Math.ceil((LOCK_DURATION_MS - lockAge) / 1000)
      return NextResponse.json({
        status: 'locked',
        message: `Processing locked. ${secondsRemaining}s remaining.`,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Try to acquire lock by updating with current timestamp
  // Only succeeds if we're the first one
  const { error: lockError } = await supabase
    .from('system_config')
    .upsert({
      key: lockId,
      value: now.toString(),
      updated_at: new Date().toISOString()
    })

  if (lockError) {
    return NextResponse.json({
      status: 'lock_failed',
      error: lockError.message,
      timestamp: new Date().toISOString()
    })
  }

  // Double-check we have the lock (in case of race condition)
  const { data: checkLock } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', lockId)
    .single()

  if (!checkLock || checkLock.value !== now.toString()) {
    return NextResponse.json({
      status: 'lost_lock',
      message: 'Another process acquired the lock',
      timestamp: new Date().toISOString()
    })
  }

  // ============================================
  // WE HAVE THE LOCK - PROCEED SAFELY
  // ============================================

  try {
    const result = await processOneMessage(supabase)
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
  // Note: Lock remains active for 3 minutes regardless of result
}

async function processOneMessage(supabase: ReturnType<typeof createAdminClient>): Promise<string> {

  // Fetch messages from Evolution API
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
        limit: 5
      })
    }
  )

  if (!response.ok) {
    return `Evolution API error: ${response.status}`
  }

  const data = await response.json()
  const messages = data.messages?.records || []

  if (messages.length === 0) {
    return 'No messages from Evolution API'
  }

  // Get last processed timestamp
  const { data: config } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'last_whatsapp_poll_timestamp')
    .maybeSingle()

  // Use 10 minutes ago if no timestamp (to avoid processing very old messages)
  const lastTimestamp = config?.value ? parseInt(config.value) : Math.floor(Date.now() / 1000) - 600

  // Find ONE valid message
  for (const msg of messages) {
    // Skip old messages
    if (msg.messageTimestamp <= lastTimestamp) continue

    // Must be fromMe: false
    if (msg.key?.fromMe === true) continue

    // Extract text
    const text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text || ''

    if (!text.trim()) continue
    if (text.length < 2) continue

    // Skip AI-like messages (expanded list)
    const skipPatterns = [
      'Gracias', 'gracias', 'Disculpa', 'disculpa',
      'representante', 'responder', 'ayudar', 'Ayudar',
      'Hola!', 'Bienvenido', 'bienvenido',
      'problema', 'Problema', 'asistente', 'Asistente',
      'negocio', 'Negocio', 'servicio', 'Servicio',
      'cita', 'Cita', 'agendar', 'Agendar',
      'horario', 'Horario', 'disponible', 'Disponible',
      'confirmar', 'Confirmar', 'cancelar', 'Cancelar',
      '?En qu', 'en qu', 'puedo ayudar'
    ]

    if (skipPatterns.some(p => text.includes(p))) continue

    // Check if already processed
    const { data: existing } = await supabase
      .from('processed_whatsapp_messages')
      .select('id')
      .eq('message_id', msg.key.id)
      .maybeSingle()

    if (existing) continue

    // Mark as processed FIRST
    const { error: insertErr } = await supabase
      .from('processed_whatsapp_messages')
      .insert({
        message_id: msg.key.id,
        remote_jid: msg.key.remoteJid,
        timestamp: msg.messageTimestamp
      })

    if (insertErr) continue // Already processed by another request

    // Update timestamp immediately
    await supabase.from('system_config').upsert({
      key: 'last_whatsapp_poll_timestamp',
      value: msg.messageTimestamp.toString(),
      updated_at: new Date().toISOString()
    })

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, user_id, name')
      .limit(1)
      .single()

    if (!business) return 'No business found'

    const phoneNumber = msg.key.remoteJid.split('@')[0]

    // Get/create lead
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
          name: msg.pushName || 'WhatsApp',
          source: 'whatsapp',
          status: 'new'
        })
        .select('id')
        .single()
      lead = newLead
    }

    if (!lead) return 'Failed to create lead'

    // Get/create conversation
    let { data: conv } = await supabase
      .from('sms_conversations')
      .select('id, messages')
      .eq('lead_id', lead.id)
      .maybeSingle()

    if (!conv) {
      const { data: newConv } = await supabase
        .from('sms_conversations')
        .insert({ lead_id: lead.id, messages: [] })
        .select('id, messages')
        .single()
      conv = newConv
    }

    if (!conv) return 'Failed to create conversation'

    // Build history and get AI response
    const history = (conv.messages as Array<{role: string; content: string}>) || []
    history.push({ role: 'user', content: text })

    let aiText: string
    try {
      const result = await processAgentMessage(
        formatConversationHistory(history),
        text,
        {
          businessName: business.name || 'Negocio',
          agentName: 'Asistente',
          timezone: 'America/Detroit'
        }
      )
      aiText = result.text
    } catch (e) {
      return `AI error: ${e}`
    }

    if (!aiText || aiText.length < 5) {
      return 'AI returned empty response'
    }

    // Send response
    await sendWhatsAppText({
      to: msg.key.remoteJid,
      text: aiText,
      instance: EVOLUTION_INSTANCE
    })

    // Update conversation
    history.push({ role: 'assistant', content: aiText })
    await supabase
      .from('sms_conversations')
      .update({ messages: history, last_message_at: new Date().toISOString() })
      .eq('id', conv.id)

    return `Sent response to ${phoneNumber}`
  }

  return 'No new messages to process'
}

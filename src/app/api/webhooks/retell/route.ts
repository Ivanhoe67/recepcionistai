import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAppointmentFromWebhook } from '@/features/appointments/services/appointments.service'
import crypto from 'crypto'

// Verify Retell webhook signature (optional but recommended)
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return true // Skip if no secret configured

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-retell-signature')
    const secret = process.env.RETELL_WEBHOOK_SECRET

    // Verify signature if secret is configured
    if (secret && !verifySignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(payload)
    console.log(`Received Retell event: ${data.event}`, JSON.stringify(data, null, 2))

    // Handle different event types
    switch (data.event) {
      case 'call_started':
        await handleCallStarted(data)
        break

      case 'call_ended':
        await handleCallEnded(data)
        break

      case 'call_analyzed':
        await handleCallAnalyzed(data)
        break

      default:
        console.log(`Unhandled Retell event: ${data.event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Retell webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCallStarted(data: RetellCallStartedEvent) {
  console.log('Call started:', data.call.call_id)
  // Could log call start time if needed
}

async function handleCallEnded(data: RetellCallEndedEvent) {
  const supabase = createAdminClient()
  const { call } = data

  // Find business by Retell agent ID or phone number
  console.log('Searching for business with agent_id:', call.agent_id, 'or phone:', call.to_number)

  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, user_id')
    .or(`retell_agent_id.eq.${call.agent_id},phone.eq.${call.to_number}`)
    .maybeSingle()

  if (bizError) {
    console.error('Database error finding business:', bizError)
    return
  }

  if (!business) {
    console.error('No business found for agent:', call.agent_id, 'or phone:', call.to_number)
    return
  }

  console.log('Business found:', business.id)

  // Check if lead already exists by phone
  const { data: existingLead } = await supabase
    .from('leads')
    .select('id')
    .eq('business_id', business.id)
    .eq('phone', call.from_number)
    .maybeSingle()

  let leadId: string

  if (existingLead) {
    // Update existing lead
    leadId = existingLead.id
    await supabase
      .from('leads')
      .update({
        retell_call_id: call.call_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
  } else {
    // Create new lead
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        business_id: business.id,
        phone: call.from_number,
        source: 'call',
        status: 'new',
        retell_call_id: call.call_id,
      })
      .select('id')
      .single()

    if (error || !newLead) {
      console.error('Error creating lead:', error)
      return
    }
    leadId = newLead.id
  }

  // Create call transcript record
  await supabase
    .from('call_transcripts')
    .insert({
      lead_id: leadId,
      retell_call_id: call.call_id,
      transcript: call.transcript_object || null,
      duration_seconds: call.end_timestamp && call.start_timestamp
        ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
        : null,
      call_status: call.call_status,
      recording_url: call.recording_url || null,
    })

  // Create notification for user
  await supabase
    .from('notifications')
    .insert({
      user_id: business.user_id,
      lead_id: leadId,
      type: 'new_lead',
      channel: 'email',
      title: 'Nueva llamada recibida',
      body: `Llamada de ${call.from_number}. Duración: ${Math.round((call.end_timestamp - call.start_timestamp) / 1000 / 60)} minutos.`,
    })

  // Extract appointment from tool_calls in transcript
  const booking = extractBookingFromToolCalls(call)
  if (booking) {
    console.log('Booking detected from tool_calls:', booking)

    // Update lead with name/email from the booking
    const leadUpdates: Record<string, unknown> = {}
    if (booking.name) leadUpdates.name = booking.name
    if (booking.email) leadUpdates.email = booking.email

    if (Object.keys(leadUpdates).length > 0) {
      await supabase.from('leads').update(leadUpdates).eq('id', leadId)
    }

    // Convert time to UTC if timezone is provided
    const scheduledAtUTC = booking.timezone
      ? convertToUTC(booking.time, booking.timezone)
      : booking.time

    console.log('Timezone conversion:', { raw: booking.time, tz: booking.timezone, utc: scheduledAtUTC })

    // Create the appointment
    const result = await createAppointmentFromWebhook({
      leadId,
      businessId: business.id,
      scheduledAt: scheduledAtUTC,
      durationMinutes: 30,
      source: 'retell',
      notes: `Agendado durante llamada telefónica con ${booking.name || call.from_number}`
    })

    if (result.success) {
      await supabase.from('leads').update({ status: 'appointment_scheduled' }).eq('id', leadId)
      console.log('Appointment created from tool_calls:', result.appointmentId)
    } else {
      console.error('Failed to create appointment from tool_calls:', result.error)
    }
  }

  console.log('Call ended processed:', call.call_id, 'Lead:', leadId)
}

async function handleCallAnalyzed(data: RetellCallAnalyzedEvent) {
  const supabase = createAdminClient()
  const { call } = data

  if (!call.call_analysis) {
    console.log('No call_analysis in event:', call.call_id)
    return
  }

  const analysis = call.call_analysis
  console.log('Processing call_analyzed:', call.call_id, JSON.stringify(analysis, null, 2))

  // Try to find lead by retell_call_id first, then by phone number
  let lead: { id: string; business_id: string } | null = null

  const { data: leadByCallId } = await supabase
    .from('leads')
    .select('id, business_id')
    .eq('retell_call_id', call.call_id)
    .maybeSingle()

  if (leadByCallId) {
    lead = leadByCallId
  } else {
    // Fallback: find by phone number + business
    console.log('Lead not found by retell_call_id, trying phone:', call.from_number)

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .or(`retell_agent_id.eq.${call.agent_id},phone.eq.${call.to_number}`)
      .maybeSingle()

    if (business) {
      const { data: leadByPhone } = await supabase
        .from('leads')
        .select('id, business_id')
        .eq('business_id', business.id)
        .eq('phone', call.from_number)
        .maybeSingle()

      if (leadByPhone) {
        // Update with retell_call_id for future lookups
        await supabase
          .from('leads')
          .update({ retell_call_id: call.call_id })
          .eq('id', leadByPhone.id)
        lead = leadByPhone
      } else {
        // Create the lead since call_ended might not have fired
        console.log('Creating lead from call_analyzed event')
        const { data: newLead } = await supabase
          .from('leads')
          .insert({
            business_id: business.id,
            phone: call.from_number,
            source: 'call',
            status: 'new',
            retell_call_id: call.call_id,
          })
          .select('id, business_id')
          .single()

        if (newLead) lead = newLead
      }
    }
  }

  if (!lead) {
    console.error('Could not find or create lead for call:', call.call_id)
    return
  }

  // Extract into consts to avoid TypeScript narrowing issues with Supabase types
  const leadId = lead.id as string
  const leadBusinessId = lead.business_id as string

  // Merge custom_analysis_data with top-level analysis fields
  // Retell may put post_call_analysis_data in either location
  const customData: Record<string, unknown> = {
    ...(analysis.custom_analysis_data || {}),
    ...(analysis as Record<string, unknown>),
  }

  console.log('Merged analysis data:', JSON.stringify(customData, null, 2))

  // Update lead with extracted info
  const updates: Record<string, unknown> = {}

  if (customData.caller_name) updates.name = customData.caller_name
  if (customData.case_type) updates.case_type = customData.case_type
  if (customData.urgency) updates.urgency = customData.urgency
  if (customData.email || customData.caller_email) {
    updates.email = customData.email || customData.caller_email
  }

  // Check if appointment already exists (may have been created by handleCallEnded)
  const { data: existingAppointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('lead_id', leadId)
    .eq('status', 'scheduled')
    .limit(1)

  if (existingAppointment && existingAppointment.length > 0) {
    console.log('Appointment already exists for lead (created by call_ended), skipping creation')
    updates.status = 'appointment_scheduled'
  } else {
    // No appointment exists yet — try to create one
    // Strategy 1: Check post_call_analysis_data fields
    const appointmentScheduled = customData.appointment_scheduled
    const appointmentDate = customData.appointment_date as string | undefined
    let appointmentCreated = false

    if (appointmentScheduled && appointmentDate) {
      console.log('Appointment detected in call analysis:', {
        scheduled: appointmentScheduled,
        date: appointmentDate,
        time: customData.appointment_time,
      })

      const parsedDate = parseAppointmentDate(
        appointmentDate,
        customData.appointment_time as string | undefined
      )

      if (parsedDate) {
        const result = await createAppointmentFromWebhook({
          leadId: leadId,
          businessId: leadBusinessId,
          scheduledAt: parsedDate,
          durationMinutes: (customData.appointment_duration as number) || 30,
          source: 'retell',
          notes: `Agendado durante llamada. ${analysis.call_summary || ''}`
        })

        if (result.success) {
          updates.status = 'appointment_scheduled'
          appointmentCreated = true
          console.log('Appointment created from call analysis:', result.appointmentId)
        } else {
          console.error('Failed to create appointment:', result.error)
        }
      } else {
        console.error('Could not parse appointment date:', appointmentDate, customData.appointment_time)
      }
    }

    // Strategy 2: Fallback to tool_calls extraction
    if (!appointmentCreated) {
      const booking = extractBookingFromToolCalls(call)
      if (booking) {
        console.log('Appointment detected from tool_calls fallback:', booking)

        if (booking.name) updates.name = booking.name
        if (booking.email) updates.email = booking.email

        const scheduledAtUTC = booking.timezone
          ? convertToUTC(booking.time, booking.timezone)
          : booking.time

        const result = await createAppointmentFromWebhook({
          leadId: leadId,
          businessId: leadBusinessId,
          scheduledAt: scheduledAtUTC,
          durationMinutes: 30,
          source: 'retell',
          notes: `Agendado durante llamada. ${analysis.call_summary || ''}`
        })

        if (result.success) {
          updates.status = 'appointment_scheduled'
          console.log('Appointment created from tool_calls fallback:', result.appointmentId)
        } else {
          console.error('Failed to create appointment from tool_calls:', result.error)
        }
      }
    }
  }

  // Update status based on sentiment if no appointment was created
  if (analysis.user_sentiment === 'Positive' && !updates.status) {
    updates.status = 'qualified'
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
  }

  // Update transcript with summary
  if (analysis.call_summary) {
    await supabase
      .from('call_transcripts')
      .update({ summary: analysis.call_summary })
      .eq('retell_call_id', call.call_id)
  }

  console.log('Call analyzed processed:', call.call_id, 'Lead:', leadId, 'Updates:', JSON.stringify(updates))
}

/**
 * Convert a datetime string from a specific timezone to a UTC ISO string.
 * Example: convertToUTC("2026-01-30T17:00:00", "America/Detroit")
 *   → "2026-01-30T22:00:00.000Z" (Detroit is UTC-5 in winter)
 */
function convertToUTC(dateTimeStr: string, timezone: string): string {
  // Treat the input as if it were UTC to get a reference point
  const refDate = new Date(dateTimeStr + 'Z')

  // Compare UTC vs timezone representation to compute the offset
  const utcStr = refDate.toLocaleString('en-US', { timeZone: 'UTC' })
  const tzStr = refDate.toLocaleString('en-US', { timeZone: timezone })
  const offsetMs = new Date(utcStr).getTime() - new Date(tzStr).getTime()

  // Apply offset: if timezone is behind UTC (e.g., UTC-5), offsetMs is positive
  return new Date(refDate.getTime() + offsetMs).toISOString()
}

/**
 * Extract booking data from tool_calls in transcript_with_tool_calls.
 * Looks for book_appointment_cal invocations followed by successful results.
 */
function extractBookingFromToolCalls(call: RetellCall): BookingToolCallData | null {
  const entries = call.transcript_with_tool_calls
  if (!entries || entries.length === 0) return null

  // Find book_appointment_cal invocations
  for (const entry of entries) {
    if (entry.role !== 'tool_call_invocation') continue
    if (!entry.name?.includes('book_appointment')) continue

    // Check if this tool call has a successful result
    const result = entries.find(
      e => e.role === 'tool_call_result' && e.tool_call_id === entry.tool_call_id
    )

    if (!result?.content) continue

    try {
      const resultData = JSON.parse(result.content)
      // Check if the booking was successful
      const status = (resultData.status || '').toLowerCase()
      if (!status.includes('success') && !status.includes('booked')) continue
    } catch {
      continue
    }

    // Parse the arguments
    try {
      const args = JSON.parse(entry.arguments || '{}')
      if (!args.time) continue

      return {
        time: args.time,
        timezone: args.timezone,
        name: args.name,
        email: args.email,
      }
    } catch {
      console.error('Failed to parse tool call arguments:', entry.arguments)
    }
  }

  return null
}

/**
 * Parse appointment date/time from various formats
 */
function parseAppointmentDate(date: string, time?: string): Date | null {
  try {
    const today = new Date()

    // Handle relative dates
    if (date.toLowerCase().includes('hoy') || date.toLowerCase().includes('today')) {
      date = today.toISOString().split('T')[0]
    } else if (date.toLowerCase().includes('mañana') || date.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      date = tomorrow.toISOString().split('T')[0]
    }

    // Parse time if provided
    let hours = 9 // Default to 9 AM
    let minutes = 0

    if (time) {
      const timeMatch = time.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10)
        minutes = parseInt(timeMatch[2] || '0', 10)

        if (timeMatch[3]?.toLowerCase() === 'pm' && hours < 12) {
          hours += 12
        } else if (timeMatch[3]?.toLowerCase() === 'am' && hours === 12) {
          hours = 0
        }
      }
    }

    const result = new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)

    if (isNaN(result.getTime())) {
      return null
    }

    return result
  } catch {
    return null
  }
}

// Retell.ai webhook event types
interface TranscriptEntry {
  role: string
  content?: string
  tool_call_id?: string
  name?: string
  arguments?: string
  time_sec?: number
  type?: string
  words?: Array<{
    word: string
    start: number
    end: number
  }>
  metadata?: Record<string, unknown>
}

interface RetellCall {
  call_id: string
  agent_id: string
  call_status: string
  from_number: string
  to_number: string
  direction: string
  start_timestamp: number
  end_timestamp: number
  transcript: string
  transcript_object?: TranscriptEntry[]
  transcript_with_tool_calls?: TranscriptEntry[]
  recording_url?: string
  call_analysis?: {
    call_summary?: string
    user_sentiment?: string
    custom_analysis_data?: Record<string, unknown>
  }
}

interface RetellCallStartedEvent {
  event: 'call_started'
  call: RetellCall
}

interface RetellCallEndedEvent {
  event: 'call_ended'
  call: RetellCall
}

interface RetellCallAnalyzedEvent {
  event: 'call_analyzed'
  call: RetellCall
}

interface BookingToolCallData {
  time: string
  timezone?: string
  name?: string
  email?: string
}

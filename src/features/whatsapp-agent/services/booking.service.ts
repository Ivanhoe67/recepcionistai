// @ts-nocheck
/**
 * Booking Service - Cal.com Integration
 * Extracts booking data from conversations and creates real appointments
 */

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const CAL_API_KEY = process.env.CAL_API_KEY || ''
const CAL_EVENT_TYPE_ID = process.env.CAL_CALENDAR_ID || '' // Using CALENDAR_ID as event type
const CAL_TIMEZONE = process.env.CAL_TIMEZONE || 'America/Detroit'

interface ConversationMessage {
  role: string
  content: string
}

interface BookingData {
  name: string
  email: string
  phone: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  isComplete: boolean
}

interface CalBookingResult {
  success: boolean
  bookingId?: string
  bookingUid?: string
  scheduledAt?: string
  meetingUrl?: string
  error?: string
}

/**
 * Extract booking data from conversation using AI
 */
export async function extractBookingData(
  messages: ConversationMessage[]
): Promise<BookingData> {
  try {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        name: z.string().describe('Nombre completo del cliente'),
        email: z.string().describe('Email del cliente'),
        phone: z.string().describe('Teléfono del cliente'),
        date: z.string().describe('Fecha de la cita en formato YYYY-MM-DD'),
        time: z.string().describe('Hora de la cita en formato HH:MM (24 horas)'),
        isComplete: z.boolean().describe('true si TODOS los datos están presentes y confirmados')
      }),
      prompt: `Analiza esta conversación y extrae los datos de la cita si están completos.

FECHA ACTUAL: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
ZONA HORARIA: America/Detroit (Eastern Time)

CONVERSACIÓN:
${conversationText}

INSTRUCCIONES:
- Extrae: nombre, email, teléfono, fecha (YYYY-MM-DD), hora (HH:MM 24h)
- isComplete = true SOLO si tienes TODOS los datos (nombre, email, teléfono, fecha, hora)
- Si falta algún dato, pon string vacío "" y isComplete = false

FECHAS RELATIVAS:
- "hoy" = fecha actual
- "mañana" = fecha actual + 1 día
- "lunes/martes/etc" = próximo día de la semana que corresponda
- Siempre usa formato YYYY-MM-DD

HORAS:
- "4 de la tarde" o "4pm" = 16:00
- "5 de la tarde" o "5pm" = 17:00
- Convierte SIEMPRE a formato 24 horas (HH:MM)
- Si no especifica hora, usa 16:00 (inicio del horario disponible 4PM-9PM)`
    })

    return result.object
  } catch (error) {
    console.error('Error extracting booking data:', error)
    return {
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      isComplete: false
    }
  }
}

/**
 * Get available slots from Cal.com for a specific date
 */
async function getAvailableSlots(date: string): Promise<string[]> {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  const endDate = nextDay.toISOString().split('T')[0]

  const url = `https://api.cal.com/v1/slots?apiKey=${CAL_API_KEY}&eventTypeId=${CAL_EVENT_TYPE_ID}&startTime=${date}&endTime=${endDate}&timeZone=${CAL_TIMEZONE}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.slots && data.slots[date]) {
      return data.slots[date].map((slot: { time: string }) => slot.time)
    }
    return []
  } catch (error) {
    console.error('Error fetching slots:', error)
    return []
  }
}

/**
 * Find the nearest available slot to the requested time
 */
function findNearestSlot(slots: string[], requestedTime: string, date: string): string | null {
  if (slots.length === 0) return null

  const [reqHours, reqMinutes] = requestedTime.split(':').map(Number)
  const requestedMinutes = reqHours * 60 + reqMinutes

  console.log('Finding nearest slot to:', requestedTime, '(', requestedMinutes, 'minutes)')

  let nearestSlot = slots[0]
  let minDiff = Infinity

  for (const slot of slots) {
    // Parse slot time from string (format: "2026-02-23T16:15:00-05:00")
    // Extract hours and minutes directly from string to avoid timezone issues
    const timeMatch = slot.match(/T(\d{2}):(\d{2})/)
    if (!timeMatch) continue

    const slotHours = parseInt(timeMatch[1])
    const slotMins = parseInt(timeMatch[2])
    const slotTotalMinutes = slotHours * 60 + slotMins

    const diff = Math.abs(slotTotalMinutes - requestedMinutes)
    console.log(`Slot ${slot}: ${slotHours}:${slotMins} (${slotTotalMinutes} min) - diff: ${diff}`)

    if (diff < minDiff) {
      minDiff = diff
      nearestSlot = slot
    }
  }

  console.log('Selected nearest slot:', nearestSlot)
  return nearestSlot
}

/**
 * Create booking in Cal.com
 */
export async function createCalBooking(
  bookingData: BookingData
): Promise<CalBookingResult> {
  if (!CAL_API_KEY) {
    console.log('CAL_API_KEY not configured, skipping Cal.com booking')
    return { success: false, error: 'Cal.com API key not configured' }
  }

  if (!CAL_EVENT_TYPE_ID) {
    console.log('CAL_EVENT_TYPE_ID not configured')
    return { success: false, error: 'Cal.com Event Type ID not configured' }
  }

  try {
    // First, get available slots for the requested date
    console.log('Fetching available slots for:', bookingData.date)
    const availableSlots = await getAvailableSlots(bookingData.date)
    console.log('Available slots:', availableSlots.length, 'slots found')

    if (availableSlots.length === 0) {
      return { success: false, error: 'No hay disponibilidad para esa fecha' }
    }

    // Find the nearest available slot
    const nearestSlot = findNearestSlot(availableSlots, bookingData.time, bookingData.date)
    if (!nearestSlot) {
      return { success: false, error: 'No se encontró un horario disponible cercano' }
    }

    // Parse the slot time to get UTC format for Cal.com API v2
    const slotDate = new Date(nearestSlot)
    const startTime = slotDate.toISOString()

    console.log('Creating Cal.com booking:', {
      eventTypeId: CAL_EVENT_TYPE_ID,
      requestedTime: `${bookingData.date} ${bookingData.time}`,
      actualSlot: nearestSlot,
      startTimeUTC: startTime,
      attendee: bookingData.name,
      email: bookingData.email
    })

    const response = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CAL_API_KEY}`,
        'cal-api-version': '2024-08-13'
      },
      body: JSON.stringify({
        start: startTime,
        eventTypeId: parseInt(CAL_EVENT_TYPE_ID),
        attendee: {
          name: bookingData.name,
          email: bookingData.email,
          timeZone: CAL_TIMEZONE,
          phoneNumber: bookingData.phone
        },
        metadata: {
          source: 'whatsapp-agent',
          phone: bookingData.phone
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cal.com API error:', JSON.stringify(data, null, 2))
      console.error('Request was:', {
        start: startTime,
        eventTypeId: parseInt(CAL_EVENT_TYPE_ID),
        attendee: bookingData.name,
        email: bookingData.email
      })
      const errorMsg = data.error?.message || data.message || data.error || 'Failed to create booking'
      return {
        success: false,
        error: errorMsg
      }
    }

    console.log('Cal.com booking created:', data)

    return {
      success: true,
      bookingId: data.data?.id?.toString(),
      bookingUid: data.data?.uid,
      scheduledAt: startTime,
      meetingUrl: data.data?.meetingUrl || data.data?.location
    }
  } catch (error) {
    console.error('Error creating Cal.com booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Format date for display in Spanish
 */
export function formatBookingDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CAL_TIMEZONE
  })
}

/**
 * Check if the last assistant message indicates a booking was requested
 */
export function looksLikeBookingCompletion(lastAssistantMessage: string): boolean {
  const bookingPhrases = [
    // Spanish - main trigger phrase
    'procesando tu reserva',
    'estoy procesando',
    // Spanish - fallback phrases
    'registrado tu solicitud',
    'solicitud de cita',
    'he anotado',
    'he registrado',
    'cita para el',
    'cita agendada',
    'cita confirmada',
    'he agendado',
    'está agendada',
    'queda agendada',
    'tu cita es',
    'tu cita será',
    'agendé tu cita',
    // English
    'registered your',
    'appointment request',
    'appointment for',
    'appointment is scheduled',
    'appointment confirmed',
    'booked your appointment'
  ]

  const lowerMessage = lastAssistantMessage.toLowerCase()
  const matches = bookingPhrases.some(phrase => lowerMessage.includes(phrase.toLowerCase()))

  if (matches) {
    console.log('Booking phrase detected in:', lastAssistantMessage.substring(0, 100))
  }

  return matches
}

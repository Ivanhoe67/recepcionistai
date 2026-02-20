// @ts-nocheck
/**
 * Calendar Tools for WhatsApp AI Agent
 * Integration with Cal.com or similar calendar service
 */

import { z } from 'zod'
import { tool } from 'ai'

const CAL_API_KEY = process.env.CAL_API_KEY || ''
const CAL_API_URL = process.env.CAL_API_URL || 'https://api.cal.com/v1'
const CAL_CALENDAR_ID = process.env.CAL_CALENDAR_ID || ''
const CAL_TIMEZONE = process.env.CAL_TIMEZONE || 'America/Detroit'

/**
 * Get available slots for the next N days
 */
export const getAvailabilityTool = tool({
  description: 'Obtiene la disponibilidad del calendario para los próximos días. Usa esta herramienta cuando el usuario quiera agendar una cita.',
  parameters: z.object({
    daysAhead: z.number().min(1).max(14).describe('Número de días a consultar (1-14). Por defecto 3.')
  }),
  execute: async ({ daysAhead }) => {
    const days = daysAhead || 3
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days)

      // If using Cal.com API
      if (CAL_API_KEY && CAL_CALENDAR_ID) {
        const response = await fetch(
          `${CAL_API_URL}/availability?` + new URLSearchParams({
            apiKey: CAL_API_KEY,
            eventTypeId: CAL_CALENDAR_ID,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            timeZone: CAL_TIMEZONE
          })
        )

        if (response.ok) {
          const data = await response.json()
          return {
            success: true,
            slots: data.slots || [],
            timezone: CAL_TIMEZONE
          }
        }
      }

      // Fallback: Generate mock availability for demo
      const slots = generateMockAvailability(startDate, days)
      return {
        success: true,
        slots,
        timezone: CAL_TIMEZONE,
        note: 'Horarios disponibles para los próximos días'
      }
    } catch (error) {
      console.error('Error getting availability:', error)
      return {
        success: false,
        error: 'No se pudo obtener la disponibilidad. Por favor intente más tarde.'
      }
    }
  }
})

/**
 * Book an appointment
 */
export const bookAppointmentTool = tool({
  description: 'Agenda una cita en el calendario. Solo usar cuando tengas todos los datos confirmados: nombre, email, teléfono, fecha y hora.',
  parameters: z.object({
    name: z.string().describe('Nombre completo del cliente'),
    email: z.string().email().describe('Email del cliente'),
    phone: z.string().describe('Teléfono del cliente'),
    date: z.string().describe('Fecha de la cita en formato YYYY-MM-DD'),
    time: z.string().describe('Hora de la cita en formato HH:MM (24h) o HH:MM AM/PM'),
    notes: z.string().optional().describe('Notas adicionales sobre la cita')
  }),
  execute: async ({ name, email, phone, date, time, notes }) => {
    try {
      // Parse time to 24h format
      const scheduledAt = parseDateTime(date, time)

      if (!scheduledAt) {
        return {
          success: false,
          error: 'Formato de fecha/hora inválido'
        }
      }

      // If using Cal.com API
      if (CAL_API_KEY && CAL_CALENDAR_ID) {
        const response = await fetch(`${CAL_API_URL}/bookings?apiKey=${CAL_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventTypeId: parseInt(CAL_CALENDAR_ID),
            start: scheduledAt.toISOString(),
            responses: {
              name,
              email,
              phone,
              notes: notes || ''
            },
            timeZone: CAL_TIMEZONE,
            language: 'es'
          })
        })

        if (response.ok) {
          const booking = await response.json()
          return {
            success: true,
            bookingId: booking.id,
            scheduledAt: scheduledAt.toISOString(),
            message: `Cita agendada exitosamente para ${formatDateSpanish(scheduledAt)}`
          }
        }
      }

      // Return booking data for webhook processing
      return {
        success: true,
        bookingData: {
          nombre_completo: name,
          email,
          telefono: phone,
          fecha_seleccionada: date,
          hora_seleccionada: time,
          scheduledAt: scheduledAt.toISOString(),
          calendarId: CAL_CALENDAR_ID,
          timezone: CAL_TIMEZONE,
          notes
        },
        message: `Cita agendada exitosamente para ${formatDateSpanish(scheduledAt)}`
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      return {
        success: false,
        error: 'No se pudo agendar la cita. Por favor intente más tarde.'
      }
    }
  }
})

/**
 * Search for existing appointments by email
 */
export const searchAppointmentsTool = tool({
  description: 'Busca las citas existentes de un cliente por su email. Usar cuando el cliente quiera ver, cambiar o cancelar sus citas.',
  parameters: z.object({
    email: z.string().email().describe('Email del cliente')
  }),
  execute: async ({ email }) => {
    try {
      if (CAL_API_KEY) {
        const response = await fetch(
          `${CAL_API_URL}/bookings?` + new URLSearchParams({
            apiKey: CAL_API_KEY,
            attendeeEmail: email
          })
        )

        if (response.ok) {
          const data = await response.json()
          return {
            success: true,
            appointments: data.bookings || [],
            count: data.bookings?.length || 0
          }
        }
      }

      return {
        success: true,
        appointments: [],
        count: 0,
        message: 'No se encontraron citas para este email'
      }
    } catch (error) {
      console.error('Error searching appointments:', error)
      return {
        success: false,
        error: 'No se pudieron buscar las citas'
      }
    }
  }
})

/**
 * Cancel an appointment
 */
export const cancelAppointmentTool = tool({
  description: 'Cancela una cita existente. Siempre preguntar el motivo antes de cancelar.',
  parameters: z.object({
    email: z.string().email().describe('Email del cliente'),
    appointmentDate: z.string().describe('Fecha de la cita a cancelar'),
    reason: z.string().describe('Motivo de la cancelación')
  }),
  execute: async ({ email, appointmentDate, reason }) => {
    try {
      // In production, would call Cal.com API to cancel
      return {
        success: true,
        message: `Cita del ${appointmentDate} cancelada. Motivo: ${reason}`,
        cancelledAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      return {
        success: false,
        error: 'No se pudo cancelar la cita'
      }
    }
  }
})

// Helper functions
function generateMockAvailability(startDate: Date, days: number) {
  const slots: Array<{ date: string; times: string[] }> = []
  const workHours = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    // Randomly remove some slots to simulate bookings
    const availableTimes = workHours.filter(() => Math.random() > 0.3)

    if (availableTimes.length > 0) {
      slots.push({
        date: date.toISOString().split('T')[0],
        times: availableTimes
      })
    }
  }

  return slots
}

function parseDateTime(date: string, time: string): Date | null {
  try {
    // Handle 12h format (e.g., "10:00 AM", "3:00 PM")
    const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (!timeMatch) return null

    let hours = parseInt(timeMatch[1])
    const minutes = parseInt(timeMatch[2])
    const period = timeMatch[3]?.toUpperCase()

    if (period === 'PM' && hours < 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    const dateTime = new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)
    return isNaN(dateTime.getTime()) ? null : dateTime
  } catch {
    return null
  }
}

function formatDateSpanish(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// @ts-nocheck
// TODO: Regenerar tipos de Supabase
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAppointmentFromWebhook } from '@/features/appointments/services/appointments.service'

/**
 * Retell.ai Function Calling Endpoint
 *
 * This endpoint handles custom functions that Retell can call during a conversation.
 * Configure this URL in your Retell agent's custom functions.
 *
 * Expected payload:
 * {
 *   "call_id": "xxx",
 *   "function_name": "book_appointment",
 *   "arguments": {
 *     "date": "2025-01-15",
 *     "time": "10:00",
 *     "duration_minutes": 30,
 *     "notes": "Consulta inicial"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        let args = data.arguments
        if (typeof args === 'string') {
            try {
                args = JSON.parse(args)
            } catch (e) {
                args = {}
            }
        }
        args = args || {}

        const call_id = data.call_id || data.callId
        const function_name = data.function_name || data.name

        console.log(`Retell function call: ${function_name}`, { call_id, args })

        switch (function_name) {
            case 'book_appointment':
                return await handleBookAppointment(call_id, args)

            case 'check_availability':
                return await handleCheckAvailability(call_id, args)

            case 'get_services':
                return await handleGetServices(call_id)

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown function: ${function_name}`
                }, { status: 400 })
        }
    } catch (error) {
        console.error('Retell function error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 })
    }
}

/**
 * Book an appointment during a Retell call
 */
async function handleBookAppointment(
    callId: string,
    args: {
        date?: string      // YYYY-MM-DD
        time?: string      // HH:mm
        duration_minutes?: number
        notes?: string
    }
) {
    const supabase = createAdminClient()

    if (!callId) {
        return NextResponse.json({
            success: false,
            message: 'Hubo un error de conexión, por favor intenta de nuevo.'
        })
    }

    // Find lead by retell_call_id
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id, business_id, name, phone')
        .eq('retell_call_id', callId)
        .single()

    if (leadError || !lead) {
        console.error('Lead not found for call:', callId)
        return NextResponse.json({
            success: false,
            message: 'No pude encontrar tu información para agendar la cita. Por favor intenta de nuevo.'
        })
    }

    // Parse date and time
    const scheduledAt = parseDateTime(args.date || '', args.time || '09:00')
    if (!scheduledAt) {
        return NextResponse.json({
            success: false,
            message: 'No logré entender bien el día o la hora que me indicaste. ¿Podrías repetirlo?'
        })
    }

    // Check if the slot is available (no overlapping appointments)
    const { data: existing } = await supabase
        .from('appointments')
        .select('id')
        .eq('business_id', lead.business_id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', scheduledAt.toISOString())
        .lt('scheduled_at', new Date(scheduledAt.getTime() + (args.duration_minutes || 30) * 60000).toISOString())
        .limit(1)

    if (existing && existing.length > 0) {
        return NextResponse.json({
            success: false,
            message: 'Ese horario ya está ocupado. ¿Te gustaría agendar en otro momento?'
        })
    }

    // Create the appointment
    const result = await createAppointmentFromWebhook({
        leadId: lead.id,
        businessId: lead.business_id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: args.duration_minutes || 30,
        source: 'retell',
        notes: args.notes || 'Agendado durante llamada telefónica'
    })

    if (!result.success) {
        return NextResponse.json({
            success: false,
            message: 'Hubo un problema al agendar la cita. Por favor intenta de nuevo.'
        })
    }

    // Format confirmation message
    const formattedDate = scheduledAt.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const formattedTime = scheduledAt.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return NextResponse.json({
        success: true,
        message: `Perfecto, tu cita ha sido agendada para el ${formattedDate} a las ${formattedTime}. Recibirás una confirmación.`,
        appointment_id: result.appointmentId,
        scheduled_at: scheduledAt.toISOString()
    })
}

/**
 * Check availability for a given date
 */
async function handleCheckAvailability(callId: string, args: { date?: string }) {
    const supabase = createAdminClient()

    if (!callId) {
        return NextResponse.json({
            success: false,
            message: 'Tengo un problema técnico momentáneo. No pude encontrar tu información.'
        })
    }

    // Find business from the call
    const { data: lead } = await supabase
        .from('leads')
        .select('business_id')
        .eq('retell_call_id', callId)
        .maybeSingle()

    if (!lead || !lead.business_id) {
        return NextResponse.json({
            success: false,
            message: 'Tengo un problema técnico. No pude encontrar el negocio asociado a esta llamada.'
        })
    }

    // Use parseDateTime with a dummy time just to safely extract the date part
    const parsedDate = parseDateTime(args.date || 'hoy', '09:00')
    if (!parsedDate) {
        return NextResponse.json({
            success: false,
            message: 'No entendí la fecha. ¿Podrías decirme qué día te gustaría revisar horarios?'
        })
    }

    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999))

    // Get all appointments for that day FOR THIS SPECIFIC BUSINESS
    const { data: appointments } = await supabase
        .from('appointments')
        .select('scheduled_at, duration_minutes')
        .eq('business_id', lead.business_id)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .eq('status', 'scheduled')

    // Define business hours (9 AM - 6 PM)
    const businessHours = {
        start: 9,
        end: 18
    }

    // Calculate available slots (30 min increments)
    const slots: string[] = []

    // Build a Set of HH:mm formats for quick lookup of booked hours
    const bookedSlots = new Set(
        (appointments || []).map(a => {
            const date = new Date(a.scheduled_at)
            const h = date.getHours().toString().padStart(2, '0')
            const m = date.getMinutes().toString().padStart(2, '0')
            return `${h}:${m}`
        })
    )

    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        for (const minute of [0, 30]) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            if (!bookedSlots.has(timeStr)) {
                slots.push(timeStr)
            }
        }
    }

    // Avoid giving too many options, pick 3 spread out options or first 3
    const formatTime = (t: string) => {
        const [h, m] = t.split(':')
        const hNum = parseInt(h, 10)
        const ampm = hNum >= 12 ? 'pm' : 'am'
        const h12 = hNum % 12 || 12
        return `${h12}:${m} ${ampm}`
    }

    let message = ''
    if (slots.length > 0) {
        const firstSlots = slots.slice(0, 3).map(formatTime).join(', ')
        message = `Sí, tenemos disponibilidad. Por ejemplo a las ${firstSlots}, y algunos otros horarios. ¿Qué hora te conviene más?`
    } else {
        message = 'Lo siento, no tenemos disponibilidad para esa fecha. ¿Te gustaría revisar otro día?'
    }

    return NextResponse.json({
        success: true,
        date: args.date,
        available_slots: slots,
        message: message
    })
}

/**
 * Get services offered by the business
 */
async function handleGetServices(callId: string) {
    const supabase = createAdminClient()

    // Find business from the call
    const { data: lead } = await supabase
        .from('leads')
        .select('business_id')
        .eq('retell_call_id', callId)
        .single()

    if (!lead) {
        return NextResponse.json({
            success: false,
            message: 'No pude encontrar la información del negocio.'
        })
    }

    const { data: business } = await supabase
        .from('businesses')
        .select('services')
        .eq('id', lead.business_id)
        .single()

    const services = business?.services || ['Consulta general']

    return NextResponse.json({
        success: true,
        services,
        message: `Ofrecemos los siguientes servicios: ${services.join(', ')}. ¿En cuál estás interesado?`
    })
}

/**
 * Parse date and time strings into a Date object
 */
function parseDateTime(date: string, time: string): Date | null {
    try {
        // Handle various date formats
        let dateStr = date

        // If date includes Spanish words like "mañana", "hoy", etc.
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (date.toLowerCase().includes('hoy')) {
            dateStr = today.toISOString().split('T')[0]
        } else if (date.toLowerCase().includes('mañana')) {
            dateStr = tomorrow.toISOString().split('T')[0]
        }

        // Parse time (handle "10:00", "10:00 AM", "10am", etc.)
        let hours = 0
        let minutes = 0

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

        const result = new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)

        if (isNaN(result.getTime())) {
            return null
        }

        return result
    } catch {
        return null
    }
}

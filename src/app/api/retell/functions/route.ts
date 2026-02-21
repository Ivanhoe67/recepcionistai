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
        const { call_id, function_name, arguments: args } = data

        console.log(`Retell function call: ${function_name}`, { call_id, args })

        switch (function_name) {
            case 'book_appointment':
                return await handleBookAppointment(call_id, args)

            case 'check_availability':
                return await handleCheckAvailability(args)

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
        date: string      // YYYY-MM-DD
        time: string      // HH:mm
        duration_minutes?: number
        notes?: string
    }
) {
    const supabase = createAdminClient()

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
            message: 'No pude encontrar tu información. Por favor intenta de nuevo.'
        })
    }

    // Parse date and time
    const scheduledAt = parseDateTime(args.date, args.time)
    if (!scheduledAt) {
        return NextResponse.json({
            success: false,
            message: 'La fecha u hora proporcionada no es válida. Por favor intenta con otro horario.'
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
        message: `Perfecto, tu cita ha sido agendada para el ${formattedDate} a las ${formattedTime}. Recibirás una confirmación por mensaje.`,
        appointment_id: result.appointmentId,
        scheduled_at: scheduledAt.toISOString()
    })
}

/**
 * Check availability for a given date
 */
async function handleCheckAvailability(args: { date: string }) {
    const supabase = createAdminClient()

    // Use parseDateTime with a dummy time just to safely extract the date part
    const parsedDate = parseDateTime(args.date || '', '09:00')
    if (!parsedDate) {
        return NextResponse.json({
            success: false,
            message: 'No entendí la fecha. ¿Podrías decirme qué día te gustaría agendar?'
        })
    }

    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999))

    // Get all appointments for that day
    const { data: appointments } = await supabase
        .from('appointments')
        .select('scheduled_at, duration_minutes')
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
    const bookedSlots = new Set(
        (appointments || []).map(a =>
            new Date(a.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        )
    )

    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        for (const minute of [0, 30]) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            if (!bookedSlots.has(timeStr)) {
                slots.push(timeStr)
            }
        }
    }

    return NextResponse.json({
        success: true,
        date: args.date,
        available_slots: slots,
        message: slots.length > 0
            ? `Tenemos disponibilidad a las ${slots.slice(0, 3).join(', ')} y otros horarios. ¿Cuál prefieres?`
            : 'Lo siento, no hay disponibilidad para esa fecha. ¿Te gustaría revisar otro día?'
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

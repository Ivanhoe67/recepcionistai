// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Appointment } from '@/lib/database.types'

export type AppointmentWithLead = Appointment & {
    leads: {
        name: string | null
        phone: string
    }
}

export type CreateAppointmentInput = {
    leadId: string
    businessId: string
    scheduledAt: string | Date
    durationMinutes?: number
    source: 'retell' | 'sms' | 'whatsapp' | 'manual'
    notes?: string
}

export type CreateAppointmentResult = {
    success: boolean
    appointmentId?: string
    error?: string
}

/**
 * Creates an appointment from webhook (uses admin client)
 * Call this from WhatsApp, Retell, or SMS webhooks when the AI agent schedules a meeting
 */
export async function createAppointmentFromWebhook(
    input: CreateAppointmentInput
): Promise<CreateAppointmentResult> {
    const supabase = createAdminClient()

    const scheduledAt = input.scheduledAt instanceof Date
        ? input.scheduledAt.toISOString()
        : input.scheduledAt

    // Create the appointment
    const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
            lead_id: input.leadId,
            business_id: input.businessId,
            scheduled_at: scheduledAt,
            duration_minutes: input.durationMinutes || 30,
            source: input.source === 'whatsapp' ? 'sms' : input.source, // Map whatsapp to sms
            status: 'scheduled',
            notes: input.notes || null,
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error creating appointment:', error)
        return { success: false, error: error.message }
    }

    // Update lead status to appointment_scheduled
    await supabase
        .from('leads')
        .update({ status: 'appointment_scheduled' })
        .eq('id', input.leadId)

    // Get business user_id for notification
    const { data: business } = await supabase
        .from('businesses')
        .select('user_id')
        .eq('id', input.businessId)
        .single()

    if (business) {
        // Create notification
        await supabase
            .from('notifications')
            .insert({
                user_id: business.user_id,
                lead_id: input.leadId,
                type: 'appointment',
                channel: 'email',
                title: 'Nueva cita agendada',
                body: `Se ha agendado una cita para ${new Date(scheduledAt).toLocaleString('es-MX', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                })}`,
            })
    }

    return { success: true, appointmentId: appointment.id }
}

export async function getAppointments(): Promise<AppointmentWithLead[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      leads!inner (
        name,
        phone
      )
    `)
        .eq('business_id', (
            await supabase
                .from('businesses')
                .select('id')
                .eq('user_id', user.id)
                .single()
        ).data?.id)
        .order('scheduled_at', { ascending: true })

    if (error) throw error
    return data as unknown as AppointmentWithLead[]
}

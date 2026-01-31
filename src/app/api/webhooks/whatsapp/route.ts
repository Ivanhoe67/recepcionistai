import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createAppointmentFromWebhook } from '@/features/appointments/services/appointments.service'

/**
 * Generic WhatsApp Webhook for n8n or other external integrations.
 * Expected JSON payload:
 * {
 *   "from": "+1234567890",
 *   "business_phone": "+0987654321",
 *   "body": "Hola, necesito informes",
 *   "role": "user" | "assistant",
 *   "name": "Nombre del Lead (opcional)",
 *
 *   // Optional: When the AI agent books an appointment
 *   "appointment": {
 *     "scheduled_at": "2025-01-15T10:00:00Z",
 *     "duration_minutes": 30,
 *     "notes": "Consulta inicial"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { from, business_phone, body, role, name, appointment } = data

        if (!from || !business_phone || !body || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // 1. Find business by phone number
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('id, user_id')
            .eq('phone', business_phone)
            .maybeSingle()

        if (bizError || !business) {
            console.error('Business not found for phone:', business_phone)
            return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        }

        // 2. Find or create lead
        let { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('id, status, name')
            .eq('business_id', business.id)
            .eq('phone', from)
            .maybeSingle()

        if (leadError) throw leadError

        if (!lead) {
            const { data: newLead, error: createError } = await supabase
                .from('leads')
                .insert({
                    business_id: business.id,
                    phone: from,
                    name: name || null,
                    source: 'whatsapp',
                    status: 'new'
                })
                .select()
                .single()

            if (createError) throw createError
            lead = newLead
        } else if (name && !lead.name) {
            // Update name if we just got it
            await supabase.from('leads').update({ name }).eq('id', lead.id)
        }

        // 3. Find or create conversation
        let { data: conversation, error: convError } = await supabase
            .from('sms_conversations')
            .select('*')
            .eq('lead_id', lead.id)
            .maybeSingle()

        if (convError) throw convError

        if (!conversation) {
            const { data: newConv, error: createConvError } = await supabase
                .from('sms_conversations')
                .insert({
                    lead_id: lead.id,
                    messages: []
                })
                .select()
                .single()

            if (createConvError) throw createConvError
            conversation = newConv
        }

        // 4. Add message
        const messages = (conversation.messages as any[]) || []
        messages.push({
            id: crypto.randomUUID(),
            role: role,
            content: body,
            timestamp: new Date().toISOString()
        })

        const { error: updateError } = await supabase
            .from('sms_conversations')
            .update({
                messages,
                last_message_at: new Date().toISOString()
            })
            .eq('id', conversation.id)

        if (updateError) throw updateError

        // 5. Create notification if it's a new user message
        if (role === 'user') {
            await supabase
                .from('notifications')
                .insert({
                    user_id: business.user_id,
                    lead_id: lead.id,
                    type: 'sms_received',
                    channel: 'email',
                    title: 'Nuevo WhatsApp recibido',
                    body: `Mensaje de ${from}: "${body.substring(0, 100)}${body.length > 100 ? '...' : ''}"`
                })
        }

        // 6. Create appointment if provided by AI agent
        let appointmentResult = null
        if (appointment && appointment.scheduled_at) {
            console.log('Creating appointment from WhatsApp:', appointment)

            appointmentResult = await createAppointmentFromWebhook({
                leadId: lead.id,
                businessId: business.id,
                scheduledAt: appointment.scheduled_at,
                durationMinutes: appointment.duration_minutes || 30,
                source: 'whatsapp',
                notes: appointment.notes || `Agendado vía WhatsApp: ${body.substring(0, 200)}`
            })

            if (!appointmentResult.success) {
                console.error('Failed to create appointment:', appointmentResult.error)
            }
        }

        return NextResponse.json({
            success: true,
            lead_id: lead.id,
            appointment_created: appointmentResult?.success || false,
            appointment_id: appointmentResult?.appointmentId || null
        })
    } catch (error) {
        console.error('WhatsApp webhook error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

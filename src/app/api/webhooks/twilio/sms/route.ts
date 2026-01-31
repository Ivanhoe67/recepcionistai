import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import twilio from 'twilio'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Verify Twilio webhook signature
function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null
): boolean {
  if (!signature) return false

  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false

  return twilio.validateRequest(authToken, signature, url, params)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    // Verify Twilio signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers.get('x-twilio-signature')
      const url = request.url
      if (!verifyTwilioSignature(url, params, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const from = params.From // Customer's phone number
    const to = params.To // Your Twilio number
    const body = params.Body // Message content

    const supabase = createAdminClient()

    // Find business by Twilio phone number
    const { data: business } = await supabase
      .from('businesses')
      .select('id, user_id, name, services, assistant_script')
      .eq('phone', to)
      .single()

    if (!business) {
      console.error('No business found for phone:', to)
      // Still respond to avoid Twilio errors
      return createTwiMLResponse('Lo sentimos, este número no está configurado.')
    }

    // Find or create lead
    let lead = await findOrCreateLead(supabase, business.id, from)

    // Find or create conversation
    let conversation = await findOrCreateConversation(supabase, lead.id)

    // Add user message to conversation
    const messages = (conversation.messages as Array<{
      id: string
      role: 'user' | 'assistant'
      content: string
      timestamp: string
    }>) || []

    messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: body,
      timestamp: new Date().toISOString(),
    })

    // Generate AI response
    const aiResponse = await generateAIResponse(
      messages,
      business.name,
      business.services,
      business.assistant_script,
      lead
    )

    // Add AI response to conversation
    messages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    })

    // Update conversation in database
    await supabase
      .from('sms_conversations')
      .update({
        messages,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)

    // Update lead status if qualified
    const qualificationResult = await checkQualification(messages)
    if (qualificationResult.qualified && lead.status === 'new') {
      await supabase
        .from('leads')
        .update({
          status: 'qualified',
          case_type: qualificationResult.caseType,
          urgency: qualificationResult.urgency,
          name: qualificationResult.name || lead.name,
        })
        .eq('id', lead.id)
    }

    // Create notification for new message
    await supabase
      .from('notifications')
      .insert({
        user_id: business.user_id,
        lead_id: lead.id,
        type: 'sms_received',
        channel: 'email',
        title: 'Nuevo SMS recibido',
        body: `Mensaje de ${from}: "${body.substring(0, 100)}${body.length > 100 ? '...' : ''}"`,
      })

    // Return TwiML response
    return createTwiMLResponse(aiResponse)
  } catch (error) {
    console.error('Twilio SMS webhook error:', error)
    return createTwiMLResponse('Lo sentimos, ocurrió un error. Por favor intente más tarde.')
  }
}

async function findOrCreateLead(
  supabase: ReturnType<typeof createAdminClient>,
  businessId: string,
  phone: string
) {
  const { data: existingLead } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .single()

  if (existingLead) {
    return existingLead
  }

  const { data: newLead, error } = await supabase
    .from('leads')
    .insert({
      business_id: businessId,
      phone,
      source: 'sms',
      status: 'new',
    })
    .select()
    .single()

  if (error) throw error
  return newLead!
}

async function findOrCreateConversation(
  supabase: ReturnType<typeof createAdminClient>,
  leadId: string
) {
  const { data: existingConversation } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('lead_id', leadId)
    .single()

  if (existingConversation) {
    return existingConversation
  }

  const { data: newConversation, error } = await supabase
    .from('sms_conversations')
    .insert({
      lead_id: leadId,
      messages: [],
    })
    .select()
    .single()

  if (error) throw error
  return newConversation!
}

async function generateAIResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  businessName: string,
  services: unknown,
  assistantScript: string | null,
  lead: { name: string | null; case_type: string | null }
): Promise<string> {
  const systemPrompt = `Eres un asistente virtual profesional para "${businessName}", un servicio de preparación de documentos legales e impuestos.

Tu objetivo es:
1. Responder preguntas sobre los servicios
2. Calificar al cliente preguntando tipo de caso y urgencia
3. Ofrecer agendar una cita si el cliente está interesado

${assistantScript ? `Instrucciones específicas: ${assistantScript}` : ''}

Servicios disponibles: ${JSON.stringify(services)}

${lead.name ? `El cliente se llama: ${lead.name}` : 'Aún no sabemos el nombre del cliente.'}
${lead.case_type ? `Tipo de caso: ${lead.case_type}` : ''}

Responde de manera profesional, amable y concisa. Máximo 160 caracteres por respuesta (límite SMS).`

  const chatMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: chatMessages,
    max_tokens: 100,
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content || 'Lo sentimos, no pudimos procesar su mensaje.'
}

async function checkQualification(
  messages: Array<{ role: string; content: string }>
): Promise<{
  qualified: boolean
  caseType?: string
  urgency?: 'low' | 'medium' | 'high' | 'urgent'
  name?: string
}> {
  const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Analiza esta conversación y extrae:
1. Si el cliente está calificado (interesado en servicios legales/impuestos)
2. Tipo de caso mencionado
3. Urgencia percibida
4. Nombre del cliente si lo mencionó

Responde SOLO en JSON: {"qualified": boolean, "caseType": string|null, "urgency": "low"|"medium"|"high"|"urgent"|null, "name": string|null}`,
      },
      { role: 'user', content: conversationText },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 100,
  })

  try {
    const result = JSON.parse(response.choices[0]?.message?.content || '{}')
    return {
      qualified: result.qualified || false,
      caseType: result.caseType,
      urgency: result.urgency,
      name: result.name,
    }
  } catch {
    return { qualified: false }
  }
}

function createTwiMLResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

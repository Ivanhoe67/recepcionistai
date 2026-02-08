import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

/**
 * Support Chat API Route
 *
 * Handles streaming AI responses for customer support chat.
 * Uses OpenAI directly via OpenRouter for reliability.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://recepcionistai.com',
    'X-Title': 'RecepcionistAI',
  },
})

const SYSTEM_PROMPT = `Eres un asistente de soporte técnico profesional para RecepcionistAI, un SaaS que ayuda a negocios a capturar leads por SMS con IA.

## Tu Rol
- Responder preguntas sobre RecepcionistAI de manera clara y profesional
- Ayudar con configuración, problemas técnicos, facturación y características
- Sugerir escalación a soporte humano si no puedes resolver el problema

## Características de RecepcionistAI
- **WhatsApp AI Agent**: Q&A, FAQs, atención inicial, calificación de leads y agendado automático 24/7
- **Voz AI (Retell)**: Llamadas con IA para calificación y agendado
- **CRM Unificado**: Dashboard con métricas y transcripciones de todos los canales
- **Agendado Automático**: Integración con calendarios para citas

## Planes y Precios

### 1. Solo WhatsApp
- **$199/mes** o $1,910/año (2 meses gratis)
- 1 canal WhatsApp
- Q&A/FAQs + atención inicial + calificación + agendado
- Dashboard + transcripciones
- 3,000 mensajes/mes incluidos
- 1 flujo principal + 1 variación
- Sobreuso: $0.015 por mensaje extra

### 2. Solo Voz (Retell)
- **$299/mes** o $2,870/año
- 1 línea de voz
- Calificación + agendado
- Dashboard + transcripciones
- 1,000 minutos/mes incluidos
- Sobreuso: $0.25 por minuto extra

### 3. WhatsApp + Voz (Bundle)
- **$499/mes** o $4,790/año
- 1 WhatsApp + 1 línea de voz
- CRM + métricas unificadas + transcripciones de ambos canales
- Reglas de enrutamiento (si no responde WhatsApp, se llama o viceversa)
- 3,000 mensajes + 1,000 minutos/mes incluidos
- Sobreuso: $0.015/mensaje + $0.25/minuto

## Tono
- Amigable pero profesional
- Conciso (máximo 3 párrafos)
- Si no sabes algo, di "No estoy seguro, pero puedo escalarte con soporte humano"

Responde en español siempre.`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { messages, conversationId } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 })
    }

    // 3. Find or create conversation
    let convId = conversationId

    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: user.id,
          messages: [],
          status: 'active',
        })
        .select('id')
        .single()

      if (convError) {
        console.error('Failed to create conversation:', convError)
      } else {
        convId = newConv?.id
      }
    }

    // 4. Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    })

    // 5. Create a readable stream for the response
    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = ''

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              // Send as SSE format that the client expects
              controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`))
            }
          }

          // Save messages to database after streaming completes
          if (convId) {
            const latestUserMessage = messages[messages.length - 1]

            // Get current messages
            const { data: conversation } = await supabase
              .from('support_conversations')
              .select('messages')
              .eq('id', convId)
              .single()

            const existingMessages = conversation?.messages || []

            // Add new messages
            const updatedMessages = [
              ...existingMessages,
              {
                id: crypto.randomUUID(),
                role: 'user',
                content: latestUserMessage?.content || '',
                timestamp: new Date().toISOString(),
              },
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: fullContent,
                timestamp: new Date().toISOString(),
              },
            ]

            await supabase
              .from('support_conversations')
              .update({ messages: updatedMessages })
              .eq('id', convId)
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    // 6. Return streaming response with conversation ID in headers
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'x-conversation-id': convId || '',
      },
    })
  } catch (error) {
    console.error('Support chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

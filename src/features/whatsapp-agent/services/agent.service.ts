// @ts-nocheck
/**
 * WhatsApp AI Agent Service
 * Handles conversation with AI and tool execution
 */

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import {
  getAvailabilityTool,
  bookAppointmentTool,
  searchAppointmentsTool,
  cancelAppointmentTool
} from '../tools/calendar-tools'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AgentConfig {
  businessName: string
  agentName: string
  systemPrompt?: string
  calendarId?: string
  timezone?: string
}

interface AgentResponse {
  text: string
  bookingData?: {
    nombre_completo: string
    email: string
    telefono: string
    fecha_seleccionada: string
    hora_seleccionada: string
    scheduledAt: string
    calendarId: string
    timezone: string
    notes?: string
  }
}

const DEFAULT_SYSTEM_PROMPT = `1. ROL

Eres el agente experto en atención al cliente. Atiendes a personas interesadas en los servicios del negocio.
Tienes acceso a herramientas para gestionar citas y calendario.

2. OBJETIVOS

- Informar con precisión sobre los servicios
- Responder preguntas frecuentes
- Cualificar leads solicitando nombre completo, email y teléfono solo cuando exista intención real
- Verificar disponibilidad, agendar, cambiar y cancelar citas usando las herramientas
- Ofrecer agenda solo una vez por conversación, sin presionar

3. FUNCIONES

- Proveer información clara
- Ante consultas de precios, indicar que varían según el caso y sugerir una reunión personalizada
- Solicitar datos personales únicamente cuando detectes intención real
- Consultar disponibilidad para los próximos 3 días
- Proponer horarios disponibles sin preguntar directamente fechas
- Agendar solo después de confirmación explícita del cliente
- Cambiar citas usando primero búsqueda y luego cambio
- Cancelar citas solicitando motivo

4. LÍMITES

- No facilitar precios específicos ni garantías de resultados
- No brindar asesoría legal, fiscal, médica o migratoria
- Si se solicita información fuera de tu alcance, redirige amablemente

5. TONO

Formal, cercano, profesional y empático.
Mensajes breves y estructurados para WhatsApp.

6. FLUJOS DE ATENCIÓN

Consultas generales: Responde con información clara.
Cualificación: Cuando notes interés real, solicita nombre, email, teléfono.
Gestión de agenda: Usa las herramientas disponibles.

7. PROTOCOLO DE ERRORES

- Mensaje confuso: pide amablemente que reformulen
- Falta un dato: solicita únicamente ese dato
- Sin disponibilidad: ofrece alternativas o contacto humano`

export async function processAgentMessage(
  conversationHistory: Message[],
  userMessage: string,
  config: AgentConfig
): Promise<AgentResponse> {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const systemPrompt = config.systemPrompt || DEFAULT_SYSTEM_PROMPT
  const fullSystemPrompt = `${systemPrompt}

**Nombre del agente:** ${config.agentName}
**Negocio:** ${config.businessName}
**Fecha actual:** ${currentDate}
**Zona horaria:** ${config.timezone || 'America/Detroit'}`

  const messages: Message[] = [
    { role: 'system', content: fullSystemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]

  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages,
      tools: {
        getAvailability: getAvailabilityTool,
        bookAppointment: bookAppointmentTool,
        searchAppointments: searchAppointmentsTool,
        cancelAppointment: cancelAppointmentTool
      },
      maxSteps: 5, // Allow multiple tool calls
      temperature: 0.7
    })

    // Extract booking data if a booking was made
    let bookingData: AgentResponse['bookingData'] = undefined

    for (const step of result.steps) {
      for (const toolResult of step.toolResults) {
        if (toolResult.toolName === 'bookAppointment' && toolResult.result?.success) {
          bookingData = toolResult.result.bookingData
        }
      }
    }

    return {
      text: result.text,
      bookingData
    }
  } catch (error) {
    console.error('Agent processing error:', error)
    return {
      text: 'Disculpa, estoy teniendo problemas técnicos. ¿Podrías repetir tu mensaje?'
    }
  }
}

/**
 * Get conversation history from database
 */
export function formatConversationHistory(messages: Array<{ role: string; content: string }>): Message[] {
  return messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
    .slice(-20) // Keep last 20 messages for context
}

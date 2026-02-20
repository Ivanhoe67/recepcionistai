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

Eres Yusi, el agente experto en atención al cliente del equipo de Quick & Quality Services (Q&Q). Atiendes a dueños de negocios y equipos de marketing interesados en soluciones digitales y automatizaciones de calidad.
Tienes acceso a herramientas para gestionar citas con el calendario, zona horaria America/Detroit, y formato 12 horas.

**IDIOMA: CRÍTICO** - Detecta el idioma del mensaje del usuario y SIEMPRE responde en ese mismo idioma:
- Si el usuario escribe en español → Responde en español
- Si el usuario escribe en inglés → Responde en inglés
- Mantén el mismo idioma durante toda la conversación a menos que el usuario cambie

2. OBJETIVOS

- Informar con precisión sobre los servicios de Q&Q.
- Responder preguntas frecuentes sin precios concretos ni promesas.
- Cualificar leads solicitando nombre completo, email y teléfono solo cuando exista intención real.
- Verificar disponibilidad, agendar, cambiar y cancelar citas usando las herramientas internas.
- Ofrecer agenda solo una vez por conversación, sin presionar.

3. FUNCIONES

- Proveer información clara sobre servicios de Q&Q.
- Ante consultas de precios, indicar que varían según el caso y sugerir una reunión personalizada.
- Solicitar datos personales únicamente cuando detectes intención real.
- Consultar disponibilidad con getAvailability para los próximos 3 días.
- Proponer horarios disponibles sin preguntar directamente fechas.
- Agendar con bookAppointment solo después de confirmación explícita.
- Cambiar citas usando primero searchAppointments y luego la modificación.
- Cancelar citas solicitando motivo y usando cancelAppointment.

4. LÍMITES

- No facilitar precios específicos ni garantías de resultados.
- No brindar asesoría legal, fiscal, médica o migratoria.
- Si se solicita información fuera de tu alcance, explica con cortesía y redirige a un especialista.

5. TONO

Formal, cercano, profesional y empático.
Siempre respetuoso, accesible y claro.
Mensajes breves y estructurados para WhatsApp.

6. SERVICIOS DE Q&Q (Quick & Quality Services)

Q&Q ofrece soluciones digitales para negocios:
- Automatizaciones de procesos empresariales
- Desarrollo de software personalizado
- Integraciones con sistemas existentes
- Consultoría en transformación digital
- Soporte técnico especializado

7. FLUJOS DE ATENCIÓN

Consultas generales:
- Responde con información clara sobre Q&Q.
- Detecta intención real mediante el análisis del mensaje.

Cualificación (cuando notes interés real):
- Solicita nombre completo.
- Solicita email.
- Solicita teléfono.
- Ofrece consultar disponibilidad.

Gestión de agenda:
- Usa getAvailability para consultar próximos 3 días.
- Propón horarios concretos.
- Espera confirmación antes de agendar, cambiar o cancelar.
- Solicita motivos en cancelaciones.
- Solo una invitación a agendar por conversación, sin insistencia.

8. PROTOCOLO DE ERRORES

- Mensaje confuso: pide amablemente que reformulen.
- Falta un solo dato: solicita únicamente ese dato antes de avanzar.
- Datos sensibles (email, teléfono): confirma antes de buscar, cambiar o cancelar.
- Sin disponibilidad: informa, ofrece alternativas o contacto directo con el equipo humano.
- Desviaciones de tema: corrige con cortesía y retoma la conversación.`

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
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Agent processing error:', errorMessage)
    console.error('Error stack:', errorStack)
    console.error('Full error:', JSON.stringify(error, null, 2))

    // Return more descriptive error for debugging
    return {
      text: `Error técnico: ${errorMessage.substring(0, 100)}. Por favor intenta de nuevo.`
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

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

Eres Yusi, el agente de atención al cliente de Quick & Quality Services (Q&Q).
Zona horaria: America/Detroit. Formato de hora: 12 horas.
Horario de atención: 24/7

**IDIOMA: CRÍTICO** - Detecta el idioma del mensaje del usuario y SIEMPRE responde en ese mismo idioma:
- Si el usuario escribe en español → Responde en español
- Si el usuario escribe en inglés → Responde en inglés
- Mantén el mismo idioma durante toda la conversación a menos que el usuario cambie

2. INFORMACIÓN DE CONTACTO

- Teléfono: +1 (517) 930-2149
- Email: rosabalivan67@gmail.com
- Disponibilidad: 24/7

3. SERVICIOS DE Q&Q (Quick & Quality Services)

Q&Q ofrece soluciones digitales para negocios:
- **Automatización de procesos empresariales**: Software personalizado para optimizar operaciones sin necesidad de contratar más personal
- **Desarrollo de sitios web profesionales**: Páginas web modernas, responsivas y optimizadas
- **Agentes de IA para atención al cliente**: Chatbots y asistentes virtuales que atienden 24/7
- **Optimización de procesos**: Análisis y mejora de flujos de trabajo existentes

4. OBJETIVOS

- Informar con precisión sobre los servicios de Q&Q
- Cualificar leads recopilando nombre completo, email y teléfono cuando haya interés real
- Agendar citas para diagnósticos personalizados
- Ofrecer agenda solo una vez por conversación, sin presionar

5. MANEJO DE PRECIOS

**IMPORTANTE**: Cuando el cliente pregunte por precios:
- NUNCA dar precios específicos
- Explicar que cada caso es diferente y requiere un análisis personalizado
- Proponer agendar una cita gratuita para hacer un diagnóstico y ofrecer la mejor opción
- Ejemplo: "Los precios varían según las necesidades específicas de cada negocio. Te propongo que agendemos una cita gratuita para hacer un diagnóstico personalizado y poder ofrecerte la mejor solución. ¿Te parece bien?"

6. LÍMITES ESTRICTOS

- **NUNCA** responder preguntas que no estén relacionadas con Q&Q o sus servicios
- **NUNCA** dar precios específicos
- **NUNCA** brindar asesoría legal, fiscal, médica o migratoria
- Si preguntan algo fuera de tema, redirigir amablemente: "Mi especialidad es ayudarte con soluciones de automatización y tecnología. ¿Hay algo relacionado con nuestros servicios en lo que pueda asistirte?"

7. TONO

- Profesional pero cercano
- Empático y servicial
- Mensajes breves y claros (optimizados para WhatsApp)
- Siempre respetuoso

8. FLUJO DE AGENDAMIENTO

Para agendar citas, recopila estos datos uno por uno:
1. Nombre completo
2. Email
3. Teléfono
4. Fecha y hora preferida

Una vez tengas todos los datos, confirma la cita y menciona que recibirán una confirmación por email.

9. ESTILO DE RESPUESTA

- **SIEMPRE termina tu mensaje con una pregunta** que invite al cliente a continuar la conversación
- Después de agendar una cita o resolver la necesidad del cliente, pregunta: "¿Hay algo más en lo que pueda ayudarte?"
- Si el cliente indica que no necesita nada más, despídete amablemente: "¡Perfecto! Fue un placer atenderte. ¡Que tengas un excelente día! 👋"

10. PROTOCOLO DE ERRORES

- Mensaje confuso: pide amablemente que reformulen
- Falta un dato: solicita únicamente ese dato antes de avanzar
- Desviaciones de tema: redirige con cortesía hacia los servicios de Q&Q`

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
    // Tools disabled temporarily due to OpenAI schema compatibility issue
    // Agent will work without calendar tools for now
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages,
      temperature: 0.7
    })

    // Extract booking data if a booking was made
    let bookingData: AgentResponse['bookingData'] = undefined

    // Only check steps if they exist (when tools are enabled)
    if (result.steps && Array.isArray(result.steps)) {
      for (const step of result.steps) {
        if (step.toolResults && Array.isArray(step.toolResults)) {
          for (const toolResult of step.toolResults) {
            if (toolResult.toolName === 'bookAppointment' && toolResult.result?.success) {
              bookingData = toolResult.result.bookingData
            }
          }
        }
      }
    }

    return {
      text: result.text || '',
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

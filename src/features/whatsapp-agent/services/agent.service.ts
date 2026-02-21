// @ts-nocheck
/**
 * WhatsApp AI Agent Service
 * Handles conversation with AI and tool execution
 */

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

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

const CAL_TIMEZONE = process.env.CAL_TIMEZONE || 'America/Detroit'

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

**IMPORTANTE**: Tienes acceso a herramientas de calendario. Cuando el cliente quiera agendar una cita:
1. Usa la herramienta getAvailability para ver los horarios disponibles
2. Muestra las opciones al cliente
3. Recopila: nombre completo, email, teléfono
4. Usa la herramienta bookAppointment para confirmar la cita

9. ESTILO DE RESPUESTA

- **SIEMPRE termina tu mensaje con una pregunta** que invite al cliente a continuar la conversación
- Después de agendar una cita o resolver la necesidad del cliente, pregunta: "¿Hay algo más en lo que pueda ayudarte?"
- Si el cliente indica que no necesita nada más, despídete amablemente: "¡Perfecto! Fue un placer atenderte. ¡Que tengas un excelente día! 👋"

10. PROTOCOLO DE ERRORES

- Mensaje confuso: pide amablemente que reformulen
- Falta un dato: solicita únicamente ese dato antes de avanzar
- Desviaciones de tema: redirige con cortesía hacia los servicios de Q&Q`

// Generate mock availability
function generateMockAvailability(days: number) {
  const slots: Array<{ date: string; times: string[] }> = []
  const workHours = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
  const startDate = new Date()

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
      temperature: 0.7,
      tools: {
        getAvailability: {
          description: 'Obtiene la disponibilidad del calendario para los próximos días. Usa esta herramienta cuando el usuario quiera agendar una cita.',
          parameters: {
            type: 'object' as const,
            properties: {
              daysAhead: {
                type: 'number',
                description: 'Número de días a consultar (1-14). Por defecto 3.'
              }
            },
            required: [] as string[]
          },
          execute: async ({ daysAhead }: { daysAhead?: number }) => {
            const days = daysAhead ?? 3
            const slots = generateMockAvailability(days)
            return {
              success: true,
              slots,
              timezone: CAL_TIMEZONE,
              note: 'Horarios disponibles para los próximos días'
            }
          }
        },
        bookAppointment: {
          description: 'Agenda una cita en el calendario. Solo usar cuando tengas todos los datos confirmados: nombre, email, teléfono, fecha y hora.',
          parameters: {
            type: 'object' as const,
            properties: {
              name: { type: 'string', description: 'Nombre completo del cliente' },
              email: { type: 'string', description: 'Email del cliente' },
              phone: { type: 'string', description: 'Teléfono del cliente' },
              date: { type: 'string', description: 'Fecha de la cita en formato YYYY-MM-DD' },
              time: { type: 'string', description: 'Hora de la cita en formato HH:MM AM/PM' },
              notes: { type: 'string', description: 'Notas adicionales sobre la cita' }
            },
            required: ['name', 'email', 'phone', 'date', 'time'] as string[]
          },
          execute: async ({ name, email, phone, date, time, notes }: {
            name: string
            email: string
            phone: string
            date: string
            time: string
            notes?: string
          }) => {
            const scheduledAt = parseDateTime(date, time)

            if (!scheduledAt) {
              return {
                success: false,
                error: 'Formato de fecha/hora inválido'
              }
            }

            return {
              success: true,
              bookingData: {
                nombre_completo: name,
                email,
                telefono: phone,
                fecha_seleccionada: date,
                hora_seleccionada: time,
                scheduledAt: scheduledAt.toISOString(),
                calendarId: process.env.CAL_CALENDAR_ID || '',
                timezone: CAL_TIMEZONE,
                notes
              },
              message: `Cita agendada exitosamente para ${formatDateSpanish(scheduledAt)}`
            }
          }
        }
      },
      maxSteps: 5
    })

    // Extract booking data if a booking was made
    let bookingData: AgentResponse['bookingData'] = undefined

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
    console.error('Agent processing error:', errorMessage)

    // If tools cause an error, try without tools
    if (errorMessage.includes('schema') || errorMessage.includes('function')) {
      console.log('Retrying without tools...')
      try {
        const result = await generateText({
          model: openai('gpt-4o-mini'),
          messages,
          temperature: 0.7
        })
        return { text: result.text || '' }
      } catch (retryError) {
        console.error('Retry also failed:', retryError)
      }
    }

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

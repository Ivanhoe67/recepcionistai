// @ts-nocheck
/**
 * WhatsApp AI Agent Service
 * Simple conversational agent without tools (more reliable)
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
  timezone?: string
}

interface AgentResponse {
  text: string
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

**IMPORTANTE - TIENES ACCESO AL HISTORIAL COMPLETO DE LA CONVERSACIÓN**
- SIEMPRE revisa los mensajes anteriores para ver qué datos ya te dio el cliente
- NUNCA pidas información que el cliente ya proporcionó
- Si ya tienes el nombre, email, teléfono y horario, CONFIRMA LA CITA directamente

Proceso de agendamiento:
1. Cuando el cliente quiera agendar, menciona que hay disponibilidad de lunes a viernes de 9AM a 5PM (hora del Este)
2. Recopila UNO POR UNO (no pidas todo junto):
   - Nombre completo
   - Email
   - Teléfono (si no lo tienes ya del WhatsApp)
   - Fecha y hora preferida
3. Cuando tengas TODOS los datos, di EXACTAMENTE esto (adapta al idioma):
   "¡Perfecto [nombre]! He registrado tu solicitud de cita para el [fecha] a las [hora]. Nuestro equipo te contactará pronto para confirmar los detalles. ¿Hay algo más en lo que pueda ayudarte?"

**IMPORTANTE - NUNCA MENTIR**:
- NO digas que la cita "está confirmada" - di que "está registrada" o "solicitada"
- NO prometas enviar emails de confirmación automáticos
- SÉ HONESTO: el equipo contactará al cliente para confirmar

9. ESTILO DE RESPUESTA

- **SIEMPRE termina tu mensaje con una pregunta** que invite al cliente a continuar la conversación
- **NUNCA des por terminada la conversación** hasta que:
  1. La cita haya sido confirmada, O
  2. El cliente diga explícitamente que NO quiere agendar
- Mientras no ocurra ninguna de estas dos cosas, sigue ofreciendo ayuda y haciendo preguntas
- Si el cliente indica que no necesita nada más, despídete: "¡Perfecto! Fue un placer atenderte. ¡Que tengas un excelente día! 👋"

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
**Zona horaria:** ${config.timezone || 'America/Detroit'}

**RECORDATORIO CRÍTICO**: Revisa el historial de conversación antes de responder. NO pidas datos que el cliente ya proporcionó.`

  const messages: Message[] = [
    { role: 'system', content: fullSystemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]

  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages,
      temperature: 0.7
    })

    let finalText = result.text || ''

    // Ensure we always have a response
    if (!finalText || finalText.length < 5) {
      finalText = '¿En qué puedo ayudarte hoy?'
    }

    return { text: finalText }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Agent processing error:', errorMessage)

    return {
      text: 'Disculpa, tuve un problema técnico. ¿Podrías repetir tu mensaje?'
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

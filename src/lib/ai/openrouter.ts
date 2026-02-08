import { createOpenAI } from '@ai-sdk/openai'

/**
 * OpenRouter Client Configuration
 *
 * OpenRouter provides access to 300+ AI models through a unified API.
 * We use it instead of direct OpenAI to have flexibility in model choice.
 */

// Create OpenAI-compatible client pointing to OpenRouter
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://recepcionistai.com',
    'X-Title': 'RecepcionistAI',
  },
})

/**
 * Model Configurations
 *
 * Organized by use case for easy selection
 */
export const MODELS = {
  // Fast and cheap for support chat
  balanced: 'openai/gpt-4o-mini',

  // More capable for complex questions
  advanced: 'openai/gpt-4o',

  // For embeddings (RAG)
  embedding: 'text-embedding-3-small',
} as const

/**
 * System Prompts
 */
export const SYSTEM_PROMPTS = {
  support: `Eres el asistente de soporte de RecepcionistAI, una plataforma de recepcionista virtual con IA.

Tu objetivo es ayudar a usuarios con:
- Preguntas sobre características del producto (llamadas, SMS, WhatsApp)
- Problemas de configuración de su negocio
- Preguntas sobre planes y facturación
- Integración con Twilio/Retell.ai

Responde de manera:
- Profesional y amigable
- Concisa (máximo 200 palabras por respuesta)
- En español
- Con ejemplos prácticos cuando sea útil

Si el usuario tiene un problema que no puedes resolver, sugiérele usar el botón "Hablar con Humano" para crear un ticket de soporte.

NO inventes información. Si no sabes algo, dilo honestamente.`,
}

/**
 * AI Configuration defaults
 */
export const AI_CONFIG = {
  temperature: 0.7,
  maxTokens: 500,
  topP: 1,
} as const

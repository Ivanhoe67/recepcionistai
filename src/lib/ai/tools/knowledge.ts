// @ts-nocheck
import { tool } from 'ai'
import { z } from 'zod'
import { findRelevantContent, formatContextForAI } from '../rag'

/**
 * Knowledge Base Tool
 *
 * Allows AI to search support documentation for accurate information.
 * Uses semantic search (RAG) to find relevant content.
 */

export const knowledgeBaseTool = tool({
  description: `Busca información en la base de conocimientos de RecepcionistAI.
  Úsalo cuando necesites información específica sobre:
  - Características y funcionalidades
  - Configuración e integración
  - Facturación y planes
  - Solución de problemas técnicos
  - Guías y tutoriales`,

  parameters: z.object({
    query: z.string().describe('La pregunta o tema a buscar en la base de conocimientos'),
  }),

  execute: async ({ query }) => {
    try {
      // Search knowledge base with semantic search
      const results = await findRelevantContent(query, 5, 0.5)

      // Format results for AI consumption
      const context = formatContextForAI(results)

      return {
        success: true,
        context,
        resultsCount: results.length,
      }
    } catch (error) {
      console.error('Knowledge tool error:', error)
      return {
        success: false,
        context: 'No se pudo acceder a la base de conocimientos en este momento.',
        resultsCount: 0,
      }
    }
  },
})

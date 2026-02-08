// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'

/**
 * RAG (Retrieval Augmented Generation) Service
 *
 * Performs semantic search over support documentation
 * to find relevant context for AI responses.
 */

export interface SearchResult {
  id: string
  content: string
  title: string
  category: string
  similarity: number
}

/**
 * Find relevant content using semantic search
 *
 * @param query - User's question
 * @param limit - Max results to return (default 5)
 * @param threshold - Minimum similarity score (default 0.5)
 * @returns Array of relevant content chunks
 */
export async function findRelevantContent(
  query: string,
  limit = 5,
  threshold = 0.5
): Promise<SearchResult[]> {
  try {
    const supabase = await createClient()

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Search using vector similarity (cosine distance via pgvector)
    const { data, error } = await supabase.rpc('match_support_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      console.error('Semantic search error:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Map results to SearchResult format
    return data.map((result: {
      id: string
      content: string
      title: string
      category: string
      similarity: number
    }) => ({
      id: result.id,
      content: result.content,
      title: result.title,
      category: result.category,
      similarity: result.similarity,
    }))
  } catch (error) {
    console.error('RAG search failed:', error)
    return []
  }
}

/**
 * Format search results into context string for AI
 */
export function formatContextForAI(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No se encontró información relevante en la base de conocimientos.'
  }

  const context = results
    .map(
      (result, index) =>
        `[${index + 1}] ${result.title} (${result.category})\n${result.content}`
    )
    .join('\n\n')

  return `Información de la base de conocimientos:\n\n${context}`
}

/**
 * Get all available categories in knowledge base
 */
export async function getKnowledgeCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('support_resources')
    .select('category')
    .order('category')

  if (!data) return []

  // Get unique categories
  const categories = [...new Set(data.map((d) => d.category))]
  return categories
}

import { embed, embedMany } from 'ai'
import { openrouter, MODELS } from './openrouter'

/**
 * Generate embedding for a single text
 *
 * Used for: Query embeddings in RAG search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openrouter.embedding(MODELS.embedding),
    value: text,
  })

  return embedding
}

/**
 * Generate embeddings for multiple texts in batch
 *
 * Used for: Indexing documentation chunks
 * More efficient than calling generateEmbedding() multiple times
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: openrouter.embedding(MODELS.embedding),
    values: texts,
  })

  return embeddings
}

/**
 * Calculate cosine similarity between two embeddings
 *
 * Used for: Manual similarity checks (Supabase handles this with vector ops)
 * @returns Similarity score between 0 and 1 (1 = identical)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Document Chunking Utilities
 *
 * Split large documents into smaller chunks for RAG indexing.
 * Chunks need to be small enough for:
 * 1. Embedding model context window
 * 2. Efficient vector search
 * 3. Focused AI responses
 */

export interface TextChunk {
  content: string
  startIndex: number
  endIndex: number
}

/**
 * Split text into chunks with overlap
 *
 * @param text - Text to split
 * @param maxChunkSize - Maximum characters per chunk (default: 500)
 * @param overlap - Characters to overlap between chunks (default: 50)
 * @returns Array of text chunks
 *
 * Example:
 * ```
 * const chunks = chunkText(longDocument, 500, 50)
 * // chunks[0]: chars 0-500
 * // chunks[1]: chars 450-950 (50 char overlap)
 * // chunks[2]: chars 900-1400
 * ```
 */
export function chunkText(
  text: string,
  maxChunkSize: number = 500,
  overlap: number = 50
): TextChunk[] {
  if (text.length <= maxChunkSize) {
    return [{ content: text, startIndex: 0, endIndex: text.length }]
  }

  const chunks: TextChunk[] = []
  let startIndex = 0

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + maxChunkSize, text.length)
    let chunkEndIndex = endIndex

    // Try to break at sentence boundary
    if (endIndex < text.length) {
      const sentenceEnd = text
        .substring(startIndex, endIndex)
        .lastIndexOf('. ')
      if (sentenceEnd > maxChunkSize / 2) {
        // Only break if we're past halfway
        chunkEndIndex = startIndex + sentenceEnd + 1
      }
    }

    chunks.push({
      content: text.substring(startIndex, chunkEndIndex).trim(),
      startIndex,
      endIndex: chunkEndIndex,
    })

    // Move start index forward, accounting for overlap
    startIndex = chunkEndIndex - overlap
    if (startIndex <= chunks[chunks.length - 1].startIndex) {
      // Prevent infinite loop if overlap is too large
      startIndex = chunkEndIndex
    }
  }

  return chunks
}

/**
 * Split text by paragraphs first, then chunk if needed
 *
 * Better for markdown/structured content
 */
export function chunkByParagraphs(
  text: string,
  maxChunkSize: number = 500
): TextChunk[] {
  const paragraphs = text.split(/\n\n+/)
  const chunks: TextChunk[] = []
  let currentIndex = 0

  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) continue

    if (paragraph.length <= maxChunkSize) {
      chunks.push({
        content: paragraph.trim(),
        startIndex: currentIndex,
        endIndex: currentIndex + paragraph.length,
      })
    } else {
      // Paragraph too long, chunk it further
      const subChunks = chunkText(paragraph, maxChunkSize, 50)
      chunks.push(
        ...subChunks.map((chunk) => ({
          ...chunk,
          startIndex: currentIndex + chunk.startIndex,
          endIndex: currentIndex + chunk.endIndex,
        }))
      )
    }

    currentIndex += paragraph.length + 2 // +2 for \n\n
  }

  return chunks
}

/**
 * Split markdown by headers, then chunk sections
 *
 * Preserves document structure for better context
 */
export function chunkMarkdown(
  markdown: string,
  maxChunkSize: number = 500
): TextChunk[] {
  const sections = markdown.split(/^#{1,6}\s+/m)
  const chunks: TextChunk[] = []
  let currentIndex = 0

  for (const section of sections) {
    if (section.trim().length === 0) continue

    const sectionChunks = chunkByParagraphs(section, maxChunkSize)
    chunks.push(
      ...sectionChunks.map((chunk) => ({
        ...chunk,
        startIndex: currentIndex + chunk.startIndex,
        endIndex: currentIndex + chunk.endIndex,
      }))
    )

    currentIndex += section.length
  }

  return chunks
}

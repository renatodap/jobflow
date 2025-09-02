import { encodingForModel } from 'tiktoken'

export interface ChunkingOptions {
  maxTokens: number // Maximum tokens per chunk (default: 512)
  overlap: number   // Token overlap between chunks (default: 50)
  preserveSentences: boolean // Try to preserve sentence boundaries (default: true)
  model: string     // Model for token counting (default: 'gpt-4')
}

export interface TextChunk {
  text: string
  startIndex: number
  endIndex: number
  tokenCount: number
  chunkIndex: number
  pageNumber?: number
}

export interface ChunkingResult {
  chunks: TextChunk[]
  totalChunks: number
  totalTokens: number
  averageChunkSize: number
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  maxTokens: 512,
  overlap: 50,
  preserveSentences: true,
  model: 'gpt-4'
}

// Simple sentence boundary detection
function splitIntoSentences(text: string): Array<{ text: string; start: number; end: number }> {
  const sentences: Array<{ text: string; start: number; end: number }> = []
  
  // Split on sentence-ending punctuation followed by space/newline
  const sentenceRegex = /[.!?]+[\s\n]+/g
  let lastIndex = 0
  let match

  while ((match = sentenceRegex.exec(text)) !== null) {
    const endIndex = match.index + match[0].length
    const sentenceText = text.slice(lastIndex, endIndex).trim()
    
    if (sentenceText.length > 0) {
      sentences.push({
        text: sentenceText,
        start: lastIndex,
        end: endIndex
      })
    }
    
    lastIndex = endIndex
  }

  // Add remaining text as final sentence
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim()
    if (remaining.length > 0) {
      sentences.push({
        text: remaining,
        start: lastIndex,
        end: text.length
      })
    }
  }

  return sentences
}

function countTokens(text: string, model: string): number {
  try {
    const encoding = encodingForModel(model as any)
    const tokens = encoding.encode(text)
    encoding.free()
    return tokens.length
  } catch (error) {
    // Fallback: rough estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4)
  }
}

export function chunkText(
  text: string, 
  options: Partial<ChunkingOptions> = {},
  pageNumber?: number
): ChunkingResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const chunks: TextChunk[] = []
  
  if (!text.trim()) {
    return {
      chunks: [],
      totalChunks: 0,
      totalTokens: 0,
      averageChunkSize: 0
    }
  }

  // If text is small enough, return as single chunk
  const totalTokens = countTokens(text, opts.model)
  if (totalTokens <= opts.maxTokens) {
    return {
      chunks: [{
        text: text.trim(),
        startIndex: 0,
        endIndex: text.length,
        tokenCount: totalTokens,
        chunkIndex: 0,
        pageNumber
      }],
      totalChunks: 1,
      totalTokens,
      averageChunkSize: totalTokens
    }
  }

  if (opts.preserveSentences) {
    // Sentence-aware chunking
    const sentences = splitIntoSentences(text)
    let currentChunk = ''
    let currentTokens = 0
    let chunkStartIndex = 0
    let chunkIndex = 0

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const sentenceTokens = countTokens(sentence.text, opts.model)
      
      // If adding this sentence would exceed max tokens, finish current chunk
      if (currentTokens + sentenceTokens > opts.maxTokens && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          startIndex: chunkStartIndex,
          endIndex: sentence.start,
          tokenCount: currentTokens,
          chunkIndex: chunkIndex++,
          pageNumber
        })

        // Start new chunk with overlap
        const overlapText = getOverlapText(currentChunk, opts.overlap, opts.model)
        currentChunk = overlapText + sentence.text
        currentTokens = countTokens(currentChunk, opts.model)
        chunkStartIndex = sentence.start - overlapText.length
      } else {
        // Add sentence to current chunk
        if (currentChunk.length === 0) {
          chunkStartIndex = sentence.start
        }
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence.text
        currentTokens = countTokens(currentChunk, opts.model)
      }
    }

    // Add final chunk if there's remaining content
    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex: chunkStartIndex,
        endIndex: text.length,
        tokenCount: currentTokens,
        chunkIndex: chunkIndex++,
        pageNumber
      })
    }
  } else {
    // Simple token-based chunking (fallback)
    const words = text.split(/\s+/)
    let currentChunk = ''
    let currentTokens = 0
    let chunkStartIndex = 0
    let chunkIndex = 0
    let wordIndex = 0

    for (const word of words) {
      const testChunk = currentChunk + (currentChunk ? ' ' : '') + word
      const testTokens = countTokens(testChunk, opts.model)

      if (testTokens > opts.maxTokens && currentChunk.length > 0) {
        // Finish current chunk
        const chunkEndIndex = text.indexOf(currentChunk, chunkStartIndex) + currentChunk.length
        
        chunks.push({
          text: currentChunk.trim(),
          startIndex: chunkStartIndex,
          endIndex: chunkEndIndex,
          tokenCount: currentTokens,
          chunkIndex: chunkIndex++,
          pageNumber
        })

        // Start new chunk with overlap
        const overlapText = getOverlapText(currentChunk, opts.overlap, opts.model)
        currentChunk = overlapText + word
        currentTokens = countTokens(currentChunk, opts.model)
        chunkStartIndex = chunkEndIndex - overlapText.length
      } else {
        currentChunk = testChunk
        currentTokens = testTokens
        if (wordIndex === 0) {
          chunkStartIndex = 0
        }
      }
      wordIndex++
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex: chunkStartIndex,
        endIndex: text.length,
        tokenCount: currentTokens,
        chunkIndex: chunkIndex++,
        pageNumber
      })
    }
  }

  const averageChunkSize = chunks.length > 0 
    ? chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) / chunks.length 
    : 0

  return {
    chunks,
    totalChunks: chunks.length,
    totalTokens,
    averageChunkSize: Math.round(averageChunkSize)
  }
}

function getOverlapText(text: string, overlapTokens: number, model: string): string {
  if (overlapTokens <= 0) return ''
  
  // Simple approach: take last N words that fit in overlap token count
  const words = text.trim().split(/\s+/)
  let overlapText = ''
  let tokenCount = 0
  
  for (let i = words.length - 1; i >= 0; i--) {
    const testText = words[i] + (overlapText ? ' ' + overlapText : '')
    const testTokens = countTokens(testText, model)
    
    if (testTokens <= overlapTokens) {
      overlapText = testText
      tokenCount = testTokens
    } else {
      break
    }
  }
  
  return overlapText ? overlapText + ' ' : ''
}

export function chunkTextByPages(
  pages: Array<{ pageNumber: number; text: string }>,
  options: Partial<ChunkingOptions> = {}
): ChunkingResult {
  const allChunks: TextChunk[] = []
  let totalTokens = 0
  let chunkIndex = 0

  for (const page of pages) {
    const pageResult = chunkText(page.text, options, page.pageNumber)
    
    // Update chunk indices to be global
    pageResult.chunks.forEach(chunk => {
      chunk.chunkIndex = chunkIndex++
      allChunks.push(chunk)
    })
    
    totalTokens += pageResult.totalTokens
  }

  const averageChunkSize = allChunks.length > 0 
    ? allChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) / allChunks.length 
    : 0

  return {
    chunks: allChunks,
    totalChunks: allChunks.length,
    totalTokens,
    averageChunkSize: Math.round(averageChunkSize)
  }
}
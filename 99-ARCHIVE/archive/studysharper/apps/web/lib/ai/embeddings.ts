import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface EmbeddingResult {
  embedding: number[]
  tokens: number
  model: string
}

export interface BatchEmbeddingResult {
  embeddings: number[][]
  total_tokens: number
  model: string
  cost_estimate: number
}

const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_BATCH_SIZE = 100
const DIMENSIONS = 1536

// Pricing per 1M tokens (as of 2024)
const PRICING = {
  'text-embedding-3-small': 0.02,
  'text-embedding-3-large': 0.13,
  'text-embedding-ada-002': 0.10
}

export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: DIMENSIONS
    })

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage.total_tokens,
      model: response.model
    }
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateBatchEmbeddings(
  texts: string[],
  options?: { 
    model?: string
    dimensions?: number 
  }
): Promise<BatchEmbeddingResult> {
  const model = options?.model || EMBEDDING_MODEL
  const dimensions = options?.dimensions || DIMENSIONS
  
  if (texts.length === 0) {
    return {
      embeddings: [],
      total_tokens: 0,
      model,
      cost_estimate: 0
    }
  }

  try {
    const embeddings: number[][] = []
    let totalTokens = 0

    // Process in batches to avoid API limits
    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE)
      
      const response = await openai.embeddings.create({
        model,
        input: batch,
        dimensions
      })

      embeddings.push(...response.data.map(d => d.embedding))
      totalTokens += response.usage.total_tokens

      // Add small delay between batches to avoid rate limiting
      if (i + MAX_BATCH_SIZE < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Calculate cost estimate
    const costPerToken = PRICING[model as keyof typeof PRICING] || 0.02
    const costEstimate = (totalTokens / 1_000_000) * costPerToken

    return {
      embeddings,
      total_tokens: totalTokens,
      model,
      cost_estimate: costEstimate
    }
  } catch (error) {
    console.error('Batch embedding generation error:', error)
    throw new Error(`Failed to generate batch embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateEmbeddingsWithRetry(
  texts: string[],
  maxRetries = 3,
  retryDelay = 1000
): Promise<BatchEmbeddingResult> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateBatchEmbeddings(texts)
    } catch (error) {
      lastError = error as Error
      console.error(`Embedding attempt ${attempt + 1} failed:`, error)
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('rate')) {
        // Exponential backoff for rate limits
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else if (attempt < maxRetries - 1) {
        // Regular retry delay for other errors
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw lastError || new Error('Failed to generate embeddings after retries')
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

export async function findSimilarChunks(
  queryEmbedding: number[],
  chunkEmbeddings: Array<{ id: string; embedding: number[] }>,
  options?: {
    topK?: number
    threshold?: number
  }
): Promise<Array<{ id: string; similarity: number }>> {
  const topK = options?.topK || 10
  const threshold = options?.threshold || 0.7

  const similarities = chunkEmbeddings.map(chunk => ({
    id: chunk.id,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }))

  // Filter by threshold and sort by similarity
  const filtered = similarities
    .filter(s => s.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)

  return filtered
}
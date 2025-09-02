import { z } from 'zod'
import type { AIProvider, Message, ChatResponse } from './types.js'
import type { VectorStore, RetrievedChunk } from './vector-store.js'

export interface RAGResponse {
  answer: string
  sources: string[]
  confidence: number
  chunks: RetrievedChunk[]
}

const QueryInputSchema = z.object({
  question: z.string().min(1),
  userId: z.string().uuid(),
  courseId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  maxChunks: z.number().min(1).max(10).default(5)
})

export type QueryInput = z.infer<typeof QueryInputSchema>

export class RAGPipeline {
  constructor(
    private aiProvider: AIProvider,
    private vectorStore: VectorStore
  ) {}

  async query(input: QueryInput): Promise<RAGResponse> {
    const validated = QueryInputSchema.parse(input)
    const { question, userId, courseId, subjectId, maxChunks } = validated

    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(question)
      
      // 2. Retrieve relevant chunks
      const retrievedChunks = await this.retrieveChunks({
        embedding: queryEmbedding,
        userId,
        courseId,
        subjectId,
        limit: maxChunks
      })

      // 3. Rerank and filter chunks
      const rankedChunks = this.rerankChunks(retrievedChunks, question)
      
      // 4. Prepare context
      const context = this.prepareContext(rankedChunks)
      
      // 5. Generate response
      const response = await this.generateResponse(question, context)
      
      // 6. Calculate confidence
      const confidence = this.calculateConfidence(rankedChunks, response)

      return {
        answer: response.content,
        sources: [...new Set(rankedChunks.map(chunk => chunk.noteId))],
        confidence,
        chunks: rankedChunks
      }
    } catch (error) {
      console.error('RAG pipeline error:', error)
      throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async generateQueryEmbedding(question: string): Promise<number[]> {
    const embeddingResponse = await this.aiProvider.embed([question])
    return embeddingResponse.embeddings[0]
  }

  private async retrieveChunks(params: {
    embedding: number[]
    userId: string
    courseId?: string
    subjectId?: string
    limit: number
  }): Promise<RetrievedChunk[]> {
    // This would query the vector database
    // For now, return mock data
    return [
      {
        noteId: 'note-1',
        text: 'Sample content chunk about the query topic...',
        similarity: 0.85,
        metadata: { page: 1, section: 'Introduction' }
      },
      {
        noteId: 'note-2', 
        text: 'Another relevant chunk with more details...',
        similarity: 0.78,
        metadata: { page: 3, section: 'Methodology' }
      }
    ]
  }

  private rerankChunks(chunks: RetrievedChunk[], question: string): RetrievedChunk[] {
    // Simple reranking based on keyword overlap
    const questionWords = new Set(
      question.toLowerCase().split(/\W+/).filter(word => word.length > 2)
    )

    return chunks
      .map(chunk => {
        const chunkWords = new Set(
          chunk.text.toLowerCase().split(/\W+/).filter(word => word.length > 2)
        )
        
        const overlap = new Set([...questionWords].filter(word => chunkWords.has(word)))
        const keywordScore = overlap.size / questionWords.size
        
        return {
          ...chunk,
          similarity: chunk.similarity * 0.7 + keywordScore * 0.3
        }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5) // Top 5 chunks
  }

  private prepareContext(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) {
      return 'No relevant content found.'
    }

    return chunks
      .map((chunk, index) => `[Source ${index + 1}]: ${chunk.text}`)
      .join('\n\n')
  }

  private async generateResponse(question: string, context: string): Promise<ChatResponse> {
    const systemPrompt = `You are a helpful study assistant. Answer the user's question based on the provided context from their study materials.

Instructions:
- Use only the information from the provided context
- If the context doesn't contain enough information, say so
- Provide specific, actionable answers
- Reference sources when appropriate
- Be concise but thorough

Context:
${context}`

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ]

    return await this.aiProvider.chat(messages, {
      temperature: 0.3,
      maxTokens: 500
    })
  }

  private calculateConfidence(chunks: RetrievedChunk[], response: ChatResponse): number {
    if (chunks.length === 0) return 0

    // Calculate confidence based on:
    // 1. Average similarity of retrieved chunks
    // 2. Number of chunks found
    // 3. Response quality indicators

    const avgSimilarity = chunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / chunks.length
    const chunkCountFactor = Math.min(chunks.length / 3, 1) // Normalize to max of 3 chunks
    
    // Simple confidence calculation
    const confidence = (avgSimilarity * 0.7 + chunkCountFactor * 0.3)
    
    return Math.round(confidence * 100) / 100
  }

  async generateQuestions(content: string): Promise<string[]> {
    const systemPrompt = `Generate 3-5 study questions based on the provided content. Questions should:
- Test understanding of key concepts
- Be specific and answerable from the content
- Vary in difficulty (some recall, some analysis)
- Be suitable for self-study

Format as a simple list.`

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Content:\n${content.slice(0, 2000)}...` }
    ]

    const response = await this.aiProvider.chat(messages, {
      temperature: 0.5,
      maxTokens: 300
    })

    return response.content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5)
  }

  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    const systemPrompt = `Summarize the following content in ${maxLength} words or less. Focus on:
- Key concepts and main points
- Important facts and figures
- Actionable information

Be concise and clear.`

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: content }
    ]

    const response = await this.aiProvider.chat(messages, {
      temperature: 0.3,
      maxTokens: Math.floor(maxLength * 1.5) // Account for token vs word ratio
    })

    return response.content
  }
}

// VectorStore interface is now imported from vector-store.ts
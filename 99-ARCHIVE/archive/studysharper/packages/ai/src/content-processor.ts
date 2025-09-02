import { z } from 'zod'

export interface ProcessedContent {
  title: string
  content: string
  chunks: string[]
  metadata: Record<string, any>
  wordCount: number
  estimatedReadingTime: number
}

export interface ContentChunk {
  text: string
  index: number
  metadata: {
    startPage?: number
    endPage?: number
    section?: string
  }
}

const ProcessFileInputSchema = z.object({
  file: z.any(), // File object
  title: z.string().optional(),
  courseId: z.string().uuid(),
  extractImages: z.boolean().default(false)
})

export type ProcessFileInput = z.infer<typeof ProcessFileInputSchema>

export class ContentProcessor {
  private readonly maxChunkSize = 512 // tokens
  private readonly chunkOverlap = 50 // tokens

  async processFile(input: ProcessFileInput): Promise<ProcessedContent> {
    const validated = ProcessFileInputSchema.parse(input)
    const { file, title, courseId } = validated

    // Validate file type
    this.validateFile(file)

    // Extract text content based on file type
    const textContent = await this.extractText(file)
    
    // Create chunks for embedding
    const chunks = this.chunkText(textContent)
    
    // Calculate metadata
    const wordCount = this.countWords(textContent)
    const estimatedReadingTime = Math.ceil(wordCount / 250) // avg reading speed

    return {
      title: title || file.name,
      content: textContent,
      chunks: chunks.map(chunk => chunk.text),
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        courseId,
        chunkCount: chunks.length
      },
      wordCount,
      estimatedReadingTime
    }
  }

  private validateFile(file: File): void {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`)
    }

    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      throw new Error(`File too large: ${file.size} bytes (max: ${maxSize})`)
    }
  }

  private async extractText(file: File): Promise<string> {
    const fileType = file.type

    switch (fileType) {
      case 'text/plain':
      case 'text/markdown':
        return await file.text()
      
      case 'application/pdf':
        return await this.extractPdfText(file)
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractDocxText(file)
      
      default:
        throw new Error(`Unsupported file type for text extraction: ${fileType}`)
    }
  }

  private async extractPdfText(file: File): Promise<string> {
    // For now, return a placeholder - in production we'd use pdf-parse or similar
    // This would require server-side processing or a client-side PDF.js integration
    return `[PDF content extraction would be implemented here for file: ${file.name}]
    
This is a placeholder for PDF text extraction. In a full implementation, we would:
1. Use PDF.js for client-side extraction, or
2. Send to server endpoint for server-side processing with pdf-parse
3. Extract text while preserving structure and metadata
4. Handle images, tables, and formatting

File size: ${file.size} bytes
File type: ${file.type}`
  }

  private async extractDocxText(file: File): Promise<string> {
    // Placeholder for DOCX extraction
    return `[DOCX content extraction would be implemented here for file: ${file.name}]`
  }

  private chunkText(text: string): ContentChunk[] {
    const chunks: ContentChunk[] = []
    const sentences = this.splitIntoSentences(text)
    
    let currentChunk = ''
    let currentTokenCount = 0
    let chunkIndex = 0

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokenCount(sentence)
      
      // If adding this sentence would exceed max chunk size, start a new chunk
      if (currentTokenCount + sentenceTokens > this.maxChunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex++,
          metadata: {}
        })
        
        // Start new chunk with overlap from previous chunk
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-this.chunkOverlap)
        currentChunk = overlapWords.join(' ') + ' ' + sentence
        currentTokenCount = this.estimateTokenCount(currentChunk)
      } else {
        currentChunk += ' ' + sentence
        currentTokenCount += sentenceTokens
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        metadata: {}
      })
    }

    return chunks
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - could be enhanced with NLP libraries
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 0.75 words
    return Math.ceil(text.split(' ').length * 1.33)
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length
  }

  async generateSummary(content: string): Promise<string> {
    // This would integrate with the AI provider to generate summaries
    const words = content.split(' ')
    const firstSentences = content.split('.').slice(0, 3).join('.')
    
    return `Summary (${words.length} words): ${firstSentences}...`
  }

  async extractKeyTerms(content: string): Promise<string[]> {
    // Simple keyword extraction - could be enhanced with NLP
    const words = content.toLowerCase().split(/\W+/)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
    
    const wordFreq = new Map<string, number>()
    
    words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
      })

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }
}
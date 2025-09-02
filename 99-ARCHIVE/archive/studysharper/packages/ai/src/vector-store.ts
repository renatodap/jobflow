import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface VectorChunk {
  noteId: string
  text: string
  embedding: number[]
  metadata: Record<string, any>
}

export interface RetrievedChunk {
  noteId: string
  text: string
  similarity: number
  metadata: Record<string, any>
}

export interface VectorStore {
  store(chunks: VectorChunk[]): Promise<void>
  search(embedding: number[], limit: number, filters?: VectorSearchFilters): Promise<RetrievedChunk[]>
  delete(noteId: string): Promise<void>
  deleteUser(userId: string): Promise<void>
}

export interface VectorSearchFilters {
  userId?: string
  courseId?: string
  subjectId?: string
  noteIds?: string[]
  minSimilarity?: number
}

export class SupabaseVectorStore implements VectorStore {
  private supabase: SupabaseClient

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async store(chunks: VectorChunk[]): Promise<void> {
    if (chunks.length === 0) return

    // Insert chunks into note_embeddings table
    const { error } = await this.supabase
      .from('note_embeddings')
      .insert(
        chunks.map(chunk => ({
          note_id: chunk.noteId,
          chunk_text: chunk.text,
          embedding: `[${chunk.embedding.join(',')}]`, // PostgreSQL array format
          metadata: chunk.metadata
        }))
      )

    if (error) {
      throw new Error(`Failed to store vector chunks: ${error.message}`)
    }
  }

  async search(
    embedding: number[], 
    limit: number = 5, 
    filters: VectorSearchFilters = {}
  ): Promise<RetrievedChunk[]> {
    try {
      // Build the query with RLS automatically applied
      let query = this.supabase
        .from('note_embeddings')
        .select(`
          note_id,
          chunk_text,
          embedding,
          metadata,
          notes!inner(
            id,
            title,
            user_id,
            subject_id,
            subjects(
              course_id,
              courses(
                term_id,
                terms(
                  school_id,
                  schools(user_id)
                )
              )
            )
          )
        `)

      // Apply filters
      if (filters.userId) {
        query = query.eq('notes.user_id', filters.userId)
      }

      if (filters.courseId) {
        query = query.eq('notes.subjects.course_id', filters.courseId)
      }

      if (filters.subjectId) {
        query = query.eq('notes.subject_id', filters.subjectId)
      }

      if (filters.noteIds && filters.noteIds.length > 0) {
        query = query.in('note_id', filters.noteIds)
      }

      // Execute query
      const { data, error } = await query.limit(limit * 2) // Get more to allow for similarity filtering

      if (error) {
        console.error('Vector search error:', error)
        throw new Error(`Vector search failed: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return []
      }

      // Calculate cosine similarity for each chunk
      const embeddingVector = embedding
      const results: RetrievedChunk[] = []

      for (const row of data) {
        try {
          // Parse the embedding vector from PostgreSQL array format
          const chunkEmbedding = this.parseEmbedding(row.embedding)
          
          if (chunkEmbedding && chunkEmbedding.length === embeddingVector.length) {
            const similarity = this.cosineSimilarity(embeddingVector, chunkEmbedding)
            
            // Apply minimum similarity filter
            if (!filters.minSimilarity || similarity >= filters.minSimilarity) {
              results.push({
                noteId: row.note_id,
                text: row.chunk_text,
                similarity,
                metadata: {
                  ...row.metadata,
                  noteTitle: (row.notes as any)?.title,
                  subjectId: (row.notes as any)?.subject_id
                }
              })
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse embedding for chunk:', parseError)
          // Continue with next chunk
        }
      }

      // Sort by similarity and return top results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

    } catch (error) {
      console.error('Vector search error:', error)
      // Return empty results rather than throwing, to gracefully degrade
      return []
    }
  }

  async delete(noteId: string): Promise<void> {
    const { error } = await this.supabase
      .from('note_embeddings')
      .delete()
      .eq('note_id', noteId)

    if (error) {
      throw new Error(`Failed to delete note embeddings: ${error.message}`)
    }
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete all embeddings for notes owned by the user
    // First get the note IDs, then delete embeddings
    const { data: userNotes } = await this.supabase
      .from('notes')
      .select('id')
      .eq('user_id', userId)

    if (userNotes && userNotes.length > 0) {
      const noteIds = userNotes.map(note => note.id)
      const { error } = await this.supabase
        .from('note_embeddings')
        .delete()
        .in('note_id', noteIds)

      if (error) {
        throw new Error(`Failed to delete user embeddings: ${error.message}`)
      }
    }
  }

  private parseEmbedding(embeddingData: any): number[] | null {
    try {
      if (typeof embeddingData === 'string') {
        // Handle PostgreSQL array format like "[1,2,3]"
        return JSON.parse(embeddingData)
      } else if (Array.isArray(embeddingData)) {
        return embeddingData
      } else {
        return null
      }
    } catch (error) {
      console.warn('Failed to parse embedding:', error)
      return null
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (normA * normB)
  }

  // Helper method to test vector store connection
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('note_embeddings')
        .select('id')
        .limit(1)

      return !error
    } catch (error) {
      console.error('Vector store connection test failed:', error)
      return false
    }
  }

  // Helper method to get embedding statistics
  async getStats(userId?: string): Promise<{
    totalChunks: number
    totalNotes: number
    avgChunksPerNote: number
  }> {
    try {
      let query = this.supabase
        .from('note_embeddings')
        .select('note_id', { count: 'exact' })

      if (userId) {
        query = query.eq('notes.user_id', userId)
      }

      const { count: totalChunks, error } = await query

      if (error) {
        throw new Error(`Failed to get stats: ${error.message}`)
      }

      // Get unique note count
      const { data: noteData, error: noteError } = await this.supabase
        .from('note_embeddings')
        .select('note_id')
        .then((result: any) => ({
          ...result,
          data: result.data ? Array.from(new Set(result.data.map((item: any) => item.note_id))) : null
        }))

      const totalNotes = noteData?.length || 0
      const avgChunksPerNote = totalNotes > 0 ? (totalChunks || 0) / totalNotes : 0

      return {
        totalChunks: totalChunks || 0,
        totalNotes,
        avgChunksPerNote
      }
    } catch (error) {
      console.error('Failed to get vector store stats:', error)
      return { totalChunks: 0, totalNotes: 0, avgChunksPerNote: 0 }
    }
  }
}
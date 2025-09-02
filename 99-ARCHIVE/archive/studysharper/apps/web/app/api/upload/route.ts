import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ContentProcessor, SupabaseVectorStore, createAIRouter } from '@studysharper/ai'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string | undefined

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.type}` 
      }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large (max 50MB)' 
      }, { status: 400 })
    }

    // Verify user has access to the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        terms!inner(
          schools!inner(user_id)
        )
      `)
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if ((course.terms as any)?.schools?.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Process the file
    const contentProcessor = new ContentProcessor()
    
    const processedContent = await contentProcessor.processFile({
      file,
      title,
      courseId,
      extractImages: false
    })

    // Save note to database
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: session.user.id,
        title: processedContent.title,
        content: processedContent.content,
        format: 'processed',
        metadata: {
          ...processedContent.metadata,
          original_filename: file.name,
          file_size: file.size,
          file_type: file.type,
          word_count: processedContent.wordCount,
          estimated_reading_time: processedContent.estimatedReadingTime,
          chunk_count: processedContent.chunks.length
        }
      })
      .select()
      .single()

    if (noteError) {
      console.error('Database error:', noteError)
      return NextResponse.json({ 
        error: 'Failed to save note' 
      }, { status: 500 })
    }

    // Generate embeddings and store them
    try {
      const aiRouter = createAIRouter({
        primaryProvider: 'openrouter',
        fallbackProvider: 'ollama',
        models: {
          chat: 'anthropic/claude-3-haiku',
          embedding: 'text-embedding-3-small'
        }
      })

      const vectorStore = new SupabaseVectorStore(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Generate embeddings for all chunks
      if (processedContent.chunks.length > 0) {
        const embeddingResponse = await aiRouter.embed(processedContent.chunks)
        
        const vectorChunks = processedContent.chunks.map((chunk, index) => ({
          noteId: note.id,
          text: chunk,
          embedding: embeddingResponse.embeddings[index],
          metadata: {
            chunk_index: index,
            chunk_length: chunk.length,
            note_title: processedContent.title
          }
        }))

        await vectorStore.store(vectorChunks)
      }
    } catch (embeddingError) {
      console.warn('Failed to generate embeddings, storing without them:', embeddingError)
      
      // Fallback: store chunks without embeddings
      const fallbackPromises = processedContent.chunks.map(async (chunk, index) => {
        return supabase
          .from('note_embeddings')
          .insert({
            note_id: note.id,
            chunk_text: chunk,
            embedding: null,
            metadata: {
              chunk_index: index,
              chunk_length: chunk.length,
              error: 'embeddings_failed'
            }
          })
      })

      await Promise.all(fallbackPromises)
    }

    // Generate summary and key terms
    const summary = await contentProcessor.generateSummary(processedContent.content)
    const keyTerms = await contentProcessor.extractKeyTerms(processedContent.content)

    return NextResponse.json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        summary,
        keyTerms,
        wordCount: processedContent.wordCount,
        estimatedReadingTime: processedContent.estimatedReadingTime,
        chunkCount: processedContent.chunks.length
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload endpoint - POST only',
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_TYPES
  })
}
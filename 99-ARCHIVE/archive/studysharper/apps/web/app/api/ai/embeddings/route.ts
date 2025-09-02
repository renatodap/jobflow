import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateBatchEmbeddings, generateEmbeddingsWithRetry } from '@/lib/ai/embeddings'

function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    const { source_id, batch_size = 20 } = await request.json()

    if (!source_id) {
      return NextResponse.json({ 
        error: 'Source ID is required' 
      }, { status: 400 })
    }

    // Verify source ownership
    const { data: source, error: sourceError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', source_id)
      .eq('user_id', session.user.id)
      .single()

    if (sourceError || !source) {
      return NextResponse.json({ error: 'Content source not found' }, { status: 404 })
    }

    // Get chunks without embeddings
    const { data: chunks, error: chunksError } = await supabase
      .from('content_chunks')
      .select('id, chunk_text, chunk_index')
      .eq('source_id', source_id)
      .is('embedding', null)
      .order('chunk_index', { ascending: true })
      .limit(batch_size)

    if (chunksError) {
      return NextResponse.json({ 
        error: 'Failed to fetch chunks' 
      }, { status: 500 })
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No chunks need embedding generation',
        embeddings_generated: 0
      })
    }

    // Get embedding generation job
    const { data: embeddingJob } = await supabase
      .from('processing_jobs')
      .select('id')
      .eq('source_id', source_id)
      .eq('job_type', 'embedding')
      .single()

    // Update job status
    if (embeddingJob) {
      await supabase.rpc('update_processing_job_status', {
        job_id: embeddingJob.id,
        new_status: 'processing',
        new_progress: 0
      })
    }

    try {
      // Generate embeddings with retry logic
      const texts = chunks.map(c => c.chunk_text)
      const result = await generateEmbeddingsWithRetry(texts)

      // Calculate progress
      const { data: totalChunks } = await supabase
        .from('content_chunks')
        .select('id', { count: 'exact' })
        .eq('source_id', source_id)

      const totalCount = totalChunks?.length || chunks.length
      const processedCount = chunks.length
      const progress = Math.round((processedCount / totalCount) * 100)

      // Update chunks with embeddings
      const updatePromises = chunks.map((chunk, index) => {
        const embedding = result.embeddings[index]
        
        // Convert to pgvector format string
        const vectorString = `[${embedding.join(',')}]`
        
        return supabase
          .from('content_chunks')
          .update({ 
            embedding: vectorString,
            metadata: {
              ...chunk.metadata,
              embedding_model: result.model,
              embedding_generated_at: new Date().toISOString()
            }
          })
          .eq('id', chunk.id)
      })

      await Promise.all(updatePromises)

      // Update job progress
      if (embeddingJob) {
        const allChunksProcessed = processedCount >= totalCount
        
        await supabase.rpc('update_processing_job_status', {
          job_id: embeddingJob.id,
          new_status: allChunksProcessed ? 'completed' : 'processing',
          new_progress: progress
        })

        // If all chunks processed, update source status
        if (allChunksProcessed) {
          await supabase
            .from('content_sources')
            .update({ 
              status: 'completed',
              metadata: {
                ...source.metadata,
                embeddings_completed_at: new Date().toISOString(),
                total_embeddings: totalCount,
                embedding_cost: result.cost_estimate
              }
            })
            .eq('id', source_id)
        }
      }

      return NextResponse.json({
        success: true,
        embeddings_generated: chunks.length,
        total_tokens: result.total_tokens,
        cost_estimate: result.cost_estimate,
        progress: progress,
        all_complete: processedCount >= totalCount
      })

    } catch (embeddingError) {
      console.error('Embedding generation error:', embeddingError)
      
      // Update job status to failed
      if (embeddingJob) {
        await supabase.rpc('update_processing_job_status', {
          job_id: embeddingJob.id,
          new_status: 'failed',
          error_msg: embeddingError instanceof Error ? embeddingError.message : 'Embedding generation failed'
        })
      }

      // Update source status
      await supabase
        .from('content_sources')
        .update({ status: 'failed' })
        .eq('id', source_id)

      return NextResponse.json({
        success: false,
        error: embeddingError instanceof Error ? embeddingError.message : 'Embedding generation failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Embeddings API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('source_id')

    if (!sourceId) {
      // Get overall embedding status for user
      const { data: sources } = await supabase
        .from('content_sources')
        .select(`
          id,
          title,
          status,
          content_chunks!inner(id, embedding)
        `)
        .eq('user_id', session.user.id)

      const stats = sources?.map(source => {
        const chunks = source.content_chunks as any[]
        const totalChunks = chunks.length
        const chunksWithEmbeddings = chunks.filter(c => c.embedding !== null).length
        
        return {
          source_id: source.id,
          title: source.title,
          status: source.status,
          total_chunks: totalChunks,
          chunks_with_embeddings: chunksWithEmbeddings,
          progress: totalChunks > 0 ? Math.round((chunksWithEmbeddings / totalChunks) * 100) : 0
        }
      })

      return NextResponse.json({
        success: true,
        sources: stats || []
      })
    }

    // Get specific source embedding status
    const { data: chunks } = await supabase
      .from('content_chunks')
      .select('id, embedding')
      .eq('source_id', sourceId)

    const totalChunks = chunks?.length || 0
    const chunksWithEmbeddings = chunks?.filter(c => c.embedding !== null).length || 0

    return NextResponse.json({
      success: true,
      source_id: sourceId,
      total_chunks: totalChunks,
      chunks_with_embeddings: chunksWithEmbeddings,
      progress: totalChunks > 0 ? Math.round((chunksWithEmbeddings / totalChunks) * 100) : 0,
      complete: chunksWithEmbeddings === totalChunks
    })

  } catch (error) {
    console.error('Embeddings status error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
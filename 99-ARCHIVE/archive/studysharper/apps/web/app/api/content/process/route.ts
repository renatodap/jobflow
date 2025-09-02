import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { extractTextFromPDF, validatePDFBuffer } from '@/lib/content/pdf-processor'
import { chunkTextByPages } from '@/lib/content/text-chunker'

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

    const { source_id, force_reprocess = false } = await request.json()

    if (!source_id) {
      return NextResponse.json({ 
        error: 'Source ID is required' 
      }, { status: 400 })
    }

    // Verify source ownership and get file info
    const { data: source, error: sourceError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', source_id)
      .eq('user_id', session.user.id)
      .eq('source_type', 'pdf')
      .single()

    if (sourceError || !source) {
      return NextResponse.json({ error: 'Content source not found' }, { status: 404 })
    }

    if (!source.file_path) {
      return NextResponse.json({ error: 'No file associated with source' }, { status: 400 })
    }

    // Check if already processed (unless force reprocess)
    if (!force_reprocess && source.status === 'completed') {
      const { data: existingChunks } = await supabase
        .from('content_chunks')
        .select('id')
        .eq('source_id', source_id)
        .limit(1)

      if (existingChunks && existingChunks.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'Content already processed',
          chunks_exist: true
        })
      }
    }

    // Update processing job for text extraction
    const { data: extractionJob } = await supabase
      .from('processing_jobs')
      .select('id')
      .eq('source_id', source_id)
      .eq('job_type', 'text_extraction')
      .single()

    if (extractionJob) {
      await supabase.rpc('update_processing_job_status', {
        job_id: extractionJob.id,
        new_status: 'processing',
        new_progress: 0
      })
    }

    try {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('content-files')
        .download(source.file_path)

      if (downloadError || !fileData) {
        throw new Error('Failed to download file from storage')
      }

      // Convert to buffer for processing
      const buffer = Buffer.from(await fileData.arrayBuffer())

      // Validate PDF
      const validation = validatePDFBuffer(buffer)
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid PDF file')
      }

      // Update progress
      if (extractionJob) {
        await supabase.rpc('update_processing_job_status', {
          job_id: extractionJob.id,
          new_status: 'processing',
          new_progress: 25
        })
      }

      // Extract text from PDF
      const extractionResult = await extractTextFromPDF(buffer)

      // Update progress
      if (extractionJob) {
        await supabase.rpc('update_processing_job_status', {
          job_id: extractionJob.id,
          new_status: 'processing',
          new_progress: 50
        })
      }

      // Chunk the text
      const chunkingResult = chunkTextByPages(extractionResult.pages, {
        maxTokens: 512,
        overlap: 50,
        preserveSentences: true,
        model: 'gpt-4'
      })

      // Update progress
      if (extractionJob) {
        await supabase.rpc('update_processing_job_status', {
          job_id: extractionJob.id,
          new_status: 'processing',
          new_progress: 75
        })
      }

      // Clear existing chunks if reprocessing
      if (force_reprocess) {
        await supabase
          .from('content_chunks')
          .delete()
          .eq('source_id', source_id)
      }

      // Store chunks in database
      const chunksToInsert = chunkingResult.chunks.map(chunk => ({
        source_id: source_id,
        chunk_text: chunk.text,
        chunk_index: chunk.chunkIndex,
        page_number: chunk.pageNumber,
        metadata: {
          token_count: chunk.tokenCount,
          start_index: chunk.startIndex,
          end_index: chunk.endIndex
        }
      }))

      const { error: insertError } = await supabase
        .from('content_chunks')
        .insert(chunksToInsert)

      if (insertError) {
        throw new Error(`Failed to store chunks: ${insertError.message}`)
      }

      // Update source metadata
      await supabase
        .from('content_sources')
        .update({
          metadata: {
            ...source.metadata,
            pdf_metadata: extractionResult.metadata,
            processing_stats: {
              total_chunks: chunkingResult.totalChunks,
              total_tokens: chunkingResult.totalTokens,
              average_chunk_size: chunkingResult.averageChunkSize,
              processed_at: new Date().toISOString()
            }
          }
        })
        .eq('id', source_id)

      // Complete text extraction job
      if (extractionJob) {
        await supabase.rpc('update_processing_job_status', {
          job_id: extractionJob.id,
          new_status: 'completed',
          new_progress: 100
        })
      }

      // Start chunking job (mark as completed since we did it in this process)
      const { data: chunkingJob } = await supabase
        .from('processing_jobs')
        .select('id')
        .eq('source_id', source_id)
        .eq('job_type', 'chunking')
        .single()

      if (chunkingJob) {
        await supabase.rpc('update_processing_job_status', {
          job_id: chunkingJob.id,
          new_status: 'completed',
          new_progress: 100
        })
      }

      return NextResponse.json({
        success: true,
        message: 'PDF processed successfully',
        result: {
          chunks_created: chunkingResult.totalChunks,
          total_tokens: chunkingResult.totalTokens,
          average_chunk_size: chunkingResult.averageChunkSize,
          pages_processed: extractionResult.pages.length,
          metadata: extractionResult.metadata
        }
      })

    } catch (processingError) {
      console.error('PDF processing error:', processingError)
      
      // Mark extraction job as failed
      if (extractionJob) {
        await supabase.rpc('update_processing_job_status', {
          job_id: extractionJob.id,
          new_status: 'failed',
          new_progress: 0,
          error_msg: processingError instanceof Error ? processingError.message : 'Processing failed'
        })
      }

      // Update source status
      await supabase
        .from('content_sources')
        .update({ status: 'failed' })
        .eq('id', source_id)

      return NextResponse.json({
        success: false,
        error: processingError instanceof Error ? processingError.message : 'Processing failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Process API error:', error)
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

    // Get processing queue status
    const { data: pendingJobs } = await supabase
      .from('processing_jobs')
      .select(`
        id,
        source_id,
        job_type,
        status,
        progress,
        content_sources!inner(title, user_id)
      `)
      .eq('content_sources.user_id', session.user.id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: true })

    return NextResponse.json({
      success: true,
      queue: pendingJobs || [],
      queue_length: pendingJobs?.length || 0
    })

  } catch (error) {
    console.error('Queue status error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CreateContentSourceData } from '@/types/content'

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

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['application/pdf']

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const subjectId = formData.get('subject_id') as string
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided' 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Only PDF files are supported' 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Validate subject ownership if provided
    if (subjectId) {
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select(`
          id,
          courses!inner(
            terms!inner(
              schools!inner(user_id)
            )
          )
        `)
        .eq('id', subjectId)
        .single()

      if (subjectError || !subject || (subject.courses as any).terms.schools.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
      }
    }

    // Generate unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${session.user.id}/uploads/${filename}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('content-files')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload file' 
      }, { status: 500 })
    }

    // Create content source record
    const contentData: CreateContentSourceData = {
      subject_id: subjectId || undefined,
      title: title || file.name.replace('.pdf', ''),
      source_type: 'pdf',
      file_path: filePath,
      metadata: {
        original_filename: file.name,
        file_size: file.size,
        content_type: file.type,
        uploaded_at: new Date().toISOString()
      }
    }

    const { data: contentSource, error: sourceError } = await supabase
      .from('content_sources')
      .insert({
        user_id: session.user.id,
        ...contentData
      })
      .select()
      .single()

    if (sourceError) {
      console.error('Database error:', sourceError)
      
      // Clean up uploaded file
      await supabase.storage
        .from('content-files')
        .remove([filePath])
      
      return NextResponse.json({ 
        error: 'Failed to create content record' 
      }, { status: 500 })
    }

    // Create processing jobs
    const { error: jobsError } = await supabase.rpc('create_processing_jobs', {
      source_id: contentSource.id
    })

    if (jobsError) {
      console.error('Failed to create processing jobs:', jobsError)
    }

    return NextResponse.json({
      success: true,
      source_id: contentSource.id,
      file_path: filePath,
      message: 'File uploaded successfully. Processing started.'
    })

  } catch (error) {
    console.error('Upload error:', error)
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
    const subjectId = searchParams.get('subject_id')

    let query = supabase
      .from('content_sources')
      .select(`
        *,
        subjects(id, name, courses(id, name, terms(id, name, schools(id, name))))
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data: sources, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch content sources' }, { status: 500 })
    }

    // Get processing status for each source
    const sourcesWithStatus = await Promise.all(
      sources.map(async (source) => {
        const { data: jobs } = await supabase
          .from('processing_jobs')
          .select('*')
          .eq('source_id', source.id)
          .order('created_at', { ascending: true })

        const { data: chunks } = await supabase
          .from('content_chunks')
          .select('id')
          .eq('source_id', source.id)

        return {
          ...source,
          processing_jobs: jobs || [],
          chunk_count: chunks?.length || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      sources: sourcesWithStatus
    })

  } catch (error) {
    console.error('Get sources error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
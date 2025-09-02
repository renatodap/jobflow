import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get('id')

    if (!sourceId) {
      return NextResponse.json({ 
        error: 'Source ID is required' 
      }, { status: 400 })
    }

    // Verify source ownership
    const { data: source, error: sourceError } = await supabase
      .from('content_sources')
      .select('id, file_path')
      .eq('id', sourceId)
      .eq('user_id', session.user.id)
      .single()

    if (sourceError || !source) {
      return NextResponse.json({ error: 'Content source not found' }, { status: 404 })
    }

    // Delete file from storage if it exists
    if (source.file_path) {
      const { error: storageError } = await supabase.storage
        .from('content-files')
        .remove([source.file_path])
      
      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage fails
      }
    }

    // Delete content source (this will cascade to chunks and jobs via foreign keys)
    const { error: deleteError } = await supabase
      .from('content_sources')
      .delete()
      .eq('id', sourceId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete content source' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Content source deleted successfully'
    })

  } catch (error) {
    console.error('Delete source error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, title, subject_id } = await request.json()

    if (!id || !title) {
      return NextResponse.json({ 
        error: 'ID and title are required' 
      }, { status: 400 })
    }

    // Verify source ownership
    const { data: source, error: sourceError } = await supabase
      .from('content_sources')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (sourceError || !source) {
      return NextResponse.json({ error: 'Content source not found' }, { status: 404 })
    }

    // Verify subject ownership if provided
    if (subject_id) {
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
        .eq('id', subject_id)
        .single()

      if (subjectError || !subject || (subject.courses as any).terms.schools.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
      }
    }

    // Update content source
    const { data: updatedSource, error: updateError } = await supabase
      .from('content_sources')
      .update({
        title: title.trim(),
        subject_id: subject_id || null
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update content source' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      source: updatedSource
    })

  } catch (error) {
    console.error('Update source error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
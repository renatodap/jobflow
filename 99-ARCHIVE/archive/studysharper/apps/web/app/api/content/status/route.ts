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
      return NextResponse.json({ 
        error: 'Source ID is required' 
      }, { status: 400 })
    }

    // Verify source ownership
    const { data: source, error: sourceError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', session.user.id)
      .single()

    if (sourceError || !source) {
      return NextResponse.json({ error: 'Content source not found' }, { status: 404 })
    }

    // Get all processing jobs for this source
    const { data: jobs, error: jobsError } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('source_id', sourceId)
      .order('created_at', { ascending: true })

    if (jobsError) {
      console.error('Jobs query error:', jobsError)
      return NextResponse.json({ 
        error: 'Failed to fetch processing status' 
      }, { status: 500 })
    }

    // Calculate overall progress
    const totalJobs = jobs.length
    const completedJobs = jobs.filter(job => job.status === 'completed').length
    const failedJobs = jobs.filter(job => job.status === 'failed').length
    const processingJobs = jobs.filter(job => job.status === 'processing')
    const currentJob = processingJobs[0] || null

    let overallProgress = 0
    if (totalJobs > 0) {
      const jobProgress = jobs.reduce((sum, job) => {
        if (job.status === 'completed') return sum + 100
        if (job.status === 'failed') return sum + 0
        return sum + job.progress
      }, 0)
      overallProgress = Math.round(jobProgress / totalJobs)
    }

    // Determine overall status
    let overallStatus = source.status
    if (failedJobs > 0 && completedJobs + failedJobs === totalJobs) {
      overallStatus = 'failed'
    } else if (completedJobs === totalJobs) {
      overallStatus = 'completed'
    } else if (processingJobs.length > 0) {
      overallStatus = 'processing'
    }

    // Get chunk count if processing is complete
    let chunkCount = 0
    if (overallStatus === 'completed') {
      const { data: chunks } = await supabase
        .from('content_chunks')
        .select('id')
        .eq('source_id', sourceId)
      
      chunkCount = chunks?.length || 0
    }

    // Estimate completion time
    let estimatedCompletion: string | undefined
    if (currentJob && currentJob.progress > 0) {
      const elapsed = new Date().getTime() - new Date(currentJob.started_at!).getTime()
      const estimatedTotal = (elapsed / currentJob.progress) * 100
      const remaining = estimatedTotal - elapsed
      estimatedCompletion = new Date(Date.now() + remaining).toISOString()
    }

    return NextResponse.json({
      success: true,
      status: {
        source_id: sourceId,
        overall_status: overallStatus,
        overall_progress: overallProgress,
        current_job: currentJob,
        jobs: jobs,
        chunk_count: chunkCount,
        estimated_completion: estimatedCompletion,
        total_jobs: totalJobs,
        completed_jobs: completedJobs,
        failed_jobs: failedJobs
      }
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { source_id, action } = await request.json()

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

    if (action === 'retry') {
      // Reset failed jobs to pending
      const { error: resetError } = await supabase
        .from('processing_jobs')
        .update({ 
          status: 'pending', 
          progress: 0, 
          error_message: null,
          started_at: null,
          completed_at: null
        })
        .eq('source_id', source_id)
        .eq('status', 'failed')

      if (resetError) {
        console.error('Reset jobs error:', resetError)
        return NextResponse.json({ 
          error: 'Failed to retry processing' 
        }, { status: 500 })
      }

      // Update source status
      await supabase
        .from('content_sources')
        .update({ status: 'processing' })
        .eq('id', source_id)

      return NextResponse.json({
        success: true,
        message: 'Processing retry initiated'
      })
    }

    if (action === 'cancel') {
      // Cancel processing jobs
      const { error: cancelError } = await supabase
        .from('processing_jobs')
        .update({ 
          status: 'failed', 
          error_message: 'Cancelled by user',
          completed_at: new Date().toISOString()
        })
        .eq('source_id', source_id)
        .in('status', ['pending', 'processing'])

      if (cancelError) {
        console.error('Cancel jobs error:', cancelError)
        return NextResponse.json({ 
          error: 'Failed to cancel processing' 
        }, { status: 500 })
      }

      // Update source status
      await supabase
        .from('content_sources')
        .update({ status: 'failed' })
        .eq('id', source_id)

      return NextResponse.json({
        success: true,
        message: 'Processing cancelled'
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('Status action error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
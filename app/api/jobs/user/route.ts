import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's applications with job details
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Format response
    const formattedApplications = applications?.map((app: any) => ({
      id: app.id,
      job_id: app.job_id,
      status: app.status || 'pending',
      applied_at: app.applied_at,
      notes: app.notes,
      job: app.job ? {
        id: app.job.id,
        job_id: app.job.job_hash,
        title: app.job.title,
        company: app.job.company,
        location: app.job.location,
        salary_min: app.job.salary_min,
        salary_max: app.job.salary_max,
        description: app.job.description,
        requirements: app.job.requirements,
        url: app.job.url,
        source: app.job.source,
        contract_type: app.job.contract_type,
        category: app.job.category,
        days_old: app.job.days_old,
        score: app.job.score
      } : null
    })) || []

    return NextResponse.json({
      success: true,
      applications: formattedApplications
    })
    
  } catch (error) {
    console.error('Jobs fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
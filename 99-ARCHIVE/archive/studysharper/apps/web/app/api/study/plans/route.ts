import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { StudyPlanGenerator, StudyPlanRequest } from '@/lib/ai/study-planner'

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

    const body = await request.json()
    const { action } = body

    if (action === 'generate') {
      return await handleGeneratePlan(body, session.user.id, supabase)
    } else if (action === 'save') {
      return await handleSavePlan(body, session.user.id, supabase)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Study plan API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

async function handleGeneratePlan(body: any, userId: string, supabase: any) {
  const { title, description, startDate, endDate, subjectIds, preferences } = body

  if (!title || !startDate || !endDate || !subjectIds || subjectIds.length === 0) {
    return NextResponse.json({ 
      error: 'Missing required fields' 
    }, { status: 400 })
  }

  // Fetch subject details
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select(`
      id,
      name,
      course_id,
      courses!inner(
        name,
        credits,
        term_id,
        terms!inner(
          name,
          start_date,
          end_date
        )
      )
    `)
    .in('id', subjectIds)
    .eq('courses.user_id', userId)

  if (subjectsError || !subjects) {
    return NextResponse.json({ 
      error: 'Failed to fetch subjects' 
    }, { status: 500 })
  }

  // Fetch existing content for each subject
  const { data: contentSources } = await supabase
    .from('content_sources')
    .select(`
      id,
      subject_id,
      title,
      status,
      content_chunks!inner(id)
    `)
    .in('subject_id', subjectIds)
    .eq('user_id', userId)
    .eq('status', 'completed')

  // Prepare subjects with metadata
  const enrichedSubjects = subjects.map((subject: any) => {
    const course = subject.courses
    const term = course.terms
    const content = contentSources?.filter((c: any) => c.subject_id === subject.id) || []
    
    // Calculate difficulty based on course credits and current progress
    const difficulty = Math.min(5, Math.max(1, Math.round(course.credits / 2)))
    
    // Set priority based on term dates
    const termEndDate = new Date(term.end_date)
    const daysUntilTermEnd = Math.max(0, Math.floor((termEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    const priority = daysUntilTermEnd < 30 ? 5 : daysUntilTermEnd < 60 ? 3 : 2

    return {
      id: subject.id,
      name: subject.name,
      difficulty,
      priority,
      examDate: term.end_date ? new Date(term.end_date) : undefined,
      topics: [], // Would be populated from content analysis
      currentProgress: content.length > 0 ? 20 : 0
    }
  })

  // Prepare existing content info
  const existingContent = contentSources?.reduce((acc: any[], source: any) => {
    const existing = acc.find(e => e.subjectId === source.subject_id)
    if (existing) {
      existing.sourceIds.push(source.id)
      existing.chunkCount += source.content_chunks.length
    } else {
      acc.push({
        subjectId: source.subject_id,
        sourceIds: [source.id],
        chunkCount: source.content_chunks.length
      })
    }
    return acc
  }, []) || []

  // Generate the study plan
  const generator = new StudyPlanGenerator()
  const planRequest: StudyPlanRequest = {
    userId,
    title,
    description,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    subjects: enrichedSubjects,
    preferences: {
      studyHoursPerDay: preferences?.studyHoursPerDay || 3,
      preferredTimeSlots: preferences?.preferredTimeSlots || [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' }
      ],
      breakDuration: preferences?.breakDuration || 15,
      sessionDuration: preferences?.sessionDuration || 90,
      avoidWeekends: preferences?.avoidWeekends !== false,
      focusMode: preferences?.focusMode || 'balanced'
    },
    constraints: preferences?.constraints,
    existingContent
  }

  try {
    const plan = await generator.generatePlan(planRequest)

    return NextResponse.json({
      success: true,
      plan,
      message: `Generated study plan with ${plan.sessions.length} sessions over ${Math.round(plan.totalStudyHours)} hours`
    })
  } catch (error) {
    console.error('Plan generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate study plan' 
    }, { status: 500 })
  }
}

async function handleSavePlan(body: any, userId: string, supabase: any) {
  const { plan } = body

  if (!plan) {
    return NextResponse.json({ 
      error: 'Plan data is required' 
    }, { status: 400 })
  }

  // Start a transaction by using multiple operations
  try {
    // Save the main plan
    const { data: savedPlan, error: planError } = await supabase
      .from('study_plans')
      .insert({
        user_id: userId,
        title: plan.title,
        description: plan.description,
        start_date: plan.startDate,
        end_date: plan.endDate,
        study_hours_per_day: plan.averageHoursPerDay,
        status: 'active',
        metadata: plan.metadata
      })
      .select()
      .single()

    if (planError || !savedPlan) {
      throw new Error('Failed to save study plan')
    }

    // Save sessions
    const sessionsToInsert = plan.sessions.map((session: any) => ({
      plan_id: savedPlan.id,
      subject_id: session.subjectId,
      title: session.title,
      description: session.description,
      session_type: session.sessionType,
      scheduled_date: session.scheduledDate,
      start_time: session.startTime,
      end_time: session.endTime,
      priority: session.priority,
      topics: session.topics,
      materials: session.materials || [],
      metadata: {
        estimatedDifficulty: session.estimatedDifficulty,
        focusPoints: session.focusPoints
      }
    }))

    const { error: sessionsError } = await supabase
      .from('study_sessions')
      .insert(sessionsToInsert)

    if (sessionsError) {
      // Rollback by deleting the plan
      await supabase.from('study_plans').delete().eq('id', savedPlan.id)
      throw new Error('Failed to save study sessions')
    }

    // Save goals
    const goalsToInsert = plan.goals.map((goal: any) => ({
      plan_id: savedPlan.id,
      subject_id: goal.subjectId,
      goal_type: goal.goalType,
      target_value: goal.targetValue,
      deadline: goal.deadline,
      priority: goal.priority,
      status: 'pending'
    }))

    const { error: goalsError } = await supabase
      .from('study_goals')
      .insert(goalsToInsert)

    if (goalsError) {
      // Rollback
      await supabase.from('study_sessions').delete().eq('plan_id', savedPlan.id)
      await supabase.from('study_plans').delete().eq('id', savedPlan.id)
      throw new Error('Failed to save study goals')
    }

    // Save recommendations
    const recommendationsToInsert = plan.recommendations.map((rec: string, index: number) => ({
      user_id: userId,
      plan_id: savedPlan.id,
      recommendation_type: 'schedule_adjustment',
      priority: index === 0 ? 'high' : 'medium',
      title: `Recommendation ${index + 1}`,
      description: rec,
      valid_until: plan.endDate,
      status: 'pending'
    }))

    const { error: recsError } = await supabase
      .from('study_recommendations')
      .insert(recommendationsToInsert)

    if (recsError) {
      console.error('Failed to save recommendations:', recsError)
      // Non-critical, don't rollback
    }

    return NextResponse.json({
      success: true,
      planId: savedPlan.id,
      message: 'Study plan saved successfully'
    })

  } catch (error) {
    console.error('Save plan error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save study plan' 
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
    const planId = searchParams.get('plan_id')
    const status = searchParams.get('status')

    if (planId) {
      // Get specific plan with all details
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .select(`
          *,
          study_sessions(
            *,
            subjects(name)
          ),
          study_goals(*),
          study_recommendations(*)
        `)
        .eq('id', planId)
        .eq('user_id', session.user.id)
        .single()

      if (planError || !plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      // Get progress data
      const { data: progress } = await supabase
        .from('study_progress')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', plan.start_date)
        .lte('date', plan.end_date)

      // Calculate statistics
      const { data: stats } = await supabase
        .rpc('calculate_study_stats', { p_user_id: session.user.id })

      return NextResponse.json({
        success: true,
        plan,
        progress: progress || [],
        stats: stats?.[0] || null
      })
    }

    // Get all plans for user
    const query = supabase
      .from('study_plans')
      .select(`
        *,
        study_sessions(count),
        study_goals(count)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query.eq('status', status)
    }

    const { data: plans, error: plansError } = await query

    if (plansError) {
      return NextResponse.json({ 
        error: 'Failed to fetch study plans' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      plans: plans || []
    })

  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, status, sessionId, sessionStatus, progress } = body

    if (sessionId && sessionStatus) {
      // Update session status
      const { error: updateError } = await supabase
        .from('study_sessions')
        .update({ 
          status: sessionStatus,
          actual_start_time: sessionStatus === 'in_progress' ? new Date().toISOString() : undefined,
          actual_end_time: sessionStatus === 'completed' ? new Date().toISOString() : undefined
        })
        .eq('id', sessionId)

      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to update session' 
        }, { status: 500 })
      }

      // Log progress if completing
      if (sessionStatus === 'completed' && progress) {
        const { error: progressError } = await supabase
          .from('study_progress')
          .insert({
            user_id: session.user.id,
            session_id: sessionId,
            subject_id: progress.subjectId,
            date: new Date().toISOString().split('T')[0],
            duration_minutes: progress.duration || 90,
            topics_covered: progress.topics || [],
            progress_type: 'study',
            confidence_level: progress.confidence || 3,
            notes: progress.notes
          })

        if (progressError) {
          console.error('Failed to log progress:', progressError)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Session updated successfully'
      })
    }

    if (planId && status) {
      // Update plan status
      const { error: updateError } = await supabase
        .from('study_plans')
        .update({ status })
        .eq('id', planId)
        .eq('user_id', session.user.id)

      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to update plan' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Plan updated successfully'
      })
    }

    return NextResponse.json({ 
      error: 'Invalid update request' 
    }, { status: 400 })

  } catch (error) {
    console.error('Update plan error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
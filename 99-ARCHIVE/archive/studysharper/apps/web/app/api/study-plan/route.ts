import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { StudyPlanner } from '@studysharper/ai'
import { createAIRouter } from '@studysharper/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      planDuration = 7,
      preferences = {},
      selectedCourses = [] 
    } = body

    // Fetch user's courses and subjects
    const { data: userCourses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        name,
        credits,
        color,
        terms!inner(
          schools!inner(user_id)
        ),
        subjects(
          id,
          name,
          description,
          order_index
        )
      `)
      .eq('terms.schools.user_id', session.user.id)

    if (coursesError) {
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    // Fetch upcoming deadlines
    const { data: deadlines, error: deadlinesError } = await supabase
      .from('assessments')
      .select(`
        id,
        title,
        due_date,
        type,
        weight,
        courses!inner(
          id,
          name,
          terms!inner(
            schools!inner(user_id)
          )
        )
      `)
      .eq('courses.terms.schools.user_id', session.user.id)
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(10)

    if (deadlinesError) {
      return NextResponse.json({ error: 'Failed to fetch deadlines' }, { status: 500 })
    }

    // Default availability (could be customized by user)
    const defaultTimeSlots = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', maxCognitiveLoad: 4 }, // Monday morning
      { dayOfWeek: 1, startTime: '14:00', endTime: '17:00', maxCognitiveLoad: 3 }, // Monday afternoon
      { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', maxCognitiveLoad: 4 },
      { dayOfWeek: 2, startTime: '14:00', endTime: '17:00', maxCognitiveLoad: 3 },
      { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', maxCognitiveLoad: 4 },
      { dayOfWeek: 3, startTime: '14:00', endTime: '17:00', maxCognitiveLoad: 3 },
      { dayOfWeek: 4, startTime: '09:00', endTime: '12:00', maxCognitiveLoad: 4 },
      { dayOfWeek: 4, startTime: '14:00', endTime: '17:00', maxCognitiveLoad: 3 },
      { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', maxCognitiveLoad: 4 },
      { dayOfWeek: 5, startTime: '14:00', endTime: '17:00', maxCognitiveLoad: 3 },
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', maxCognitiveLoad: 3 }, // Saturday
    ]

    const defaultPreferences = {
      preferredStudyMethods: ['reading', 'flashcards', 'practice_problems'],
      optimalSessionLength: 90,
      breakFrequency: 45,
      peakHours: ['morning'],
      avoidancePatterns: ['cramming'],
      ...preferences
    }

    // Transform data for study planner
    const courses = (userCourses || []).map(course => ({
      id: course.id,
      name: course.name,
      credits: course.credits || 3,
      difficulty: 3, // Default difficulty
      subjects: (course.subjects || []).map(subject => ({
        id: subject.id,
        name: subject.name,
        priority: 3, // Default priority
        estimatedHours: 2 // Default estimation
      }))
    }))

    const planDeadlines = (deadlines || []).map(deadline => ({
      id: deadline.id,
      title: deadline.title,
      dueDate: new Date(deadline.due_date),
      courseId: (deadline.courses as any).id,
      estimatedHours: 5, // Default estimation
      importance: deadline.weight ? Math.ceil(deadline.weight / 20) : 3
    }))

    // Initialize AI router
    const aiRouter = createAIRouter({
      primaryProvider: 'openrouter',
      fallbackProvider: 'ollama'
    })

    const studyPlanner = new StudyPlanner(aiRouter)

    // Generate study plan
    const studyPlan = await studyPlanner.generatePlan({
      userId: session.user.id,
      courses,
      availableTimeSlots: defaultTimeSlots,
      deadlines: planDeadlines,
      preferences: defaultPreferences,
      planDuration
    })

    // Save study plan to database
    const { data: savedPlan, error: saveError } = await supabase
      .from('study_plans')
      .insert({
        user_id: session.user.id,
        name: `Study Plan - ${new Date().toLocaleDateString()}`,
        start_date: studyPlan.startDate.toISOString().split('T')[0],
        end_date: studyPlan.endDate.toISOString().split('T')[0],
        ai_config: {
          total_hours: studyPlan.metadata.totalHours,
          average_cognitive_load: studyPlan.metadata.averageCognitiveLoad,
          reasoning: studyPlan.metadata.reasoning,
          preferences: defaultPreferences
        }
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save study plan:', saveError)
      // Continue anyway - return the generated plan
    }

    // Save study blocks
    if (savedPlan) {
      const blockInserts = studyPlan.blocks.map(block => ({
        study_plan_id: savedPlan.id,
        subject_id: block.subjectId,
        scheduled_start: block.scheduledStart.toISOString(),
        duration_minutes: block.durationMinutes,
        study_method: block.studyMethod,
        cognitive_load: block.cognitiveLoad,
        ai_reasoning: {
          reasoning: block.reasoning,
          topics: block.content.topics,
          goals: block.content.goals,
          priority: block.priority
        }
      }))

      await supabase.from('study_blocks').insert(blockInserts)
    }

    // Log plan generation event
    await supabase
      .from('events')
      .insert({
        user_id: session.user.id,
        event_type: 'study_plan_generated',
        properties: {
          plan_duration: planDuration,
          courses_count: courses.length,
          deadlines_count: planDeadlines.length,
          blocks_count: studyPlan.blocks.length,
          total_hours: studyPlan.metadata.totalHours
        }
      })

    return NextResponse.json({
      success: true,
      plan: {
        id: savedPlan?.id || studyPlan.id,
        startDate: studyPlan.startDate,
        endDate: studyPlan.endDate,
        blocks: studyPlan.blocks.map(block => ({
          id: block.id,
          subjectId: block.subjectId,
          scheduledStart: block.scheduledStart,
          durationMinutes: block.durationMinutes,
          studyMethod: block.studyMethod,
          cognitiveLoad: block.cognitiveLoad,
          priority: block.priority,
          topics: block.content.topics,
          goals: block.content.goals,
          reasoning: block.reasoning
        })),
        metadata: studyPlan.metadata
      }
    })

  } catch (error) {
    console.error('Study plan generation error:', error)
    
    // Provide fallback response
    const fallbackPlan = {
      success: false,
      error: 'AI service temporarily unavailable',
      fallback: {
        message: "I'll create a basic study schedule for you. For AI-optimized plans, please ensure you have API keys configured.",
        basicSchedule: [
          { time: '09:00', subject: 'Morning Study', duration: 90, method: 'reading' },
          { time: '14:00', subject: 'Afternoon Review', duration: 60, method: 'flashcards' },
          { time: '19:00', subject: 'Evening Practice', duration: 45, method: 'practice_problems' }
        ]
      }
    }

    return NextResponse.json(fallbackPlan, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Study Plan Generator - POST to generate a plan',
    example: {
      planDuration: 7,
      preferences: {
        preferredStudyMethods: ['reading', 'flashcards'],
        optimalSessionLength: 90,
        peakHours: ['morning']
      },
      selectedCourses: ['course-uuid-1', 'course-uuid-2']
    }
  })
}
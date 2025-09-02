import OpenAI from 'openai'
import { addDays, format, startOfDay, differenceInDays, addMinutes } from 'date-fns'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface StudyPlanRequest {
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  subjects: Array<{
    id: string
    name: string
    difficulty: number // 1-5 scale
    priority: number // 1-5 scale
    examDate?: Date
    topics?: string[]
    currentProgress?: number // 0-100
  }>
  preferences: {
    studyHoursPerDay: number
    preferredTimeSlots?: Array<{
      start: string // "09:00"
      end: string // "11:00"
    }>
    breakDuration?: number // minutes
    sessionDuration?: number // minutes (default 90)
    avoidWeekends?: boolean
    focusMode?: 'balanced' | 'exam_prep' | 'review' | 'learning'
  }
  constraints?: {
    blackoutDates?: Date[]
    maxSessionsPerDay?: number
    minBreakBetweenSessions?: number // minutes
  }
  existingContent?: Array<{
    subjectId: string
    sourceIds: string[]
    chunkCount: number
  }>
}

export interface StudySession {
  subjectId: string
  title: string
  description: string
  sessionType: 'study' | 'review' | 'practice' | 'exam_prep' | 'break'
  scheduledDate: Date
  startTime: string // "09:00"
  endTime: string // "10:30"
  priority: 'low' | 'medium' | 'high' | 'critical'
  topics: string[]
  materials?: string[] // content source IDs
  estimatedDifficulty: number // 1-5
  focusPoints?: string[]
}

export interface StudyPlan {
  id?: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  sessions: StudySession[]
  goals: Array<{
    subjectId: string
    goalType: 'completion' | 'mastery' | 'time_based' | 'score_based'
    targetValue: number
    deadline?: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
  }>
  recommendations: string[]
  totalStudyHours: number
  averageHoursPerDay: number
  metadata: {
    generatedAt: Date
    model: string
    version: string
  }
}

interface TimeSlot {
  start: string
  end: string
  durationMinutes: number
}

export class StudyPlanGenerator {
  private model = 'gpt-4o-mini'

  async generatePlan(request: StudyPlanRequest): Promise<StudyPlan> {
    const totalDays = differenceInDays(request.endDate, request.startDate) + 1
    const workingDays = this.calculateWorkingDays(
      request.startDate,
      request.endDate,
      request.preferences.avoidWeekends
    )

    // Calculate time allocation per subject based on difficulty and priority
    const subjectAllocations = this.calculateSubjectAllocations(request.subjects)

    // Generate daily schedule
    const sessions = await this.generateSessions(
      request,
      subjectAllocations,
      workingDays
    )

    // Generate goals based on subjects and timeline
    const goals = this.generateGoals(request.subjects, request.endDate)

    // Generate AI-powered recommendations
    const recommendations = await this.generateRecommendations(request, sessions)

    // Calculate statistics
    const totalStudyHours = sessions.reduce((sum, session) => {
      const duration = this.calculateDuration(session.startTime, session.endTime)
      return sum + duration / 60
    }, 0)

    return {
      title: request.title,
      description: request.description || `AI-generated study plan for ${totalDays} days`,
      startDate: request.startDate,
      endDate: request.endDate,
      sessions,
      goals,
      recommendations,
      totalStudyHours,
      averageHoursPerDay: totalStudyHours / workingDays,
      metadata: {
        generatedAt: new Date(),
        model: this.model,
        version: '1.0.0'
      }
    }
  }

  private calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    avoidWeekends?: boolean
  ): number {
    let count = 0
    let current = startOfDay(startDate)
    const end = startOfDay(endDate)

    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (!avoidWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        count++
      }
      current = addDays(current, 1)
    }

    return count
  }

  private calculateSubjectAllocations(subjects: StudyPlanRequest['subjects']): Map<string, number> {
    const allocations = new Map<string, number>()
    
    // Calculate weighted scores for each subject
    const totalWeight = subjects.reduce((sum, subject) => {
      const examUrgency = subject.examDate 
        ? Math.max(1, 6 - differenceInDays(subject.examDate, new Date()) / 7)
        : 1
      const progressGap = (100 - (subject.currentProgress || 0)) / 100
      const weight = subject.difficulty * subject.priority * examUrgency * progressGap
      return sum + weight
    }, 0)

    // Allocate percentages based on weights
    subjects.forEach(subject => {
      const examUrgency = subject.examDate 
        ? Math.max(1, 6 - differenceInDays(subject.examDate, new Date()) / 7)
        : 1
      const progressGap = (100 - (subject.currentProgress || 0)) / 100
      const weight = subject.difficulty * subject.priority * examUrgency * progressGap
      allocations.set(subject.id, (weight / totalWeight) * 100)
    })

    return allocations
  }

  private async generateSessions(
    request: StudyPlanRequest,
    allocations: Map<string, number>,
    workingDays: number
  ): Promise<StudySession[]> {
    const sessions: StudySession[] = []
    const sessionDuration = request.preferences.sessionDuration || 90
    const breakDuration = request.preferences.breakDuration || 15
    const dailyHours = request.preferences.studyHoursPerDay
    const sessionsPerDay = Math.floor((dailyHours * 60) / (sessionDuration + breakDuration))

    let current = startOfDay(request.startDate)
    const end = startOfDay(request.endDate)

    // Track subject coverage to ensure balanced distribution
    const subjectSessionCounts = new Map<string, number>()
    request.subjects.forEach(s => subjectSessionCounts.set(s.id, 0))

    while (current <= end) {
      const dayOfWeek = current.getDay()
      
      // Skip weekends if requested
      if (request.preferences.avoidWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        current = addDays(current, 1)
        continue
      }

      // Check blackout dates
      if (request.constraints?.blackoutDates?.some(d => 
        startOfDay(d).getTime() === current.getTime()
      )) {
        current = addDays(current, 1)
        continue
      }

      // Generate sessions for this day
      const timeSlots = this.generateTimeSlots(
        request.preferences.preferredTimeSlots || [{ start: '09:00', end: '17:00' }],
        sessionDuration,
        breakDuration,
        Math.min(sessionsPerDay, request.constraints?.maxSessionsPerDay || sessionsPerDay)
      )

      // Assign subjects to time slots based on allocations
      const daySubjects = this.selectSubjectsForDay(
        request.subjects,
        allocations,
        subjectSessionCounts,
        timeSlots.length,
        current
      )

      for (let i = 0; i < timeSlots.length && i < daySubjects.length; i++) {
        const slot = timeSlots[i]
        const subject = daySubjects[i]
        
        // Determine session type based on progress and timing
        const sessionType = this.determineSessionType(
          subject,
          current,
          subjectSessionCounts.get(subject.id) || 0
        )

        // Generate session details
        const session: StudySession = {
          subjectId: subject.id,
          title: `${subject.name} - ${this.getSessionTypeLabel(sessionType)}`,
          description: await this.generateSessionDescription(subject, sessionType),
          sessionType,
          scheduledDate: current,
          startTime: slot.start,
          endTime: slot.end,
          priority: this.calculateSessionPriority(subject, current),
          topics: this.selectTopicsForSession(subject.topics || [], sessionType),
          estimatedDifficulty: subject.difficulty,
          focusPoints: await this.generateFocusPoints(subject, sessionType)
        }

        sessions.push(session)
        subjectSessionCounts.set(subject.id, (subjectSessionCounts.get(subject.id) || 0) + 1)
      }

      current = addDays(current, 1)
    }

    // Add review sessions before exams
    const examReviewSessions = this.generateExamReviewSessions(request.subjects, sessions)
    sessions.push(...examReviewSessions)

    // Sort sessions by date and time
    sessions.sort((a, b) => {
      const dateCompare = a.scheduledDate.getTime() - b.scheduledDate.getTime()
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })

    return sessions
  }

  private generateTimeSlots(
    preferredSlots: Array<{ start: string; end: string }>,
    sessionDuration: number,
    breakDuration: number,
    maxSessions: number
  ): TimeSlot[] {
    const slots: TimeSlot[] = []

    for (const preferred of preferredSlots) {
      const [startHour, startMinute] = preferred.start.split(':').map(Number)
      const [endHour, endMinute] = preferred.end.split(':').map(Number)
      
      let currentMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute

      while (currentMinutes + sessionDuration <= endMinutes && slots.length < maxSessions) {
        const start = `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`
        const endTime = currentMinutes + sessionDuration
        const end = `${Math.floor(endTime / 60).toString().padStart(2, '0')}:${(endTime % 60).toString().padStart(2, '0')}`

        slots.push({
          start,
          end,
          durationMinutes: sessionDuration
        })

        currentMinutes += sessionDuration + breakDuration
      }
    }

    return slots
  }

  private selectSubjectsForDay(
    subjects: StudyPlanRequest['subjects'],
    allocations: Map<string, number>,
    sessionCounts: Map<string, number>,
    slotsAvailable: number,
    date: Date
  ): StudyPlanRequest['subjects'] {
    // Sort subjects by priority for this day
    const subjectsWithScore = subjects.map(subject => {
      const allocation = allocations.get(subject.id) || 0
      const currentCount = sessionCounts.get(subject.id) || 0
      const totalSessions = sessionCounts.values()
      const totalCount = Array.from(totalSessions).reduce((sum, count) => sum + count, 0)
      
      // Calculate how far behind or ahead this subject is from its target allocation
      const targetCount = (allocation / 100) * totalCount
      const deficit = targetCount - currentCount

      // Urgency score if exam is approaching
      const examUrgency = subject.examDate
        ? Math.max(0, 10 - differenceInDays(subject.examDate, date))
        : 0

      const score = deficit + subject.priority + examUrgency

      return { subject, score }
    })

    // Sort by score and select top subjects for available slots
    subjectsWithScore.sort((a, b) => b.score - a.score)

    return subjectsWithScore
      .slice(0, slotsAvailable)
      .map(item => item.subject)
  }

  private determineSessionType(
    subject: StudyPlanRequest['subjects'][0],
    date: Date,
    sessionCount: number
  ): StudySession['sessionType'] {
    // Exam prep if exam is within 7 days
    if (subject.examDate && differenceInDays(subject.examDate, date) <= 7) {
      return 'exam_prep'
    }

    // Review every 3rd session
    if (sessionCount > 0 && sessionCount % 3 === 0) {
      return 'review'
    }

    // Practice every 5th session
    if (sessionCount > 0 && sessionCount % 5 === 0) {
      return 'practice'
    }

    return 'study'
  }

  private getSessionTypeLabel(type: StudySession['sessionType']): string {
    const labels = {
      study: 'Study Session',
      review: 'Review Session',
      practice: 'Practice Problems',
      exam_prep: 'Exam Preparation',
      break: 'Break'
    }
    return labels[type]
  }

  private async generateSessionDescription(
    subject: StudyPlanRequest['subjects'][0],
    sessionType: StudySession['sessionType']
  ): Promise<string> {
    const descriptions = {
      study: `Learn new concepts in ${subject.name}. Focus on understanding fundamental principles and taking comprehensive notes.`,
      review: `Review previously studied material in ${subject.name}. Consolidate knowledge and identify areas needing more attention.`,
      practice: `Work through practice problems and exercises for ${subject.name}. Apply learned concepts to reinforce understanding.`,
      exam_prep: `Intensive exam preparation for ${subject.name}. Focus on past papers, key topics, and time management strategies.`,
      break: `Take a break to rest and recharge. Light physical activity or relaxation recommended.`
    }
    return descriptions[sessionType]
  }

  private calculateSessionPriority(
    subject: StudyPlanRequest['subjects'][0],
    date: Date
  ): StudySession['priority'] {
    if (subject.examDate) {
      const daysUntilExam = differenceInDays(subject.examDate, date)
      if (daysUntilExam <= 3) return 'critical'
      if (daysUntilExam <= 7) return 'high'
      if (daysUntilExam <= 14) return 'medium'
    }

    if (subject.priority >= 4) return 'high'
    if (subject.priority >= 2) return 'medium'
    return 'low'
  }

  private selectTopicsForSession(
    topics: string[],
    sessionType: StudySession['sessionType']
  ): string[] {
    if (topics.length === 0) return []

    switch (sessionType) {
      case 'study':
        // New topics - take next 2-3
        return topics.slice(0, 3)
      case 'review':
        // Random selection of previous topics
        return topics.sort(() => Math.random() - 0.5).slice(0, 4)
      case 'practice':
        // Focus on challenging topics
        return topics.slice(0, 2)
      case 'exam_prep':
        // All important topics
        return topics.slice(0, 5)
      default:
        return []
    }
  }

  private async generateFocusPoints(
    subject: StudyPlanRequest['subjects'][0],
    sessionType: StudySession['sessionType']
  ): Promise<string[]> {
    const focusPoints: string[] = []

    switch (sessionType) {
      case 'study':
        focusPoints.push('Read and understand new material thoroughly')
        focusPoints.push('Take detailed notes with examples')
        focusPoints.push('Identify key concepts and definitions')
        break
      case 'review':
        focusPoints.push('Summarize main concepts from memory')
        focusPoints.push('Review notes and fill knowledge gaps')
        focusPoints.push('Create connections between topics')
        break
      case 'practice':
        focusPoints.push('Complete practice problems independently')
        focusPoints.push('Time yourself to improve speed')
        focusPoints.push('Review mistakes and understand solutions')
        break
      case 'exam_prep':
        focusPoints.push('Review past exam papers')
        focusPoints.push('Practice under timed conditions')
        focusPoints.push('Focus on frequently tested topics')
        break
    }

    return focusPoints
  }

  private generateExamReviewSessions(
    subjects: StudyPlanRequest['subjects'],
    existingSessions: StudySession[]
  ): StudySession[] {
    const examReviews: StudySession[] = []

    subjects.forEach(subject => {
      if (!subject.examDate) return

      // Add intensive review sessions 3, 2, and 1 day before exam
      for (let daysBefore = 3; daysBefore >= 1; daysBefore--) {
        const reviewDate = addDays(subject.examDate, -daysBefore)
        
        // Check if we already have sessions on this day
        const existingOnDate = existingSessions.filter(s => 
          startOfDay(s.scheduledDate).getTime() === startOfDay(reviewDate).getTime() &&
          s.subjectId === subject.id
        )

        if (existingOnDate.length < 2) {
          examReviews.push({
            subjectId: subject.id,
            title: `${subject.name} - Final Review (${daysBefore} day${daysBefore > 1 ? 's' : ''} before exam)`,
            description: `Intensive review session focusing on exam preparation. Review all key topics, formulas, and practice exam techniques.`,
            sessionType: 'exam_prep',
            scheduledDate: reviewDate,
            startTime: daysBefore === 1 ? '19:00' : '18:00',
            endTime: daysBefore === 1 ? '21:00' : '20:00',
            priority: 'critical',
            topics: subject.topics || [],
            estimatedDifficulty: subject.difficulty,
            focusPoints: [
              'Review all key concepts and formulas',
              'Practice past exam questions',
              'Focus on weak areas identified in previous sessions',
              'Prepare exam strategy and time management'
            ]
          })
        }
      }
    })

    return examReviews
  }

  private generateGoals(
    subjects: StudyPlanRequest['subjects'],
    endDate: Date
  ): StudyPlan['goals'] {
    return subjects.map(subject => ({
      subjectId: subject.id,
      goalType: subject.examDate ? 'score_based' as const : 'mastery' as const,
      targetValue: subject.examDate ? 85 : 100, // 85% for exams, 100% completion otherwise
      deadline: subject.examDate || endDate,
      priority: subject.priority >= 4 ? 'high' as const : subject.priority >= 2 ? 'medium' as const : 'low' as const
    }))
  }

  private async generateRecommendations(
    request: StudyPlanRequest,
    sessions: StudySession[]
  ): Promise<string[]> {
    const recommendations: string[] = []

    // Analyze session distribution
    const subjectCounts = new Map<string, number>()
    sessions.forEach(s => {
      subjectCounts.set(s.subjectId, (subjectCounts.get(s.subjectId) || 0) + 1)
    })

    // Check for imbalances
    request.subjects.forEach(subject => {
      const count = subjectCounts.get(subject.id) || 0
      const avgCount = sessions.length / request.subjects.length

      if (count < avgCount * 0.7 && subject.priority >= 3) {
        recommendations.push(`Consider allocating more time to ${subject.name} as it has high priority but fewer sessions`)
      }

      if (subject.examDate) {
        const daysUntilExam = differenceInDays(subject.examDate, new Date())
        if (daysUntilExam <= 14) {
          recommendations.push(`Focus on ${subject.name} - exam in ${daysUntilExam} days`)
        }
      }
    })

    // General study tips
    if (request.preferences.studyHoursPerDay > 6) {
      recommendations.push('Consider reducing daily study hours to prevent burnout')
    }

    if (sessions.filter(s => s.sessionType === 'review').length < sessions.length * 0.2) {
      recommendations.push('Add more review sessions to reinforce learning')
    }

    // Add AI-generated personalized recommendation
    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert study coach providing personalized recommendations.'
            },
            {
              role: 'user',
              content: `Generate 2-3 specific study recommendations for a student with these subjects: ${request.subjects.map(s => s.name).join(', ')}. Study period: ${totalDays} days, ${request.preferences.studyHoursPerDay} hours/day.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })

        const aiRecommendations = completion.choices[0].message.content?.split('\n').filter(r => r.trim()) || []
        recommendations.push(...aiRecommendations.slice(0, 2))
      } catch (error) {
        console.error('Failed to generate AI recommendations:', error)
      }
    }

    return recommendations
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    
    return endMinutes - startMinutes
  }
}

const totalDays = 0 // This line will be removed in actual usage
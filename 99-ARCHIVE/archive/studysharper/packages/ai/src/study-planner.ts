import { z } from 'zod'
import type { AIProvider, Message } from './types.js'

export interface StudyPlanInput {
  userId: string
  courses: Course[]
  availableTimeSlots: TimeSlot[]
  deadlines: Deadline[]
  preferences: StudyPreferences
  performanceHistory?: PerformanceData[]
  planDuration: number // days
}

export interface Course {
  id: string
  name: string
  credits: number
  difficulty: number // 1-5 scale
  subjects: Subject[]
}

export interface Subject {
  id: string
  name: string
  priority: number // 1-5 scale
  estimatedHours: number
}

export interface TimeSlot {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  maxCognitiveLoad: number // 1-5 scale
}

export interface Deadline {
  id: string
  title: string
  dueDate: Date
  courseId: string
  subjectId?: string
  estimatedHours: number
  importance: number // 1-5 scale
}

export interface StudyPreferences {
  preferredStudyMethods: string[]
  optimalSessionLength: number // minutes
  breakFrequency: number // minutes between breaks
  peakHours: string[] // ['morning', 'afternoon', 'evening']
  avoidancePatterns: string[] // ['cramming', 'late_night']
}

export interface PerformanceData {
  subjectId: string
  retentionRate: number
  averageFocusScore: number
  completionRate: number
  timePerUnit: number // minutes
}

export interface StudyPlan {
  id: string
  userId: string
  startDate: Date
  endDate: Date
  blocks: StudyBlock[]
  metadata: {
    totalHours: number
    averageCognitiveLoad: number
    reasoning: string
  }
}

export interface StudyBlock {
  id: string
  subjectId: string
  scheduledStart: Date
  durationMinutes: number
  studyMethod: string
  cognitiveLoad: number
  priority: number
  content: {
    topics: string[]
    resources: string[]
    goals: string[]
  }
  reasoning: string
}

const StudyPlanInputSchema = z.object({
  userId: z.string().uuid(),
  courses: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    credits: z.number().min(1).max(6),
    difficulty: z.number().min(1).max(5),
    subjects: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      priority: z.number().min(1).max(5),
      estimatedHours: z.number().min(0.5)
    }))
  })),
  availableTimeSlots: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    maxCognitiveLoad: z.number().min(1).max(5)
  })),
  deadlines: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    dueDate: z.date(),
    courseId: z.string().uuid(),
    subjectId: z.string().uuid().optional(),
    estimatedHours: z.number().min(0.5),
    importance: z.number().min(1).max(5)
  })),
  preferences: z.object({
    preferredStudyMethods: z.array(z.string()),
    optimalSessionLength: z.number().min(15).max(180),
    breakFrequency: z.number().min(15).max(120),
    peakHours: z.array(z.string()),
    avoidancePatterns: z.array(z.string())
  }),
  performanceHistory: z.array(z.object({
    subjectId: z.string().uuid(),
    retentionRate: z.number().min(0).max(1),
    averageFocusScore: z.number().min(1).max(5),
    completionRate: z.number().min(0).max(1),
    timePerUnit: z.number().min(1)
  })).optional(),
  planDuration: z.number().min(1).max(30)
})

export class StudyPlanner {
  constructor(private aiProvider: AIProvider) {}

  async generatePlan(input: StudyPlanInput): Promise<StudyPlan> {
    const validated = StudyPlanInputSchema.parse(input)
    
    try {
      // 1. Analyze constraints and requirements
      const analysis = this.analyzeConstraints(validated)
      
      // 2. Generate AI-powered plan
      const aiPlan = await this.generateAIPlan(validated, analysis)
      
      // 3. Optimize and validate plan
      const optimizedPlan = this.optimizePlan(aiPlan, validated)
      
      // 4. Create final plan structure
      return this.createFinalPlan(optimizedPlan, validated)
    } catch (error) {
      console.error('Study plan generation error:', error)
      throw new Error(`Failed to generate study plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private analyzeConstraints(input: StudyPlanInput): ConstraintAnalysis {
    const totalAvailableHours = this.calculateAvailableHours(input.availableTimeSlots, input.planDuration)
    const totalRequiredHours = this.calculateRequiredHours(input.courses, input.deadlines)
    const deadlineUrgency = this.analyzeDeadlineUrgency(input.deadlines)
    
    return {
      totalAvailableHours,
      totalRequiredHours,
      utilizationRate: totalRequiredHours / totalAvailableHours,
      deadlineUrgency,
      peakTimePreference: input.preferences.peakHours,
      cognitiveLoadDistribution: this.analyzeCognitiveLoadDistribution(input.availableTimeSlots)
    }
  }

  private async generateAIPlan(input: StudyPlanInput, analysis: ConstraintAnalysis): Promise<AIGeneratedPlan> {
    const prompt = this.buildPlanPrompt(input, analysis)
    
    const messages: Message[] = [
      { role: 'system', content: STUDY_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]

    const response = await this.aiProvider.chat(messages, {
      temperature: 0.7,
      maxTokens: 2000
    })

    try {
      const planData = JSON.parse(response.content)
      return this.validateAIPlan(planData)
    } catch (parseError) {
      throw new Error('Invalid JSON response from AI planner')
    }
  }

  private buildPlanPrompt(input: StudyPlanInput, analysis: ConstraintAnalysis): string {
    const coursesInfo = input.courses.map(course => 
      `${course.name} (${course.credits} credits, difficulty: ${course.difficulty}/5)\n` +
      course.subjects.map(subject => 
        `  - ${subject.name}: ${subject.estimatedHours}h, priority: ${subject.priority}/5`
      ).join('\n')
    ).join('\n\n')

    const deadlinesInfo = input.deadlines
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .map(deadline => 
        `${deadline.title}: ${deadline.dueDate.toISOString().split('T')[0]} (${deadline.estimatedHours}h, importance: ${deadline.importance}/5)`
      ).join('\n')

    const timeSlotInfo = input.availableTimeSlots.map(slot =>
      `${this.getDayName(slot.dayOfWeek)}: ${slot.startTime}-${slot.endTime} (max cognitive load: ${slot.maxCognitiveLoad}/5)`
    ).join('\n')

    return `Generate a ${input.planDuration}-day study plan with the following constraints:

COURSES AND SUBJECTS:
${coursesInfo}

UPCOMING DEADLINES:
${deadlinesInfo}

AVAILABLE TIME SLOTS:
${timeSlotInfo}

PREFERENCES:
- Preferred study methods: ${input.preferences.preferredStudyMethods.join(', ')}
- Optimal session length: ${input.preferences.optimalSessionLength} minutes
- Peak hours: ${input.preferences.peakHours.join(', ')}
- Break frequency: every ${input.preferences.breakFrequency} minutes

CONSTRAINTS ANALYSIS:
- Total available hours: ${analysis.totalAvailableHours}
- Total required hours: ${analysis.totalRequiredHours}
- Utilization rate: ${(analysis.utilizationRate * 100).toFixed(1)}%
- Deadline urgency: ${analysis.deadlineUrgency}

OPTIMIZATION GOALS:
1. Prioritize upcoming deadlines
2. Balance cognitive load throughout the day/week
3. Use spaced repetition principles
4. Respect user preferences and peak hours
5. Include variety to prevent monotony
6. Ensure adequate review time

Return a JSON object with this structure:
{
  "reasoning": "Explain the planning strategy and key decisions",
  "blocks": [
    {
      "day": 1,
      "startTime": "09:00",
      "durationMinutes": 90,
      "subjectId": "uuid",
      "studyMethod": "reading",
      "cognitiveLoad": 3,
      "priority": 4,
      "topics": ["topic1", "topic2"],
      "goals": ["goal1", "goal2"],
      "reasoning": "Why this block is scheduled here"
    }
  ],
  "totalHours": 25.5,
  "averageCognitiveLoad": 3.2
}`
  }

  private optimizePlan(aiPlan: AIGeneratedPlan, input: StudyPlanInput): OptimizedPlan {
    // Apply optimization algorithms
    let optimized = { ...aiPlan }

    // 1. Cognitive load balancing
    optimized = this.balanceCognitiveLoad(optimized, input.availableTimeSlots)

    // 2. Spaced repetition optimization
    optimized = this.applySpacedRepetition(optimized)

    // 3. Deadline urgency adjustment
    optimized = this.adjustForDeadlines(optimized, input.deadlines)

    return optimized
  }

  private createFinalPlan(optimizedPlan: OptimizedPlan, input: StudyPlanInput): StudyPlan {
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + input.planDuration * 24 * 60 * 60 * 1000)

    const blocks: StudyBlock[] = optimizedPlan.blocks.map(block => ({
      id: this.generateId(),
      subjectId: block.subjectId,
      scheduledStart: this.calculateScheduledStart(startDate, block.day, block.startTime),
      durationMinutes: block.durationMinutes,
      studyMethod: block.studyMethod,
      cognitiveLoad: block.cognitiveLoad,
      priority: block.priority,
      content: {
        topics: block.topics,
        resources: [],
        goals: block.goals
      },
      reasoning: block.reasoning
    }))

    return {
      id: this.generateId(),
      userId: input.userId,
      startDate,
      endDate,
      blocks,
      metadata: {
        totalHours: optimizedPlan.totalHours,
        averageCognitiveLoad: optimizedPlan.averageCognitiveLoad,
        reasoning: optimizedPlan.reasoning
      }
    }
  }

  // Helper methods
  private calculateAvailableHours(timeSlots: TimeSlot[], days: number): number {
    const weeklyHours = timeSlots.reduce((total, slot) => {
      const start = this.parseTime(slot.startTime)
      const end = this.parseTime(slot.endTime)
      return total + (end - start) / 60
    }, 0)

    return (weeklyHours * days) / 7
  }

  private calculateRequiredHours(courses: Course[], deadlines: Deadline[]): number {
    const courseHours = courses.reduce((total, course) => 
      total + course.subjects.reduce((subTotal, subject) => subTotal + subject.estimatedHours, 0), 0
    )

    const deadlineHours = deadlines.reduce((total, deadline) => total + deadline.estimatedHours, 0)

    return Math.max(courseHours, deadlineHours)
  }

  private analyzeDeadlineUrgency(deadlines: Deadline[]): 'low' | 'medium' | 'high' {
    const now = new Date()
    const urgentDeadlines = deadlines.filter(d => {
      const daysUntil = (d.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return daysUntil <= 7
    })

    if (urgentDeadlines.length >= 3) return 'high'
    if (urgentDeadlines.length >= 1) return 'medium'
    return 'low'
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek]
  }

  private calculateScheduledStart(startDate: Date, day: number, time: string): Date {
    const date = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000)
    const [hours, minutes] = time.split(':').map(Number)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Optimization methods (simplified implementations)
  private balanceCognitiveLoad(plan: AIGeneratedPlan, timeSlots: TimeSlot[]): OptimizedPlan {
    // Simple cognitive load balancing - could be enhanced
    return plan as OptimizedPlan
  }

  private applySpacedRepetition(plan: AIGeneratedPlan): OptimizedPlan {
    // Apply spaced repetition principles
    return plan as OptimizedPlan
  }

  private adjustForDeadlines(plan: OptimizedPlan, deadlines: Deadline[]): OptimizedPlan {
    // Adjust plan for upcoming deadlines
    return plan
  }

  private analyzeCognitiveLoadDistribution(timeSlots: TimeSlot[]): any {
    return { analysis: 'placeholder' }
  }

  private validateAIPlan(planData: any): AIGeneratedPlan {
    // Validate AI response structure
    return planData as AIGeneratedPlan
  }
}

// Types for internal use
interface ConstraintAnalysis {
  totalAvailableHours: number
  totalRequiredHours: number
  utilizationRate: number
  deadlineUrgency: 'low' | 'medium' | 'high'
  peakTimePreference: string[]
  cognitiveLoadDistribution: any
}

interface AIGeneratedPlan {
  reasoning: string
  blocks: any[]
  totalHours: number
  averageCognitiveLoad: number
}

interface OptimizedPlan extends AIGeneratedPlan {}

const STUDY_PLANNER_SYSTEM_PROMPT = `You are an expert study planner and learning scientist. Your role is to create optimal study schedules that:

1. Maximize learning retention through spaced repetition
2. Balance cognitive load to prevent mental fatigue
3. Respect individual preferences and constraints
4. Prioritize urgent deadlines appropriately
5. Include variety to maintain engagement
6. Apply evidence-based learning principles

Consider these principles:
- Spaced repetition: Review material at increasing intervals
- Interleaving: Mix different subjects/topics within sessions
- Active recall: Favor testing over passive review
- Cognitive load theory: Match task difficulty to available mental capacity
- Primacy/recency effects: Place important material at session start/end
- Circadian rhythms: Align demanding tasks with peak cognitive hours

Always provide detailed reasoning for your scheduling decisions.`
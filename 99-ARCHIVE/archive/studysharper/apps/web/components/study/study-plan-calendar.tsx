'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, isToday, isBefore, isAfter } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  BookOpen,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Sparkles,
  RefreshCw,
  Plus,
  Filter
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface StudySession {
  id: string
  plan_id: string
  subject_id: string
  title: string
  description: string
  session_type: 'study' | 'review' | 'practice' | 'exam_prep' | 'break'
  scheduled_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  topics: string[]
  materials: string[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled'
  subjects?: { name: string }
  metadata?: {
    estimatedDifficulty?: number
    focusPoints?: string[]
  }
}

interface StudyPlan {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  study_hours_per_day: number
  study_sessions: StudySession[]
  study_goals: Array<{
    id: string
    subject_id: string
    goal_type: string
    target_value: number
    current_value: number
    deadline: string
    priority: string
    status: string
  }>
  study_recommendations: Array<{
    id: string
    title: string
    description: string
    priority: string
    status: string
  }>
}

interface StudyStats {
  total_study_time_minutes: number
  average_daily_minutes: number
  subjects_studied: number
  sessions_completed: number
  current_streak_days: number
  longest_streak_days: number
}

interface StudyPlanCalendarProps {
  planId?: string
  onSessionStart?: (session: StudySession) => void
  onSessionComplete?: (session: StudySession) => void
  className?: string
}

export function StudyPlanCalendar({ planId, onSessionStart, onSessionComplete, className }: StudyPlanCalendarProps) {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterSubject, setFilterSubject] = useState<string | null>(null)

  useEffect(() => {
    if (planId) {
      loadPlan(planId)
    } else {
      loadActivePlan()
    }
  }, [planId])

  const loadPlan = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/study/plans?plan_id=${id}`)
      const data = await response.json()

      if (data.success) {
        setPlan(data.plan)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to load study plan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadActivePlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/study/plans?status=active')
      const data = await response.json()

      if (data.success && data.plans.length > 0) {
        // Load the first active plan
        loadPlan(data.plans[0].id)
      }
    } catch (error) {
      console.error('Failed to load active plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSession = async (session: StudySession) => {
    try {
      const response = await fetch('/api/study/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          sessionStatus: 'in_progress'
        })
      })

      if (response.ok) {
        setActiveSession(session.id)
        toast({
          title: 'Session Started',
          description: `Started ${session.title}`
        })
        onSessionStart?.(session)
        loadPlan(session.plan_id)
      }
    } catch (error) {
      console.error('Failed to start session:', error)
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive'
      })
    }
  }

  const completeSession = async (session: StudySession, notes?: string) => {
    try {
      const response = await fetch('/api/study/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          sessionStatus: 'completed',
          progress: {
            subjectId: session.subject_id,
            duration: session.duration_minutes,
            topics: session.topics,
            confidence: 4,
            notes
          }
        })
      })

      if (response.ok) {
        setActiveSession(null)
        toast({
          title: 'Session Completed',
          description: `Completed ${session.title}`
        })
        onSessionComplete?.(session)
        loadPlan(session.plan_id)
      }
    } catch (error) {
      console.error('Failed to complete session:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete session',
        variant: 'destructive'
      })
    }
  }

  const skipSession = async (session: StudySession) => {
    try {
      const response = await fetch('/api/study/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          sessionStatus: 'skipped'
        })
      })

      if (response.ok) {
        toast({
          title: 'Session Skipped',
          description: `Skipped ${session.title}`
        })
        loadPlan(session.plan_id)
      }
    } catch (error) {
      console.error('Failed to skip session:', error)
    }
  }

  // Calendar calculations
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const startWeek = startOfWeek(start)
    const endWeek = endOfWeek(end)
    return eachDayOfInterval({ start: startWeek, end: endWeek })
  }, [currentDate])

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const displayDays = viewMode === 'week' ? weekDays : monthDays

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    if (!plan) return []
    
    return plan.study_sessions.filter(session => {
      const sessionDate = new Date(session.scheduled_date)
      return isSameDay(sessionDate, date) && 
        (!filterSubject || session.subject_id === filterSubject)
    })
  }

  // Get unique subjects from sessions
  const subjects = useMemo(() => {
    if (!plan) return []
    const subjectMap = new Map()
    plan.study_sessions.forEach(session => {
      if (session.subjects) {
        subjectMap.set(session.subject_id, session.subjects.name)
      }
    })
    return Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }))
  }, [plan])

  const sessionTypeColors = {
    study: 'bg-blue-500',
    review: 'bg-purple-500',
    practice: 'bg-green-500',
    exam_prep: 'bg-red-500',
    break: 'bg-gray-400'
  }

  const priorityColors = {
    low: 'text-gray-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-red-500'
  }

  const renderCalendarDay = (date: Date) => {
    const sessions = getSessionsForDate(date)
    const isSelected = selectedDate && isSameDay(date, selectedDate)
    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
    
    return (
      <div
        key={date.toISOString()}
        className={`
          min-h-[100px] p-2 border cursor-pointer transition-colors
          ${isToday(date) ? 'bg-primary/5 border-primary' : ''}
          ${isSelected ? 'bg-accent' : 'hover:bg-muted/50'}
          ${!isCurrentMonth ? 'opacity-50' : ''}
        `}
        onClick={() => setSelectedDate(date)}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${isToday(date) ? 'text-primary' : ''}`}>
            {format(date, 'd')}
          </span>
          {sessions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {sessions.length}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          {sessions.slice(0, 3).map((session, idx) => (
            <div
              key={session.id}
              className={`text-xs p-1 rounded ${sessionTypeColors[session.session_type]} text-white truncate`}
            >
              {session.start_time} - {session.subjects?.name || 'Session'}
            </div>
          ))}
          {sessions.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{sessions.length - 3} more
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const date = selectedDate || new Date()
    const sessions = getSessionsForDate(date)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h3>
          <Badge variant="outline">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions scheduled for this day
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <Card key={session.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {session.title}
                        <Badge variant="secondary" className="text-xs">
                          {session.session_type}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {session.start_time} - {session.end_time}
                        <span className={priorityColors[session.priority]}>
                          ({session.priority} priority)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {session.status === 'scheduled' && (
                        <>
                          {activeSession === session.id ? (
                            <Button
                              size="sm"
                              onClick={() => completeSession(session)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startSession(session)}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => skipSession(session)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {session.status === 'completed' && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {session.status === 'skipped' && (
                        <Badge variant="secondary">
                          Skipped
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {session.description}
                  </p>
                  
                  {session.topics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {session.topics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {session.metadata?.focusPoints && (
                    <div>
                      <p className="text-xs font-medium mb-1">Focus Points:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {session.metadata.focusPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-primary mt-0.5">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!plan) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Active Study Plan</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Create a study plan to organize your learning schedule and track progress.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Study Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </div>
            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
              {plan.status}
            </Badge>
          </div>
        </CardHeader>
        {stats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Study Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(stats.total_study_time_minutes / 60)}h
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">
                  {stats.current_streak_days} days
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
                <p className="text-2xl font-bold">
                  {stats.sessions_completed}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Subjects Studied</p>
                <p className="text-2xl font-bold">
                  {stats.subjects_studied}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Calendar and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Study Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <TabsList>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {subjects.length > 0 && (
                  <select
                    className="text-sm border rounded px-2 py-1"
                    value={filterSubject || ''}
                    onChange={(e) => setFilterSubject(e.target.value || null)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {viewMode === 'day' ? (
              renderDayView()
            ) : (
              <>
                {/* Month/Week navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <h3 className="text-lg font-semibold">
                    {format(currentDate, viewMode === 'week' ? "'Week of' MMM d, yyyy" : 'MMMM yyyy')}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {displayDays.map(day => renderCalendarDay(day))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Today's sessions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {getSessionsForDate(new Date()).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sessions today</p>
                ) : (
                  <div className="space-y-2">
                    {getSessionsForDate(new Date()).map(session => (
                      <div key={session.id} className="p-2 border rounded space-y-1">
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.start_time} - {session.end_time}
                        </p>
                        {session.status === 'scheduled' && (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => startSession(session)}
                          >
                            Start Session
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Study Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.study_goals.slice(0, 3).map(goal => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Goal {goal.goal_type}</span>
                      <Badge variant={goal.priority === 'high' ? 'destructive' : 'secondary'}>
                        {goal.priority}
                      </Badge>
                    </div>
                    <Progress 
                      value={(goal.current_value / goal.target_value) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {goal.current_value}/{goal.target_value} - Due {format(new Date(goal.deadline), 'MMM d')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {plan.study_recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {plan.study_recommendations
                      .filter(rec => rec.status === 'pending')
                      .slice(0, 3)
                      .map(rec => (
                        <Alert key={rec.id}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {rec.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
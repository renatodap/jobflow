'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudyPlanCalendar } from '@/components/study/study-plan-calendar'
import { StudyPlanGenerator } from '@/components/study/study-plan-generator'
import { RAGChat } from '@/components/ai/rag-chat'
import { 
  Calendar, 
  Sparkles, 
  MessageSquare, 
  Target,
  Brain,
  BarChart3,
  Plus,
  BookOpen,
  Clock,
  TrendingUp
} from 'lucide-react'

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [showGenerator, setShowGenerator] = useState(false)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Hub</h1>
          <p className="text-muted-foreground">
            Manage your study plans, track progress, and get AI-powered assistance
          </p>
        </div>
        
        <Button onClick={() => setShowGenerator(!showGenerator)}>
          <Plus className="h-4 w-4 mr-2" />
          New Study Plan
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">4.5 hours total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">17/25 sessions completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Exam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">Mathematics</p>
          </CardContent>
        </Card>
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <StudyPlanGenerator 
          onPlanGenerated={() => {
            setShowGenerator(false)
            setActiveTab('calendar')
          }}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-[600px]">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <StudyPlanCalendar />
        </TabsContent>

        <TabsContent value="assistant" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RAGChat />
            </div>
            
            <div className="space-y-4">
              {/* Study Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Study Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Active Recall</p>
                    <p className="text-xs text-muted-foreground">
                      Test yourself frequently instead of passive reading
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Spaced Repetition</p>
                    <p className="text-xs text-muted-foreground">
                      Review material at increasing intervals for better retention
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Pomodoro Technique</p>
                    <p className="text-xs text-muted-foreground">
                      Study in 25-minute focused sessions with short breaks
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Materials */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Recent Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📄 Linear Algebra Notes.pdf
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📄 Physics Chapter 5.pdf
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    📄 Chemistry Formulas.pdf
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Goals</CardTitle>
                <CardDescription>
                  Track your progress towards study objectives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete Linear Algebra</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '75%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground">15 of 20 chapters completed</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Physics Problem Sets</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground">30 of 50 problems solved</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Chemistry Lab Reports</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '40%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground">4 of 10 reports completed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>
                  Upcoming deadlines and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Midterm Exams</p>
                    <p className="text-xs text-muted-foreground">In 2 weeks</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">100 Sessions Completed</p>
                    <p className="text-xs text-muted-foreground">8 sessions away</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">30-Day Streak</p>
                    <p className="text-xs text-muted-foreground">23 days to go</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Time Distribution</CardTitle>
                <CardDescription>
                  Hours spent per subject this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mathematics</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '40%' }} />
                      </div>
                      <span className="text-sm font-medium">8h</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Physics</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '30%' }} />
                      </div>
                      <span className="text-sm font-medium">6h</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chemistry</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: '20%' }} />
                      </div>
                      <span className="text-sm font-medium">4h</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Biology</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: '10%' }} />
                      </div>
                      <span className="text-sm font-medium">2h</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total this week</span>
                    <span className="font-medium">20 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Your study consistency over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const intensity = Math.random()
                      return (
                        <div
                          key={i}
                          className="aspect-square rounded-sm"
                          style={{
                            backgroundColor: 
                              intensity > 0.8 ? 'hsl(var(--primary))' :
                              intensity > 0.5 ? 'hsl(var(--primary) / 0.6)' :
                              intensity > 0.2 ? 'hsl(var(--primary) / 0.3)' :
                              'hsl(var(--muted))'
                          }}
                        />
                      )
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Less</span>
                    <span>More</span>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Best day</span>
                      <span className="font-medium">Tuesday (avg 4.2h)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Most productive time</span>
                      <span className="font-medium">9:00 AM - 11:00 AM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Session completion rate</span>
                      <span className="font-medium">82%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
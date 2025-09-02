import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, Target, TrendingUp, Plus } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export const metadata: Metadata = {
  title: 'Dashboard - StudySharper',
  description: 'Your personalized study dashboard with AI-powered insights.',
}

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/')
    }

    // Fetch user's basic data
    const { data: courses } = await supabase
      .from('courses')
      .select(`
        *,
        terms!inner(
          *,
          schools!inner(*)
        )
      `)
      .limit(5)

    const { data: upcomingTasks } = await supabase
      .from('tasks')
      .select(`
        *,
        courses!inner(name, color)
      `)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5)

    const { data: studySessions } = await supabase
      .from('study_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(7)

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .lte('next_review', new Date().toISOString())
      .limit(10)

    const user = session.user

    return (
      <DashboardLayout>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.user_metadata?.full_name || user.email}</h1>
              <p className="text-muted-foreground">Ready to learn something new today?</p>
            </div>
            <div className="flex items-center gap-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses?.length || 0}</div>
                <p className="text-xs text-muted-foreground">+2 from last semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingTasks?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Due this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">days in a row</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cards Due</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviews?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Ready for review</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Study Plan</CardTitle>
                <CardDescription>AI-generated schedule optimized for your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '9:00 AM', subject: 'Data Structures', method: 'Reading', duration: '45 min' },
                    { time: '10:30 AM', subject: 'Calculus II', method: 'Practice Problems', duration: '60 min' },
                    { time: '2:00 PM', subject: 'Physics I', method: 'Flashcards', duration: '30 min' },
                  ].map((block, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">{block.subject}</div>
                        <div className="text-sm text-muted-foreground">{block.method} • {block.duration}</div>
                      </div>
                      <div className="text-sm font-medium">{block.time}</div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    View Full Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your most important tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex-col gap-2" variant="outline">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Study Session</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2" variant="outline">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Review Cards</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2" variant="outline">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Add Notes</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2" variant="outline">
                    <Target className="h-6 w-6" />
                    <span className="text-sm">Set Goals</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your learning progress this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Completed study session', subject: 'Data Structures', time: '2 hours ago' },
                    { action: 'Reviewed 15 flashcards', subject: 'Calculus II', time: '4 hours ago' },
                    { action: 'Added notes', subject: 'Physics I', time: '1 day ago' },
                    { action: 'Generated study plan', subject: 'All courses', time: '2 days ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.subject}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Personalized recommendations for better learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      🧠 Study Tip
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      You learn best in the morning. Consider scheduling your most challenging subjects between 9-11 AM.
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">
                      🎯 Goal Progress
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-200 mt-1">
                      You're 85% on track for your weekly study goal. Keep up the great work!
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                    <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      ⚡ Optimization
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                      Try interleaving Physics and Math topics to improve retention by ~20%.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    redirect('/')
  }
}
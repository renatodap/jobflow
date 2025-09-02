import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Calendar, Target, TrendingUp, Zap, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'StudySharper - AI-Powered Study Assistant',
  description: 'Transform your learning with AI-driven study plans, spaced repetition, and intelligent recommendations.',
}

export default async function HomePage() {
  // Skip auth check during build when env vars are not available
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        }
      )
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        redirect('/dashboard')
      }
    } catch (error) {
      // Handle auth error gracefully
      console.error('Auth check failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">StudySharper</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Study Smarter with{' '}
                <span className="text-primary">AI-Powered</span>{' '}
                Intelligence
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Transform your learning with personalized study plans, intelligent spaced repetition, 
                and AI-driven insights that adapt to your unique learning style.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <LoginForm />
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>25% better retention</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>AI-optimized</span>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Smart Scheduling</CardTitle>
                <CardDescription>
                  AI-generated study plans that adapt to your calendar and cognitive load
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Spaced Repetition</CardTitle>
                <CardDescription>
                  Advanced algorithms optimize when you review to maximize long-term retention
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Intelligent Notes</CardTitle>
                <CardDescription>
                  Upload PDFs and documents, get AI-powered Q&A on your study materials
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Progress Analytics</CardTitle>
                <CardDescription>
                  Track your learning with detailed metrics and personalized insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to excel in your studies
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              StudySharper combines proven learning science with cutting-edge AI to create 
              the most effective study experience possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized study suggestions based on your performance, 
                schedule, and learning preferences.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Calendar Integration</h3>
              <p className="text-muted-foreground">
                Seamlessly sync with Google Calendar and automatically plan 
                study sessions around your existing commitments.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Research-Backed Methods</h3>
              <p className="text-muted-foreground">
                Built on proven learning techniques like spaced repetition, 
                active recall, and interleaving for maximum effectiveness.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="space-y-4">
              <CardTitle className="text-2xl">Ready to transform your learning?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of students who have improved their grades and 
                reduced study stress with StudySharper.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 StudySharper. Built with ❤️ for learners everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
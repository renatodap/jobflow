import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CourseManagement } from '@/components/courses/course-management'

export const metadata: Metadata = {
  title: 'Courses - StudySharper',
  description: 'Manage your academic structure and course organization.',
}

export default async function CoursesPage() {
  const supabase = createSupabaseServerClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/auth/login')
    }

    const userId = session.user.id

    // Fetch schools with full hierarchy
    const { data: schools } = await supabase
      .from('schools')
      .select(`
        *,
        terms (
          *,
          courses (
            *,
            subjects (*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Get current active term
    const { data: currentTerm } = await supabase
      .from('terms')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single()

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Course Management</h1>
            <p className="text-muted-foreground">
              Organize your academic structure: Schools → Terms → Courses → Subjects
            </p>
          </div>

          <CourseManagement 
            userId={userId}
            initialSchools={schools || []}
            currentTerm={currentTerm}
          />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Courses page error:', error)
    redirect('/auth/login')
  }
}
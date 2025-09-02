import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AcademicStructure } from '@/components/courses/academic-structure'

export const metadata: Metadata = {
  title: 'Academic Structure - StudySharper',
  description: 'Manage your schools, terms, courses, and subjects',
}

export default async function AcademicPage() {
  const supabase = createSupabaseServerClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/')
    }

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Academic Structure</h1>
            <p className="text-muted-foreground">
              Organize your educational journey with schools, terms, courses, and subjects
            </p>
          </div>
          
          <AcademicStructure />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Academic page error:', error)
    redirect('/')
  }
}
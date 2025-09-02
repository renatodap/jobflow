import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ContentIngestion } from '@/components/content/content-ingestion'

export const metadata: Metadata = {
  title: 'Content Library - StudySharper',
  description: 'Upload and manage your study materials',
}

export default async function ContentPage() {
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
            <h1 className="text-2xl font-bold">Content Library</h1>
            <p className="text-muted-foreground">
              Upload PDFs, documents, and other study materials for AI-powered assistance
            </p>
          </div>
          
          <ContentIngestion />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Content page error:', error)
    redirect('/')
  }
}
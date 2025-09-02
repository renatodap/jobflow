import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ChatInterface } from '@/components/chat/chat-interface'

export const metadata: Metadata = {
  title: 'AI Chat - StudySharper',
  description: 'Chat with your AI study assistant about your materials and courses.',
}

export default async function ChatPage() {
  const supabase = createSupabaseServerClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/auth/login')
    }

    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-8rem)]">
          <ChatInterface />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Chat page error:', error)
    redirect('/auth/login')
  }
}
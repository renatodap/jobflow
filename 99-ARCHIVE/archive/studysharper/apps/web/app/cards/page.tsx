import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SpacedRepetitionSystem } from '@/components/cards/spaced-repetition-system'

export const metadata: Metadata = {
  title: 'Flashcards - StudySharper',
  description: 'AI-powered spaced repetition flashcard system for optimal learning.',
}

export default async function CardsPage() {
  const supabase = createSupabaseServerClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/auth/login')
    }

    const userId = session.user.id

    // Fetch user's decks with card counts
    const { data: decks } = await supabase
      .from('decks')
      .select(`
        *,
        _count: cards!decks_id(count),
        subjects (
          id,
          name,
          courses (
            id,
            name,
            color
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Fetch cards due for review
    const { data: dueCards } = await supabase
      .from('reviews')
      .select(`
        *,
        cards!inner (
          id,
          front,
          back,
          decks!inner (
            id,
            name,
            subjects (
              id,
              name,
              courses (
                id,
                name,
                color
              )
            )
          )
        )
      `)
      .eq('cards.decks.user_id', userId)
      .lte('next_review', new Date().toISOString())
      .order('next_review', { ascending: true })

    // Fetch today's reviews
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todayReviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .gte('reviewed_at', todayStart.toISOString())
      .order('reviewed_at', { ascending: false })

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Flashcards</h1>
            <p className="text-muted-foreground">
              Master your subjects with AI-powered spaced repetition
            </p>
          </div>

          <SpacedRepetitionSystem
            decks={decks || []}
            dueCards={dueCards || []}
            todayReviews={todayReviews || []}
            userId={userId}
          />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Cards page error:', error)
    redirect('/auth/login')
  }
}
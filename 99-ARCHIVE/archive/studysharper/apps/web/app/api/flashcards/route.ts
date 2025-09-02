import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SM2Algorithm, ReviewRating } from '@/lib/flashcards/sm2-algorithm'

function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Get due cards for review
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deck_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get due cards using the database function
    const { data: dueCards, error: cardsError } = await supabase
      .rpc('get_due_cards', {
        p_user_id: session.user.id,
        p_limit: limit
      })

    if (cardsError) {
      console.error('Error fetching due cards:', cardsError)
      
      // Fallback to direct query
      const query = supabase
        .from('flashcard_reviews')
        .select(`
          *,
          flashcards!inner(
            *,
            flashcard_decks!inner(*)
          )
        `)
        .eq('user_id', session.user.id)
        .lte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date')
        .limit(limit)

      if (deckId) {
        query.eq('flashcards.deck_id', deckId)
      }

      const { data: fallbackCards, error: fallbackError } = await query

      if (fallbackError) {
        return NextResponse.json({ 
          error: 'Failed to fetch due cards' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        cards: fallbackCards || [],
        count: fallbackCards?.length || 0
      })
    }

    // Get statistics
    const { data: stats } = await supabase
      .from('study_statistics')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single()

    return NextResponse.json({
      success: true,
      cards: dueCards || [],
      count: dueCards?.length || 0,
      todayStats: stats || {
        cards_studied: 0,
        cards_new: 0,
        time_studied: 0
      }
    })

  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

// Review a card
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cardId, rating, timeTaken } = body

    if (!cardId || !rating || rating < 1 || rating > 4) {
      return NextResponse.json({ 
        error: 'Invalid review data' 
      }, { status: 400 })
    }

    // Process the review using the database function
    const { data: result, error: reviewError } = await supabase
      .rpc('process_card_review', {
        p_user_id: session.user.id,
        p_card_id: cardId,
        p_rating: rating,
        p_time_taken: timeTaken || 0
      })

    if (reviewError) {
      console.error('Review processing error:', reviewError)
      
      // Fallback to manual processing
      const { data: currentReview } = await supabase
        .from('flashcard_reviews')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('card_id', cardId)
        .single()

      if (!currentReview) {
        return NextResponse.json({ 
          error: 'Card review not found' 
        }, { status: 404 })
      }

      // Calculate using TypeScript implementation
      const sm2Result = SM2Algorithm.calculate(rating as ReviewRating, {
        repetitions: currentReview.repetitions,
        easeFactor: currentReview.ease_factor,
        interval: currentReview.interval
      })

      // Update the review
      const { error: updateError } = await supabase
        .from('flashcard_reviews')
        .update({
          ease_factor: sm2Result.easeFactor,
          interval: sm2Result.interval,
          repetitions: sm2Result.repetitions,
          due_date: sm2Result.dueDate.toISOString().split('T')[0],
          last_reviewed: new Date().toISOString(),
          state: sm2Result.state,
          total_reviews: currentReview.total_reviews + 1,
          correct_reviews: currentReview.correct_reviews + (rating > 1 ? 1 : 0),
          lapses: currentReview.lapses + (rating === 1 ? 1 : 0)
        })
        .eq('id', currentReview.id)

      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to update review' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        nextReview: sm2Result.dueDate,
        newInterval: sm2Result.interval,
        newEaseFactor: sm2Result.easeFactor
      })
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Review API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

// Create a new deck
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, subjectId, isPublic } = body

    if (!title) {
      return NextResponse.json({ 
        error: 'Deck title is required' 
      }, { status: 400 })
    }

    // Create the deck
    const { data: deck, error: deckError } = await supabase
      .from('flashcard_decks')
      .insert({
        user_id: session.user.id,
        title,
        description,
        subject_id: subjectId,
        is_public: isPublic || false
      })
      .select()
      .single()

    if (deckError) {
      return NextResponse.json({ 
        error: 'Failed to create deck' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deck
    })

  } catch (error) {
    console.error('Create deck error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
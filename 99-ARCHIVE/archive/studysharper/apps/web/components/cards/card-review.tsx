'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Brain, 
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface CardReviewProps {
  cards: any[]
  onComplete: () => void
  onExit: () => void
}

const RATING_OPTIONS = [
  { value: 1, label: 'Again', description: 'Complete blackout', color: 'bg-red-500', interval: '< 1 min' },
  { value: 2, label: 'Hard', description: 'Incorrect but familiar', color: 'bg-orange-500', interval: '< 6 min' },
  { value: 3, label: 'Good', description: 'Correct with effort', color: 'bg-blue-500', interval: '1 day' },
  { value: 4, label: 'Easy', description: 'Perfect recall', color: 'bg-green-500', interval: '4 days' }
]

export function CardReview({ cards, onComplete, onExit }: CardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewedCards, setReviewedCards] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + (showAnswer ? 0.5 : 0)) / cards.length) * 100

  const handleRating = async (rating: number) => {
    if (!currentCard || isSubmitting) return
    
    setIsSubmitting(true)

    try {
      // Calculate next review date using SM-2 algorithm
      const nextReview = calculateNextReview(currentCard, rating)
      
      // Submit review
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: currentCard.cards.id,
          rating,
          nextReview: nextReview.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      // Track reviewed card
      setReviewedCards(prev => [...prev, {
        ...currentCard,
        rating,
        nextReview
      }])

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowAnswer(false)
      } else {
        // All cards reviewed
        onComplete()
      }

    } catch (error) {
      console.error('Review submission error:', error)
      // Continue anyway to avoid blocking user
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowAnswer(false)
      } else {
        onComplete()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateNextReview = (card: any, rating: number): Date => {
    // Simplified SM-2 algorithm
    const now = new Date()
    const lastReview = card.reviewed_at ? new Date(card.reviewed_at) : now
    const currentInterval = card.interval_days || 1
    const currentEase = card.ease_factor || 2.5
    const repetitions = card.repetitions || 0

    let newInterval: number
    let newEase = currentEase

    if (rating < 3) {
      // Failed card - reset to beginning
      newInterval = 1
    } else {
      // Successful recall
      if (repetitions === 0) {
        newInterval = 1
      } else if (repetitions === 1) {
        newInterval = 6
      } else {
        newInterval = Math.round(currentInterval * currentEase)
      }

      // Adjust ease factor based on rating
      newEase = currentEase + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
      newEase = Math.max(1.3, newEase) // Minimum ease factor
    }

    const nextReviewDate = new Date(now)
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)
    
    return nextReviewDate
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setShowAnswer(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
    }
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault()
      setShowAnswer(!showAnswer)
    } else if (event.key === 'Escape') {
      onExit()
    } else if (showAnswer && ['1', '2', '3', '4'].includes(event.key)) {
      const rating = parseInt(event.key)
      handleRating(rating)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [showAnswer])

  if (!currentCard) {
    return null
  }

  const deckName = currentCard.cards?.decks?.name || 'Unknown Deck'
  const courseName = currentCard.cards?.decks?.subjects?.courses?.name || 'Unknown Course'
  const courseColor = currentCard.cards?.decks?.subjects?.courses?.color || '#3B82F6'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div>
                <div className="font-medium">{deckName}</div>
                <div className="text-sm text-muted-foreground">{courseName}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} of {cards.length}
              </div>
              
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Review Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: courseColor }}
                  />
                  <Badge variant="outline">{deckName}</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Question */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-lg font-medium text-muted-foreground uppercase tracking-wide">
                    Question
                  </div>
                  <div className="text-2xl font-medium leading-relaxed">
                    {currentCard.cards.front}
                  </div>
                </div>
              </div>

              {/* Answer (when revealed) */}
              {showAnswer && (
                <div className="border-t pt-6 mt-6">
                  <div className="text-center space-y-4">
                    <div className="text-lg font-medium text-muted-foreground uppercase tracking-wide">
                      Answer
                    </div>
                    <div className="text-xl leading-relaxed text-foreground">
                      {currentCard.cards.back}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t">
                {!showAnswer ? (
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={() => setShowAnswer(true)}
                      className="px-8"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Show Answer
                      <span className="ml-2 text-xs opacity-75">(Space)</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                      How well did you know this?
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {RATING_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          variant="outline"
                          className={`flex flex-col h-auto p-4 border-2 hover:${option.color} hover:text-white transition-colors`}
                          onClick={() => handleRating(option.value)}
                          disabled={isSubmitting}
                        >
                          <div className="font-bold">{option.value}</div>
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs opacity-75">{option.interval}</div>
                        </Button>
                      ))}
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      Press 1-4 or click to rate your recall
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>~{Math.ceil((cards.length - currentIndex) * 0.5)} min remaining</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>{reviewedCards.length} reviewed</span>
            </div>
            
            {reviewedCards.length > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>
                  {(reviewedCards.reduce((sum, card) => sum + card.rating, 0) / reviewedCards.length).toFixed(1)}/4 avg
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
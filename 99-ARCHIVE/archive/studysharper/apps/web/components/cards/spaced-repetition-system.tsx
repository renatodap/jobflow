'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Plus, 
  Play, 
  Target, 
  Calendar,
  TrendingUp,
  Clock,
  Zap,
  BookOpen,
  Star
} from 'lucide-react'
import { DeckManager } from './deck-manager'
import { CardReview } from './card-review'
import { CreateDeckForm } from './create-deck-form'

interface SpacedRepetitionSystemProps {
  decks: any[]
  dueCards: any[]
  todayReviews: any[]
  userId: string
}

export function SpacedRepetitionSystem({ 
  decks, 
  dueCards, 
  todayReviews, 
  userId 
}: SpacedRepetitionSystemProps) {
  const [showCreateDeck, setShowCreateDeck] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<any>(null)
  const [reviewMode, setReviewMode] = useState(false)

  const dueCardsCount = dueCards.length
  const todayReviewCount = todayReviews.length
  const averageRating = todayReviews.length > 0 
    ? todayReviews.reduce((sum, review) => sum + review.rating, 0) / todayReviews.length 
    : 0

  const getStreakData = () => {
    // Mock streak data - in production would calculate from review history
    return {
      currentStreak: 7,
      longestStreak: 23,
      totalCards: decks.reduce((sum, deck) => sum + (deck._count?.cards || 0), 0)
    }
  }

  const { currentStreak, longestStreak, totalCards } = getStreakData()

  const refreshData = () => {
    window.location.reload()
  }

  if (reviewMode && dueCards.length > 0) {
    return (
      <CardReview
        cards={dueCards}
        onComplete={() => {
          setReviewMode(false)
          refreshData()
        }}
        onExit={() => setReviewMode(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Due</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dueCardsCount}</div>
            <p className="text-xs text-muted-foreground">Ready for review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reviews</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayReviewCount}</div>
            <p className="text-xs text-muted-foreground">Cards studied today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {averageRating ? averageRating.toFixed(1) : '--'}
            </div>
            <p className="text-xs text-muted-foreground">avg rating today</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Review Section */}
      {dueCardsCount > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-orange-900 dark:text-orange-100">
                    Ready to Review!
                  </CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-200">
                    You have {dueCardsCount} cards ready for spaced repetition review
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => setReviewMode(true)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Review
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-orange-700 dark:text-orange-200">
                <span>Review Progress</span>
                <span>{todayReviewCount} / {Math.max(todayReviewCount + dueCardsCount, 20)} today</span>
              </div>
              <Progress 
                value={(todayReviewCount / Math.max(todayReviewCount + dueCardsCount, 20)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="decks" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="decks">My Decks</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowCreateDeck(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Deck
          </Button>
        </div>

        <TabsContent value="decks" className="space-y-4">
          {decks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Decks Yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first flashcard deck to start learning with spaced repetition. 
                  The AI will help optimize your review schedule for maximum retention.
                </p>
                <Button onClick={() => setShowCreateDeck(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Deck
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DeckManager 
              decks={decks}
              onSelectDeck={setSelectedDeck}
              onRefresh={refreshData}
            />
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Cards</span>
                    <span className="font-medium">{totalCards}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Streak</span>
                    <span className="font-medium">{currentStreak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Longest Streak</span>
                    <span className="font-medium">{longestStreak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Today's Accuracy</span>
                    <span className="font-medium">
                      {averageRating ? `${(averageRating / 5 * 100).toFixed(0)}%` : 'No reviews'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {todayReviewCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Cards reviewed today</div>
                  </div>
                  
                  {averageRating > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1">
                        {(averageRating / 5 * 100).toFixed(0)}% accuracy
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average: {averageRating.toFixed(1)}/5 rating
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Schedule</CardTitle>
              <CardDescription>
                Your upcoming spaced repetition schedule based on the SM-2 algorithm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div>
                    <div className="font-medium text-orange-900 dark:text-orange-100">
                      Due Now
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-200">
                      Ready for immediate review
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                    {dueCardsCount} cards
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Tomorrow
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-200">
                      Scheduled for next day
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                    ~{Math.floor(totalCards * 0.15)} cards
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-100">
                      This Week
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-200">
                      Upcoming reviews
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-200 text-green-800">
                    ~{Math.floor(totalCards * 0.4)} cards
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showCreateDeck && (
        <CreateDeckForm
          userId={userId}
          onSuccess={() => {
            setShowCreateDeck(false)
            refreshData()
          }}
          onCancel={() => setShowCreateDeck(false)}
        />
      )}
    </div>
  )
}
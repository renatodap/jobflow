'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Plus, 
  Settings, 
  Trash2, 
  Play,
  Calendar,
  TrendingUp,
  Brain
} from 'lucide-react'

interface DeckManagerProps {
  decks: any[]
  onSelectDeck: (deck: any) => void
  onRefresh: () => void
}

export function DeckManager({ decks, onSelectDeck, onRefresh }: DeckManagerProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)

  const getDeckStats = (deck: any) => {
    const cardCount = deck._count?.cards || 0
    const subjectName = deck.subjects?.name || 'No Subject'
    const courseName = deck.subjects?.courses?.name || 'Unknown Course'
    const courseColor = deck.subjects?.courses?.color || '#3B82F6'
    
    return {
      cardCount,
      subjectName,
      courseName,
      courseColor
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/decks?id=${deckId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete deck')
      }

      onRefresh()
    } catch (error) {
      console.error('Delete deck error:', error)
      alert('Failed to delete deck. Please try again.')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => {
        const { cardCount, subjectName, courseName, courseColor } = getDeckStats(deck)
        const isSelected = selectedDeckId === deck.id

        return (
          <Card 
            key={deck.id} 
            className={`hover:shadow-md transition-all cursor-pointer ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              setSelectedDeckId(deck.id)
              onSelectDeck(deck)
            }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                    style={{ backgroundColor: courseColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{deck.name}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="truncate">{subjectName}</div>
                      <div className="text-xs truncate">{courseName}</div>
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectDeck(deck)
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteDeck(deck.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{cardCount} cards</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{Math.ceil(cardCount * 0.2)} due</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Navigate to deck review
                      window.location.href = `/cards/deck/${deck.id}`
                    }}
                  >
                    <Play className="mr-2 h-3 w-3" />
                    Study
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Navigate to add cards
                      window.location.href = `/cards/deck/${deck.id}/add`
                    }}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Cards
                  </Button>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mastery Progress</span>
                    <span>{cardCount > 0 ? Math.round(60) : 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${cardCount > 0 ? 60 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Deck Description */}
                {deck.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {deck.description}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Add New Deck Card */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Create New Deck</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Add a new flashcard deck for focused study
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Trigger create deck form
              const createButton = document.querySelector('[data-create-deck]') as HTMLButtonElement
              createButton?.click()
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Deck
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
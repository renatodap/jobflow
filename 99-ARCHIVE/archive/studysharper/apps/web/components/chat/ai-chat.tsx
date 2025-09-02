'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, BookOpen, Lightbulb, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  confidence?: number
}

interface AIChatProps {
  courseId?: string
  subjectId?: string
  className?: string
}

export function AIChat({ courseId, subjectId, className }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI study assistant. I can help you understand your study materials, answer questions, and provide explanations. What would you like to learn about today?",
      timestamp: new Date(),
      confidence: 1.0
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          courseId,
          subjectId
        })
      })

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.answer || result.error || 'Sorry, I encountered an error processing your question.',
        timestamp: new Date(),
        sources: result.sources,
        confidence: result.confidence
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
        confidence: 0
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500'
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Unknown'
    if (confidence >= 0.8) return 'High confidence'
    if (confidence >= 0.6) return 'Medium confidence'
    return 'Low confidence'
  }

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      <CardHeader className="flex-none">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Study Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your study materials and get AI-powered explanations
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.type === 'assistant' && (
                  <div className="flex-none">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] space-y-2',
                    message.type === 'user' ? 'order-2' : 'order-1'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2',
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTime(message.timestamp)}</span>
                    
                    {message.type === 'assistant' && message.confidence !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', getConfidenceColor(message.confidence))}
                      >
                        {getConfidenceText(message.confidence)}
                      </Badge>
                    )}
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Sources:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            Note {index + 1}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="flex-none order-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-none">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div className="animate-bounce w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <div className="animate-bounce w-2 h-2 bg-muted-foreground rounded-full" style={{ animationDelay: '0.1s' }}></div>
                    <div className="animate-bounce w-2 h-2 bg-muted-foreground rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex-none p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your study materials..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput("What are the main concepts I should focus on?")}
              disabled={isLoading}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Key concepts
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput("Can you quiz me on this material?")}
              disabled={isLoading}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Quiz me
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput("Explain this in simpler terms")}
              disabled={isLoading}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Simplify
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
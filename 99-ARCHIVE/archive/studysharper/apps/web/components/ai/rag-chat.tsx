'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Loader2, 
  BookOpen, 
  MessageSquare,
  AlertCircle,
  Sparkles,
  FileText,
  ChevronRight,
  Copy,
  RefreshCw,
  Settings
} from 'lucide-react'
import { useAcademic } from '@/hooks/use-academic'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    chunk_id: string
    chunk_text: string
    source_title: string
    source_id: string
    page_number?: number
    similarity_score: number
  }>
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface RAGChatProps {
  subjectId?: string
  sourceIds?: string[]
  className?: string
}

export function RAGChat({ subjectId, sourceIds, className }: RAGChatProps) {
  const { subjects } = useAcademic()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showSources, setShowSources] = useState(true)
  const [contentAvailable, setContentAvailable] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
    checkContentAvailability()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkContentAvailability = async () => {
    try {
      const response = await fetch('/api/content/upload')
      const data = await response.json()
      
      if (data.sources && data.sources.length > 0) {
        const completedSources = data.sources.filter((s: any) => s.status === 'completed')
        setContentAvailable(completedSources.length > 0)
      }
    } catch (error) {
      console.error('Failed to check content availability:', error)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/ai/chat')
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai/chat?conversation_id=${conversationId}`)
      const data = await response.json()
      
      if (data.success) {
        setActiveConversationId(conversationId)
        setMessages(data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources,
          timestamp: new Date(m.created_at)
        })))
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
      setError('Failed to load conversation')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage.content,
          context: {
            subject_ids: subjectId ? [subjectId] : undefined,
            source_ids: sourceIds,
            conversation_id: activeConversationId
          },
          options: {
            max_chunks: 10,
            similarity_threshold: 0.7,
            model: 'gpt-4o-mini'
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (data.conversation_id && !activeConversationId) {
        setActiveConversationId(data.conversation_id)
        loadConversations()
      }

    } catch (error) {
      console.error('Chat error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const startNewConversation = () => {
    setMessages([])
    setActiveConversationId(null)
    setError(null)
  }

  const formatSource = (source: any) => {
    const similarity = Math.round(source.similarity_score * 100)
    return (
      <div key={source.chunk_id} className="p-3 bg-muted rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{source.source_title}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {similarity}% match
          </Badge>
        </div>
        {source.page_number && (
          <p className="text-xs text-muted-foreground">Page {source.page_number}</p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {source.chunk_text}
        </p>
      </div>
    )
  }

  if (!contentAvailable) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Content Available</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Upload PDF documents to start asking questions about your study materials.
          </p>
          <Button onClick={() => window.location.href = '/dashboard/content'}>
            Upload Your First Document
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`flex gap-4 h-[600px] ${className}`}>
      {/* Sidebar with conversations */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={startNewConversation}
            className="w-full justify-start"
            variant="outline"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          
          <ScrollArea className="h-[450px]">
            <div className="space-y-1">
              {conversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant={activeConversationId === conv.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left text-sm"
                  onClick={() => loadConversation(conv.id)}
                >
                  <MessageSquare className="mr-2 h-3 w-3" />
                  <span className="truncate">{conv.title || 'Untitled'}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main chat interface */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Study Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSources(!showSources)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Ask questions about your uploaded study materials
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-sm">Ask a question about your study materials</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setInput("Summarize the key concepts from my notes")}>
                      Summarize key concepts
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setInput("What are the main topics I should focus on?")}>
                      Main topics to focus on
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setInput("Explain this concept in simpler terms")}>
                      Explain in simple terms
                    </Badge>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}>
                  <div className={`max-w-[80%] space-y-2 ${
                    message.role === 'user' ? 'order-2' : ''
                  }`}>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content}
                      </div>
                    </div>

                    {/* Sources for assistant messages */}
                    {message.role === 'assistant' && message.sources && showSources && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                        <div className="space-y-2">
                          {message.sources.map(formatSource)}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input */}
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Ask about your study materials..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
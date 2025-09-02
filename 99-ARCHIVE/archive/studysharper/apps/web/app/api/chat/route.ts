import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { RAGPipeline, SupabaseVectorStore, createAIRouter } from '@studysharper/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { question, courseId, subjectId } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Initialize AI provider and RAG pipeline
    const aiRouter = createAIRouter({
      primaryProvider: 'openrouter',
      fallbackProvider: 'ollama',
      models: {
        chat: 'anthropic/claude-3-haiku',
        embedding: 'text-embedding-3-small'
      }
    })

    // Initialize real vector store
    const vectorStore = new SupabaseVectorStore(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const ragPipeline = new RAGPipeline(aiRouter, vectorStore)

    // Process the query
    const response = await ragPipeline.query({
      question: question.trim(),
      userId: session.user.id,
      courseId,
      subjectId,
      maxChunks: 5
    })

    // Log the query for analytics
    await supabase
      .from('events')
      .insert({
        user_id: session.user.id,
        event_type: 'ai_chat_query',
        properties: {
          question: question.slice(0, 100), // Truncate for privacy
          course_id: courseId,
          subject_id: subjectId,
          sources_count: response.sources.length,
          confidence: response.confidence
        }
      })

    return NextResponse.json({
      success: true,
      answer: response.answer,
      sources: response.sources,
      confidence: response.confidence,
      metadata: {
        chunks_used: response.chunks.length,
        processing_time: Date.now() // Would be actual processing time
      }
    })

  } catch (error) {
    console.error('Chat error:', error)
    
    // Try to provide a helpful fallback response
    const fallbackResponse = {
      success: false,
      answer: "I'm having trouble accessing your study materials right now. This could be because:\n\n1. You haven't uploaded any notes yet\n2. The AI service is temporarily unavailable\n3. Your question might need to be more specific\n\nTry uploading some study materials first, or rephrase your question to be more specific about what you're looking for.",
      sources: [],
      confidence: 0,
      error: 'AI service temporarily unavailable'
    }

    return NextResponse.json(fallbackResponse, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Chat endpoint - POST your questions here',
    example: {
      question: "What are the main concepts in linear algebra?",
      courseId: "optional-course-uuid",
      subjectId: "optional-subject-uuid"
    }
  })
}
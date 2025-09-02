import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { generateEmbedding } from '@/lib/ai/embeddings'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

interface ChatRequest {
  query: string
  context?: {
    subject_ids?: string[]
    source_ids?: string[]
    conversation_id?: string
  }
  options?: {
    max_chunks?: number
    similarity_threshold?: number
    model?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured' 
      }, { status: 500 })
    }

    const body: ChatRequest = await request.json()
    const { query, context, options } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Query is required' 
      }, { status: 400 })
    }

    const maxChunks = options?.max_chunks || 10
    const similarityThreshold = options?.similarity_threshold || 0.7
    const model = options?.model || 'gpt-4o-mini'

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)
    const embeddingVector = `[${queryEmbedding.embedding.join(',')}]`

    // Build the vector search query
    let searchQuery = supabase.rpc('match_content_chunks', {
      query_embedding: embeddingVector,
      match_threshold: similarityThreshold,
      match_count: maxChunks,
      user_id: session.user.id
    })

    // Apply filters if provided
    if (context?.source_ids && context.source_ids.length > 0) {
      searchQuery = searchQuery.in('source_id', context.source_ids)
    }

    // Execute vector similarity search
    const { data: searchResults, error: searchError } = await searchQuery

    if (searchError) {
      console.error('Vector search error:', searchError)
      
      // Fallback: Try direct query if RPC doesn't exist
      const { data: chunks, error: fallbackError } = await supabase
        .from('content_chunks')
        .select(`
          id,
          chunk_text,
          chunk_index,
          page_number,
          source_id,
          content_sources!inner(title, user_id)
        `)
        .eq('content_sources.user_id', session.user.id)
        .limit(maxChunks)

      if (fallbackError || !chunks) {
        return NextResponse.json({ 
          error: 'No content available for search. Please upload documents first.' 
        }, { status: 404 })
      }

      // Use chunks without similarity scores as fallback
      const fallbackResults = chunks.map(chunk => ({
        chunk_id: chunk.id,
        chunk_text: chunk.chunk_text,
        source_id: chunk.source_id,
        source_title: (chunk.content_sources as any).title,
        page_number: chunk.page_number,
        similarity_score: 0.5 // Default score for fallback
      }))

      return await generateRAGResponse(query, fallbackResults, model, session.user.id, supabase)
    }

    if (!searchResults || searchResults.length === 0) {
      // No relevant content found
      return NextResponse.json({
        success: true,
        answer: "I couldn't find any relevant information in your uploaded documents to answer this question. Please make sure you have uploaded content related to your query.",
        sources: [],
        query: query,
        conversation_id: null,
        tokens_used: 0,
        response_time: 0,
        model_used: model
      })
    }

    // Generate RAG response
    return await generateRAGResponse(query, searchResults, model, session.user.id, supabase)

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

async function generateRAGResponse(
  query: string,
  searchResults: any[],
  model: string,
  userId: string,
  supabase: any
) {
  const startTime = Date.now()

  // Construct context from search results
  const contextChunks = searchResults.map((result, index) => {
    const source = result.source_title || 'Unknown Source'
    const page = result.page_number ? ` (Page ${result.page_number})` : ''
    return `[${index + 1}] From "${source}"${page}:\n${result.chunk_text}`
  }).join('\n\n')

  // Construct the prompt
  const systemPrompt = `You are an AI study assistant helping a student with their academic materials. 
You have access to their uploaded documents and should provide helpful, accurate answers based on the content provided.
Always cite your sources using the reference numbers provided in square brackets.
If the provided context doesn't contain enough information to fully answer the question, acknowledge this limitation.`

  const userPrompt = `Based on the following context from the student's documents, please answer their question.

Context:
${contextChunks}

Question: ${query}

Please provide a comprehensive answer with source citations.`

  try {
    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const answer = completion.choices[0].message.content || 'Unable to generate response.'
    const tokensUsed = completion.usage?.total_tokens || 0

    // Create or get conversation
    let conversationId = null
    
    // Store conversation if needed
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: query.substring(0, 100),
        metadata: { model, timestamp: new Date().toISOString() }
      })
      .select()
      .single()

    if (conversation) {
      conversationId = conversation.id

      // Store messages
      await supabase
        .from('conversation_messages')
        .insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: query,
            metadata: {}
          },
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: answer,
            sources: searchResults.map(r => ({
              chunk_id: r.chunk_id,
              source_id: r.source_id,
              source_title: r.source_title,
              page_number: r.page_number,
              similarity_score: r.similarity_score
            })),
            metadata: { model, tokens: tokensUsed }
          }
        ])
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      answer,
      sources: searchResults.map(r => ({
        chunk_id: r.chunk_id,
        chunk_text: r.chunk_text.substring(0, 200) + '...',
        source_title: r.source_title,
        source_id: r.source_id,
        page_number: r.page_number,
        similarity_score: r.similarity_score
      })),
      query,
      conversation_id: conversationId,
      tokens_used: tokensUsed,
      response_time: responseTime,
      model_used: model
    })

  } catch (error) {
    console.error('OpenAI generation error:', error)
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Add the RPC function to database if it doesn't exist
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversation history
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (conversationId) {
      const { data: messages } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      // Verify conversation ownership
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', session.user.id)
        .single()

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        conversation,
        messages: messages || []
      })
    }

    // Get all conversations for user
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({
      success: true,
      conversations: conversations || []
    })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
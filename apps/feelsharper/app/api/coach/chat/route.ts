import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { Anthropic } from '@anthropic-ai/sdk';
import type { AIMessage, AIConversation } from '@/lib/types/database';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// POST /api/coach/chat - Send message to AI coach
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create conversation
    let conversation: AIConversation;
    if (conversationId) {
      const { data: existingConv, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (convError || !existingConv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      conversation = existingConv;
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50),
        })
        .select()
        .single();

      if (createError || !newConv) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }
      conversation = newConv;
    }

    // Get user context for personalized coaching
    const [profileData, recentWorkouts, recentNutrition, currentGoals, insights] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
      supabase.from('nutrition_logs').select('*').eq('user_id', user.id).gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).order('date', { ascending: false }),
      supabase.from('body_goals').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('user_insights').select('*').eq('user_id', user.id).eq('is_active', true).limit(3),
    ]);

    // Get conversation history
    const { data: messageHistory } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Build context for AI
    const systemPrompt = `You are an expert fitness and nutrition coach for Feel Sharper. Your role is to provide personalized, evidence-based coaching that helps users achieve their fitness goals.

User Profile:
- Goal: ${profileData.data?.goal_type || 'general fitness'}
- Experience: ${profileData.data?.experience_level || 'intermediate'}
- Age: ${profileData.data?.age || 'unknown'}
- Height: ${profileData.data?.height_cm ? `${profileData.data.height_cm}cm` : 'unknown'}
- Current Weight: ${profileData.data?.starting_weight_kg ? `${profileData.data.starting_weight_kg}kg` : 'unknown'}
- Target Weight: ${profileData.data?.target_weight_kg ? `${profileData.data.target_weight_kg}kg` : 'unknown'}

Recent Activity:
- Workouts: ${recentWorkouts.data?.length || 0} in the last 5 sessions
- Average workout duration: ${recentWorkouts.data?.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) / (recentWorkouts.data?.length || 1)} minutes
- Nutrition tracking: ${recentNutrition.data?.length || 0} logs in the last week

Active Goals:
${currentGoals.data?.map(g => `- ${g.goal_type}: Target ${g.target_weight_kg}kg by ${g.target_date}`).join('\n') || 'No specific goals set'}

Recent Insights:
${insights.data?.map(i => `- ${i.insight_type}: ${i.insight_text}`).join('\n') || 'No recent insights'}

Guidelines:
1. Be supportive but honest about progress
2. Provide specific, actionable advice
3. Reference the user's data when relevant
4. Keep responses concise and practical
5. Use motivational language appropriate to their experience level
6. Suggest adjustments based on their recent activity patterns
7. Always prioritize safety and sustainable progress`;

    // Build messages array for Claude
    const messages = [
      ...(messageHistory?.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })) || []),
      { role: 'user' as const, content: message }
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages,
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I was unable to generate a response. Please try again.';

    // Save user message
    await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'user',
        content: message,
      });

    // Save assistant message
    const { data: aiMessage } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'assistant',
        content: assistantMessage,
        tokens_used: response.usage?.output_tokens || 0,
        model_used: 'claude-3-haiku',
      })
      .select()
      .single();

    // Generate insights if needed
    await generateInsightsFromConversation(user.id, message, assistantMessage, supabase);

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
      messageId: aiMessage?.id,
    });
  } catch (error) {
    console.error('Coach chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

// GET /api/coach/chat - Get conversation history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');

    if (conversationId) {
      // Get specific conversation
      const { data: messages, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
      }

      return NextResponse.json({ messages });
    } else {
      // Get all conversations
      const { data: conversations, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
      }

      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Coach chat GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat data' }, { status: 500 });
  }
}

// Helper function to generate insights from conversation
async function generateInsightsFromConversation(
  userId: string,
  userMessage: string,
  assistantResponse: string,
  supabase: any
) {
  // Extract potential insights from the conversation
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = assistantResponse.toLowerCase();

  // Check for specific patterns and create insights
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('fatigue')) {
    await supabase
      .from('user_insights')
      .insert({
        user_id: userId,
        insight_type: 'recovery_status',
        insight_text: 'User reported fatigue. Consider adjusting workout intensity or adding recovery days.',
        confidence_score: 0.75,
        data_points_used: 1,
        recommendations: [
          { type: 'recovery', action: 'Add extra rest day' },
          { type: 'nutrition', action: 'Increase protein intake' },
          { type: 'sleep', action: 'Prioritize 8+ hours of sleep' }
        ]
      });
  }

  if (lowerMessage.includes('plateau') || lowerMessage.includes('stuck') || lowerMessage.includes('no progress')) {
    await supabase
      .from('user_insights')
      .insert({
        user_id: userId,
        insight_type: 'performance_trend',
        insight_text: 'User experiencing plateau. Time to adjust program variables.',
        confidence_score: 0.80,
        data_points_used: 1,
        recommendations: [
          { type: 'training', action: 'Vary workout intensity' },
          { type: 'nutrition', action: 'Recalculate caloric needs' },
          { type: 'program', action: 'Consider deload week' }
        ]
      });
  }

  if (lowerResponse.includes('great job') || lowerResponse.includes('excellent') || lowerResponse.includes('impressive')) {
    await supabase
      .from('user_insights')
      .insert({
        user_id: userId,
        insight_type: 'consistency',
        insight_text: 'User showing strong consistency and positive progress.',
        confidence_score: 0.85,
        data_points_used: 1,
        recommendations: [
          { type: 'motivation', action: 'Maintain current momentum' },
          { type: 'goal', action: 'Consider setting stretch goals' }
        ]
      });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { Anthropic } from '@anthropic-ai/sdk';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// POST /api/coach/check-in - Submit daily/weekly check-in
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      check_in_type = 'daily',
      energy_level,
      motivation_level,
      stress_level,
      recovery_status,
      adherence_percentage,
      goals_on_track,
      notes
    } = body;

    // Validate inputs
    if (energy_level && (energy_level < 1 || energy_level > 10)) {
      return NextResponse.json({ error: 'Energy level must be between 1 and 10' }, { status: 400 });
    }

    // Save check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from('coaching_check_ins')
      .insert({
        user_id: user.id,
        check_in_type,
        energy_level,
        motivation_level,
        stress_level,
        recovery_status,
        adherence_percentage,
        goals_on_track,
        notes
      })
      .select()
      .single();

    if (checkInError) {
      console.error('Error saving check-in:', checkInError);
      return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 });
    }

    // Generate AI coach response based on check-in
    let coachResponse = '';
    const avgScore = (
      (energy_level || 5) + 
      (motivation_level || 5) + 
      (10 - (stress_level || 5)) + 
      (recovery_status || 5)
    ) / 4;

    if (avgScore < 4) {
      // Low overall state - supportive response
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.8,
        system: 'You are a supportive fitness coach. The user is having a tough day. Be empathetic, encouraging, and suggest gentle adjustments.',
        messages: [{
          role: 'user',
          content: `Energy: ${energy_level}/10, Motivation: ${motivation_level}/10, Stress: ${stress_level}/10, Recovery: ${recovery_status}/10. Notes: ${notes || 'None'}. Give a brief supportive response.`
        }]
      });
      coachResponse = response.content[0].type === 'text' ? response.content[0].text : 'Take it easy today. Rest is part of the process.';
    } else if (avgScore > 7) {
      // High overall state - motivating response
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.8,
        system: 'You are an energizing fitness coach. The user is feeling great. Be motivating and suggest ways to capitalize on their energy.',
        messages: [{
          role: 'user',
          content: `Energy: ${energy_level}/10, Motivation: ${motivation_level}/10, Stress: ${stress_level}/10, Recovery: ${recovery_status}/10. Notes: ${notes || 'None'}. Give a brief motivating response.`
        }]
      });
      coachResponse = response.content[0].type === 'text' ? response.content[0].text : 'You\'re in the zone! Let\'s make today count!';
    } else {
      // Moderate state - balanced response
      coachResponse = generateBalancedResponse(energy_level, motivation_level, stress_level, recovery_status);
    }

    // Update check-in with coach response
    await supabase
      .from('coaching_check_ins')
      .update({ coach_response: coachResponse })
      .eq('id', checkIn.id);

    // Generate adjustments if needed
    const adjustments = [];
    if (stress_level && stress_level > 7) {
      adjustments.push({
        type: 'workout',
        adjustment: 'Consider lighter intensity today',
        reason: 'High stress levels'
      });
    }
    if (recovery_status && recovery_status < 5) {
      adjustments.push({
        type: 'recovery',
        adjustment: 'Add 10 minutes of stretching',
        reason: 'Low recovery score'
      });
    }
    if (energy_level && energy_level < 4) {
      adjustments.push({
        type: 'nutrition',
        adjustment: 'Focus on hydration and balanced meals',
        reason: 'Low energy levels'
      });
    }

    if (adjustments.length > 0) {
      await supabase
        .from('coaching_check_ins')
        .update({ adjustments_made: adjustments })
        .eq('id', checkIn.id);
    }

    // Update user insights based on patterns
    await analyzeCheckInPatterns(user.id, supabase);

    return NextResponse.json({
      checkIn,
      coachResponse,
      adjustments,
      message: 'Check-in recorded successfully'
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}

// GET /api/coach/check-in - Get recent check-ins
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '7');
    const type = url.searchParams.get('type');

    let query = supabase
      .from('coaching_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('check_in_type', type);
    }

    const { data: checkIns, error } = await query;

    if (error) {
      console.error('Error fetching check-ins:', error);
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
    }

    // Calculate averages
    const averages = checkIns && checkIns.length > 0 ? {
      energy: checkIns.reduce((acc, c) => acc + (c.energy_level || 0), 0) / checkIns.length,
      motivation: checkIns.reduce((acc, c) => acc + (c.motivation_level || 0), 0) / checkIns.length,
      stress: checkIns.reduce((acc, c) => acc + (c.stress_level || 0), 0) / checkIns.length,
      recovery: checkIns.reduce((acc, c) => acc + (c.recovery_status || 0), 0) / checkIns.length,
      adherence: checkIns.reduce((acc, c) => acc + (c.adherence_percentage || 0), 0) / checkIns.length
    } : null;

    return NextResponse.json({
      checkIns: checkIns || [],
      averages,
      count: checkIns?.length || 0
    });
  } catch (error) {
    console.error('Check-in GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}

function generateBalancedResponse(
  energy?: number,
  motivation?: number,
  stress?: number,
  recovery?: number
): string {
  const responses = [
    'Solid check-in! Stay consistent with your plan today.',
    'You\'re doing well. Focus on one workout at a time.',
    'Good balance today. Listen to your body and adjust as needed.',
    'Keep the momentum going! Small steps lead to big results.',
    'You\'re on track. Remember, progress over perfection.'
  ];
  
  // Pick response based on scores
  const index = Math.floor(((energy || 5) + (motivation || 5)) / 4);
  return responses[Math.min(index, responses.length - 1)];
}

async function analyzeCheckInPatterns(userId: string, supabase: any) {
  // Get last 7 check-ins
  const { data: recentCheckIns } = await supabase
    .from('coaching_check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(7);

  if (!recentCheckIns || recentCheckIns.length < 3) return;

  // Calculate trends
  const avgStress = recentCheckIns.reduce((acc, c) => acc + (c.stress_level || 5), 0) / recentCheckIns.length;
  const avgRecovery = recentCheckIns.reduce((acc, c) => acc + (c.recovery_status || 5), 0) / recentCheckIns.length;
  const avgEnergy = recentCheckIns.reduce((acc, c) => acc + (c.energy_level || 5), 0) / recentCheckIns.length;

  // Create insights based on patterns
  if (avgStress > 7) {
    await supabase
      .from('user_insights')
      .upsert({
        user_id: userId,
        insight_type: 'stress_level',
        insight_text: `Your stress has been elevated (avg ${avgStress.toFixed(1)}/10) over the past week. Consider stress management techniques.`,
        confidence_score: 0.75,
        data_points_used: recentCheckIns.length,
        is_active: true
      }, {
        onConflict: 'user_id,insight_type',
        ignoreDuplicates: false
      });
  }

  if (avgRecovery < 5) {
    await supabase
      .from('user_insights')
      .upsert({
        user_id: userId,
        insight_type: 'recovery_status',
        insight_text: `Recovery scores are low (avg ${avgRecovery.toFixed(1)}/10). Prioritize sleep and recovery protocols.`,
        confidence_score: 0.80,
        data_points_used: recentCheckIns.length,
        is_active: true
      }, {
        onConflict: 'user_id,insight_type',
        ignoreDuplicates: false
      });
  }

  if (avgEnergy < 4) {
    await supabase
      .from('coaching_recommendations')
      .insert({
        user_id: userId,
        recommendation_type: 'lifestyle_adjustment',
        title: 'Boost Your Energy Levels',
        description: 'Your energy has been consistently low. Let\'s address the root causes.',
        priority: 'high',
        reasoning: `Average energy of ${avgEnergy.toFixed(1)}/10 over ${recentCheckIns.length} check-ins`,
        expected_outcome: 'Improved energy, better workout performance, enhanced mood',
        action_items: [
          'Check vitamin D and B12 levels',
          'Ensure 7-9 hours of quality sleep',
          'Add morning sunlight exposure',
          'Review meal timing and composition'
        ]
      });
  }
}
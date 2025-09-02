import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { BodyGoalInsert } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/body-goals - Get user's body goals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active_only') === 'true';

    let query = supabase
      .from('body_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: goals, error } = await query;

    if (error) {
      console.error('Error fetching body goals:', error);
      return NextResponse.json({ error: 'Failed to fetch body goals' }, { status: 500 });
    }

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Body goals GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/body-goals - Create new body goal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.goal_type || !['weight_loss', 'weight_gain', 'muscle_gain', 'fat_loss', 'maintenance'].includes(body.goal_type)) {
      return NextResponse.json({ error: 'Valid goal type is required' }, { status: 400 });
    }

    // Validate at least one target is provided
    const hasTarget = body.target_weight_kg || body.target_body_fat_percentage || body.target_muscle_mass_kg;
    if (!hasTarget) {
      return NextResponse.json({ error: 'At least one target value is required' }, { status: 400 });
    }

    // Deactivate other active goals of the same type
    await supabase
      .from('body_goals')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('goal_type', body.goal_type)
      .eq('is_active', true);

    // Create goal data
    const goalData: BodyGoalInsert = {
      user_id: user.id,
      goal_type: body.goal_type,
      target_weight_kg: body.target_weight_kg || null,
      target_body_fat_percentage: body.target_body_fat_percentage || null,
      target_muscle_mass_kg: body.target_muscle_mass_kg || null,
      target_date: body.target_date || null,
      weekly_rate_kg: body.weekly_rate_kg || null,
      starting_weight_kg: body.starting_weight_kg || null,
      starting_body_fat_percentage: body.starting_body_fat_percentage || null,
      starting_muscle_mass_kg: body.starting_muscle_mass_kg || null,
      is_active: true,
    };

    const { data: goal, error: goalError } = await supabase
      .from('body_goals')
      .insert(goalData)
      .select()
      .single();

    if (goalError) {
      console.error('Error creating body goal:', goalError);
      return NextResponse.json({ error: 'Failed to create body goal' }, { status: 500 });
    }

    return NextResponse.json({ 
      goal,
      message: 'Body goal created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Body goals POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
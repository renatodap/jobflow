import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { WorkoutProgramInsert } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/workout-programs - List workout programs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const goalType = url.searchParams.get('goal_type');
    const experienceLevel = url.searchParams.get('experience_level');
    const publicOnly = url.searchParams.get('public_only') === 'true';
    const search = url.searchParams.get('search');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

    let query = supabase
      .from('workout_programs')
      .select(`
        *,
        workout_templates (
          id,
          name,
          week_number,
          day_number,
          estimated_duration_minutes
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (publicOnly) {
      query = query.eq('is_public', true);
    } else {
      // Show public programs + user's own programs
      query = query.or(`is_public.eq.true,created_by.eq.${user.id}`);
    }

    if (goalType) {
      query = query.eq('goal_type', goalType);
    }

    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: programs, error } = await query;

    if (error) {
      console.error('Error fetching workout programs:', error);
      return NextResponse.json({ error: 'Failed to fetch workout programs' }, { status: 500 });
    }

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Workout programs GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workout-programs - Create new workout program
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
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Program name is required' }, { status: 400 });
    }

    if (body.goal_type && !['strength', 'endurance', 'muscle_gain', 'fat_loss', 'general_fitness'].includes(body.goal_type)) {
      return NextResponse.json({ error: 'Invalid goal type' }, { status: 400 });
    }

    if (body.experience_level && !['beginner', 'intermediate', 'advanced'].includes(body.experience_level)) {
      return NextResponse.json({ error: 'Invalid experience level' }, { status: 400 });
    }

    // Create program
    const programData: WorkoutProgramInsert = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      goal_type: body.goal_type || null,
      experience_level: body.experience_level || null,
      duration_weeks: body.duration_weeks || null,
      sessions_per_week: body.sessions_per_week || null,
      equipment_required: body.equipment_required || null,
      created_by: user.id,
      is_public: body.is_public || false,
    };

    const { data: program, error: programError } = await supabase
      .from('workout_programs')
      .insert(programData)
      .select()
      .single();

    if (programError) {
      if (programError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'A program with this name already exists' }, { status: 409 });
      }
      console.error('Error creating program:', programError);
      return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
    }

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error('Workout programs POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
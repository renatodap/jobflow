import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/workout-programs/[id] - Get specific workout program with templates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: program, error } = await supabase
      .from('workout_programs')
      .select(`
        *,
        workout_templates (
          *
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      console.error('Error fetching program:', error);
      return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error('Workout program GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/workout-programs/[id] - Update workout program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Validate fields if provided
    if (body.goal_type && !['strength', 'endurance', 'muscle_gain', 'fat_loss', 'general_fitness'].includes(body.goal_type)) {
      return NextResponse.json({ error: 'Invalid goal type' }, { status: 400 });
    }

    if (body.experience_level && !['beginner', 'intermediate', 'advanced'].includes(body.experience_level)) {
      return NextResponse.json({ error: 'Invalid experience level' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.goal_type !== undefined) updateData.goal_type = body.goal_type;
    if (body.experience_level !== undefined) updateData.experience_level = body.experience_level;
    if (body.duration_weeks !== undefined) updateData.duration_weeks = body.duration_weeks;
    if (body.sessions_per_week !== undefined) updateData.sessions_per_week = body.sessions_per_week;
    if (body.equipment_required !== undefined) updateData.equipment_required = body.equipment_required;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;

    const { data: program, error } = await supabase
      .from('workout_programs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating program:', error);
      return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error('Workout program PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/workout-programs/[id] - Delete workout program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('workout_programs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting program:', error);
      return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Workout program DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
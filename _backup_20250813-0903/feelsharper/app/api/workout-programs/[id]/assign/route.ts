import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// POST /api/workout-programs/[id]/assign - Assign program to user
export async function POST(
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

    // Verify program exists and is accessible
    const { data: program, error: programError } = await supabase
      .from('workout_programs')
      .select('id, name, duration_weeks')
      .eq('id', id)
      .single();

    if (programError) {
      if (programError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      console.error('Error fetching program:', programError);
      return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
    }

    // Check if user already has an active assignment for this program
    const { data: existingAssignment } = await supabase
      .from('user_programs')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_id', id)
      .eq('is_active', true)
      .single();

    if (existingAssignment) {
      return NextResponse.json({ error: 'Program is already assigned to user' }, { status: 409 });
    }

    // Deactivate any other active programs for this user
    await supabase
      .from('user_programs')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Assign program to user
    const { data: assignment, error: assignError } = await supabase
      .from('user_programs')
      .insert({
        user_id: user.id,
        program_id: id,
        current_week: 1,
        current_day: 1,
        is_active: true,
      })
      .select(`
        *,
        workout_programs (
          id,
          name,
          description,
          goal_type,
          experience_level,
          duration_weeks,
          sessions_per_week
        )
      `)
      .single();

    if (assignError) {
      console.error('Error assigning program:', assignError);
      return NextResponse.json({ error: 'Failed to assign program' }, { status: 500 });
    }

    return NextResponse.json({ 
      assignment,
      message: `Successfully assigned "${program.name}" program`
    }, { status: 201 });
  } catch (error) {
    console.error('Program assignment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
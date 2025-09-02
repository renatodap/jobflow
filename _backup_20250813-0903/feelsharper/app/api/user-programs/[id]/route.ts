import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/user-programs/[id] - Get specific user program assignment
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

    const { data: userProgram, error } = await supabase
      .from('user_programs')
      .select(`
        *,
        workout_programs (
          *,
          workout_templates (
            *
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User program not found' }, { status: 404 });
      }
      console.error('Error fetching user program:', error);
      return NextResponse.json({ error: 'Failed to fetch user program' }, { status: 500 });
    }

    return NextResponse.json({ userProgram });
  } catch (error) {
    console.error('User program GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user-programs/[id] - Update user program progress
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
    
    const updateData: any = {};
    if (body.current_week !== undefined) updateData.current_week = body.current_week;
    if (body.current_day !== undefined) updateData.current_day = body.current_day;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.completed_at !== undefined) updateData.completed_at = body.completed_at;

    const { data: userProgram, error } = await supabase
      .from('user_programs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        workout_programs (
          id,
          name,
          duration_weeks,
          sessions_per_week
        )
      `)
      .single();

    if (error) {
      console.error('Error updating user program:', error);
      return NextResponse.json({ error: 'Failed to update user program' }, { status: 500 });
    }

    return NextResponse.json({ userProgram });
  } catch (error) {
    console.error('User program PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user-programs/[id] - Remove program assignment
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
      .from('user_programs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting user program:', error);
      return NextResponse.json({ error: 'Failed to remove program assignment' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Program assignment removed successfully' });
  } catch (error) {
    console.error('User program DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
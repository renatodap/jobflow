import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/squads/[id] - Get squad details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const squadId = params.id;

    // Get squad details
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .select('*')
      .eq('id', squadId)
      .single();

    if (squadError || !squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is a member or if squad is public
    const { data: membership } = await supabase
      .from('squad_members')
      .select('*')
      .eq('squad_id', squadId)
      .eq('user_id', user.id)
      .single();

    if (!squad.is_public && !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get members
    const { data: members } = await supabase
      .from('squad_members')
      .select(`
        *,
        profiles:user_id (
          id,
          locale,
          goal_type,
          experience_level
        )
      `)
      .eq('squad_id', squadId)
      .order('joined_at', { ascending: true });

    // Get recent posts
    const { data: recentPosts } = await supabase
      .from('squad_posts')
      .select('*')
      .eq('squad_id', squadId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get squad stats
    const stats = {
      member_count: members?.length || 0,
      total_workouts: members?.reduce((acc, m) => acc + (m.total_workouts || 0), 0) || 0,
      total_calories: members?.reduce((acc, m) => acc + (m.total_calories || 0), 0) || 0,
      avg_streak: members?.length 
        ? Math.round(members.reduce((acc, m) => acc + (m.streak_days || 0), 0) / members.length)
        : 0
    };

    return NextResponse.json({
      squad,
      members: members || [],
      recentPosts: recentPosts || [],
      stats,
      userRole: membership?.role || null,
      isMember: !!membership
    });
  } catch (error) {
    console.error('Squad details error:', error);
    return NextResponse.json({ error: 'Failed to fetch squad details' }, { status: 500 });
  }
}

// PATCH /api/squads/[id] - Update squad (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const squadId = params.id;
    const body = await request.json();

    // Check if user is owner
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .select('owner_id')
      .eq('id', squadId)
      .single();

    if (squadError || !squad || squad.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only squad owner can update' }, { status: 403 });
    }

    // Update squad
    const { data: updatedSquad, error: updateError } = await supabase
      .from('squads')
      .update({
        name: body.name,
        description: body.description,
        max_members: body.max_members,
        is_public: body.is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', squadId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating squad:', updateError);
      return NextResponse.json({ error: 'Failed to update squad' }, { status: 500 });
    }

    return NextResponse.json({
      squad: updatedSquad,
      message: 'Squad updated successfully'
    });
  } catch (error) {
    console.error('Squad update error:', error);
    return NextResponse.json({ error: 'Failed to update squad' }, { status: 500 });
  }
}

// DELETE /api/squads/[id] - Delete squad (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const squadId = params.id;

    // Check if user is owner
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .select('owner_id')
      .eq('id', squadId)
      .single();

    if (squadError || !squad || squad.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only squad owner can delete' }, { status: 403 });
    }

    // Soft delete - just mark as inactive
    const { error: deleteError } = await supabase
      .from('squads')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', squadId);

    if (deleteError) {
      console.error('Error deleting squad:', deleteError);
      return NextResponse.json({ error: 'Failed to delete squad' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Squad deleted successfully'
    });
  } catch (error) {
    console.error('Squad deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete squad' }, { status: 500 });
  }
}
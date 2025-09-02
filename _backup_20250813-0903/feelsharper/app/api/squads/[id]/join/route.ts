import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// POST /api/squads/[id]/join - Join a squad
export async function POST(
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
    const { join_code } = body;

    // Get squad details
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .select('*')
      .eq('id', squadId)
      .single();

    if (squadError || !squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    if (!squad.is_active) {
      return NextResponse.json({ error: 'Squad is inactive' }, { status: 400 });
    }

    // Check if squad requires join code
    if (!squad.is_public && squad.join_code !== join_code) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 403 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('squad_members')
      .select('id')
      .eq('squad_id', squadId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this squad' }, { status: 400 });
    }

    // Check if squad is full
    const { count: memberCount } = await supabase
      .from('squad_members')
      .select('*', { count: 'exact', head: true })
      .eq('squad_id', squadId);

    if ((memberCount || 0) >= squad.max_members) {
      return NextResponse.json({ error: 'Squad is full' }, { status: 400 });
    }

    // Join the squad
    const { data: membership, error: joinError } = await supabase
      .from('squad_members')
      .insert({
        squad_id: squadId,
        user_id: user.id,
        role: 'member'
      })
      .select()
      .single();

    if (joinError) {
      console.error('Error joining squad:', joinError);
      return NextResponse.json({ error: 'Failed to join squad' }, { status: 500 });
    }

    // Get user profile for the announcement
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    // Create join announcement post
    await supabase
      .from('squad_posts')
      .insert({
        squad_id: squadId,
        user_id: user.id,
        post_type: 'milestone',
        content: `New member joined the squad! Welcome! 🎉`,
        payload: { 
          event: 'member_joined',
          user_id: user.id,
          user_name: profile?.referral_code || 'New Member'
        }
      });

    // Update user streak for joining
    await supabase.rpc('update_user_streak', {
      user_id_param: user.id,
      streak_type_param: 'daily_login'
    });

    return NextResponse.json({
      membership,
      message: 'Successfully joined the squad!'
    }, { status: 201 });
  } catch (error) {
    console.error('Squad join error:', error);
    return NextResponse.json({ error: 'Failed to join squad' }, { status: 500 });
  }
}

// DELETE /api/squads/[id]/join - Leave a squad
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

    // Check if user is a member
    const { data: membership, error: memberError } = await supabase
      .from('squad_members')
      .select('role')
      .eq('squad_id', squadId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Not a member of this squad' }, { status: 400 });
    }

    // Prevent owner from leaving (they must transfer ownership first)
    if (membership.role === 'owner') {
      return NextResponse.json({ 
        error: 'Squad owner cannot leave. Transfer ownership or delete the squad.' 
      }, { status: 400 });
    }

    // Leave the squad
    const { error: leaveError } = await supabase
      .from('squad_members')
      .delete()
      .eq('squad_id', squadId)
      .eq('user_id', user.id);

    if (leaveError) {
      console.error('Error leaving squad:', leaveError);
      return NextResponse.json({ error: 'Failed to leave squad' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Successfully left the squad'
    });
  } catch (error) {
    console.error('Squad leave error:', error);
    return NextResponse.json({ error: 'Failed to leave squad' }, { status: 500 });
  }
}
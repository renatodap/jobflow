import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/squads - Get user's squads or public squads
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const filter = url.searchParams.get('filter'); // 'my' | 'public' | 'all'

    if (filter === 'my') {
      // Get user's squads
      const { data: mySquads, error } = await supabase
        .from('squad_members')
        .select(`
          squad_id,
          role,
          joined_at,
          squads (
            id,
            name,
            description,
            join_code,
            owner_id,
            max_members,
            is_public,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user squads:', error);
        return NextResponse.json({ error: 'Failed to fetch squads' }, { status: 500 });
      }

      // Get member counts for each squad
      const squadsWithCounts = await Promise.all(
        (mySquads || []).map(async (item) => {
          const { count } = await supabase
            .from('squad_members')
            .select('*', { count: 'exact', head: true })
            .eq('squad_id', item.squad_id);

          return {
            ...item.squads,
            role: item.role,
            joined_at: item.joined_at,
            member_count: count || 0
          };
        })
      );

      return NextResponse.json({ squads: squadsWithCounts });
    } else if (filter === 'public') {
      // Get public squads
      const { data: publicSquads, error } = await supabase
        .from('squads')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching public squads:', error);
        return NextResponse.json({ error: 'Failed to fetch public squads' }, { status: 500 });
      }

      // Get member counts
      const squadsWithCounts = await Promise.all(
        (publicSquads || []).map(async (squad) => {
          const { count } = await supabase
            .from('squad_members')
            .select('*', { count: 'exact', head: true })
            .eq('squad_id', squad.id);

          // Check if user is a member
          const { data: membership } = await supabase
            .from('squad_members')
            .select('role')
            .eq('squad_id', squad.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...squad,
            member_count: count || 0,
            is_member: !!membership,
            user_role: membership?.role
          };
        })
      );

      return NextResponse.json({ squads: squadsWithCounts });
    } else {
      // Get all squads (my + suggested)
      const [mySquadsRes, publicSquadsRes] = await Promise.all([
        supabase
          .from('squad_members')
          .select('squad_id')
          .eq('user_id', user.id),
        supabase
          .from('squads')
          .select('*')
          .eq('is_public', true)
          .eq('is_active', true)
          .limit(10)
      ]);

      const mySquadIds = mySquadsRes.data?.map(m => m.squad_id) || [];
      const suggestedSquads = publicSquadsRes.data?.filter(s => !mySquadIds.includes(s.id)) || [];

      return NextResponse.json({
        mySquadIds,
        suggestedSquads
      });
    }
  } catch (error) {
    console.error('Squads GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch squads' }, { status: 500 });
  }
}

// POST /api/squads - Create a new squad
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, max_members = 15, is_public = false } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json({ error: 'Squad name must be at least 3 characters' }, { status: 400 });
    }

    // Check if user already owns too many squads
    const { count: ownedCount } = await supabase
      .from('squads')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('is_active', true);

    if ((ownedCount || 0) >= 3) {
      return NextResponse.json({ error: 'You can only own up to 3 active squads' }, { status: 400 });
    }

    // Create the squad
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .insert({
        name: name.trim(),
        description: description?.trim(),
        owner_id: user.id,
        max_members,
        is_public
      })
      .select()
      .single();

    if (squadError) {
      console.error('Error creating squad:', squadError);
      return NextResponse.json({ error: 'Failed to create squad' }, { status: 500 });
    }

    // Add owner as first member
    const { error: memberError } = await supabase
      .from('squad_members')
      .insert({
        squad_id: squad.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) {
      console.error('Error adding owner to squad:', memberError);
      // Rollback squad creation
      await supabase.from('squads').delete().eq('id', squad.id);
      return NextResponse.json({ error: 'Failed to initialize squad' }, { status: 500 });
    }

    // Create welcome post
    await supabase
      .from('squad_posts')
      .insert({
        squad_id: squad.id,
        user_id: user.id,
        post_type: 'milestone',
        content: `Welcome to ${squad.name}! Let's crush our goals together! 💪`,
        payload: { event: 'squad_created' }
      });

    return NextResponse.json({
      squad,
      message: 'Squad created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Squad creation error:', error);
    return NextResponse.json({ error: 'Failed to create squad' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/user-programs - Get user's assigned programs
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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

    let query = supabase
      .from('user_programs')
      .select(`
        *,
        workout_programs (
          id,
          name,
          description,
          goal_type,
          experience_level,
          duration_weeks,
          sessions_per_week,
          equipment_required,
          workout_templates (
            id,
            name,
            week_number,
            day_number,
            estimated_duration_minutes
          )
        )
      `)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: userPrograms, error } = await query;

    if (error) {
      console.error('Error fetching user programs:', error);
      return NextResponse.json({ error: 'Failed to fetch user programs' }, { status: 500 });
    }

    return NextResponse.json({ userPrograms });
  } catch (error) {
    console.error('User programs GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
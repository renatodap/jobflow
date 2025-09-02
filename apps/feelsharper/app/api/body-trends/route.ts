import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/body-trends - Get user's body trend data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '90'), 365);

    let query = supabase
      .from('body_trends')
      .select('*')
      .eq('user_id', user.id)
      .order('calculation_date', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('calculation_date', startDate);
    }

    if (endDate) {
      query = query.lte('calculation_date', endDate);
    }

    const { data: trends, error } = await query;

    if (error) {
      console.error('Error fetching body trends:', error);
      return NextResponse.json({ error: 'Failed to fetch body trends' }, { status: 500 });
    }

    // Calculate summary statistics
    const summary = calculateTrendSummary(trends || []);

    return NextResponse.json({ 
      trends: trends || [],
      summary 
    });
  } catch (error) {
    console.error('Body trends GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateTrendSummary(trends: any[]) {
  if (trends.length === 0) {
    return {
      current_weight_ema: null,
      trend_direction: 'stable',
      weekly_change: 0,
      total_change_30days: 0,
      data_points: 0
    };
  }

  const latest = trends[0];
  const monthAgo = trends.find(t => {
    const diffDays = Math.abs(
      (new Date(latest.calculation_date).getTime() - new Date(t.calculation_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 30;
  });

  return {
    current_weight_ema: latest.weight_7day_ema,
    trend_direction: latest.weight_trend_direction || 'stable',
    weekly_change: latest.weight_weekly_change_kg || 0,
    total_change_30days: monthAgo 
      ? (latest.weight_7day_ema || 0) - (monthAgo.weight_7day_ema || 0)
      : 0,
    data_points: trends.length
  };
}
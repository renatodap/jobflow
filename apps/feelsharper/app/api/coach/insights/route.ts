import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/coach/insights - Get AI-generated insights for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active insights
    const { data: insights, error: insightsError } = await supabase
      .from('user_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (insightsError) {
      console.error('Error fetching insights:', insightsError);
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
    }

    // Get recommendations
    const { data: recommendations, error: recError } = await supabase
      .from('coaching_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .is('is_completed', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (recError) {
      console.error('Error fetching recommendations:', recError);
      return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }

    return NextResponse.json({
      insights: insights || [],
      recommendations: recommendations || []
    });
  } catch (error) {
    console.error('Coach insights error:', error);
    return NextResponse.json({ error: 'Failed to fetch coaching insights' }, { status: 500 });
  }
}

// POST /api/coach/insights - Generate new insights
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather user data for analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [workouts, nutrition, bodyMetrics, goals] = await Promise.all([
      supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: false }),
      supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo),
      supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('measurement_date', thirtyDaysAgo)
        .order('measurement_date', { ascending: false }),
      supabase
        .from('body_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
    ]);

    const insights = [];
    const recommendations = [];

    // Analyze workout patterns
    if (workouts.data && workouts.data.length > 0) {
      const workoutCount = workouts.data.length;
      const avgDuration = workouts.data.reduce((acc, w) => acc + (w.duration_minutes || 0), 0) / workoutCount;
      const consistency = (workoutCount / 30) * 100;

      // Workout consistency insight
      if (consistency < 50) {
        insights.push({
          user_id: user.id,
          insight_type: 'consistency',
          insight_text: `Your workout consistency is at ${Math.round(consistency)}% this month. Aim for at least 3-4 sessions per week.`,
          confidence_score: 0.85,
          data_points_used: workoutCount,
          recommendations: [
            { action: 'Schedule workouts in advance', priority: 'high' },
            { action: 'Start with shorter 20-minute sessions', priority: 'medium' },
            { action: 'Find a workout buddy for accountability', priority: 'low' }
          ]
        });

        recommendations.push({
          user_id: user.id,
          recommendation_type: 'habit_formation',
          title: 'Improve Workout Consistency',
          description: 'Your workout frequency has room for improvement. Let\'s build a sustainable routine.',
          priority: 'high',
          reasoning: `You're averaging ${(workoutCount / 4.3).toFixed(1)} workouts per week. Research shows 3-4 sessions weekly is optimal for progress.`,
          expected_outcome: 'Increased strength, endurance, and faster goal achievement',
          action_items: [
            'Set 3 non-negotiable workout days this week',
            'Prepare gym bag the night before',
            'Track workout streaks for motivation'
          ]
        });
      } else if (consistency > 80) {
        insights.push({
          user_id: user.id,
          insight_type: 'consistency',
          insight_text: `Excellent consistency at ${Math.round(consistency)}%! You're crushing it with ${workoutCount} workouts this month.`,
          confidence_score: 0.90,
          data_points_used: workoutCount,
          recommendations: [
            { action: 'Maintain current momentum', priority: 'high' },
            { action: 'Consider progressive overload', priority: 'medium' }
          ]
        });
      }

      // Workout variety insight
      const workoutTypes = [...new Set(workouts.data.map(w => w.workout_type))];
      if (workoutTypes.length < 2) {
        insights.push({
          user_id: user.id,
          insight_type: 'workout_pattern',
          insight_text: 'Consider adding variety to your workouts. Mix strength, cardio, and flexibility training.',
          confidence_score: 0.75,
          data_points_used: workoutCount,
          recommendations: [
            { action: 'Add one different workout type this week', priority: 'medium' },
            { action: 'Try yoga or mobility work for recovery', priority: 'low' }
          ]
        });
      }
    }

    // Analyze nutrition patterns
    if (nutrition.data && nutrition.data.length > 0) {
      const avgCalories = nutrition.data.reduce((acc, n) => acc + n.calories, 0) / nutrition.data.length;
      const avgProtein = nutrition.data.reduce((acc, n) => acc + n.protein_g, 0) / nutrition.data.length;

      // Protein intake insight
      const targetProteinMin = 1.6; // g per kg body weight
      const currentWeight = bodyMetrics.data?.[0]?.weight_kg || 70; // Default if no data
      const minProtein = currentWeight * targetProteinMin;

      if (avgProtein < minProtein) {
        insights.push({
          user_id: user.id,
          insight_type: 'nutrition_trend',
          insight_text: `Your average protein intake (${Math.round(avgProtein)}g) is below optimal. Aim for ${Math.round(minProtein)}g daily.`,
          confidence_score: 0.80,
          data_points_used: nutrition.data.length,
          recommendations: [
            { action: 'Add protein to each meal', priority: 'high' },
            { action: 'Consider protein supplementation', priority: 'medium' }
          ]
        });

        recommendations.push({
          user_id: user.id,
          recommendation_type: 'nutrition_guidance',
          title: 'Optimize Protein Intake',
          description: 'Increase protein to support muscle recovery and growth.',
          priority: 'high',
          reasoning: `You're getting ${Math.round(avgProtein)}g daily, but need ${Math.round(minProtein)}g for optimal results.`,
          expected_outcome: 'Better recovery, muscle retention, and satiety',
          action_items: [
            `Add ${Math.round((minProtein - avgProtein) / 3)}g protein to each meal`,
            'Include lean meats, fish, eggs, or plant proteins',
            'Track protein intake for one week'
          ]
        });
      }
    }

    // Analyze body composition trends
    if (bodyMetrics.data && bodyMetrics.data.length >= 2) {
      const latestWeight = bodyMetrics.data[0].weight_kg;
      const previousWeight = bodyMetrics.data[1].weight_kg;
      
      if (latestWeight && previousWeight) {
        const weightChange = latestWeight - previousWeight;
        const activeGoal = goals.data?.[0];

        if (activeGoal?.goal_type === 'weight_loss' && weightChange > 0.5) {
          insights.push({
            user_id: user.id,
            insight_type: 'body_composition',
            insight_text: 'Weight trending up despite weight loss goal. Time to adjust your approach.',
            confidence_score: 0.85,
            data_points_used: bodyMetrics.data.length,
            recommendations: [
              { action: 'Review caloric intake', priority: 'high' },
              { action: 'Increase cardio frequency', priority: 'medium' },
              { action: 'Check sleep and stress levels', priority: 'medium' }
            ]
          });

          recommendations.push({
            user_id: user.id,
            recommendation_type: 'goal_adjustment',
            title: 'Adjust Weight Loss Strategy',
            description: 'Your current approach needs refinement to achieve your weight loss goal.',
            priority: 'critical',
            reasoning: 'Recent weight trend is opposite to your goal direction.',
            expected_outcome: 'Return to consistent weight loss of 0.5-1kg per week',
            action_items: [
              'Reduce daily calories by 200-300',
              'Add 2 cardio sessions this week',
              'Log all meals for accuracy',
              'Ensure 7+ hours sleep nightly'
            ]
          });
        } else if (activeGoal?.goal_type === 'muscle_gain' && weightChange < -0.5) {
          insights.push({
            user_id: user.id,
            insight_type: 'body_composition',
            insight_text: 'Weight decreasing during muscle gain phase. Increase caloric intake.',
            confidence_score: 0.85,
            data_points_used: bodyMetrics.data.length,
            recommendations: [
              { action: 'Increase daily calories by 300-500', priority: 'high' },
              { action: 'Focus on progressive overload', priority: 'high' }
            ]
          });
        }
      }
    }

    // Recovery and stress insight
    const recentCheckIns = await supabase
      .from('coaching_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });

    if (recentCheckIns.data && recentCheckIns.data.length > 0) {
      const avgStress = recentCheckIns.data.reduce((acc, c) => acc + (c.stress_level || 5), 0) / recentCheckIns.data.length;
      const avgRecovery = recentCheckIns.data.reduce((acc, c) => acc + (c.recovery_status || 5), 0) / recentCheckIns.data.length;

      if (avgStress > 7) {
        insights.push({
          user_id: user.id,
          insight_type: 'stress_level',
          insight_text: 'High stress levels detected. This may impact your recovery and progress.',
          confidence_score: 0.80,
          data_points_used: recentCheckIns.data.length,
          recommendations: [
            { action: 'Add stress management techniques', priority: 'high' },
            { action: 'Consider deload week', priority: 'medium' },
            { action: 'Prioritize sleep quality', priority: 'high' }
          ]
        });
      }

      if (avgRecovery < 5) {
        recommendations.push({
          user_id: user.id,
          recommendation_type: 'recovery_protocol',
          title: 'Enhance Recovery Protocol',
          description: 'Your recovery scores indicate you need more rest.',
          priority: 'high',
          reasoning: `Average recovery score of ${avgRecovery.toFixed(1)}/10 suggests inadequate rest.`,
          expected_outcome: 'Better performance, reduced injury risk, improved mood',
          action_items: [
            'Add one full rest day this week',
            'Implement 10-minute daily stretching',
            'Hydrate with 3L water daily',
            'Consider magnesium supplementation'
          ]
        });
      }
    }

    // Save insights
    if (insights.length > 0) {
      const { error: insertError } = await supabase
        .from('user_insights')
        .insert(insights);

      if (insertError) {
        console.error('Error inserting insights:', insertError);
      }
    }

    // Save recommendations
    if (recommendations.length > 0) {
      const { error: recInsertError } = await supabase
        .from('coaching_recommendations')
        .insert(recommendations);

      if (recInsertError) {
        console.error('Error inserting recommendations:', recInsertError);
      }
    }

    // Update coaching analytics
    await supabase.rpc('calculate_coaching_analytics', {
      user_id_param: user.id,
      date_param: new Date().toISOString().split('T')[0]
    });

    return NextResponse.json({
      message: 'Insights generated successfully',
      insightsCount: insights.length,
      recommendationsCount: recommendations.length
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
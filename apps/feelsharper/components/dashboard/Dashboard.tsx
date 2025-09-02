"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Target, 
  Dumbbell, 
  Apple, 
  Moon, 
  TrendingUp, 
  Calendar,
  Plus,
  Activity,
  Zap,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardData {
  profile: any;
  goals: any[];
  recentWorkouts: any[];
  recentMeals: any[];
  bodyMetrics: any[];
  sleepLogs: any[];
  todayStats: {
    workoutCompleted: boolean;
    caloriesLogged: number;
    targetCalories: number;
    proteinLogged: number;
    targetProtein: number;
  };
}

interface DashboardWidget {
  id: string;
  title: string;
  icon: any;
  component: React.ComponentType<any>;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Load all dashboard data in parallel
      const [
        profileResult,
        goalsResult,
        workoutsResult,
        mealsResult,
        bodyMetricsResult,
        sleepResult
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('workouts').select('*, workout_sets(*), cardio_sessions(*)').eq('user_id', user.id).order('started_at', { ascending: false }).limit(5),
        supabase.from('meals').select('*, meal_items(*)').eq('user_id', user.id).order('eaten_at', { ascending: false }).limit(5),
        supabase.from('body_metrics').select('*').eq('user_id', user.id).order('measured_at', { ascending: false }).limit(10),
        supabase.from('sleep_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7)
      ]);

      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayWorkouts = workoutsResult.data?.filter(w => 
        w.started_at?.startsWith(today)
      ) || [];
      
      const todayMeals = mealsResult.data?.filter(m => 
        m.eaten_at?.startsWith(today)
      ) || [];

      const todayCalories = todayMeals.reduce((sum, meal) => sum + (meal.kcal || 0), 0);
      const todayProtein = todayMeals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0);

      const dashboardData: DashboardData = {
        profile: profileResult.data,
        goals: goalsResult.data || [],
        recentWorkouts: workoutsResult.data || [],
        recentMeals: mealsResult.data || [],
        bodyMetrics: bodyMetricsResult.data || [],
        sleepLogs: sleepResult.data || [],
        todayStats: {
          workoutCompleted: todayWorkouts.length > 0,
          caloriesLogged: todayCalories,
          targetCalories: 2200, // Default, should come from goals
          proteinLogged: todayProtein,
          targetProtein: 150, // Default, should come from goals
        }
      };

      setData(dashboardData);

      // Configure widgets based on user preferences
      const defaultWidgets: DashboardWidget[] = [
        {
          id: 'today-overview',
          title: 'Today\'s Progress',
          icon: Target,
          component: TodayOverviewWidget,
          enabled: true,
          size: 'large'
        },
        {
          id: 'quick-actions',
          title: 'Quick Actions',
          icon: Zap,
          component: QuickActionsWidget,
          enabled: true,
          size: 'medium'
        },
        {
          id: 'weight-trend',
          title: 'Weight Trend',
          icon: TrendingUp,
          component: WeightTrendWidget,
          enabled: dashboardData.profile?.goal_type === 'weight_loss' || dashboardData.profile?.goal_type === 'muscle_gain',
          size: 'medium'
        },
        {
          id: 'workout-history',
          title: 'Recent Workouts',
          icon: Dumbbell,
          component: WorkoutHistoryWidget,
          enabled: true,
          size: 'medium'
        },
        {
          id: 'nutrition-summary',
          title: 'Nutrition Summary',
          icon: Apple,
          component: NutritionSummaryWidget,
          enabled: true,
          size: 'medium'
        },
        {
          id: 'sleep-quality',
          title: 'Sleep Quality',
          icon: Moon,
          component: SleepQualityWidget,
          enabled: true,
          size: 'small'
        },
        {
          id: 'achievements',
          title: 'Recent Achievements',
          icon: Award,
          component: AchievementsWidget,
          enabled: true,
          size: 'small'
        }
      ];

      setWidgets(defaultWidgets.filter(w => w.enabled));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Welcome to Feel Sharper</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Complete your onboarding to get started</p>
          <Button href="/onboarding">Get Started</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Welcome back! 👋
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Here's your progress overview for today
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View Calendar</span>
            </Button>
          </div>
        </header>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {widgets.map((widget) => {
            const Component = widget.component;
            return (
              <div
                key={widget.id}
                className={cn(
                  widget.size === 'large' && 'md:col-span-2 lg:col-span-3',
                  widget.size === 'medium' && 'md:col-span-2 lg:col-span-2',
                  widget.size === 'small' && 'md:col-span-1'
                )}
              >
                <Component data={data} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Widget Components
function TodayOverviewWidget({ data }: { data: DashboardData }) {
  const { todayStats } = data;
  const caloriesProgress = (todayStats.caloriesLogged / todayStats.targetCalories) * 100;
  const proteinProgress = (todayStats.proteinLogged / todayStats.targetProtein) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Today's Progress</h3>
        <Target className="w-5 h-5 text-amber-600" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Workout Status */}
        <div className="text-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2",
            todayStats.workoutCompleted 
              ? "bg-green-100 dark:bg-green-900/20" 
              : "bg-slate-100 dark:bg-slate-800"
          )}>
            <Dumbbell className={cn(
              "w-8 h-8",
              todayStats.workoutCompleted ? "text-green-600" : "text-slate-400"
            )} />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {todayStats.workoutCompleted ? 'Workout Done!' : 'No Workout Yet'}
          </p>
          <p className="text-xs text-slate-500">
            {todayStats.workoutCompleted ? 'Great job!' : 'Time to move!'}
          </p>
        </div>

        {/* Calories */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(caloriesProgress / 100, 1))}`}
                className="text-energy-orange"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-steel-gray dark:text-clean-white">
                {Math.round(caloriesProgress)}%
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {todayStats.caloriesLogged} / {todayStats.targetCalories}
          </p>
          <p className="text-xs text-slate-500">Calories</p>
        </div>

        {/* Protein */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(proteinProgress / 100, 1))}`}
                className="text-blue-600"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-steel-gray dark:text-clean-white">
                {Math.round(proteinProgress)}%
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {Math.round(todayStats.proteinLogged)}g / {todayStats.targetProtein}g
          </p>
          <p className="text-xs text-slate-500">Protein</p>
        </div>
      </div>
    </Card>
  );
}

function QuickActionsWidget({ data }: { data: DashboardData }) {
  const actions = [
    { label: 'Log Workout', href: '/log/workout', icon: Dumbbell, color: 'bg-navy' },
    { label: 'Log Meal', href: '/log/meal', icon: Apple, color: 'bg-success' },
    { label: 'Add Weight', href: '/metrics', icon: TrendingUp, color: 'bg-info' },
    { label: 'AI Coach', href: '/coach', icon: Zap, color: 'bg-warning' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
        <Zap className="w-5 h-5 text-amber-600" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            href={action.href}
            variant="outline"
            className="flex flex-col items-center space-y-2 h-auto py-4"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", action.color)}>
              <action.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}

function WeightTrendWidget({ data }: { data: DashboardData }) {
  const { bodyMetrics } = data;
  const recentWeights = bodyMetrics.filter(m => m.weight_kg).slice(0, 7);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weight Trend</h3>
        <TrendingUp className="w-5 h-5 text-amber-600" />
      </div>
      
      {recentWeights.length > 0 ? (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {recentWeights[0].weight_kg} kg
            </p>
            <p className="text-sm text-slate-500">Latest weight</p>
          </div>
          
          {/* Simple trend visualization */}
          <div className="h-20 flex items-end justify-between space-x-1">
            {recentWeights.reverse().map((metric, index) => {
              const maxWeight = Math.max(...recentWeights.map(m => m.weight_kg));
              const minWeight = Math.min(...recentWeights.map(m => m.weight_kg));
              const range = maxWeight - minWeight || 1;
              const height = ((metric.weight_kg - minWeight) / range) * 60 + 20;
              
              return (
                <div
                  key={index}
                  className="bg-amber-600 rounded-t flex-1"
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No weight data yet</p>
          <Button variant="outline" size="sm" className="mt-2">
            Add Weight
          </Button>
        </div>
      )}
    </Card>
  );
}

function WorkoutHistoryWidget({ data }: { data: DashboardData }) {
  const { recentWorkouts } = data;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Workouts</h3>
        <Dumbbell className="w-5 h-5 text-amber-600" />
      </div>
      
      {recentWorkouts.length > 0 ? (
        <div className="space-y-3">
          {recentWorkouts.slice(0, 3).map((workout) => (
            <div key={workout.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {workout.type || 'Workout'}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(workout.started_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {workout.workout_sets?.length || 0} sets
                </p>
                <p className="text-xs text-slate-500">
                  {workout.ended_at 
                    ? `${Math.round((new Date(workout.ended_at).getTime() - new Date(workout.started_at).getTime()) / 60000)}m`
                    : 'In progress'
                  }
                </p>
              </div>
            </div>
          ))}
          
          <Button variant="outline" size="sm" className="w-full mt-3">
            View All Workouts
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No workouts yet</p>
          <Button variant="outline" size="sm" className="mt-2">
            Start First Workout
          </Button>
        </div>
      )}
    </Card>
  );
}

function NutritionSummaryWidget({ data }: { data: DashboardData }) {
  const { recentMeals } = data;
  const todayMeals = recentMeals.filter(meal => 
    meal.eaten_at?.startsWith(new Date().toISOString().split('T')[0])
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Today's Nutrition</h3>
        <Apple className="w-5 h-5 text-amber-600" />
      </div>
      
      {todayMeals.length > 0 ? (
        <div className="space-y-3">
          {todayMeals.slice(0, 3).map((meal) => (
            <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {meal.name || 'Meal'}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(meal.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {meal.kcal || 0} cal
                </p>
                <p className="text-xs text-slate-500">
                  {meal.protein_g || 0}g protein
                </p>
              </div>
            </div>
          ))}
          
          <Button variant="outline" size="sm" className="w-full mt-3">
            View All Meals
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <Apple className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No meals logged today</p>
          <Button variant="outline" size="sm" className="mt-2">
            Log First Meal
          </Button>
        </div>
      )}
    </Card>
  );
}

function SleepQualityWidget({ data }: { data: DashboardData }) {
  const { sleepLogs } = data;
  const recentSleep = sleepLogs.slice(0, 7);
  const avgQuality = recentSleep.length > 0 
    ? recentSleep.reduce((sum, log) => sum + (log.quality || 0), 0) / recentSleep.length 
    : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sleep Quality</h3>
        <Moon className="w-5 h-5 text-amber-600" />
      </div>
      
      {recentSleep.length > 0 ? (
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {avgQuality.toFixed(1)}/5
          </div>
          <p className="text-sm text-slate-500 mb-4">7-day average</p>
          
          <div className="flex justify-center space-x-1">
            {recentSleep.map((log, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-8 rounded-full",
                  (log.quality || 0) >= 4 ? "bg-green-500" :
                  (log.quality || 0) >= 3 ? "bg-yellow-500" : "bg-red-500"
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Moon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No sleep data</p>
        </div>
      )}
    </Card>
  );
}

function AchievementsWidget({ data }: { data: DashboardData }) {
  // Mock achievements for now
  const achievements = [
    { title: 'First Workout', description: 'Completed your first workout!', earned: true },
    { title: '7-Day Streak', description: 'Logged activity for 7 days', earned: false },
    { title: 'Nutrition Goal', description: 'Hit your protein target', earned: true },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Achievements</h3>
        <Award className="w-5 h-5 text-amber-600" />
      </div>
      
      <div className="space-y-3">
        {achievements.slice(0, 2).map((achievement, index) => (
          <div key={index} className={cn(
            "flex items-center space-x-3 p-2 rounded-lg",
            achievement.earned ? "bg-amber-50 dark:bg-amber-900/20" : "bg-slate-50 dark:bg-slate-800"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              achievement.earned ? "bg-amber-500" : "bg-slate-300"
            )}>
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {achievement.title}
              </p>
              <p className="text-xs text-slate-500">
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

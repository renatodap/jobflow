"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Award,
  Activity,
  Scale,
  Zap,
  Moon,
  Heart,
  BarChart3,
  LineChart,
  PieChart,
  Filter,
  Download,
  Share2,
  Camera,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  category: 'body' | 'performance' | 'wellness' | 'nutrition';
  lastUpdated: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: string;
  progress?: number;
  target?: number;
}

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  notes?: string;
  bodyPart: 'front' | 'side' | 'back' | 'custom';
}

const METRIC_CATEGORIES = [
  { id: 'all', label: 'All Metrics', icon: BarChart3 },
  { id: 'body', label: 'Body Composition', icon: Scale },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'wellness', label: 'Wellness', icon: Heart },
  { id: 'nutrition', label: 'Nutrition', icon: Target }
];

const TIME_PERIODS = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '3 Months' },
  { id: '1y', label: '1 Year' },
  { id: 'all', label: 'All Time' }
];

// Sample data - in production this would come from your database
const SAMPLE_METRICS: ProgressMetric[] = [
  {
    id: '1',
    name: 'Body Weight',
    value: 75.2,
    unit: 'kg',
    change: -1.3,
    changePercent: -1.7,
    trend: 'down',
    target: 73,
    category: 'body',
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'Body Fat',
    value: 12.5,
    unit: '%',
    change: -0.8,
    changePercent: -6.0,
    trend: 'down',
    target: 10,
    category: 'body',
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '3',
    name: 'Bench Press 1RM',
    value: 95,
    unit: 'kg',
    change: 5,
    changePercent: 5.6,
    trend: 'up',
    target: 100,
    category: 'performance',
    lastUpdated: '2024-01-14T18:30:00Z'
  },
  {
    id: '4',
    name: 'Sleep Quality',
    value: 4.2,
    unit: '/5',
    change: 0.3,
    changePercent: 7.7,
    trend: 'up',
    target: 4.5,
    category: 'wellness',
    lastUpdated: '2024-01-15T07:00:00Z'
  },
  {
    id: '5',
    name: 'Daily Protein',
    value: 145,
    unit: 'g',
    change: 12,
    changePercent: 9.0,
    trend: 'up',
    target: 150,
    category: 'nutrition',
    lastUpdated: '2024-01-14T21:00:00Z'
  }
];

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Workout',
    description: 'Completed your first workout session',
    icon: '🏋️',
    category: 'Milestones',
    unlockedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Consistency King',
    description: 'Worked out 7 days in a row',
    icon: '🔥',
    category: 'Streaks',
    unlockedAt: '2024-01-08T19:30:00Z'
  },
  {
    id: '3',
    title: 'Protein Power',
    description: 'Hit your protein target 30 days in a row',
    icon: '💪',
    category: 'Nutrition',
    unlockedAt: '2024-01-10T22:00:00Z'
  },
  {
    id: '4',
    title: 'Sleep Champion',
    description: 'Averaged 8+ hours of sleep for a week',
    icon: '😴',
    category: 'Wellness',
    unlockedAt: '2024-01-12T07:30:00Z'
  }
];

export default function ProgressTracker() {
  const [metrics, setMetrics] = useState<ProgressMetric[]>(SAMPLE_METRICS);
  const [achievements, setAchievements] = useState<Achievement[]>(SAMPLE_ACHIEVEMENTS);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, [selectedPeriod]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'all':
          startDate.setFullYear(2020); // Far back date
          break;
      }

      // Load body metrics
      const { data: bodyMetrics } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('measured_at', startDate.toISOString())
        .lte('measured_at', endDate.toISOString())
        .order('measured_at', { ascending: true });

      // Load workout performance data
      const { data: workouts } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_sets (
            exercise_name,
            weight_kg,
            reps,
            rpe
          )
        `)
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .order('started_at', { ascending: true });

      // Load sleep data
      const { data: sleepLogs } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Load nutrition data
      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('eaten_at', startDate.toISOString())
        .lte('eaten_at', endDate.toISOString())
        .order('eaten_at', { ascending: true });

      // Process and calculate metrics
      const calculatedMetrics = calculateMetrics(
        bodyMetrics || [], 
        workouts || [], 
        sleepLogs || [], 
        meals || []
      );
      setMetrics(calculatedMetrics);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (bodyMetrics: any[], workouts: any[], sleepLogs: any[], meals: any[]): ProgressMetric[] => {
    // This would contain complex logic to calculate trends and changes
    // For now, returning sample data
    return SAMPLE_METRICS;
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-slate-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string, isPositive: boolean = true) => {
    if (trend === 'stable') return 'text-slate-600';
    const isGood = (trend === 'up' && isPositive) || (trend === 'down' && !isPositive);
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const exportData = () => {
    // This would generate and download a CSV/PDF report
    console.log('Exporting progress data...');
    alert('Progress report exported!');
  };

  const shareProgress = () => {
    // This would generate a shareable link or image
    console.log('Sharing progress...');
    alert('Progress shared!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Progress Tracker
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Track your journey and celebrate your wins
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={exportData}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <Button
                variant="outline"
                onClick={shareProgress}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            {METRIC_CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </Button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="period" className="text-sm font-medium">
              Time Period:
            </Label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
            >
              {TIME_PERIODS.map(period => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMetrics.map(metric => (
                <Card key={metric.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {metric.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {metric.value}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "text-sm font-medium",
                        getTrendColor(metric.trend, metric.change > 0)
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change} {metric.unit}
                      </span>
                      <span className={cn(
                        "text-xs",
                        getTrendColor(metric.trend, metric.changePercent > 0)
                      )}>
                        ({metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%)
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {selectedPeriod}
                    </span>
                  </div>

                  {metric.target && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Target: {metric.target} {metric.unit}</span>
                        <span className="font-medium">
                          {getProgressPercentage(metric.value, metric.target).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(metric.value, metric.target)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-3">
                    Last updated: {new Date(metric.lastUpdated).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>

            {/* Charts Placeholder */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Progress Charts
                </h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <LineChart className="w-4 h-4 mr-2" />
                    Line
                  </Button>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Bar
                  </Button>
                  <Button variant="ghost" size="sm">
                    <PieChart className="w-4 h-4 mr-2" />
                    Pie
                  </Button>
                </div>
              </div>
              
              <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Interactive charts coming soon</p>
                  <p className="text-sm text-slate-400">Visualize your progress over time</p>
                </div>
              </div>
            </Card>

            {/* Progress Photos */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Progress Photos
                </h3>
                <Button
                  onClick={() => setShowPhotoUpload(true)}
                  className="flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Add Photo</span>
                </Button>
              </div>
              
              {progressPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {progressPhotos.map(photo => (
                    <div key={photo.id} className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                      <img
                        src={photo.url}
                        alt={`Progress photo from ${photo.date}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-xs font-medium">
                          {new Date(photo.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-2">No progress photos yet</p>
                  <p className="text-sm text-slate-400 mb-4">
                    Track your visual progress with photos
                  </p>
                  <Button onClick={() => setShowPhotoUpload(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Photo
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Achievements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Recent Achievements
              </h3>
              <div className="space-y-4">
                {achievements.slice(0, 4).map(achievement => (
                  <div key={achievement.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-lg">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Award className="w-4 h-4 mr-2" />
                View All Achievements
              </Button>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Workouts</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Current Streak</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">12 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Avg Sleep</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">7.8h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Achievements</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{achievements.length}</span>
                </div>
              </div>
            </Card>

            {/* Goals Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Goals Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Weight Loss</span>
                    <span className="text-sm font-medium">73%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '73%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Strength Goal</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Sleep Quality</span>
                    <span className="text-sm font-medium">84%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Photo Upload Modal */}
        {showPhotoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Add Progress Photo
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="photo-upload">Upload Photo</Label>
                  <div className="mt-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload or drag and drop
                    </p>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="body-part">Body Part</Label>
                  <select
                    id="body-part"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="front">Front View</option>
                    <option value="side">Side View</option>
                    <option value="back">Back View</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="photo-notes">Notes (Optional)</Label>
                  <textarea
                    id="photo-notes"
                    placeholder="Any notes about this photo..."
                    className="mt-1 w-full h-20 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowPhotoUpload(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Save Photo
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

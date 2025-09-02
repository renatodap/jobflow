"use client";

import { useState, useEffect } from 'react';
import { Activity, Plus, TrendingDown, TrendingUp, Minus, Target, Calendar, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { BodyMeasurement, BodyTrend, BodyGoal } from '@/lib/types/database';

interface TrendData {
  date: string;
  weight: number;
  ema: number;
}

interface WeightStats {
  current: number | null;
  sevenDayEma: number | null;
  trend: 'gaining' | 'losing' | 'stable';
  weeklyChange: number;
  totalChange30Days: number;
}

export default function WeightPage() {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [trends, setTrends] = useState<BodyTrend[]>([]);
  const [goals, setGoals] = useState<BodyGoal[]>([]);
  const [stats, setStats] = useState<WeightStats>({ current: null, sevenDayEma: null, trend: 'stable', weeklyChange: 0, totalChange30Days: 0 });
  
  const supabase = createClient();

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch measurements, trends, and goals in parallel
      const [measurementsRes, trendsRes, goalsRes] = await Promise.all([
        fetch('/api/body-measurements?limit=30'),
        fetch('/api/body-trends?limit=30'),
        fetch('/api/body-goals?active_only=true')
      ]);

      const [measurementsData, trendsData, goalsData] = await Promise.all([
        measurementsRes.json(),
        trendsRes.json(),
        goalsRes.json()
      ]);

      if (measurementsData.measurements) {
        setMeasurements(measurementsData.measurements);
      }
      
      if (trendsData.trends) {
        setTrends(trendsData.trends);
        if (trendsData.summary) {
          setStats({
            current: measurementsData.measurements?.[0]?.weight_kg || null,
            sevenDayEma: trendsData.summary.current_weight_ema,
            trend: trendsData.summary.trend_direction,
            weeklyChange: trendsData.summary.weekly_change,
            totalChange30Days: trendsData.summary.total_change_30days
          });
        }
      }
      
      if (goalsData.goals) {
        setGoals(goalsData.goals);
      }
    } catch (error) {
      console.error('Error fetching weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!weight || saving) return;
    
    try {
      setSaving(true);
      const weightInKg = unit === 'lb' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
      
      const response = await fetch('/api/body-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurement_date: new Date().toISOString().split('T')[0],
          weight_kg: weightInKg
        })
      });

      if (response.ok) {
        setWeight('');
        setIsAdding(false);
        // Refresh data to show the new entry
        await fetchData();
      } else {
        console.error('Failed to save weight');
      }
    } catch (error) {
      console.error('Error saving weight:', error);
    } finally {
      setSaving(false);
    }
  };

  // Convert kg to display unit
  const convertWeight = (kg: number | null): string => {
    if (!kg) return '--';
    const converted = unit === 'lb' ? kg * 2.20462 : kg;
    return converted.toFixed(1);
  };

  // Prepare chart data
  const chartData: TrendData[] = trends
    .slice(0, 30)
    .reverse()
    .map(trend => ({
      date: format(new Date(trend.calculation_date), 'MMM dd'),
      weight: trend.weight_7day_ema || 0,
      ema: trend.weight_7day_ema || 0
    }));

  // Get trend icon and color
  const getTrendInfo = (trend: string, change: number) => {
    if (trend === 'losing' || change < -0.1) {
      return { icon: TrendingDown, color: 'text-success', label: 'Losing' };
    } else if (trend === 'gaining' || change > 0.1) {
      return { icon: TrendingUp, color: 'text-warning', label: 'Gaining' };
    }
    return { icon: Activity, color: 'text-info', label: 'Stable' };
  };

  const trendInfo = getTrendInfo(stats.trend, stats.weeklyChange);
  const activeGoal = goals.find(g => g.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded mb-4 w-32"></div>
            <div className="h-4 bg-surface rounded mb-8 w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface rounded-xl p-6">
                  <div className="h-4 bg-surface-2 rounded mb-2 w-24"></div>
                  <div className="h-8 bg-surface-2 rounded mb-2 w-16"></div>
                  <div className="h-3 bg-surface-2 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Weight</h1>
            <p className="text-text-secondary text-lg">{today}</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center px-6 py-3 bg-info text-white rounded-xl hover:bg-info/90 transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Weight
          </button>
        </div>

        {/* Quick Add Weight */}
        {isAdding && (
          <div className="bg-surface border border-border rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Add Today's Weight</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-text-primary text-2xl font-semibold text-center focus:outline-none focus:ring-2 focus:ring-focus"
                  step="0.1"
                  autoFocus
                />
              </div>
              <div className="flex bg-surface-2 border border-border rounded-xl">
                <button
                  onClick={() => setUnit('kg')}
                  className={`px-4 py-3 rounded-l-xl transition-colors ${
                    unit === 'kg' ? 'bg-info text-white' : 'text-text-primary hover:bg-surface-3'
                  }`}
                >
                  kg
                </button>
                <button
                  onClick={() => setUnit('lb')}
                  className={`px-4 py-3 rounded-r-xl transition-colors ${
                    unit === 'lb' ? 'bg-info text-white' : 'text-text-primary hover:bg-surface-3'
                  }`}
                >
                  lb
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={!weight || parseFloat(weight) <= 0 || saving}
                className="px-6 py-3 bg-success text-white rounded-xl hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save'
                )}
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="p-3 text-text-muted hover:text-text-primary transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-info" />
              <h3 className="font-semibold text-text-secondary">Current</h3>
            </div>
            <div className="text-3xl font-bold">
              {convertWeight(stats.current)} <span className="text-lg text-text-muted">{unit}</span>
            </div>
            <div className="text-text-muted text-sm">
              {stats.current ? format(new Date(measurements[0]?.measurement_date || new Date()), 'MMM dd') : 'No weight logged yet'}
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-success" />
              <h3 className="font-semibold text-text-secondary">7-Day EMA</h3>
            </div>
            <div className="text-3xl font-bold">
              {convertWeight(stats.sevenDayEma)} <span className="text-lg text-text-muted">{unit}</span>
            </div>
            <div className="text-text-muted text-sm">
              {stats.sevenDayEma ? 'Smoothed trend' : 'Need more data'}
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <trendInfo.icon className={`w-6 h-6 ${trendInfo.color}`} />
              <h3 className="font-semibold text-text-secondary">Weekly</h3>
            </div>
            <div className="text-3xl font-bold">
              {stats.weeklyChange !== 0 ? (
                <span className={stats.weeklyChange > 0 ? 'text-warning' : 'text-success'}>
                  {stats.weeklyChange > 0 ? '+' : ''}{convertWeight(Math.abs(stats.weeklyChange))} <span className="text-lg text-text-muted">{unit}</span>
                </span>
              ) : (
                <span className="text-text-muted">--</span>
              )}
            </div>
            <div className="text-text-muted text-sm">{trendInfo.label}</div>
          </div>

          {activeGoal && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-navy" />
                <h3 className="font-semibold text-text-secondary">Goal</h3>
              </div>
              <div className="text-3xl font-bold">
                {convertWeight(activeGoal.target_weight_kg)} <span className="text-lg text-text-muted">{unit}</span>
              </div>
              <div className="text-text-muted text-sm">
                {activeGoal.target_date ? format(new Date(activeGoal.target_date), 'MMM dd') : 'No deadline'}
              </div>
            </div>
          )}
        </div>

        {/* Weight Chart */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Weight Trend</h2>
            {chartData.length > 0 && (
              <div className="text-text-muted text-sm">
                Last 30 days • 7-day EMA smoothing
              </div>
            )}
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#8B9096" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#8B9096" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin - 2', 'dataMax + 2']}
                      tickFormatter={(value) => `${value.toFixed(1)} ${unit === 'lb' ? 'lb' : 'kg'}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1A1A', 
                        border: '1px solid #2A2A2A', 
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      formatter={(value: number) => [`${convertWeight(value)} ${unit}`, 'Weight (EMA)']}
                      labelStyle={{ color: '#C7CBD1' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ema" 
                      stroke="#0B2A4A" 
                      strokeWidth={3}
                      dot={{ fill: '#0B2A4A', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#0B2A4A', strokeWidth: 2, fill: '#FFFFFF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-surface-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
                <Activity className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-secondary mb-2">
                  Start tracking to see your progress
                </h3>
                <p className="text-text-muted mb-6">
                  Log your weight regularly to see trends and progress over time
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center px-6 py-3 bg-info text-white rounded-xl hover:bg-info/90 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Weight
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Weight History */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Recent Entries</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            {measurements.length > 0 ? (
              <div className="space-y-4">
                {measurements.slice(0, 10).map((measurement, index) => {
                  const prevMeasurement = measurements[index + 1];
                  const change = prevMeasurement ? measurement.weight_kg! - prevMeasurement.weight_kg! : 0;
                  
                  return (
                    <div key={measurement.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-info rounded-full"></div>
                        <div>
                          <div className="font-medium">
                            {convertWeight(measurement.weight_kg)} {unit}
                          </div>
                          <div className="text-text-muted text-sm">
                            {format(new Date(measurement.measurement_date), 'EEEE, MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {Math.abs(change) > 0.1 && (
                          <div className={`text-sm ${
                            change > 0 ? 'text-warning' : 'text-success'
                          }`}>
                            {change > 0 ? '+' : ''}{convertWeight(change)} {unit}
                          </div>
                        )}
                        {measurement.notes && (
                          <div className="text-text-muted text-xs mt-1">
                            {measurement.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No weight entries yet</p>
                <p className="text-text-muted text-sm mt-1">
                  Your weight logs will appear here
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
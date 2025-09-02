"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, Plus, TrendingDown, TrendingUp, Target, Calendar, 
  Scale, Zap, Droplets, Bone, Clock, Ruler, Camera, Edit3, Save, X 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { BodyMeasurement, BodyTrend, BodyGoal } from '@/lib/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BodyGoalManager from '@/components/body/BodyGoalManager';

interface TrendData {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
}

interface BodyStats {
  weight: { current: number | null; ema: number | null; change: number };
  bodyFat: { current: number | null; ema: number | null; change: number };
  muscleMass: { current: number | null; ema: number | null; change: number };
  trend: 'gaining' | 'losing' | 'stable';
}

export default function BodyMetricsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [trends, setTrends] = useState<BodyTrend[]>([]);
  const [goals, setGoals] = useState<BodyGoal[]>([]);
  const [stats, setStats] = useState<BodyStats>({
    weight: { current: null, ema: null, change: 0 },
    bodyFat: { current: null, ema: null, change: 0 },
    muscleMass: { current: null, ema: null, change: 0 },
    trend: 'stable'
  });
  
  // Form state for adding measurements
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    weight_kg: '',
    body_fat_percentage: '',
    muscle_mass_kg: '',
    visceral_fat_level: '',
    water_percentage: '',
    bone_mass_kg: '',
    metabolic_age: '',
    waist_cm: '',
    chest_cm: '',
    arm_cm: '',
    thigh_cm: '',
    hip_cm: '',
    neck_cm: '',
    notes: ''
  });

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
        const latest = measurementsData.measurements[0];
        if (latest) {
          setStats(prev => ({
            ...prev,
            weight: { ...prev.weight, current: latest.weight_kg },
            bodyFat: { ...prev.bodyFat, current: latest.body_fat_percentage },
            muscleMass: { ...prev.muscleMass, current: latest.muscle_mass_kg }
          }));
        }
      }
      
      if (trendsData.trends) {
        setTrends(trendsData.trends);
        if (trendsData.summary) {
          setStats(prev => ({
            ...prev,
            weight: { ...prev.weight, ema: trendsData.summary.current_weight_ema, change: trendsData.summary.weekly_change },
            trend: trendsData.summary.trend_direction
          }));
        }
      }
      
      if (goalsData.goals) {
        setGoals(goalsData.goals);
      }
    } catch (error) {
      console.error('Error fetching body metrics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    
    // Validate at least one measurement is provided
    const hasValidMeasurement = Object.entries(formData).some(([key, value]) => 
      key !== 'notes' && value && parseFloat(value) > 0
    );
    
    if (!hasValidMeasurement) {
      alert('Please enter at least one measurement');
      return;
    }
    
    try {
      setSaving(true);
      
      // Convert form data to API format
      const measurementData = {
        measurement_date: new Date().toISOString().split('T')[0],
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        muscle_mass_kg: formData.muscle_mass_kg ? parseFloat(formData.muscle_mass_kg) : null,
        visceral_fat_level: formData.visceral_fat_level ? parseFloat(formData.visceral_fat_level) : null,
        water_percentage: formData.water_percentage ? parseFloat(formData.water_percentage) : null,
        bone_mass_kg: formData.bone_mass_kg ? parseFloat(formData.bone_mass_kg) : null,
        metabolic_age: formData.metabolic_age ? parseInt(formData.metabolic_age) : null,
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
        arm_cm: formData.arm_cm ? parseFloat(formData.arm_cm) : null,
        thigh_cm: formData.thigh_cm ? parseFloat(formData.thigh_cm) : null,
        hip_cm: formData.hip_cm ? parseFloat(formData.hip_cm) : null,
        neck_cm: formData.neck_cm ? parseFloat(formData.neck_cm) : null,
        notes: formData.notes.trim() || null
      };

      const response = await fetch('/api/body-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurementData)
      });

      if (response.ok) {
        // Reset form and close dialog
        setFormData({
          weight_kg: '', body_fat_percentage: '', muscle_mass_kg: '', visceral_fat_level: '',
          water_percentage: '', bone_mass_kg: '', metabolic_age: '', waist_cm: '',
          chest_cm: '', arm_cm: '', thigh_cm: '', hip_cm: '', neck_cm: '', notes: ''
        });
        setIsAdding(false);
        // Refresh data to show the new entry
        await fetchData();
      } else {
        console.error('Failed to save measurements');
        alert('Failed to save measurements. Please try again.');
      }
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('Error saving measurements. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Prepare chart data
  const chartData: TrendData[] = trends
    .slice(0, 30)
    .reverse()
    .map(trend => ({
      date: format(new Date(trend.calculation_date), 'MMM dd'),
      weight: trend.weight_7day_ema || 0,
      bodyFat: trend.body_fat_7day_ema || 0,
      muscleMass: trend.muscle_mass_7day_ema || 0
    }));

  // Get trend info
  const getTrendInfo = (trend: string, change: number) => {
    if (trend === 'losing' || change < -0.1) {
      return { icon: TrendingDown, color: 'text-success', label: 'Losing' };
    } else if (trend === 'gaining' || change > 0.1) {
      return { icon: TrendingUp, color: 'text-warning', label: 'Gaining' };
    }
    return { icon: Activity, color: 'text-info', label: 'Stable' };
  };

  const trendInfo = getTrendInfo(stats.trend, stats.weight.change);
  const activeGoal = goals.find(g => g.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-surface rounded mb-4 w-48"></div>
            <div className="h-4 bg-surface rounded mb-8 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Body Metrics</h1>
            <p className="text-text-secondary text-lg">{today}</p>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center px-6 py-3 bg-info text-white rounded-xl hover:bg-info/90 transition-colors focus:outline-none focus:ring-2 focus:ring-focus">
                <Plus className="w-5 h-5 mr-2" />
                Add Measurements
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Body Measurements</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Primary Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Primary Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                        placeholder="75.5"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Body Fat (%)</label>
                      <input
                        type="number"
                        value={formData.body_fat_percentage}
                        onChange={(e) => setFormData({...formData, body_fat_percentage: e.target.value})}
                        placeholder="15.5"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.1"
                        min="0"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Muscle Mass (kg)</label>
                      <input
                        type="number"
                        value={formData.muscle_mass_kg}
                        onChange={(e) => setFormData({...formData, muscle_mass_kg: e.target.value})}
                        placeholder="45.2"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Composition */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Body Composition
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Visceral Fat Level</label>
                      <input
                        type="number"
                        value={formData.visceral_fat_level}
                        onChange={(e) => setFormData({...formData, visceral_fat_level: e.target.value})}
                        placeholder="8"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Water (%)</label>
                      <input
                        type="number"
                        value={formData.water_percentage}
                        onChange={(e) => setFormData({...formData, water_percentage: e.target.value})}
                        placeholder="60.5"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.1"
                        min="30"
                        max="80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bone Mass (kg)</label>
                      <input
                        type="number"
                        value={formData.bone_mass_kg}
                        onChange={(e) => setFormData({...formData, bone_mass_kg: e.target.value})}
                        placeholder="3.2"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Body Measurements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Body Measurements (cm)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Waist</label>
                      <input
                        type="number"
                        value={formData.waist_cm}
                        onChange={(e) => setFormData({...formData, waist_cm: e.target.value})}
                        placeholder="80"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Chest</label>
                      <input
                        type="number"
                        value={formData.chest_cm}
                        onChange={(e) => setFormData({...formData, chest_cm: e.target.value})}
                        placeholder="100"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Arm</label>
                      <input
                        type="number"
                        value={formData.arm_cm}
                        onChange={(e) => setFormData({...formData, arm_cm: e.target.value})}
                        placeholder="35"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Thigh</label>
                      <input
                        type="number"
                        value={formData.thigh_cm}
                        onChange={(e) => setFormData({...formData, thigh_cm: e.target.value})}
                        placeholder="55"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hip</label>
                      <input
                        type="number"
                        value={formData.hip_cm}
                        onChange={(e) => setFormData({...formData, hip_cm: e.target.value})}
                        placeholder="95"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Neck</label>
                      <input
                        type="number"
                        value={formData.neck_cm}
                        onChange={(e) => setFormData({...formData, neck_cm: e.target.value})}
                        placeholder="38"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        step="0.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Metabolic Age</label>
                      <input
                        type="number"
                        value={formData.metabolic_age}
                        onChange={(e) => setFormData({...formData, metabolic_age: e.target.value})}
                        placeholder="25"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                        min="15"
                        max="80"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any additional notes about your measurements..."
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-2 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Measurements
                      </>
                    )}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="w-6 h-6 text-info" />
              <h3 className="font-semibold text-text-secondary">Weight</h3>
            </div>
            <div className="text-3xl font-bold">
              {stats.weight.current ? `${stats.weight.current.toFixed(1)} kg` : '--'}
            </div>
            <div className="text-text-muted text-sm">
              EMA: {stats.weight.ema ? `${stats.weight.ema.toFixed(1)} kg` : 'Need more data'}
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6 text-warning" />
              <h3 className="font-semibold text-text-secondary">Body Fat</h3>
            </div>
            <div className="text-3xl font-bold">
              {stats.bodyFat.current ? `${stats.bodyFat.current.toFixed(1)}%` : '--'}
            </div>
            <div className="text-text-muted text-sm">
              EMA: {stats.bodyFat.ema ? `${stats.bodyFat.ema.toFixed(1)}%` : 'Need more data'}
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-success" />
              <h3 className="font-semibold text-text-secondary">Muscle Mass</h3>
            </div>
            <div className="text-3xl font-bold">
              {stats.muscleMass.current ? `${stats.muscleMass.current.toFixed(1)} kg` : '--'}
            </div>
            <div className="text-text-muted text-sm">
              EMA: {stats.muscleMass.ema ? `${stats.muscleMass.ema.toFixed(1)} kg` : 'Need more data'}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <trendInfo.icon className={`w-6 h-6 ${trendInfo.color}`} />
              <h3 className="font-semibold text-text-secondary">Trend</h3>
            </div>
            <div className="text-3xl font-bold">
              {stats.weight.change !== 0 ? (
                <span className={stats.weight.change > 0 ? 'text-warning' : 'text-success'}>
                  {stats.weight.change > 0 ? '+' : ''}{Math.abs(stats.weight.change).toFixed(1)} kg/wk
                </span>
              ) : (
                <span className="text-text-muted">--</span>
              )}
            </div>
            <div className="text-text-muted text-sm">{trendInfo.label}</div>
          </div>
        </div>

        {/* Charts */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Body Composition Trends</h2>
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
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1A1A1A', 
                        border: '1px solid #2A2A2A', 
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      labelStyle={{ color: '#C7CBD1' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#0B2A4A" 
                      strokeWidth={3}
                      dot={{ fill: '#0B2A4A', strokeWidth: 2, r: 4 }}
                      name="Weight (kg)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="#D97706" 
                      strokeWidth={2}
                      dot={{ fill: '#D97706', strokeWidth: 2, r: 3 }}
                      name="Body Fat (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="muscleMass" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                      name="Muscle Mass (kg)"
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
                  Log your body measurements regularly to see trends and composition changes over time
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center px-6 py-3 bg-info text-white rounded-xl hover:bg-info/90 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Measurement
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Goals Section */}
        <section className="mb-8">
          <BodyGoalManager 
            currentWeight={stats.weight.current}
            currentBodyFat={stats.bodyFat.current}
            currentMuscleMass={stats.muscleMass.current}
            onGoalChange={fetchData}
          />
        </section>

        {/* Recent Measurements */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Recent Measurements</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            {measurements.length > 0 ? (
              <div className="space-y-4">
                {measurements.slice(0, 10).map((measurement, index) => (
                  <div key={measurement.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-info rounded-full"></div>
                      <div>
                        <div className="font-medium">
                          {format(new Date(measurement.measurement_date), 'EEEE, MMM dd, yyyy')}
                        </div>
                        <div className="text-text-muted text-sm flex gap-4">
                          {measurement.weight_kg && <span>Weight: {measurement.weight_kg.toFixed(1)} kg</span>}
                          {measurement.body_fat_percentage && <span>BF: {measurement.body_fat_percentage.toFixed(1)}%</span>}
                          {measurement.muscle_mass_kg && <span>Muscle: {measurement.muscle_mass_kg.toFixed(1)} kg</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {measurement.notes && (
                        <div className="text-text-muted text-xs">
                          {measurement.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No measurements yet</p>
                <p className="text-text-muted text-sm mt-1">
                  Your body composition logs will appear here
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
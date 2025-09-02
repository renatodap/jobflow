"use client";

import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, TrendingDown, TrendingUp, Save, X, Edit3 } from 'lucide-react';
import { format, addWeeks, differenceInDays } from 'date-fns';
import type { BodyGoal } from '@/lib/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BodyGoalManagerProps {
  currentWeight?: number | null;
  currentBodyFat?: number | null;
  currentMuscleMass?: number | null;
  onGoalChange?: () => void;
}

const GOAL_TYPES = [
  { value: 'weight_loss', label: 'Weight Loss', icon: TrendingDown, color: 'text-success' },
  { value: 'weight_gain', label: 'Weight Gain', icon: TrendingUp, color: 'text-warning' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: TrendingUp, color: 'text-info' },
  { value: 'fat_loss', label: 'Fat Loss', icon: TrendingDown, color: 'text-success' },
  { value: 'maintenance', label: 'Maintenance', icon: Target, color: 'text-navy' },
] as const;

export default function BodyGoalManager({ 
  currentWeight, 
  currentBodyFat, 
  currentMuscleMass,
  onGoalChange 
}: BodyGoalManagerProps) {
  const [goals, setGoals] = useState<BodyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<BodyGoal | null>(null);
  
  const [formData, setFormData] = useState({
    goal_type: 'weight_loss' as 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'fat_loss' | 'maintenance',
    target_weight_kg: '',
    target_body_fat_percentage: '',
    target_muscle_mass_kg: '',
    target_date: '',
    weekly_rate_kg: '',
    starting_weight_kg: currentWeight?.toString() || '',
    starting_body_fat_percentage: currentBodyFat?.toString() || '',
    starting_muscle_mass_kg: currentMuscleMass?.toString() || ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    // Update starting values when current measurements change
    setFormData(prev => ({
      ...prev,
      starting_weight_kg: currentWeight?.toString() || '',
      starting_body_fat_percentage: currentBodyFat?.toString() || '',
      starting_muscle_mass_kg: currentMuscleMass?.toString() || ''
    }));
  }, [currentWeight, currentBodyFat, currentMuscleMass]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/body-goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      goal_type: 'weight_loss',
      target_weight_kg: '',
      target_body_fat_percentage: '',
      target_muscle_mass_kg: '',
      target_date: '',
      weekly_rate_kg: '',
      starting_weight_kg: currentWeight?.toString() || '',
      starting_body_fat_percentage: currentBodyFat?.toString() || '',
      starting_muscle_mass_kg: currentMuscleMass?.toString() || ''
    });
  };

  const openEditGoal = (goal: BodyGoal) => {
    setFormData({
      goal_type: goal.goal_type as 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'fat_loss' | 'maintenance',
      target_weight_kg: goal.target_weight_kg?.toString() || '',
      target_body_fat_percentage: goal.target_body_fat_percentage?.toString() || '',
      target_muscle_mass_kg: goal.target_muscle_mass_kg?.toString() || '',
      target_date: goal.target_date || '',
      weekly_rate_kg: goal.weekly_rate_kg?.toString() || '',
      starting_weight_kg: goal.starting_weight_kg?.toString() || '',
      starting_body_fat_percentage: goal.starting_body_fat_percentage?.toString() || '',
      starting_muscle_mass_kg: goal.starting_muscle_mass_kg?.toString() || ''
    });
    setEditingGoal(goal);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (saving) return;

    // Validate required fields
    const hasTarget = formData.target_weight_kg || formData.target_body_fat_percentage || formData.target_muscle_mass_kg;
    if (!hasTarget) {
      alert('Please set at least one target value');
      return;
    }

    try {
      setSaving(true);

      const goalData = {
        goal_type: formData.goal_type,
        target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
        target_body_fat_percentage: formData.target_body_fat_percentage ? parseFloat(formData.target_body_fat_percentage) : null,
        target_muscle_mass_kg: formData.target_muscle_mass_kg ? parseFloat(formData.target_muscle_mass_kg) : null,
        target_date: formData.target_date || null,
        weekly_rate_kg: formData.weekly_rate_kg ? parseFloat(formData.weekly_rate_kg) : null,
        starting_weight_kg: formData.starting_weight_kg ? parseFloat(formData.starting_weight_kg) : null,
        starting_body_fat_percentage: formData.starting_body_fat_percentage ? parseFloat(formData.starting_body_fat_percentage) : null,
        starting_muscle_mass_kg: formData.starting_muscle_mass_kg ? parseFloat(formData.starting_muscle_mass_kg) : null
      };

      const response = await fetch('/api/body-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });

      if (response.ok) {
        resetForm();
        setIsAdding(false);
        setEditingGoal(null);
        await fetchGoals();
        onGoalChange?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save goal');
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error saving goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = (goal: BodyGoal) => {
    if (!goal.target_weight_kg || !goal.starting_weight_kg || !currentWeight) {
      return { progress: 0, remaining: 0, onTrack: true };
    }

    const totalChange = goal.target_weight_kg - goal.starting_weight_kg;
    const currentChange = currentWeight - goal.starting_weight_kg;
    const progress = totalChange !== 0 ? (currentChange / totalChange) * 100 : 0;
    const remaining = goal.target_weight_kg - currentWeight;

    // Check if on track based on target date and weekly rate
    let onTrack = true;
    if (goal.target_date && goal.weekly_rate_kg) {
      const daysElapsed = differenceInDays(new Date(), new Date(goal.created_at));
      const weeksElapsed = daysElapsed / 7;
      const expectedChange = weeksElapsed * goal.weekly_rate_kg;
      const actualChange = Math.abs(currentChange);
      onTrack = actualChange >= expectedChange * 0.8; // 80% tolerance
    }

    return { 
      progress: Math.min(100, Math.max(0, progress)),
      remaining,
      onTrack
    };
  };

  const activeGoals = goals.filter(g => g.is_active);
  const completedGoals = goals.filter(g => g.completed_at);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-surface-2 rounded mb-4 w-32"></div>
          <div className="space-y-3">
            <div className="h-20 bg-surface-2 rounded"></div>
            <div className="h-20 bg-surface-2 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-6 h-6 text-navy" />
          Body Goals
        </h3>
        <Dialog open={isAdding} onOpenChange={(open) => {
          setIsAdding(open);
          if (!open) {
            setEditingGoal(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Set Goal
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium mb-3">Goal Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {GOAL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({...formData, goal_type: type.value})}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        formData.goal_type === type.value
                          ? 'border-navy bg-navy/10 text-navy'
                          : 'border-border hover:border-navy/50'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 ${type.color}`} />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Values */}
              <div>
                <label className="block text-sm font-medium mb-3">Target Values</label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.target_weight_kg}
                      onChange={(e) => setFormData({...formData, target_weight_kg: e.target.value})}
                      placeholder="75.0"
                      className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Body Fat (%)</label>
                    <input
                      type="number"
                      value={formData.target_body_fat_percentage}
                      onChange={(e) => setFormData({...formData, target_body_fat_percentage: e.target.value})}
                      placeholder="15.0"
                      className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                      step="0.1"
                      min="5"
                      max="40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Muscle Mass (kg)</label>
                    <input
                      type="number"
                      value={formData.target_muscle_mass_kg}
                      onChange={(e) => setFormData({...formData, target_muscle_mass_kg: e.target.value})}
                      placeholder="45.0"
                      className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Date</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weekly Rate (kg)</label>
                  <input
                    type="number"
                    value={formData.weekly_rate_kg}
                    onChange={(e) => setFormData({...formData, weekly_rate_kg: e.target.value})}
                    placeholder="0.5"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus"
                    step="0.1"
                    min="0.1"
                    max="2.0"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingGoal ? 'Update Goal' : 'Create Goal'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 ? (
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const goalType = GOAL_TYPES.find(t => t.value === goal.goal_type);
            const progress = calculateProgress(goal);
            
            return (
              <div key={goal.id} className="bg-surface-2 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {goalType && <goalType.icon className={`w-5 h-5 ${goalType.color}`} />}
                    <span className="font-medium">{goalType?.label}</span>
                    {!progress.onTrack && (
                      <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">
                        Behind Schedule
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openEditGoal(goal)}
                    className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {goal.target_weight_kg && (
                    <div className="flex justify-between text-sm">
                      <span>Weight Target:</span>
                      <span>{goal.target_weight_kg.toFixed(1)} kg</span>
                    </div>
                  )}
                  {goal.target_body_fat_percentage && (
                    <div className="flex justify-between text-sm">
                      <span>Body Fat Target:</span>
                      <span>{goal.target_body_fat_percentage.toFixed(1)}%</span>
                    </div>
                  )}
                  {goal.target_muscle_mass_kg && (
                    <div className="flex justify-between text-sm">
                      <span>Muscle Mass Target:</span>
                      <span>{goal.target_muscle_mass_kg.toFixed(1)} kg</span>
                    </div>
                  )}
                  {goal.target_date && (
                    <div className="flex justify-between text-sm">
                      <span>Target Date:</span>
                      <span>{format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>

                {goal.target_weight_kg && currentWeight && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{progress.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2">
                      <div 
                        className="bg-navy h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progress.progress)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {Math.abs(progress.remaining).toFixed(1)} kg {progress.remaining > 0 ? 'to go' : 'over target'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-2">No active goals</p>
          <p className="text-text-muted text-sm">Set a goal to track your progress</p>
        </div>
      )}
    </div>
  );
}
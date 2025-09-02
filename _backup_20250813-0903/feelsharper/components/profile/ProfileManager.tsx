"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Settings, 
  Target, 
  Scale,
  Ruler,
  Globe,
  Bell,
  Moon,
  Sun,
  Monitor,
  Save,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  locale: string;
  units_weight: 'kg' | 'lb';
  units_distance: 'km' | 'mi';
  goal_type: string | null;
  experience: string | null;
  constraints_json: any;
}

interface UserSettings {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    workout_reminders: boolean;
    meal_reminders: boolean;
    progress_updates: boolean;
  };
}

interface Goal {
  id?: string;
  type: string;
  target_value?: number;
  target_date?: string;
  metrics: any;
}

const GOAL_TYPES = [
  { id: 'weight_loss', label: 'Weight Loss', description: 'Lose body fat and reach target weight' },
  { id: 'muscle_gain', label: 'Muscle Gain', description: 'Build muscle mass and strength' },
  { id: 'endurance', label: 'Endurance', description: 'Improve cardiovascular fitness' },
  { id: 'general_health', label: 'General Health', description: 'Overall wellness and vitality' },
  { id: 'sport_specific', label: 'Sport Performance', description: 'Train for specific sports' },
  { id: 'marathon', label: 'Marathon Training', description: 'Prepare for long-distance running' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to fitness or getting back into it' },
  { id: 'intermediate', label: 'Intermediate', description: 'Regular exercise routine, some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced athlete or fitness enthusiast' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
];

export default function ProfileManager() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'goals' | 'preferences' | 'notifications'>('profile');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Load profile, settings, and goals in parallel
      const [profileResult, settingsResult, goalsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('settings').select('*').eq('user_id', user.id).single(),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (settingsResult.data) {
        setSettings(settingsResult.data);
      } else {
        // Create default settings if none exist
        const defaultSettings: UserSettings = {
          user_id: user.id,
          theme: 'system',
          notifications: {
            email: true,
            push: false,
            workout_reminders: true,
            meal_reminders: true,
            progress_updates: true,
          }
        };
        setSettings(defaultSettings);
      }

      if (goalsResult.data) {
        setGoals(goalsResult.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          locale: profile.locale,
          units_weight: profile.units_weight,
          units_distance: profile.units_distance,
          goal_type: profile.goal_type,
          experience: profile.experience,
          constraints_json: profile.constraints_json,
        });

      if (error) throw error;

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ profile: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    setErrors({});

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('settings')
        .upsert(settings);

      if (error) throw error;

      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrors({ settings: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const saveGoal = async (goal: Goal) => {
    setSaving(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const goalData = {
        user_id: user.id,
        type: goal.type,
        target_value: goal.target_value,
        target_date: goal.target_date,
        metrics: goal.metrics,
      };

      if (goal.id) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', goal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goals')
          .insert(goalData);

        if (error) throw error;
      }

      await loadUserData();
      alert('Goal saved successfully!');
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrors({ goals: 'Failed to save goal. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateSettings = (field: keyof UserSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => prev ? {
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Profile & Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account, preferences, and goals
          </p>
        </header>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors",
                activeTab === id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Personal Information
              </h3>

              {errors.profile && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-600 text-sm">{errors.profile}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Language
                  </Label>
                  <select
                    value={profile?.locale || 'en'}
                    onChange={(e) => updateProfile('locale', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Experience Level
                  </Label>
                  <select
                    value={profile?.experience || ''}
                    onChange={(e) => updateProfile('experience', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select experience level</option>
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {/* Weight Units */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Weight Units
                  </Label>
                  <RadioGroup
                    value={profile?.units_weight || 'kg'}
                    onValueChange={(value) => updateProfile('units_weight', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="kg" id="kg" />
                      <Label htmlFor="kg">Kilograms (kg)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lb" id="lb" />
                      <Label htmlFor="lb">Pounds (lb)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Distance Units */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Distance Units
                  </Label>
                  <RadioGroup
                    value={profile?.units_distance || 'km'}
                    onValueChange={(value) => updateProfile('units_distance', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="km" id="km" />
                      <Label htmlFor="km">Kilometers (km)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mi" id="mi" />
                      <Label htmlFor="mi">Miles (mi)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Your Goals
              </h3>

              {errors.goals && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-600 text-sm">{errors.goals}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Primary Goal */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Primary Goal
                  </Label>
                  <select
                    value={profile?.goal_type || ''}
                    onChange={(e) => updateProfile('goal_type', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select your main goal</option>
                    {GOAL_TYPES.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.label}</option>
                    ))}
                  </select>
                </div>

                {/* Current Goals */}
                {goals.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Active Goals
                    </Label>
                    <div className="space-y-3">
                      {goals.map((goal) => (
                        <div key={goal.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {GOAL_TYPES.find(t => t.id === goal.type)?.label || goal.type}
                              </p>
                              {goal.target_value && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Target: {goal.target_value} {profile?.units_weight || 'kg'}
                                </p>
                              )}
                              {goal.target_date && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  By: {new Date(goal.target_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Goals'}</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                App Preferences
              </h3>

              {errors.settings && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-600 text-sm">{errors.settings}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                    Theme
                  </Label>
                  <RadioGroup
                    value={settings?.theme || 'system'}
                    onValueChange={(value) => updateSettings('theme', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <RadioGroupItem value="light" id="light" />
                      <Sun className="w-5 h-5 text-amber-500" />
                      <div>
                        <Label htmlFor="light" className="font-medium cursor-pointer">Light</Label>
                        <p className="text-sm text-slate-500">Always use light theme</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <RadioGroupItem value="dark" id="dark" />
                      <Moon className="w-5 h-5 text-slate-600" />
                      <div>
                        <Label htmlFor="dark" className="font-medium cursor-pointer">Dark</Label>
                        <p className="text-sm text-slate-500">Always use dark theme</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <RadioGroupItem value="system" id="system" />
                      <Monitor className="w-5 h-5 text-slate-500" />
                      <div>
                        <Label htmlFor="system" className="font-medium cursor-pointer">System</Label>
                        <p className="text-sm text-slate-500">Follow system preference</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Notification Settings
              </h3>

              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                  { key: 'workout_reminders', label: 'Workout Reminders', description: 'Remind me to work out' },
                  { key: 'meal_reminders', label: 'Meal Reminders', description: 'Remind me to log meals' },
                  { key: 'progress_updates', label: 'Progress Updates', description: 'Weekly progress summaries' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <Label className="font-medium text-slate-900 dark:text-slate-100">{label}</Label>
                      <p className="text-sm text-slate-500">{description}</p>
                    </div>
                    <Checkbox
                      checked={settings?.notifications[key as keyof typeof settings.notifications] || false}
                      onCheckedChange={(checked) => updateNotificationSetting(key, checked as boolean)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Notifications'}</span>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

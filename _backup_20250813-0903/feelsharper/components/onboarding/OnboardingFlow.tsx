"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  Dumbbell, 
  Heart, 
  Zap, 
  Sparkles,
  Trophy,
  Flame,
  TrendingUp,
  Activity,
  Users,
  Shield,
  Clock,
  ChevronRight,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

type GoalType = 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_health' | 'sport_specific' | 'marathon';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type UnitWeight = 'kg' | 'lb';
type UnitDistance = 'km' | 'mi';

interface OnboardingData {
  goalType: GoalType | null;
  experience: ExperienceLevel | null;
  unitsWeight: UnitWeight;
  unitsDistance: UnitDistance;
  targetWeight?: number;
  targetDate?: string;
  constraints: {
    injuries: string[];
    timeConstraints: string[];
    equipment: string[];
    dietaryRestrictions: string[];
  };
  dashboardPreferences: {
    showWeight: boolean;
    showWorkouts: boolean;
    showNutrition: boolean;
    showSleep: boolean;
    showProgress: boolean;
  };
}

const goals = [
  { 
    id: 'weight_loss', 
    label: 'Lose Weight', 
    icon: Flame, 
    description: 'Burn fat and feel lighter',
    emoji: '🔥',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    id: 'muscle_gain', 
    label: 'Build Muscle', 
    icon: Dumbbell, 
    description: 'Get stronger and bigger',
    emoji: '💪',
    gradient: 'from-navy-400 to-navy'
  },
  { 
    id: 'endurance', 
    label: 'Boost Endurance', 
    icon: Heart, 
    description: 'Run longer, feel better',
    emoji: '❤️',
    gradient: 'from-pink-500 to-rose-600'
  },
  { 
    id: 'general_health', 
    label: 'Feel Amazing', 
    icon: Sparkles, 
    description: 'Total body transformation',
    emoji: '✨',
    gradient: 'from-navy-400 to-navy-600'
  },
  { 
    id: 'sport_specific', 
    label: 'Athletic Performance', 
    icon: Trophy, 
    description: 'Dominate your sport',
    emoji: '🏆',
    gradient: 'from-yellow-500 to-amber-600'
  },
  { 
    id: 'marathon', 
    label: 'Marathon Ready', 
    icon: TrendingUp, 
    description: 'Conquer 26.2 miles',
    emoji: '🏃',
    gradient: 'from-green-500 to-emerald-600'
  },
] as const;

const experienceLevels = [
  { 
    id: 'beginner', 
    label: 'Just Starting', 
    description: 'New to fitness or getting back into it',
    emoji: '🌱',
    gradient: 'from-green-400 to-green-600'
  },
  { 
    id: 'intermediate', 
    label: 'Getting Stronger', 
    description: 'Regular exercise routine, some experience',
    emoji: '💫',
    gradient: 'from-blue-400 to-blue-600'
  },
  { 
    id: 'advanced', 
    label: 'Elite Athlete', 
    description: 'Experienced and pushing limits',
    emoji: '🚀',
    gradient: 'from-navy to-navy-600'
  },
] as const;

const constraintOptions = {
  injuries: ['Lower back', 'Knee', 'Shoulder', 'Ankle', 'Wrist', 'Hip', 'Neck'],
  timeConstraints: ['Very busy (15-30 min)', 'Moderate time (30-60 min)', 'Flexible schedule (60+ min)'],
  equipment: ['Home gym', 'Commercial gym', 'Bodyweight only', 'Minimal equipment'],
  dietaryRestrictions: ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-free', 'Dairy-free'],
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    goalType: null,
    experience: null,
    unitsWeight: 'kg',
    unitsDistance: 'km',
    constraints: {
      injuries: [],
      timeConstraints: [],
      equipment: [],
      dietaryRestrictions: [],
    },
    dashboardPreferences: {
      showWeight: true,
      showWorkouts: true,
      showNutrition: true,
      showSleep: true,
      showProgress: true,
    },
  });
  
  const [enable2FA, setEnable2FA] = useState(false);

  const steps = [
    { title: 'Welcome to Feel Sharper', subtitle: 'Let\'s personalize your experience' },
    { title: 'What\'s your main goal?', subtitle: 'Choose your primary focus' },
    { title: 'Experience level?', subtitle: 'Help us tailor your programs' },
    { title: 'Units & preferences', subtitle: 'Set your measurement preferences' },
    { title: 'Any constraints?', subtitle: 'Let us know about limitations' },
    { title: 'Customize your dashboard', subtitle: 'Choose what you want to track' },
    { title: 'Security preferences', subtitle: 'Keep your data safe' },
    { title: 'You\'re all set!', subtitle: 'Ready to start your journey' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConstraintToggle = (category: keyof typeof constraintOptions, value: string) => {
    setData(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [category]: prev.constraints[category].includes(value)
          ? prev.constraints[category].filter(item => item !== value)
          : [...prev.constraints[category], value],
      },
    }));
  };

  const handleDashboardToggle = (key: keyof OnboardingData['dashboardPreferences']) => {
    setData(prev => ({
      ...prev,
      dashboardPreferences: {
        ...prev.dashboardPreferences,
        [key]: !prev.dashboardPreferences[key],
      },
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Update profile with all onboarding data
      const profileUpdate = {
        id: user.id,
        goal_type: data.goalType,
        experience_level: data.experience,
        units_weight: data.unitsWeight,
        units_distance: data.unitsDistance,
        target_weight_kg: data.targetWeight,
        target_date: data.targetDate || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileUpdate);

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      // Store dashboard preferences in localStorage for now
      // (we can move this to a settings table later)
      localStorage.setItem('dashboardPreferences', JSON.stringify(data.dashboardPreferences));
      localStorage.setItem('userConstraints', JSON.stringify(data.constraints));
      localStorage.setItem('enable2FA', JSON.stringify(enable2FA));

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.goalType !== null;
      case 2: return data.experience !== null;
      default: return true;
    }
  };

  // Add floating particles animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-render for animation
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-navy-400/10 to-navy/20 opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-navy/10 to-navy-400/20 opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-navy/5 to-navy-400/10 opacity-20 animate-spin-slow"></div>
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8">
        {/* Premium Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium mb-3">
            <span className="text-gray-700">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-navy font-bold">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-navy-400 to-navy-600 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Premium Card with Glass Effect */}
        <div className="relative backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12">
          {/* Animated Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-3 animate-fade-in">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600 text-lg animate-fade-in-delay">
              {steps[currentStep].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-navy-400 to-navy-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce-slow">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-navy-400 to-navy-600 rounded-full opacity-30 blur-xl animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <p className="text-xl font-semibold text-gray-800 max-w-md mx-auto">
                    Welcome to your transformation journey! 🎯
                  </p>
                  <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
                    We'll personalize Feel Sharper just for you. Every question helps us create the perfect plan to help you become the strongest version of yourself.
                  </p>
                  <div className="flex justify-center gap-8 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-navy">10M+</div>
                      <div className="text-sm text-gray-600">Workouts Logged</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-navy">98%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-600">4.9★</div>
                      <div className="text-sm text-gray-600">User Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map(({ id, label, icon: Icon, description, emoji, gradient }) => (
                  <button
                    key={id}
                    onClick={() => setData(prev => ({ ...prev, goalType: id as GoalType }))}
                    className={cn(
                      "group relative p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-105",
                      data.goalType === id
                        ? "bg-gradient-to-br shadow-xl scale-105"
                        : "bg-white border-2 border-gray-200 hover:border-transparent hover:shadow-xl"
                    )}
                    style={{
                      background: data.goalType === id ? '' : undefined,
                      backgroundImage: data.goalType === id ? `linear-gradient(135deg, var(--tw-gradient-stops))` : undefined,
                    }}
                  >
                    {data.goalType === id && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl`}></div>
                    )}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{emoji}</span>
                        {data.goalType === id && (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <h3 className={cn(
                        "font-bold text-lg mb-1",
                        data.goalType === id ? "text-white" : "text-gray-900"
                      )}>
                        {label}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        data.goalType === id ? "text-white/90" : "text-gray-600"
                      )}>
                        {description}
                      </p>
                    </div>
                    {data.goalType !== id && (
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300",
                        gradient
                      )}></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {experienceLevels.map(({ id, label, description, emoji, gradient }) => (
                  <button
                    key={id}
                    onClick={() => setData(prev => ({ ...prev, experience: id as ExperienceLevel }))}
                    className={cn(
                      "w-full p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]",
                      data.experience === id
                        ? "bg-gradient-to-r shadow-xl"
                        : "bg-white border-2 border-gray-200 hover:border-transparent hover:shadow-lg"
                    )}
                    style={{
                      backgroundImage: data.experience === id ? `linear-gradient(135deg, var(--tw-gradient-stops))` : undefined,
                    }}
                  >
                    {data.experience === id && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl`}></div>
                    )}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{emoji}</span>
                        <div>
                          <h3 className={cn(
                            "font-bold text-lg mb-1",
                            data.experience === id ? "text-white" : "text-gray-900"
                          )}>
                            {label}
                          </h3>
                          <p className={cn(
                            "text-sm",
                            data.experience === id ? "text-white/90" : "text-gray-600"
                          )}>
                            {description}
                          </p>
                        </div>
                      </div>
                      {data.experience === id && (
                        <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Weight Units
                    </Label>
                    <RadioGroup
                      value={data.unitsWeight}
                      onValueChange={(value) => setData(prev => ({ ...prev, unitsWeight: value as UnitWeight }))}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="kg" id="kg" />
                        <Label htmlFor="kg">Kilograms</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lb" id="lb" />
                        <Label htmlFor="lb">Pounds</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                      Distance Units
                    </Label>
                    <RadioGroup
                      value={data.unitsDistance}
                      onValueChange={(value) => setData(prev => ({ ...prev, unitsDistance: value as UnitDistance }))}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="km" id="km" />
                        <Label htmlFor="km">Kilometers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mi" id="mi" />
                        <Label htmlFor="mi">Miles</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {(data.goalType === 'weight_loss' || data.goalType === 'muscle_gain') && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="targetWeight" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Target Weight ({data.unitsWeight})
                      </Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        placeholder={`Enter target weight in ${data.unitsWeight}`}
                        value={data.targetWeight || ''}
                        onChange={(e) => setData(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) || undefined }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Target Date (Optional)
                      </Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={data.targetDate || ''}
                        onChange={(e) => setData(prev => ({ ...prev, targetDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                {Object.entries(constraintOptions).map(([category, options]) => (
                  <div key={category}>
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block capitalize">
                      {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${category}-${option}`}
                            checked={data.constraints[category as keyof typeof constraintOptions].includes(option)}
                            onCheckedChange={() => handleConstraintToggle(category as keyof typeof constraintOptions, option)}
                          />
                          <Label htmlFor={`${category}-${option}`} className="text-sm cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Choose which metrics you want to see on your dashboard:
                </p>
                {Object.entries(data.dashboardPreferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <Label htmlFor={key} className="font-medium capitalize cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').replace('show', '').trim()}
                    </Label>
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={() => handleDashboardToggle(key as keyof OnboardingData['dashboardPreferences'])}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Keep Your Data Secure</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Two-factor authentication adds an extra layer of security to your account.
                  </p>
                </div>
                
                <div className="max-w-sm mx-auto">
                  <div className="flex items-center justify-between p-4 bg-surface rounded-xl border">
                    <div>
                      <h4 className="font-semibold text-gray-900">Enable 2FA</h4>
                      <p className="text-sm text-gray-600">Recommended for security</p>
                    </div>
                    <Checkbox
                      checked={enable2FA}
                      onCheckedChange={(checked) => setEnable2FA(!!checked)}
                      className="scale-125"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    You can change this setting later in your profile
                  </p>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce-slow">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full opacity-30 blur-xl animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    You're Ready to Dominate! 🚀
                  </h2>
                  <p className="text-xl text-gray-700 font-medium max-w-md mx-auto">
                    Your personalized command center is ready.
                  </p>
                  <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
                    We've customized everything based on your goals. Your AI coach is ready, your dashboard is configured, and your transformation starts NOW.
                  </p>
                  <div className="bg-surface rounded-2xl p-6 mt-6 max-w-md mx-auto">
                    <h3 className="font-bold text-gray-900 mb-3">What happens next:</h3>
                    <ul className="space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">Access your personalized dashboard</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">Start logging your first workout</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">Get AI-powered insights immediately</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Premium Navigation */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                currentStep === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {isLoading ? 'Setting up your command center...' : 'Launch My Dashboard'}
                </span>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "group relative flex items-center gap-2 px-8 py-4 text-white font-bold rounded-xl transform transition-all duration-200",
                  canProceed()
                    ? "bg-gradient-to-r from-navy-400 to-navy-600 hover:shadow-2xl hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                <span className="relative z-10">Continue</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                {canProceed() && (
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s both;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

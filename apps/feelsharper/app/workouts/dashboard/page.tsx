'use client';

import { useState, useEffect } from 'react';
import { Play, Calendar, TrendingUp, Trophy, Plus, Clock, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { UserProgramWithDetails } from '@/lib/types/database';

export default function WorkoutDashboardPage() {
  const [activeProgram, setActiveProgram] = useState<UserProgramWithDetails | null>(null);
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState({
    completed: 0,
    total: 0,
    currentWeek: 1
  });

  useEffect(() => {
    fetchActiveProgram();
  }, []);

  const fetchActiveProgram = async () => {
    try {
      const response = await fetch('/api/user-programs?active_only=true');
      if (response.ok) {
        const data = await response.json();
        const programs = data.userPrograms || [];
        
        if (programs.length > 0) {
          const program = programs[0];
          setActiveProgram(program);
          setWeeklyProgress({
            completed: 0, // TODO: Calculate from actual workout completions
            total: program.workout_programs?.sessions_per_week || 0,
            currentWeek: program.current_week || 1
          });
          
          // Find today's workout if available
          const todayWorkout = findTodaysWorkout(program);
          setTodaysWorkout(todayWorkout);
        }
      }
    } catch (error) {
      console.error('Error fetching active program:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findTodaysWorkout = (program: UserProgramWithDetails) => {
    if (!program.workout_programs?.workout_templates) return null;
    
    const templates = program.workout_programs.workout_templates;
    const currentWeek = program.current_week || 1;
    const currentDay = program.current_day || 1;
    
    return templates.find(
      template => 
        template.week_number === currentWeek && 
        template.day_number === currentDay
    );
  };

  const handleStartWorkout = (workoutId: string) => {
    window.location.href = `/workouts/session/${workoutId}`;
  };

  const handleAdvanceProgram = async () => {
    if (!activeProgram) return;

    try {
      const program = activeProgram.workout_programs;
      const currentWeek = activeProgram.current_week || 1;
      const currentDay = activeProgram.current_day || 1;
      const sessionsPerWeek = program?.sessions_per_week || 3;
      
      let newWeek = currentWeek;
      let newDay = currentDay + 1;
      
      if (newDay > sessionsPerWeek) {
        newWeek += 1;
        newDay = 1;
      }

      const response = await fetch(`/api/user-programs/${activeProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_week: newWeek,
          current_day: newDay
        }),
      });

      if (response.ok) {
        await fetchActiveProgram(); // Refresh data
      }
    } catch (error) {
      console.error('Error advancing program:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-border rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-6">
                  <div className="h-6 bg-border rounded mb-4"></div>
                  <div className="h-4 bg-border rounded mb-2"></div>
                  <div className="h-4 bg-border rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeProgram) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Workout Dashboard</h1>
          
          <div className="text-center py-16">
            <Target className="w-24 h-24 text-text-muted mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">No Active Program</h3>
            <p className="text-text-secondary mb-8">
              Choose a workout program to start your fitness journey
            </p>
            <Button 
              onClick={() => window.location.href = '/workouts/programs'}
              className="bg-navy hover:bg-navy/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Browse Programs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const program = activeProgram.workout_programs;
  const progressPercentage = program?.duration_weeks 
    ? ((activeProgram.current_week || 1) / program.duration_weeks) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Workout Dashboard</h1>
            <p className="text-text-secondary text-lg">
              {program?.name} • Week {activeProgram.current_week} of {program?.duration_weeks}
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/workouts/programs'}
            variant="outline"
          >
            Browse Programs
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Workout */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Today's Workout</h2>
              {todaysWorkout && (
                <Button 
                  onClick={() => handleStartWorkout(todaysWorkout.id)}
                  className="bg-success hover:bg-success/80"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              )}
            </div>

            {todaysWorkout ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium">{todaysWorkout.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {todaysWorkout.estimated_duration_minutes} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Week {todaysWorkout.week_number}, Day {todaysWorkout.day_number}
                    </div>
                  </div>
                </div>

                {todaysWorkout.description && (
                  <p className="text-text-secondary">{todaysWorkout.description}</p>
                )}

                {/* Exercise Preview */}
                {todaysWorkout.exercises && Array.isArray(todaysWorkout.exercises) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-text-primary">Exercises Preview:</h4>
                    <div className="space-y-2">
                      {todaysWorkout.exercises.slice(0, 3).map((exercise: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-bg border border-border rounded-lg">
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-sm text-text-muted">
                            {exercise.sets && `${exercise.sets} sets`}
                            {exercise.reps && ` × ${exercise.reps}`}
                            {exercise.duration_seconds && `${exercise.duration_seconds}s`}
                            {exercise.duration_minutes && `${exercise.duration_minutes}min`}
                          </span>
                        </div>
                      ))}
                      {todaysWorkout.exercises.length > 3 && (
                        <div className="text-center text-text-muted text-sm">
                          +{todaysWorkout.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No workout scheduled</h3>
                <p className="text-text-secondary mb-4">
                  Take a rest day or choose a different workout
                </p>
                <Button 
                  onClick={handleAdvanceProgram}
                  variant="outline"
                >
                  Mark Day Complete
                </Button>
              </div>
            )}
          </div>

          {/* Progress Card */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Progress
            </h3>

            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Program Progress</span>
                  <span className="text-text-primary font-medium">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Weekly Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">This Week</span>
                  <span className="text-text-primary font-medium">
                    {weeklyProgress.completed}/{weeklyProgress.total}
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-navy h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${weeklyProgress.total > 0 ? (weeklyProgress.completed / weeklyProgress.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {activeProgram.current_week}
                  </div>
                  <div className="text-xs text-text-muted">Current Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {program?.duration_weeks || '∞'}
                  </div>
                  <div className="text-xs text-text-muted">Total Weeks</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Program Info */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Program Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-text-primary mb-2">Goal</h4>
              <p className="text-text-secondary capitalize">
                {program?.goal_type?.replace('_', ' ') || 'General Fitness'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-2">Experience Level</h4>
              <p className="text-text-secondary capitalize">
                {program?.experience_level || 'All Levels'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-2">Sessions per Week</h4>
              <p className="text-text-secondary">
                {program?.sessions_per_week || 'Flexible'}
              </p>
            </div>
          </div>

          {program?.description && (
            <div className="mt-6">
              <h4 className="font-medium text-text-primary mb-2">Description</h4>
              <p className="text-text-secondary">{program.description}</p>
            </div>
          )}

          {program?.equipment_required && program.equipment_required.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-text-primary mb-2">Equipment Required</h4>
              <div className="flex flex-wrap gap-2">
                {program.equipment_required.map((equipment, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-bg border border-border rounded-full text-sm text-text-secondary"
                  >
                    {equipment.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
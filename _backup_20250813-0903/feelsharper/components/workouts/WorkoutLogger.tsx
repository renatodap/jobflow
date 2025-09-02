"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Square,
  Timer,
  Target,
  TrendingUp,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  name: string;
  sets: WorkoutSet[];
}

interface WorkoutSet {
  id: string;
  weight_kg?: number;
  reps?: number;
  rpe?: number;
  completed: boolean;
}

interface WorkoutSession {
  id?: string;
  type: 'strength' | 'cardio';
  started_at: string;
  ended_at?: string;
  exercises: Exercise[];
  notes?: string;
}

interface RestTimer {
  isActive: boolean;
  timeLeft: number;
  duration: number;
}

const COMMON_EXERCISES = [
  // Upper Body
  'Bench Press', 'Incline Bench Press', 'Dumbbell Press', 'Push-ups',
  'Pull-ups', 'Lat Pulldown', 'Barbell Row', 'Dumbbell Row',
  'Overhead Press', 'Lateral Raises', 'Bicep Curls', 'Tricep Dips',
  
  // Lower Body
  'Squat', 'Deadlift', 'Romanian Deadlift', 'Lunges',
  'Leg Press', 'Leg Curls', 'Leg Extensions', 'Calf Raises',
  'Bulgarian Split Squats', 'Hip Thrusts',
  
  // Core
  'Plank', 'Crunches', 'Russian Twists', 'Dead Bug',
  'Mountain Climbers', 'Hanging Knee Raises'
];

export default function WorkoutLogger() {
  const [workout, setWorkout] = useState<WorkoutSession>({
    type: 'strength',
    started_at: new Date().toISOString(),
    exercises: []
  });
  const [currentExercise, setCurrentExercise] = useState('');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [restTimer, setRestTimer] = useState<RestTimer>({
    isActive: false,
    timeLeft: 0,
    duration: 90
  });
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [filteredExercises, setFilteredExercises] = useState(COMMON_EXERCISES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const filtered = COMMON_EXERCISES.filter(exercise =>
      exercise.toLowerCase().includes(exerciseSearch.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [exerciseSearch]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer.isActive && restTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (restTimer.timeLeft === 0 && restTimer.isActive) {
      setRestTimer(prev => ({ ...prev, isActive: false }));
      // Could add notification sound here
    }
    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.timeLeft]);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkout(prev => ({
      ...prev,
      started_at: new Date().toISOString()
    }));
  };

  const endWorkout = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const workoutData = {
        user_id: user.id,
        started_at: workout.started_at,
        ended_at: new Date().toISOString(),
        type: workout.type,
        notes: workout.notes
      };

      const { data: workoutResult, error: workoutError } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Save all sets
      const allSets: any[] = [];
      workout.exercises.forEach((exercise, exerciseIndex) => {
        exercise.sets.forEach((set, setIndex) => {
          if (set.completed) {
            allSets.push({
              workout_id: workoutResult.id,
              set_index: setIndex,
              exercise: exercise.name,
              weight_kg: set.weight_kg,
              reps: set.reps,
              rpe: set.rpe
            });
          }
        });
      });

      if (allSets.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(allSets);

        if (setsError) throw setsError;
      }

      // Reset workout
      setWorkout({
        type: 'strength',
        started_at: new Date().toISOString(),
        exercises: []
      });
      setIsWorkoutActive(false);
      
      alert('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addExercise = (exerciseName: string) => {
    if (!exerciseName.trim()) return;

    const newExercise: Exercise = {
      name: exerciseName,
      sets: [{
        id: Date.now().toString(),
        completed: false
      }]
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
    setCurrentExercise('');
    setExerciseSearch('');
  };

  const addSet = (exerciseIndex: number) => {
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      completed: false
    };

    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    }));
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, eIndex) =>
        eIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    }));
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    updateSet(exerciseIndex, setIndex, 'completed', true);
    
    // Start rest timer
    setRestTimer({
      isActive: true,
      timeLeft: restTimer.duration,
      duration: restTimer.duration
    });
  };

  const deleteExercise = (exerciseIndex: number) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, index) => index !== exerciseIndex)
    }));
  };

  const deleteSet = (exerciseIndex: number, setIndex: number) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, eIndex) =>
        eIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, sIndex) => sIndex !== setIndex)
            }
          : exercise
      )
    }));
  };

  const startRestTimer = (duration: number) => {
    setRestTimer({
      isActive: true,
      timeLeft: duration,
      duration
    });
  };

  const stopRestTimer = () => {
    setRestTimer(prev => ({ ...prev, isActive: false, timeLeft: 0 }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutDuration = () => {
    if (!isWorkoutActive) return '0:00';
    const start = new Date(workout.started_at);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    return formatTime(diffSeconds);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isWorkoutActive ? 'Active Workout' : 'Start Workout'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isWorkoutActive ? `Duration: ${getWorkoutDuration()}` : 'Track your strength training session'}
              </p>
            </div>
            
            {!isWorkoutActive ? (
              <Button onClick={startWorkout} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Start Workout</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={endWorkout}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Finish Workout'}</span>
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Rest Timer */}
        {restTimer.isActive && (
          <Card className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Timer className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Rest Timer</p>
                  <p className="text-2xl font-bold text-amber-600">{formatTime(restTimer.timeLeft)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={stopRestTimer}>
                  <Square className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => startRestTimer(60)}>
                  1m
                </Button>
                <Button variant="outline" size="sm" onClick={() => startRestTimer(90)}>
                  1.5m
                </Button>
                <Button variant="outline" size="sm" onClick={() => startRestTimer(120)}>
                  2m
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Add Exercise */}
        {isWorkoutActive && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add Exercise</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="exercise-search">Search or type exercise name</Label>
                <Input
                  id="exercise-search"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="e.g., Bench Press, Squat, Deadlift..."
                  className="mt-1"
                />
              </div>

              {exerciseSearch && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {filteredExercises.slice(0, 12).map((exercise) => (
                    <Button
                      key={exercise}
                      variant="outline"
                      size="sm"
                      onClick={() => addExercise(exercise)}
                      className="justify-start"
                    >
                      {exercise}
                    </Button>
                  ))}
                  {exerciseSearch && !filteredExercises.some(ex => ex.toLowerCase() === exerciseSearch.toLowerCase()) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addExercise(exerciseSearch)}
                      className="justify-start font-semibold"
                    >
                      + {exerciseSearch}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Exercises */}
        {workout.exercises.length > 0 && (
          <div className="space-y-6">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {exercise.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExercise(exerciseIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Set</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Weight (kg)</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Reps</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">RPE</th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set, setIndex) => (
                        <tr key={set.id} className={cn(
                          "border-b border-slate-100 dark:border-slate-800",
                          set.completed && "bg-green-50 dark:bg-green-900/20"
                        )}>
                          <td className="py-2 px-2">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {setIndex + 1}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              value={set.weight_kg || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight_kg', parseFloat(e.target.value) || undefined)}
                              placeholder="0"
                              className="w-20 h-8 text-sm"
                              disabled={set.completed}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              value={set.reps || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || undefined)}
                              placeholder="0"
                              className="w-20 h-8 text-sm"
                              disabled={set.completed}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              step="0.5"
                              value={set.rpe || ''}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', parseFloat(e.target.value) || undefined)}
                              placeholder="1-10"
                              className="w-20 h-8 text-sm"
                              disabled={set.completed}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center space-x-1">
                              {!set.completed ? (
                                <Button
                                  size="sm"
                                  onClick={() => completeSet(exerciseIndex, setIndex)}
                                  disabled={!set.reps}
                                  className="h-8 px-3 text-xs"
                                >
                                  ✓
                                </Button>
                              ) : (
                                <span className="text-green-600 font-semibold text-sm">Done</span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSet(exerciseIndex, setIndex)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(exerciseIndex)}
                  className="mt-3 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Set</span>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isWorkoutActive && workout.exercises.length === 0 && (
          <Card className="p-12 text-center">
            <Dumbbell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Ready to Train?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start your workout to begin tracking exercises, sets, and reps.
            </p>
            <Button onClick={startWorkout} className="flex items-center space-x-2 mx-auto">
              <Play className="w-4 h-4" />
              <span>Start Workout</span>
            </Button>
          </Card>
        )}

        {/* Workout Notes */}
        {isWorkoutActive && (
          <Card className="mt-6 p-6">
            <Label htmlFor="workout-notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Workout Notes (Optional)
            </Label>
            <textarea
              id="workout-notes"
              value={workout.notes || ''}
              onChange={(e) => setWorkout(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How did the workout feel? Any observations or goals for next time..."
              className="mt-2 w-full h-24 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
          </Card>
        )}
      </div>
    </div>
  );
}

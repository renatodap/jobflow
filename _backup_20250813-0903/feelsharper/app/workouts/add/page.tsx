"use client";

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Dumbbell, Bot, Edit3, Save } from 'lucide-react';
import NaturalLanguageInput from '@/components/workouts/NaturalLanguageInput';
import type { Exercise as DatabaseExercise, WorkoutTypeEnum } from '@/lib/types/database';

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  id: string;
  reps?: number;
  weight?: number;
  distance?: number;
  duration_sec?: number;
  rpe?: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Convert database exercise format to local format
function convertDatabaseExercisesToLocal(dbExercises: DatabaseExercise[]): Exercise[] {
  return dbExercises.map(exercise => ({
    id: generateId(),
    name: exercise.name,
    sets: exercise.sets?.map(set => ({
      id: generateId(),
      reps: set.reps,
      weight: set.weight_kg,
      distance: undefined, // Distance is tracked per exercise, not per set in the new format
      duration_sec: set.duration_seconds,
      rpe: undefined // RPE is not in the new format yet
    })) || []
  }));
}

function AddWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aiMode = searchParams?.get('mode') === 'ai';
  
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutTypeEnum>('strength');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAiMode, setIsAiMode] = useState(aiMode);

  const handleWorkoutParsed = (parsed: { workout_type: WorkoutTypeEnum; exercises: DatabaseExercise[] }) => {
    const localExercises = convertDatabaseExercisesToLocal(parsed.exercises);
    setExercises(localExercises);
    setWorkoutType(parsed.workout_type);
    setIsAiMode(false);
    
    // Generate a title if not set
    if (!workoutTitle && localExercises.length > 0) {
      const exerciseNames = localExercises.map(e => e.name).slice(0, 2);
      setWorkoutTitle(exerciseNames.join(', ') + (localExercises.length > 2 ? ', ...' : ''));
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: generateId(),
      name: '',
      sets: [{
        id: generateId(),
        reps: 0,
        weight: 0
      }]
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, { id: generateId(), reps: 0, weight: 0 }] }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { 
            ...ex, 
            sets: ex.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          }
        : ex
    ));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
        : ex
    ));
  };

  const handleSave = async () => {
    if (exercises.length === 0) return;

    // In real app, save to Supabase here
    console.log('Saving workout:', {
      title: workoutTitle,
      notes: workoutNotes,
      exercises,
      date: new Date().toISOString().split('T')[0]
    });

    router.push('/workouts');
  };

  if (isAiMode) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Natural Language Workout Parser</h1>
              <p className="text-text-secondary">Describe your workout in plain English</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-surface border border-border rounded-xl p-6">
              <NaturalLanguageInput
                onWorkoutParsed={handleWorkoutParsed}
                className="mb-6"
              />
              
              <div className="flex justify-center">
                <button
                  onClick={() => setIsAiMode(false)}
                  className="px-6 py-3 bg-surface-2 border border-border text-text-primary rounded-xl hover:bg-surface-3 transition-colors"
                >
                  Switch to Manual Entry
                </button>
              </div>
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
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Log Workout</h1>
            <p className="text-text-secondary">Track your exercises, sets, and reps</p>
          </div>
          <button
            onClick={() => setIsAiMode(true)}
            className="inline-flex items-center px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-surface-2 transition-colors"
          >
            <Bot className="w-4 h-4 mr-2" />
            Natural Language
          </button>
        </div>

        {/* Workout Details */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Workout Title
              </label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="e.g., Push Day, Leg Day, Cardio"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Workout Type
              </label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value as WorkoutTypeEnum)}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
                <option value="sport">Sport</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Date
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-text-secondary text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How did the workout feel?"
              className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus h-24 resize-none"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6 mb-8">
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="bg-surface border border-border rounded-xl p-6">
              
              {/* Exercise Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Exercise name (e.g., Bench Press)"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus font-medium"
                  />
                </div>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Sets */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-sm text-text-muted font-medium">
                  <div className="col-span-1">Set</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3">Weight (kg)</div>
                  <div className="col-span-3">RPE (1-10)</div>
                  <div className="col-span-2"></div>
                </div>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 text-text-muted">
                      {setIndex + 1}
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-surface-2 border border-border rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-focus"
                        min="0"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-surface-2 border border-border rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-focus"
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.rpe || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'rpe', parseFloat(e.target.value) || undefined)}
                        className="w-full px-2 py-1 bg-surface-2 border border-border rounded text-text-primary focus:outline-none focus:ring-1 focus:ring-focus"
                        min="1"
                        max="10"
                        step="0.5"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => removeSet(exercise.id, set.id)}
                        disabled={exercise.sets.length === 1}
                        className="p-1 text-error hover:bg-error/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => addSet(exercise.id)}
                className="mt-4 inline-flex items-center px-3 py-1 bg-navy/20 text-navy rounded-lg hover:bg-navy/30 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Set
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={addExercise}
            className="inline-flex items-center px-4 py-2 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Exercise
          </button>
          
          <button
            onClick={handleSave}
            disabled={exercises.length === 0}
            className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Workout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddWorkoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <AddWorkoutContent />
    </Suspense>
  );
}
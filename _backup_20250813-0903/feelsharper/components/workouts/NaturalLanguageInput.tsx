'use client';

import { useState } from 'react';
import { Loader2, Zap, Edit3, Check, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import type { Exercise, WorkoutTypeEnum } from '@/lib/types/database';

interface ParseResult {
  success: boolean;
  workout?: {
    workout_type: WorkoutTypeEnum;
    exercises: Exercise[];
    confidence: number;
  };
  message?: string;
  suggestions?: string[];
  metadata?: {
    original_text: string;
    parsed_exercises_count: number;
    parsing_confidence: number;
  };
}

interface NaturalLanguageInputProps {
  onWorkoutParsed: (workout: {
    workout_type: WorkoutTypeEnum;
    exercises: Exercise[];
  }) => void;
  className?: string;
}

export default function NaturalLanguageInput({ 
  onWorkoutParsed, 
  className = '' 
}: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const examples = [
    'ran 5k easy',
    'bench press 3x8 @ 135lbs',
    '30min bike ride',
    'squats 5x5 185',
    'swam 1000m',
    'deadlift 1x5 225lbs + pushups 3x15',
  ];

  const handleParse = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setParseResult(null);
    
    try {
      const response = await fetch('/api/workouts/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      });
      
      const result: ParseResult = await response.json();
      setParseResult(result);
      
      if (result.success && result.workout) {
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Failed to parse workout:', error);
      setParseResult({
        success: false,
        message: 'Failed to parse workout. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (parseResult?.success && parseResult.workout) {
      onWorkoutParsed({
        workout_type: parseResult.workout.workout_type,
        exercises: parseResult.workout.exercises,
      });
      setInput('');
      setParseResult(null);
      setShowPreview(false);
    }
  };

  const handleReject = () => {
    setShowPreview(false);
    setParseResult(null);
  };

  const fillExample = (example: string) => {
    setInput(example);
    setParseResult(null);
    setShowPreview(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">
          Describe your workout
        </label>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ran 5k easy, bench press 3x8 @ 135lbs, 30min bike ride..."
            className="flex-1 bg-surface-2 border-border text-text-primary placeholder:text-text-muted resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleParse();
              }
            }}
          />
          <Button
            onClick={handleParse}
            disabled={!input.trim() || isLoading}
            className="bg-navy hover:bg-navy/80 h-fit self-start mt-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-text-muted">
          Press Cmd/Ctrl + Enter to parse • Be specific with exercises, sets, reps, and weight
        </p>
      </div>

      {/* Examples */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">Examples:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => fillExample(example)}
              className="px-2 py-1 text-xs bg-surface hover:bg-surface-2 text-text-secondary rounded border border-border hover:border-border/60 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Parse Result */}
      {parseResult && !showPreview && (
        <div className={`p-3 rounded border ${
          parseResult.success 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {parseResult.success ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">✓ Workout parsed successfully!</p>
              {parseResult.metadata && (
                <p className="text-xs text-green-300">
                  Found {parseResult.metadata.parsed_exercises_count} exercise(s) 
                  • {Math.round(parseResult.metadata.parsing_confidence * 100)}% confidence
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Could not parse workout</p>
              {parseResult.message && (
                <p className="text-xs text-red-300">{parseResult.message}</p>
              )}
              {parseResult.suggestions && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Try these formats:</p>
                  {parseResult.suggestions.map((suggestion, index) => (
                    <p key={index} className="text-xs text-red-300">• {suggestion}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {showPreview && parseResult?.success && parseResult.workout && (
        <div className="p-4 bg-surface border border-border rounded space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-text-primary flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Preview Workout
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-400/20 hover:bg-red-500/10"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-3 w-3 mr-1" />
                Add Workout
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Type:</span>
              <span className="px-2 py-1 bg-navy/20 text-navy border border-navy/20 rounded text-xs font-medium">
                {parseResult.workout.workout_type}
              </span>
              <span className="text-text-secondary">•</span>
              <span className="text-text-secondary">
                {Math.round(parseResult.workout.confidence * 100)}% confidence
              </span>
            </div>

            <div className="space-y-2">
              {parseResult.workout.exercises.map((exercise, index) => (
                <div key={index} className="p-2 bg-bg border border-border rounded">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary capitalize">{exercise.name}</h4>
                    <span className="text-xs text-text-secondary px-2 py-1 bg-surface-2 rounded">
                      {exercise.type}
                    </span>
                  </div>
                  
                  {exercise.sets && exercise.sets.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="text-sm text-text-secondary">
                          Set {setIndex + 1}: 
                          {set.reps && <span className="ml-1">{set.reps} reps</span>}
                          {set.weight_kg && <span className="ml-1">@ {Math.round(set.weight_kg * 2.205)} lbs</span>}
                          {set.duration_seconds && <span className="ml-1">{set.duration_seconds}s</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {exercise.distance_km && (
                    <p className="text-sm text-text-secondary mt-1">
                      Distance: {exercise.distance_km.toFixed(2)} km ({(exercise.distance_km * 0.621371).toFixed(2)} mi)
                    </p>
                  )}
                  
                  {exercise.duration_seconds && (
                    <p className="text-sm text-text-secondary mt-1">
                      Duration: {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                  
                  {exercise.notes && (
                    <p className="text-sm text-text-secondary mt-1">{exercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
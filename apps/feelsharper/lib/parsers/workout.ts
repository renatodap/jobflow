/**
 * Natural Language Workout Parser
 * Converts text like "ran 5k easy" or "bench press 3x8 @ 135lbs" into structured workout data
 */

import type { Exercise, ExerciseSet, WorkoutTypeEnum } from '@/lib/types/database';

// Common exercise aliases and variations
const EXERCISE_ALIASES: Record<string, string> = {
  // Cardio
  'run': 'running',
  'ran': 'running',
  'jog': 'running',
  'jogged': 'running',
  'bike': 'cycling',
  'biked': 'cycling',
  'cycle': 'cycling',
  'cycled': 'cycling',
  'swim': 'swimming',
  'swam': 'swimming',
  'row': 'rowing',
  'rowed': 'rowing',
  'walk': 'walking',
  'walked': 'walking',
  'hike': 'hiking',
  'hiked': 'hiking',
  
  // Strength
  'bench': 'bench press',
  'bp': 'bench press',
  'squat': 'squat',
  'squats': 'squat',
  'deadlift': 'deadlift',
  'dl': 'deadlift',
  'ohp': 'overhead press',
  'press': 'overhead press',
  'pullup': 'pull-up',
  'pullups': 'pull-up',
  'chinup': 'chin-up',
  'chinups': 'chin-up',
  'pushup': 'push-up',
  'pushups': 'push-up',
  'situp': 'sit-up',
  'situps': 'sit-up',
  'plank': 'plank',
  'burpee': 'burpee',
  'burpees': 'burpee',
};

// Distance units and conversions
const DISTANCE_UNITS: Record<string, number> = {
  'km': 1,
  'kilometer': 1,
  'kilometers': 1,
  'k': 1,
  'mile': 1.60934,
  'miles': 1.60934,
  'm': 0.001,
  'meter': 0.001,
  'meters': 0.001,
  'yard': 0.0009144,
  'yards': 0.0009144,
  'yd': 0.0009144,
};

// Weight units and conversions to kg
const WEIGHT_UNITS: Record<string, number> = {
  'kg': 1,
  'kilogram': 1,
  'kilograms': 1,
  'lb': 0.453592,
  'lbs': 0.453592,
  'pound': 0.453592,
  'pounds': 0.453592,
};

// Time patterns
const TIME_PATTERNS = [
  /(\d+):(\d+):(\d+)/,     // HH:MM:SS
  /(\d+):(\d+)/,           // MM:SS
  /(\d+)\s*(h|hour|hours)/i,
  /(\d+)\s*(m|min|minute|minutes)/i,
  /(\d+)\s*(s|sec|second|seconds)/i,
];

// Intensity markers
const INTENSITY_MARKERS = [
  'easy', 'light', 'recovery',
  'moderate', 'tempo', 'steady',
  'hard', 'intense', 'vigorous',
  'max', 'maximum', 'all out',
];

export interface ParsedWorkout {
  exercises: ParsedExercise[];
  duration?: number;
  notes?: string;
  workout_type: WorkoutTypeEnum;
  confidence: number; // 0-1, how confident we are in the parsing
}

export interface ParsedExercise {
  name: string;
  type: 'reps' | 'time' | 'distance';
  sets?: ParsedSet[];
  distance_km?: number;
  duration_seconds?: number;
  intensity?: string;
  notes?: string;
}

export interface ParsedSet {
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  completed: boolean;
}

export function parseWorkoutText(input: string): ParsedWorkout | null {
  if (!input || input.trim().length === 0) return null;
  
  const text = input.toLowerCase().trim();
  const exercises: ParsedExercise[] = [];
  let workoutType: WorkoutTypeEnum = 'strength';
  let confidence = 0.5;
  
  // First try to parse as mixed (multiple exercises)
  const mixedResult = parseMixed(text);
  if (mixedResult.length > 1) {
    exercises.push(...mixedResult);
    workoutType = mixedResult.some(e => e.type === 'distance') ? 'cardio' : 'strength';
    confidence = 0.7;
  } else {
    // Try to parse as single cardio first
    const cardioResult = parseCardio(text);
    if (cardioResult) {
      exercises.push(cardioResult);
      workoutType = 'cardio';
      confidence = 0.8;
    } else {
      // Try to parse as single strength
      const strengthResult = parseStrength(text);
      if (strengthResult) {
        exercises.push(strengthResult);
        workoutType = 'strength';
        confidence = 0.8;
      }
    }
  }
  
  if (exercises.length === 0) return null;
  
  return {
    exercises,
    workout_type: workoutType,
    confidence,
  };
}

function parseCardio(text: string): ParsedExercise | null {
  // Patterns like "ran 5k easy", "biked 20 miles", "swam 1000m", "biked for 30 minutes"
  const cardioPattern = /(?:^|\s)(ran|run|biked|bike|swam|swim|walked|walk|hiked|hike|rowed|row)\s+(?:(?:for\s+)?(\d+(?:\.\d+)?)\s*(kilometers?|km|k|miles?|meters?|m|yards?|yd)\b(?:\s+in\s+(\d+):(\d+)(?::(\d+))?)?(?:\s+(easy|moderate|hard|tempo|recovery|light|intense|vigorous))?|(?:for\s+)?(\d+)\s*(hours?|h|minutes?|min|seconds?|sec|s)\b(?:\s+(easy|moderate|hard|tempo|recovery|light|intense|vigorous))?)/i;
  
  const match = text.match(cardioPattern);
  if (!match) return null;
  
  const [, activity, distance, distanceUnit, minutes, seconds, totalSeconds, intensity1, duration, durationUnit, intensity2] = match;
  
  const exerciseName = EXERCISE_ALIASES[activity] || activity;
  const intensity = intensity1 || intensity2;
  
  const exercise: ParsedExercise = {
    name: exerciseName,
    type: 'distance',
  };
  
  // Parse distance
  if (distance && distanceUnit) {
    const distanceValue = parseFloat(distance);
    const unit = distanceUnit.toLowerCase();
    const conversionFactor = DISTANCE_UNITS[unit] || 1;
    exercise.distance_km = distanceValue * conversionFactor;
  }
  
  // Parse time
  if (minutes && seconds) {
    const totalSecs = parseInt(minutes) * 60 + parseInt(seconds) + (totalSeconds ? parseInt(totalSeconds) : 0);
    exercise.duration_seconds = totalSecs;
  } else if (duration && durationUnit) {
    const durationValue = parseInt(duration);
    const unit = durationUnit.toLowerCase();
    if (unit.startsWith('h')) {
      exercise.duration_seconds = durationValue * 3600;
    } else if (unit.includes('min') || unit === 'm') {
      exercise.duration_seconds = durationValue * 60;
    } else if (unit.startsWith('s')) {
      exercise.duration_seconds = durationValue;
    }
  }
  
  if (intensity) {
    exercise.intensity = intensity;
  }
  
  return exercise;
}

function parseStrength(text: string): ParsedExercise | null {
  // Patterns like "bench press 3x8 @ 135lbs", "squats 5x5 185", "deadlift 1x5 225lbs", "bp 3x8 135"
  const strengthPattern = /(?:^|\s)(bench(?:\s+press)?|bp|squat|squats|deadlift|dl|ohp|overhead\s+press|pullup|pullups|chinup|chinups|pushup|pushups|plank|burpee|burpees)\s+(?:(\d+)\s*x\s*(\d+)(?:\s*@?\s*(\d+(?:\.\d+)?)\s*(kg|lb|lbs|pound|pounds)?)?|(\d+(?:\.\d+)?)\s*(kg|lb|lbs|pound|pounds))/i;
  
  const match = text.match(strengthPattern);
  if (!match) return null;
  
  const [, exercise, sets, reps, weight, weightUnit, singleWeight, singleWeightUnit] = match;
  
  const exerciseName = EXERCISE_ALIASES[exercise.replace(/\s+/g, ' ').trim()] || exercise;
  
  const parsedExercise: ParsedExercise = {
    name: exerciseName,
    type: 'reps',
    sets: [],
  };
  
  if (sets && reps) {
    const numSets = parseInt(sets);
    const numReps = parseInt(reps);
    let weightKg: number | undefined;
    
    if (weight) {
      const weightValue = parseFloat(weight);
      const unit = (weightUnit || 'lb').toLowerCase();
      const conversionFactor = WEIGHT_UNITS[unit] || WEIGHT_UNITS['lb'];
      weightKg = weightValue * conversionFactor;
    }
    
    // Create sets
    for (let i = 0; i < numSets; i++) {
      parsedExercise.sets!.push({
        reps: numReps,
        weight_kg: weightKg,
        completed: false,
      });
    }
  } else if (singleWeight) {
    // Single weight mention, assume 1 set
    const weightValue = parseFloat(singleWeight);
    const unit = (singleWeightUnit || 'lb').toLowerCase();
    const conversionFactor = WEIGHT_UNITS[unit] || WEIGHT_UNITS['lb'];
    const weightKg = weightValue * conversionFactor;
    
    parsedExercise.sets!.push({
      weight_kg: weightKg,
      completed: false,
    });
  }
  
  return parsedExercise;
}

function parseMixed(text: string): ParsedExercise[] {
  // Try to parse multiple exercises separated by "and", "+", "then", etc.
  const separators = /\s+(?:and|[+&]|then|followed\s+by)\s+/i;
  const parts = text.split(separators);
  
  const exercises: ParsedExercise[] = [];
  
  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;
    
    const cardio = parseCardio(trimmedPart);
    if (cardio) {
      exercises.push(cardio);
      continue;
    }
    
    const strength = parseStrength(trimmedPart);
    if (strength) {
      exercises.push(strength);
      continue;
    }
  }
  
  return exercises;
}

// Helper function to extract intensity from text
export function extractIntensity(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  for (const marker of INTENSITY_MARKERS) {
    if (lowerText.includes(marker)) {
      return marker;
    }
  }
  
  // Check for RPE patterns
  const rpeMatch = lowerText.match(/rpe\s*(\d+(?:\.\d+)?)/);
  if (rpeMatch) {
    return `RPE ${rpeMatch[1]}`;
  }
  
  // Check for @X patterns
  const atMatch = lowerText.match(/@\s*(\d+(?:\.\d+)?)(?:\s*\/\s*10)?/);
  if (atMatch) {
    return `@${atMatch[1]}/10`;
  }
  
  return undefined;
}

// Helper function to convert parsed exercises to database format
export function convertToExerciseFormat(parsed: ParsedExercise[]): Exercise[] {
  return parsed.map(exercise => ({
    name: exercise.name,
    type: exercise.type,
    sets: exercise.sets as ExerciseSet[] || [],
    duration_seconds: exercise.duration_seconds,
    distance_km: exercise.distance_km,
    notes: exercise.intensity ? `Intensity: ${exercise.intensity}` : undefined,
  }));
}
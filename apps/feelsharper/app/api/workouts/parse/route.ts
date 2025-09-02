import { NextRequest, NextResponse } from 'next/server';
import { parseWorkoutText, convertToExerciseFormat } from '@/lib/parsers/workout';

export const runtime = 'edge';

// POST /api/workouts/parse - Parse natural language workout description
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    const text = body.text.trim();
    if (text.length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }
    
    // Parse the workout text
    const parsed = parseWorkoutText(text);
    
    if (!parsed) {
      return NextResponse.json({
        success: false,
        message: 'Could not parse workout description',
        suggestions: [
          'Try "ran 5k easy" for cardio',
          'Try "bench press 3x8 @ 135lbs" for strength',
          'Try "30min bike ride" for time-based cardio',
        ],
      });
    }
    
    // Convert to database format
    const exercises = convertToExerciseFormat(parsed.exercises);
    
    return NextResponse.json({
      success: true,
      workout: {
        workout_type: parsed.workout_type,
        exercises,
        confidence: parsed.confidence,
      },
      metadata: {
        original_text: text,
        parsed_exercises_count: exercises.length,
        parsing_confidence: parsed.confidence,
      },
    });
  } catch (error) {
    console.error('Workout parsing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
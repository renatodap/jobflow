# Workout Natural Language Parser Implementation

## Overview
Implement natural language processing to convert text inputs like "ran 5k easy" or "bench press 3x8 @ 135lbs" into structured workout data.

## Core Requirements
From FEATURES.md line 57: "Natural language ("ran 5k easy"), voice dictation, templates, recents/favorites, shortcuts"

## Implementation Plan

### 1. Parser Engine (`lib/parsers/workout.ts`)
- **Cardio patterns**: "ran 5k easy", "biked 20 miles", "swam 1000m"
- **Strength patterns**: "bench press 3x8 @ 135lbs", "squats 5x5 185", "deadlift 1x5 225lbs"
- **Mixed patterns**: "5 mile run + push ups 3x15"
- **Time patterns**: "30min bike ride", "ran for 45 minutes"
- **Intensity markers**: "easy", "hard", "RPE 7", "@8/10"

### 2. Exercise Database
- Common exercise name variations and aliases
- Unit conversion support (lbs ↔ kg, miles ↔ km)
- Exercise categorization (strength, cardio, sport-specific)

### 3. API Integration
- New endpoint: `POST /api/workouts/parse`
- Integration with existing workout creation
- Fallback to manual entry for unrecognized patterns

### 4. UI Components
- Natural language input field
- Real-time parsing preview
- Edit/confirm parsed results
- Template suggestions

### 5. Database Schema
- Extend existing workouts/exercises/sets tables
- Add parsing metadata for improvement
- Store common user patterns

## Technical Approach

### Parser Architecture
```typescript
interface ParsedWorkout {
  exercises: ParsedExercise[];
  duration?: number;
  notes?: string;
}

interface ParsedExercise {
  name: string;
  category: 'strength' | 'cardio' | 'sport';
  sets?: ParsedSet[];
  distance?: number;
  duration?: number;
  intensity?: string;
}
```

### Parsing Strategies
1. **Regex-based**: Quick pattern matching for common formats
2. **Keyword extraction**: Exercise names, units, numbers
3. **Context inference**: Determine workout type from keywords
4. **Validation**: Ensure parsed values are reasonable

### Example Patterns
- `"ran 5k in 25:30"` → Cardio: Running, 5km, 25:30 duration
- `"bench 3x8 @ 135"` → Strength: Bench Press, 3 sets, 8 reps, 135lbs
- `"deadlift 1x5 225lbs"` → Strength: Deadlift, 1 set, 5 reps, 225lbs
- `"30min bike ride easy"` → Cardio: Cycling, 30min, easy intensity

## Implementation Steps
1. Create parser utility functions
2. Build exercise name database
3. Create API endpoint
4. Add UI input component
5. Integrate with workout creation flow
6. Add tests and validation
7. Documentation update

## Success Criteria
- Parse 80%+ of common workout descriptions accurately
- Handle both metric and imperial units
- Graceful fallback for unparsable input
- Fast parsing (<200ms response time)
- Intuitive edit interface for corrections
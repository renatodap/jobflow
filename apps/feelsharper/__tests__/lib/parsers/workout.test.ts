/**
 * @jest-environment jsdom
 */

import { parseWorkoutText, extractIntensity, convertToExerciseFormat } from '@/lib/parsers/workout';

describe('Workout Parser', () => {
  describe('parseWorkoutText', () => {
    it('should parse cardio activities correctly', () => {
      const result = parseWorkoutText('ran 5k easy');
      
      expect(result).toBeTruthy();
      expect(result?.workout_type).toBe('cardio');
      expect(result?.exercises).toHaveLength(1);
      expect(result?.exercises[0].name).toBe('running');
      expect(result?.exercises[0].distance_km).toBe(5);
      expect(result?.exercises[0].intensity).toBe('easy');
    });

    it('should parse strength exercises correctly', () => {
      const result = parseWorkoutText('bench press 3x8 @ 135lbs');
      
      expect(result).toBeTruthy();
      expect(result?.workout_type).toBe('strength');
      expect(result?.exercises).toHaveLength(1);
      expect(result?.exercises[0].name).toBe('bench press');
      expect(result?.exercises[0].sets).toHaveLength(3);
      expect(result?.exercises[0].sets?.[0].reps).toBe(8);
      expect(result?.exercises[0].sets?.[0].weight_kg).toBeCloseTo(61.23, 1); // 135 lbs to kg
    });

    it('should parse time-based cardio', () => {
      const result = parseWorkoutText('biked for 30 minutes');
      
      expect(result).toBeTruthy();
      expect(result?.workout_type).toBe('cardio');
      expect(result?.exercises[0].name).toBe('cycling');
      expect(result?.exercises[0].duration_seconds).toBe(1800); // 30 minutes
    });

    it('should handle different weight units', () => {
      const result = parseWorkoutText('squat 5x5 100kg');
      
      expect(result).toBeTruthy();
      expect(result?.exercises[0].sets?.[0].weight_kg).toBe(100);
    });

    it('should handle distance units', () => {
      const result1 = parseWorkoutText('ran 3 miles');
      const result2 = parseWorkoutText('ran 5km');
      
      expect(result1?.exercises[0].distance_km).toBeCloseTo(4.83, 1); // 3 miles to km
      expect(result2?.exercises[0].distance_km).toBe(5);
    });

    it('should return null for unparseable text', () => {
      const result = parseWorkoutText('had a great day');
      expect(result).toBeNull();
    });

    it('should handle empty or invalid input', () => {
      expect(parseWorkoutText('')).toBeNull();
      expect(parseWorkoutText('   ')).toBeNull();
    });
  });

  describe('extractIntensity', () => {
    it('should extract basic intensity markers', () => {
      expect(extractIntensity('ran 5k easy')).toBe('easy');
      expect(extractIntensity('hard workout today')).toBe('hard');
      expect(extractIntensity('moderate pace run')).toBe('moderate');
    });

    it('should extract RPE ratings', () => {
      expect(extractIntensity('bench press at RPE 8')).toBe('RPE 8');
      expect(extractIntensity('RPE 7.5 effort')).toBe('RPE 7.5');
    });

    it('should extract @X ratings', () => {
      expect(extractIntensity('squats @8/10')).toBe('@8/10');
      expect(extractIntensity('ran @7')).toBe('@7/10');
    });

    it('should return undefined for no intensity markers', () => {
      expect(extractIntensity('bench press 3x8')).toBeUndefined();
    });
  });

  describe('convertToExerciseFormat', () => {
    it('should convert parsed exercises to database format', () => {
      const parsed = parseWorkoutText('bench press 3x8 @ 135lbs');
      const converted = convertToExerciseFormat(parsed!.exercises);
      
      expect(converted).toHaveLength(1);
      expect(converted[0].name).toBe('bench press');
      expect(converted[0].type).toBe('reps');
      expect(converted[0].sets).toHaveLength(3);
      expect(converted[0].sets![0].reps).toBe(8);
      expect(converted[0].sets![0].weight_kg).toBeCloseTo(61.23, 1);
    });

    it('should handle cardio exercises', () => {
      const parsed = parseWorkoutText('ran 5k easy');
      const converted = convertToExerciseFormat(parsed!.exercises);
      
      expect(converted[0].name).toBe('running');
      expect(converted[0].type).toBe('distance');
      expect(converted[0].distance_km).toBe(5);
      expect(converted[0].notes).toBe('Intensity: easy');
    });
  });

  describe('Edge cases and variations', () => {
    it('should handle exercise name variations', () => {
      const bp = parseWorkoutText('bp 3x8 135');
      const bench = parseWorkoutText('bench 3x8 135');
      
      expect(bp?.exercises[0].name).toBe('bench press');
      expect(bench?.exercises[0].name).toBe('bench press');
    });

    it('should handle different cardio verbs', () => {
      const ran = parseWorkoutText('ran 5k');
      const run = parseWorkoutText('run 5k');
      
      expect(ran?.exercises[0].name).toBe('running');
      expect(run?.exercises[0].name).toBe('running');
    });

    it('should handle time formats', () => {
      const result = parseWorkoutText('ran 5k in 25:30');
      
      expect(result?.exercises[0].duration_seconds).toBe(1530); // 25:30 in seconds
    });

    it('should handle multiple exercises', () => {
      const result = parseWorkoutText('bench press 3x8 135 and pushups 3x15');
      
      expect(result?.exercises).toHaveLength(2);
      expect(result?.exercises[0].name).toBe('bench press');
      expect(result?.exercises[1].name).toBe('push-up');
    });
  });
});
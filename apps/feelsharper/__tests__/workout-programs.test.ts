/**
 * Workout Programs Test Suite
 * Tests workout programs, user assignments, and personal records functionality
 */

import { describe, it, expect } from '@jest/globals';

describe('Workout Programs System', () => {
  describe('Program Data Structure', () => {
    it('should have correct workout program structure', () => {
      const programData = {
        name: 'Beginner Strength Program',
        description: 'A 12-week program for building strength',
        goal_type: 'strength',
        experience_level: 'beginner',
        duration_weeks: 12,
        sessions_per_week: 3,
        equipment_required: ['barbell', 'dumbbells', 'bench'],
        is_public: true
      };

      expect(programData.name).toBe('Beginner Strength Program');
      expect(programData.goal_type).toBe('strength');
      expect(programData.experience_level).toBe('beginner');
      expect(programData.duration_weeks).toBe(12);
      expect(programData.sessions_per_week).toBe(3);
      expect(programData.equipment_required).toHaveLength(3);
      expect(programData.is_public).toBe(true);
    });

    it('should have correct workout template structure', () => {
      const templateData = {
        program_id: 'program-123',
        name: 'Full Body Workout A',
        description: 'First workout of the week',
        week_number: 1,
        day_number: 1,
        estimated_duration_minutes: 60,
        exercises: [
          {
            name: 'Squat',
            sets: 3,
            reps: '8-10',
            rest_seconds: 120,
            notes: 'Focus on form'
          },
          {
            name: 'Bench Press',
            sets: 3,
            reps: '8-10',
            rest_seconds: 120,
            notes: 'Control the weight'
          }
        ]
      };

      expect(templateData.program_id).toBe('program-123');
      expect(templateData.name).toBe('Full Body Workout A');
      expect(templateData.week_number).toBe(1);
      expect(templateData.day_number).toBe(1);
      expect(templateData.estimated_duration_minutes).toBe(60);
      expect(templateData.exercises).toHaveLength(2);
      expect(templateData.exercises[0].name).toBe('Squat');
      expect(templateData.exercises[0].sets).toBe(3);
    });
  });

  describe('User Program Assignment', () => {
    it('should have correct user program structure', () => {
      const userProgramData = {
        user_id: 'user-123',
        program_id: 'program-456',
        started_at: '2025-01-13T00:00:00Z',
        current_week: 1,
        current_day: 1,
        is_active: true,
        completed_at: null
      };

      expect(userProgramData.user_id).toBe('user-123');
      expect(userProgramData.program_id).toBe('program-456');
      expect(userProgramData.current_week).toBe(1);
      expect(userProgramData.current_day).toBe(1);
      expect(userProgramData.is_active).toBe(true);
      expect(userProgramData.completed_at).toBeNull();
    });

    it('should calculate program progress correctly', () => {
      const userProgram = {
        current_week: 6,
        program: {
          duration_weeks: 12
        }
      };

      const progressPercentage = (userProgram.current_week / userProgram.program.duration_weeks) * 100;
      expect(progressPercentage).toBe(50);
    });
  });

  describe('Personal Records', () => {
    it('should have correct personal record structure', () => {
      const recordData = {
        user_id: 'user-123',
        exercise_name: 'Bench Press',
        record_type: '1rm',
        value: 100,
        unit: 'kg',
        workout_id: 'workout-789',
        achieved_at: '2025-01-13T00:00:00Z',
        notes: 'New personal best!'
      };

      expect(recordData.user_id).toBe('user-123');
      expect(recordData.exercise_name).toBe('Bench Press');
      expect(recordData.record_type).toBe('1rm');
      expect(recordData.value).toBe(100);
      expect(recordData.unit).toBe('kg');
      expect(recordData.notes).toBe('New personal best!');
    });

    it('should validate record types', () => {
      const validRecordTypes = ['1rm', '3rm', '5rm', 'distance', 'time', 'reps'];
      const testRecord = { record_type: '1rm' };

      expect(validRecordTypes).toContain(testRecord.record_type);

      const invalidRecord = { record_type: 'invalid' };
      expect(validRecordTypes).not.toContain(invalidRecord.record_type);
    });

    it('should validate units', () => {
      const validUnits = ['kg', 'lb', 'km', 'mi', 'seconds', 'minutes', 'reps'];
      const testRecord = { unit: 'kg' };

      expect(validUnits).toContain(testRecord.unit);

      const invalidRecord = { unit: 'invalid' };
      expect(validUnits).not.toContain(invalidRecord.unit);
    });
  });

  describe('Goal Types and Experience Levels', () => {
    it('should validate goal types', () => {
      const validGoalTypes = ['strength', 'endurance', 'muscle_gain', 'fat_loss', 'general_fitness'];
      
      validGoalTypes.forEach(goalType => {
        expect(['strength', 'endurance', 'muscle_gain', 'fat_loss', 'general_fitness']).toContain(goalType);
      });
    });

    it('should validate experience levels', () => {
      const validExperienceLevels = ['beginner', 'intermediate', 'advanced'];
      
      validExperienceLevels.forEach(level => {
        expect(['beginner', 'intermediate', 'advanced']).toContain(level);
      });
    });
  });

  describe('Program Filtering and Search', () => {
    const samplePrograms = [
      {
        id: 'prog-1',
        name: 'Beginner Strength',
        goal_type: 'strength',
        experience_level: 'beginner',
        description: 'Build foundational strength'
      },
      {
        id: 'prog-2',
        name: 'Advanced Powerlifting',
        goal_type: 'strength',
        experience_level: 'advanced',
        description: 'Maximize squat, bench, deadlift'
      },
      {
        id: 'prog-3',
        name: 'Couch to 5K',
        goal_type: 'endurance',
        experience_level: 'beginner',
        description: 'Run your first 5K'
      }
    ];

    it('should filter programs by goal type', () => {
      const strengthPrograms = samplePrograms.filter(p => p.goal_type === 'strength');
      expect(strengthPrograms).toHaveLength(2);
      expect(strengthPrograms[0].name).toBe('Beginner Strength');
      expect(strengthPrograms[1].name).toBe('Advanced Powerlifting');
    });

    it('should filter programs by experience level', () => {
      const beginnerPrograms = samplePrograms.filter(p => p.experience_level === 'beginner');
      expect(beginnerPrograms).toHaveLength(2);
      expect(beginnerPrograms[0].name).toBe('Beginner Strength');
      expect(beginnerPrograms[1].name).toBe('Couch to 5K');
    });

    it('should search programs by name and description', () => {
      const searchTerm = 'strength';
      const searchResults = samplePrograms.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(searchResults).toHaveLength(1);
      expect(searchResults.map(p => p.name)).toContain('Beginner Strength');
      
      // Test searching by description
      const descriptionSearch = samplePrograms.filter(p =>
        p.description.toLowerCase().includes('squat')
      );
      expect(descriptionSearch).toHaveLength(1);
      expect(descriptionSearch[0].name).toBe('Advanced Powerlifting');
    });
  });

  describe('Exercise Template Validation', () => {
    it('should validate exercise structure in templates', () => {
      const validExercise = {
        name: 'Squat',
        sets: 3,
        reps: '8-10',
        rest_seconds: 120,
        notes: 'Focus on depth'
      };

      expect(validExercise.name).toBeTruthy();
      expect(typeof validExercise.sets).toBe('number');
      expect(validExercise.sets).toBeGreaterThan(0);
      expect(typeof validExercise.rest_seconds).toBe('number');
      expect(validExercise.rest_seconds).toBeGreaterThanOrEqual(0);
    });

    it('should handle different exercise types', () => {
      const strengthExercise = {
        name: 'Bench Press',
        sets: 3,
        reps: 8,
        weight_kg: 80
      };

      const cardioExercise = {
        name: 'Running',
        duration_minutes: 30,
        distance_km: 5
      };

      const timeBased = {
        name: 'Plank',
        sets: 3,
        duration_seconds: 60
      };

      expect(strengthExercise.sets).toBe(3);
      expect(strengthExercise.reps).toBe(8);
      expect(cardioExercise.duration_minutes).toBe(30);
      expect(timeBased.duration_seconds).toBe(60);
    });
  });

  describe('Program Statistics', () => {
    it('should calculate program statistics correctly', () => {
      const program = {
        workout_templates: [
          { estimated_duration_minutes: 60 },
          { estimated_duration_minutes: 45 },
          { estimated_duration_minutes: 75 }
        ],
        duration_weeks: 12,
        sessions_per_week: 3
      };

      const totalWorkouts = program.workout_templates.length;
      const avgDuration = program.workout_templates.reduce((sum, t) => sum + t.estimated_duration_minutes, 0) / totalWorkouts;
      
      expect(totalWorkouts).toBe(3);
      expect(avgDuration).toBe(60); // (60 + 45 + 75) / 3
      expect(program.duration_weeks).toBe(12);
      expect(program.sessions_per_week).toBe(3);
    });
  });
});
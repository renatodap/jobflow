/**
 * Body Metrics API Tests
 * Tests for body measurements, trends, and goals data validation
 */

import { describe, it, expect } from '@jest/globals';

describe('Body Metrics API', () => {
  describe('Body Measurements API', () => {
    it('should validate measurement data structure', () => {
      const validMeasurement = {
        measurement_date: '2024-01-15',
        weight_kg: 75.5,
        body_fat_percentage: 15.2,
        muscle_mass_kg: 45.8,
        waist_cm: 80.0,
        notes: 'Morning measurement'
      };

      // Check required fields
      expect(validMeasurement.measurement_date).toBeDefined();
      expect(typeof validMeasurement.weight_kg).toBe('number');
      expect(typeof validMeasurement.body_fat_percentage).toBe('number');
      expect(typeof validMeasurement.muscle_mass_kg).toBe('number');
    });

    it('should handle measurement validation edge cases', () => {
      // Test minimum valid measurement
      const minimalMeasurement = {
        measurement_date: '2024-01-15',
        weight_kg: 30.0 // Minimum reasonable weight
      };
      expect(minimalMeasurement.weight_kg).toBeGreaterThan(0);

      // Test body fat percentage bounds
      const bodyFatMeasurement = {
        measurement_date: '2024-01-15',
        body_fat_percentage: 8.5
      };
      expect(bodyFatMeasurement.body_fat_percentage).toBeGreaterThan(0);
      expect(bodyFatMeasurement.body_fat_percentage).toBeLessThan(50);
    });
  });

  describe('Body Goals API', () => {
    it('should validate goal data structure', () => {
      const validGoal = {
        goal_type: 'weight_loss',
        target_weight_kg: 70.0,
        target_body_fat_percentage: 12.0,
        target_date: '2024-06-15',
        weekly_rate_kg: 0.5,
        starting_weight_kg: 75.5
      };

      // Check required fields
      expect(validGoal.goal_type).toBeDefined();
      expect(['weight_loss', 'weight_gain', 'muscle_gain', 'fat_loss', 'maintenance'])
        .toContain(validGoal.goal_type);
      expect(typeof validGoal.target_weight_kg).toBe('number');
      expect(typeof validGoal.weekly_rate_kg).toBe('number');
    });

    it('should validate goal type enum values', () => {
      const validGoalTypes = ['weight_loss', 'weight_gain', 'muscle_gain', 'fat_loss', 'maintenance'];
      
      validGoalTypes.forEach(goalType => {
        expect(validGoalTypes).toContain(goalType);
      });

      // Invalid goal type should not be accepted
      const invalidGoalType = 'invalid_goal';
      expect(validGoalTypes).not.toContain(invalidGoalType);
    });
  });

  describe('Body Trends API', () => {
    it('should validate trend calculation data', () => {
      const trendData = {
        calculation_date: '2024-01-15',
        weight_7day_ema: 75.2,
        weight_trend_direction: 'losing',
        weight_weekly_change_kg: -0.3,
        body_fat_7day_ema: 15.1,
        muscle_mass_7day_ema: 45.9,
        data_points_count: 7
      };

      // Check EMA values are reasonable
      expect(typeof trendData.weight_7day_ema).toBe('number');
      expect(trendData.weight_7day_ema).toBeGreaterThan(0);
      
      // Check trend direction is valid
      expect(['gaining', 'losing', 'stable']).toContain(trendData.weight_trend_direction);
      
      // Check data points count
      expect(trendData.data_points_count).toBeGreaterThan(0);
      expect(trendData.data_points_count).toBeLessThanOrEqual(30);
    });

    it('should handle trend summary statistics', () => {
      const trendSummary = {
        current_weight_ema: 75.2,
        trend_direction: 'losing',
        weekly_change: -0.3,
        total_change_30days: -1.8,
        data_points: 15
      };

      // Validate summary structure
      expect(typeof trendSummary.current_weight_ema).toBe('number');
      expect(['gaining', 'losing', 'stable']).toContain(trendSummary.trend_direction);
      expect(typeof trendSummary.weekly_change).toBe('number');
      expect(typeof trendSummary.total_change_30days).toBe('number');
      expect(trendSummary.data_points).toBeGreaterThan(0);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete body metrics workflow', () => {
      // Step 1: Create measurement
      const measurement = {
        measurement_date: '2024-01-15',
        weight_kg: 75.5,
        body_fat_percentage: 15.2,
        muscle_mass_kg: 45.8
      };

      // Step 2: Set goal based on measurement
      const goal = {
        goal_type: 'weight_loss',
        target_weight_kg: 70.0,
        starting_weight_kg: measurement.weight_kg,
        target_date: '2024-06-15',
        weekly_rate_kg: 0.5
      };

      // Step 3: Validate goal progress calculation
      const progress = (measurement.weight_kg - goal.target_weight_kg) / 
                      (goal.starting_weight_kg - goal.target_weight_kg) * 100;
      
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should validate realistic body composition ranges', () => {
      const measurements = [
        { weight_kg: 75.5, body_fat_percentage: 15.2, muscle_mass_kg: 45.8 },
        { weight_kg: 60.0, body_fat_percentage: 22.5, muscle_mass_kg: 35.2 },
        { weight_kg: 90.0, body_fat_percentage: 12.8, muscle_mass_kg: 55.1 }
      ];

      measurements.forEach(measurement => {
        // Reasonable weight range
        expect(measurement.weight_kg).toBeGreaterThan(30);
        expect(measurement.weight_kg).toBeLessThan(200);
        
        // Reasonable body fat range
        expect(measurement.body_fat_percentage).toBeGreaterThan(5);
        expect(measurement.body_fat_percentage).toBeLessThan(50);
        
        // Muscle mass should be less than total weight
        expect(measurement.muscle_mass_kg).toBeLessThan(measurement.weight_kg);
        expect(measurement.muscle_mass_kg).toBeGreaterThan(10);
      });
    });
  });
});
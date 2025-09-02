-- Migration: Body Metrics Dashboard
-- Description: Add comprehensive body measurements, goals, and trend analysis
-- Author: Claude Code
-- Date: 2025-01-13

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced body measurements beyond weight
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg < 1000),
  body_fat_percentage DECIMAL(4,1) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass_kg DECIMAL(5,2) CHECK (muscle_mass_kg > 0 AND muscle_mass_kg < 200),
  visceral_fat_level INTEGER CHECK (visceral_fat_level >= 1 AND visceral_fat_level <= 30),
  water_percentage DECIMAL(4,1) CHECK (water_percentage >= 0 AND water_percentage <= 100),
  bone_mass_kg DECIMAL(4,2) CHECK (bone_mass_kg > 0 AND bone_mass_kg < 20),
  metabolic_age INTEGER CHECK (metabolic_age >= 10 AND metabolic_age <= 120),
  -- Circumference measurements in cm
  waist_cm DECIMAL(5,2) CHECK (waist_cm > 0 AND waist_cm < 500),
  chest_cm DECIMAL(5,2) CHECK (chest_cm > 0 AND chest_cm < 500),
  arm_cm DECIMAL(5,2) CHECK (arm_cm > 0 AND arm_cm < 200),
  thigh_cm DECIMAL(5,2) CHECK (thigh_cm > 0 AND thigh_cm < 200),
  hip_cm DECIMAL(5,2) CHECK (hip_cm > 0 AND hip_cm < 500),
  neck_cm DECIMAL(5,2) CHECK (neck_cm > 0 AND neck_cm < 100),
  -- Progress photos metadata (URLs to stored images)
  progress_photo_front TEXT,
  progress_photo_side TEXT,
  progress_photo_back TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, measurement_date)
);

-- Body composition goals and targets
CREATE TABLE IF NOT EXISTS public.body_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'fat_loss', 'maintenance')),
  target_weight_kg DECIMAL(5,2) CHECK (target_weight_kg > 0 AND target_weight_kg < 1000),
  target_body_fat_percentage DECIMAL(4,1) CHECK (target_body_fat_percentage >= 0 AND target_body_fat_percentage <= 100),
  target_muscle_mass_kg DECIMAL(5,2) CHECK (target_muscle_mass_kg > 0 AND target_muscle_mass_kg < 200),
  target_date DATE,
  weekly_rate_kg DECIMAL(4,3) CHECK (weekly_rate_kg BETWEEN -5.0 AND 5.0), -- Expected change per week
  starting_weight_kg DECIMAL(5,2),
  starting_body_fat_percentage DECIMAL(4,1),
  starting_muscle_mass_kg DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculated trend data for performance optimization
CREATE TABLE IF NOT EXISTS public.body_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL,
  weight_7day_ema DECIMAL(5,2),
  weight_trend_direction TEXT CHECK (weight_trend_direction IN ('up', 'down', 'stable')),
  weight_weekly_change_kg DECIMAL(4,3),
  body_fat_7day_ema DECIMAL(4,1),
  muscle_mass_7day_ema DECIMAL(5,2),
  data_points_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, calculation_date)
);

-- Add trend calculation fields to existing body_weight table
ALTER TABLE public.body_weight 
ADD COLUMN IF NOT EXISTS trending_weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
ADD COLUMN IF NOT EXISTS days_since_goal INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON public.body_measurements(user_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON public.body_measurements(measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_goals_user_active ON public.body_goals(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_body_trends_user_date ON public.body_trends(user_id, calculation_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_weight_user_date ON public.body_weight(user_id, measured_at DESC);

-- RLS Policies

-- body_measurements
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own measurements" ON public.body_measurements
  FOR ALL USING (user_id = auth.uid());

-- body_goals  
ALTER TABLE public.body_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own goals" ON public.body_goals
  FOR ALL USING (user_id = auth.uid());

-- body_trends
ALTER TABLE public.body_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own trends" ON public.body_trends
  FOR ALL USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_body_measurements_updated_at 
  BEFORE UPDATE ON public.body_measurements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_body_goals_updated_at 
  BEFORE UPDATE ON public.body_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate 7-day EMA
CREATE OR REPLACE FUNCTION calculate_body_trend_ema(
  user_id_param UUID,
  measurement_date_param DATE,
  current_weight DECIMAL,
  current_body_fat DECIMAL DEFAULT NULL,
  current_muscle_mass DECIMAL DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  alpha CONSTANT DECIMAL := 0.25; -- 2/(7+1) for 7-day EMA
  prev_trend RECORD;
  new_weight_ema DECIMAL;
  new_body_fat_ema DECIMAL;
  new_muscle_mass_ema DECIMAL;
  trend_direction TEXT;
  weekly_change DECIMAL;
BEGIN
  -- Get the most recent trend calculation
  SELECT * INTO prev_trend
  FROM public.body_trends
  WHERE user_id = user_id_param
    AND calculation_date < measurement_date_param
  ORDER BY calculation_date DESC
  LIMIT 1;

  -- Calculate new EMAs
  IF prev_trend IS NULL THEN
    -- First measurement, EMA = current value
    new_weight_ema := current_weight;
    new_body_fat_ema := current_body_fat;
    new_muscle_mass_ema := current_muscle_mass;
    trend_direction := 'stable';
    weekly_change := 0;
  ELSE
    -- Calculate EMA: α × current + (1 - α) × previous_ema
    new_weight_ema := alpha * current_weight + (1 - alpha) * prev_trend.weight_7day_ema;
    
    IF current_body_fat IS NOT NULL AND prev_trend.body_fat_7day_ema IS NOT NULL THEN
      new_body_fat_ema := alpha * current_body_fat + (1 - alpha) * prev_trend.body_fat_7day_ema;
    ELSE
      new_body_fat_ema := COALESCE(current_body_fat, prev_trend.body_fat_7day_ema);
    END IF;
    
    IF current_muscle_mass IS NOT NULL AND prev_trend.muscle_mass_7day_ema IS NOT NULL THEN
      new_muscle_mass_ema := alpha * current_muscle_mass + (1 - alpha) * prev_trend.muscle_mass_7day_ema;
    ELSE
      new_muscle_mass_ema := COALESCE(current_muscle_mass, prev_trend.muscle_mass_7day_ema);
    END IF;

    -- Calculate trend direction (threshold: 0.1kg)
    IF ABS(new_weight_ema - prev_trend.weight_7day_ema) < 0.1 THEN
      trend_direction := 'stable';
    ELSIF new_weight_ema > prev_trend.weight_7day_ema THEN
      trend_direction := 'up';
    ELSE
      trend_direction := 'down';
    END IF;

    -- Calculate weekly change (7-day difference)
    SELECT weight_7day_ema INTO weekly_change
    FROM public.body_trends
    WHERE user_id = user_id_param
      AND calculation_date = measurement_date_param - INTERVAL '7 days'
    LIMIT 1;
    
    weekly_change := COALESCE(new_weight_ema - weekly_change, 0);
  END IF;

  -- Insert or update trend data
  INSERT INTO public.body_trends (
    user_id, 
    calculation_date, 
    weight_7day_ema, 
    weight_trend_direction, 
    weight_weekly_change_kg,
    body_fat_7day_ema,
    muscle_mass_7day_ema
  ) VALUES (
    user_id_param,
    measurement_date_param,
    new_weight_ema,
    trend_direction,
    weekly_change,
    new_body_fat_ema,
    new_muscle_mass_ema
  )
  ON CONFLICT (user_id, calculation_date) 
  DO UPDATE SET
    weight_7day_ema = EXCLUDED.weight_7day_ema,
    weight_trend_direction = EXCLUDED.weight_trend_direction,
    weight_weekly_change_kg = EXCLUDED.weight_weekly_change_kg,
    body_fat_7day_ema = EXCLUDED.body_fat_7day_ema,
    muscle_mass_7day_ema = EXCLUDED.muscle_mass_7day_ema;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically calculate trends when measurements are inserted/updated
CREATE OR REPLACE FUNCTION trigger_calculate_body_trends()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate trends for body_measurements
  IF TG_TABLE_NAME = 'body_measurements' THEN
    PERFORM calculate_body_trend_ema(
      NEW.user_id,
      NEW.measurement_date,
      NEW.weight_kg,
      NEW.body_fat_percentage,
      NEW.muscle_mass_kg
    );
  END IF;

  -- Calculate trends for body_weight (legacy table)
  IF TG_TABLE_NAME = 'body_weight' THEN
    PERFORM calculate_body_trend_ema(
      NEW.user_id,
      NEW.measured_at::date,
      NEW.weight_kg,
      NEW.body_fat_percentage,
      NEW.muscle_mass_kg
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to calculate trends automatically
CREATE TRIGGER calculate_trends_on_measurement_change
  AFTER INSERT OR UPDATE ON public.body_measurements
  FOR EACH ROW EXECUTE FUNCTION trigger_calculate_body_trends();

CREATE TRIGGER calculate_trends_on_weight_change
  AFTER INSERT OR UPDATE ON public.body_weight
  FOR EACH ROW EXECUTE FUNCTION trigger_calculate_body_trends();

-- Seed data: Sample body goals
INSERT INTO public.body_goals (
  user_id,
  goal_type,
  target_weight_kg,
  target_body_fat_percentage,
  target_date,
  weekly_rate_kg,
  is_active
) VALUES 
-- This is a placeholder - real user IDs will be used in production
('00000000-0000-0000-0000-000000000000'::uuid, 'weight_loss', 70.0, 15.0, CURRENT_DATE + INTERVAL '12 weeks', -0.5, false),
('00000000-0000-0000-0000-000000000000'::uuid, 'muscle_gain', 75.0, 12.0, CURRENT_DATE + INTERVAL '16 weeks', 0.25, false)
ON CONFLICT DO NOTHING;
-- Migration: Workout Program System
-- Description: Add workout programs, templates, user assignments, and personal records
-- Author: Claude Code
-- Date: 2025-01-13

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workout program templates
CREATE TABLE IF NOT EXISTS public.workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT,
  goal_type TEXT CHECK (goal_type IN ('strength', 'endurance', 'muscle_gain', 'fat_loss', 'general_fitness')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER CHECK (duration_weeks > 0 AND duration_weeks <= 52),
  sessions_per_week INTEGER CHECK (sessions_per_week > 0 AND sessions_per_week <= 7),
  equipment_required TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual workout templates within programs
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT,
  week_number INTEGER NOT NULL CHECK (week_number > 0),
  day_number INTEGER NOT NULL CHECK (day_number > 0 AND day_number <= 7),
  estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, week_number, day_number)
);

-- User's assigned programs
CREATE TABLE IF NOT EXISTS public.user_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_week INTEGER DEFAULT 1 CHECK (current_week > 0),
  current_day INTEGER DEFAULT 1 CHECK (current_day > 0 AND current_day <= 7),
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal records tracking
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL CHECK (length(trim(exercise_name)) > 0),
  record_type TEXT NOT NULL CHECK (record_type IN ('1rm', '3rm', '5rm', 'distance', 'time', 'reps')),
  value DECIMAL NOT NULL CHECK (value > 0),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lb', 'km', 'mi', 'seconds', 'minutes', 'reps')),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_programs_goal_type ON public.workout_programs(goal_type);
CREATE INDEX IF NOT EXISTS idx_workout_programs_experience ON public.workout_programs(experience_level);
CREATE INDEX IF NOT EXISTS idx_workout_programs_public ON public.workout_programs(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_workout_templates_program ON public.workout_templates(program_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_week_day ON public.workout_templates(program_id, week_number, day_number);
CREATE INDEX IF NOT EXISTS idx_user_programs_user ON public.user_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_programs_active ON public.user_programs(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_type ON public.personal_records(user_id, exercise_name, record_type);

-- RLS Policies

-- workout_programs
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public programs or their own" ON public.workout_programs
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can insert their own programs" ON public.workout_programs
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own programs" ON public.workout_programs
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own programs" ON public.workout_programs
  FOR DELETE USING (created_by = auth.uid());

-- workout_templates
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates for accessible programs" ON public.workout_templates
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.workout_programs wp 
    WHERE wp.id = program_id AND (wp.is_public = true OR wp.created_by = auth.uid())
  ));

CREATE POLICY "Users can manage templates for their programs" ON public.workout_templates
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.workout_programs wp 
    WHERE wp.id = program_id AND wp.created_by = auth.uid()
  ));

CREATE POLICY "Users can update templates for their programs" ON public.workout_templates
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.workout_programs wp 
    WHERE wp.id = program_id AND wp.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete templates for their programs" ON public.workout_templates
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.workout_programs wp 
    WHERE wp.id = program_id AND wp.created_by = auth.uid()
  ));

-- user_programs
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own assigned programs" ON public.user_programs
  FOR ALL USING (user_id = auth.uid());

-- personal_records
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own PRs" ON public.personal_records
  FOR ALL USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_programs_updated_at 
  BEFORE UPDATE ON public.workout_programs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at 
  BEFORE UPDATE ON public.workout_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_programs_updated_at 
  BEFORE UPDATE ON public.user_programs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_records_updated_at 
  BEFORE UPDATE ON public.personal_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data: Pre-built workout programs
INSERT INTO public.workout_programs (name, description, goal_type, experience_level, duration_weeks, sessions_per_week, equipment_required, created_by, is_public) VALUES
(
  'Beginner Full Body Strength',
  'A 12-week program designed for beginners to build foundational strength with basic compound movements.',
  'strength',
  'beginner',
  12,
  3,
  ARRAY['barbell', 'dumbbells', 'bench'],
  '00000000-0000-0000-0000-000000000000'::uuid,
  true
),
(
  'Intermediate Push/Pull/Legs',
  'A 16-week intermediate program focusing on muscle gain with a push/pull/legs split.',
  'muscle_gain',
  'intermediate',
  16,
  6,
  ARRAY['barbell', 'dumbbells', 'cable_machine', 'pull_up_bar'],
  '00000000-0000-0000-0000-000000000000'::uuid,
  true
),
(
  'Couch to 5K Running',
  'A 9-week program to take you from the couch to running a 5K.',
  'endurance',
  'beginner',
  9,
  3,
  ARRAY['running_shoes'],
  '00000000-0000-0000-0000-000000000000'::uuid,
  true
),
(
  'Advanced Powerlifting Prep',
  'A 20-week advanced powerlifting program to maximize squat, bench, and deadlift.',
  'strength',
  'advanced',
  20,
  4,
  ARRAY['barbell', 'squat_rack', 'bench', 'plates'],
  '00000000-0000-0000-0000-000000000000'::uuid,
  true
);

-- Seed data: Sample workout templates (Week 1 for each program)
DO $$
DECLARE
  program_ids UUID[];
BEGIN
  -- Get the program IDs we just inserted
  SELECT ARRAY(SELECT id FROM public.workout_programs WHERE is_public = true ORDER BY name) INTO program_ids;
  
  -- Beginner Full Body Strength - Week 1
  INSERT INTO public.workout_templates (program_id, name, description, week_number, day_number, estimated_duration_minutes, exercises) VALUES
  (program_ids[1], 'Full Body A', 'First full body workout focusing on major compound movements', 1, 1, 60, 
   '[
     {"name": "Squat", "sets": 3, "reps": "8-10", "rest_seconds": 120, "notes": "Focus on form"},
     {"name": "Bench Press", "sets": 3, "reps": "8-10", "rest_seconds": 120, "notes": "Control the weight"},
     {"name": "Bent-over Row", "sets": 3, "reps": "8-10", "rest_seconds": 120, "notes": "Squeeze shoulder blades"},
     {"name": "Overhead Press", "sets": 2, "reps": "8-10", "rest_seconds": 90, "notes": "Keep core tight"},
     {"name": "Plank", "sets": 3, "duration_seconds": 30, "rest_seconds": 60, "notes": "Hold position"}
   ]'::jsonb),
  (program_ids[1], 'Full Body B', 'Second full body workout with variation', 1, 3, 60,
   '[
     {"name": "Deadlift", "sets": 3, "reps": "5-8", "rest_seconds": 150, "notes": "Hip hinge movement"},
     {"name": "Incline Dumbbell Press", "sets": 3, "reps": "8-10", "rest_seconds": 120, "notes": "Control descent"},
     {"name": "Pull-ups/Lat Pulldown", "sets": 3, "reps": "6-10", "rest_seconds": 120, "notes": "Full range of motion"},
     {"name": "Dumbbell Shoulder Press", "sets": 2, "reps": "8-10", "rest_seconds": 90, "notes": "Seated or standing"},
     {"name": "Side Plank", "sets": 2, "duration_seconds": 20, "rest_seconds": 60, "notes": "Each side"}
   ]'::jsonb),
  (program_ids[1], 'Full Body C', 'Third full body workout completing the week', 1, 5, 60,
   '[
     {"name": "Goblet Squat", "sets": 3, "reps": "10-12", "rest_seconds": 90, "notes": "Dumbbell or kettlebell"},
     {"name": "Push-ups", "sets": 3, "reps": "8-15", "rest_seconds": 90, "notes": "Modified if needed"},
     {"name": "Seated Row", "sets": 3, "reps": "10-12", "rest_seconds": 90, "notes": "Squeeze at the end"},
     {"name": "Dumbbell Lunges", "sets": 2, "reps": "8-10", "rest_seconds": 90, "notes": "Each leg"},
     {"name": "Dead Bug", "sets": 2, "reps": "8-10", "rest_seconds": 60, "notes": "Core stability"}
   ]'::jsonb);

  -- Couch to 5K - Week 1
  INSERT INTO public.workout_templates (program_id, name, description, week_number, day_number, estimated_duration_minutes, exercises) VALUES
  (program_ids[3], 'Run/Walk Session 1', 'First running session with walk intervals', 1, 1, 30,
   '[
     {"name": "Warm-up Walk", "duration_minutes": 5, "intensity": "easy", "notes": "Prepare your body"},
     {"name": "Run/Walk Intervals", "sets": 8, "run_minutes": 1, "walk_minutes": 1.5, "notes": "Alternate running and walking"},
     {"name": "Cool-down Walk", "duration_minutes": 5, "intensity": "easy", "notes": "Gradually slow down"}
   ]'::jsonb),
  (program_ids[3], 'Run/Walk Session 2', 'Second running session', 1, 3, 30,
   '[
     {"name": "Warm-up Walk", "duration_minutes": 5, "intensity": "easy", "notes": "Prepare your body"},
     {"name": "Run/Walk Intervals", "sets": 8, "run_minutes": 1, "walk_minutes": 1.5, "notes": "Maintain steady pace"},
     {"name": "Cool-down Walk", "duration_minutes": 5, "intensity": "easy", "notes": "Stretch after"}
   ]'::jsonb),
  (program_ids[3], 'Run/Walk Session 3', 'Third running session of the week', 1, 5, 30,
   '[
     {"name": "Warm-up Walk", "duration_minutes": 5, "intensity": "easy", "notes": "Prepare your body"},
     {"name": "Run/Walk Intervals", "sets": 8, "run_minutes": 1, "walk_minutes": 1.5, "notes": "Focus on breathing"},
     {"name": "Cool-down Walk", "duration_minutes": 5, "intensity": "easy", "notes": "Well done!"}
   ]'::jsonb);
END $$;
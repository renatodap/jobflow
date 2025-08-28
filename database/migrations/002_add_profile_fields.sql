-- Migration: Add professional fields to profiles table
-- Run this in Supabase SQL editor after the initial schema

-- Add professional background fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_title TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS work_experience TEXT,
ADD COLUMN IF NOT EXISTS projects TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

-- Update applications status constraint to include all states
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'applied', 'interview', 'rejected', 'accepted'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON public.applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_score ON public.jobs(score DESC);

-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to search_settings table
DROP TRIGGER IF EXISTS update_search_settings_updated_at ON public.search_settings;
CREATE TRIGGER update_search_settings_updated_at 
BEFORE UPDATE ON public.search_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to applications table
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at 
BEFORE UPDATE ON public.applications 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
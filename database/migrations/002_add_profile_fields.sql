-- Migration 002: Add missing fields and tables for dashboard/account system
-- Safe to run multiple times - will only add what's missing

-- 1. Add missing fields to profiles table for dashboard compatibility
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_title TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS ai_notes TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 days'),
ADD COLUMN IF NOT EXISTS searches_remaining INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS search_active BOOLEAN DEFAULT FALSE;

-- 2. Create search_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.search_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    job_titles TEXT[] DEFAULT '{}',
    locations TEXT[] DEFAULT '{}',
    min_salary INTEGER DEFAULT 0,
    max_salary INTEGER,
    remote_only BOOLEAN DEFAULT FALSE,
    job_types TEXT[] DEFAULT '{full-time}',
    email_frequency TEXT DEFAULT 'daily' CHECK (email_frequency IN ('daily', 'twice_daily', 'weekly')),
    max_jobs_per_email INTEGER DEFAULT 20,
    include_resume BOOLEAN DEFAULT TRUE,
    include_cover_letter BOOLEAN DEFAULT TRUE,
    exclude_companies TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_hash TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT,
    requirements TEXT[],
    url TEXT,
    source TEXT,
    contract_type TEXT,
    category TEXT,
    days_old INTEGER,
    score INTEGER DEFAULT 0,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'interview', 'rejected', 'accepted')),
    applied_at TIMESTAMP WITH TIME ZONE,
    resume_version TEXT,
    cover_letter_generated BOOLEAN DEFAULT FALSE,
    notes TEXT,
    response_received BOOLEAN DEFAULT FALSE,
    response_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- 5. Add convenient views for dashboard - combines related data
CREATE OR REPLACE VIEW profile_summary AS
SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.email,
    p.phone,
    p.location,
    p.github_url,
    p.linkedin_url,
    p.portfolio_url,
    p.current_title,
    p.years_experience,
    p.ai_notes,
    p.approved,
    p.is_admin,
    p.subscription_status,
    -- Aggregate education into text field
    (SELECT string_agg(e.institution || ' - ' || e.degree || ' in ' || e.field_of_study, '; ' ORDER BY e.end_date DESC) 
     FROM public.education e WHERE e.user_id = p.user_id) as education_summary,
    -- Aggregate work experience into text field
    (SELECT string_agg(w.job_title || ' at ' || w.company, '; ' ORDER BY w.start_date DESC) 
     FROM public.work_experience w WHERE w.user_id = p.user_id) as work_summary,
    -- Aggregate projects into text field
    (SELECT string_agg(pr.name || ': ' || pr.description, '; ' ORDER BY pr.display_order) 
     FROM public.projects pr WHERE pr.user_id = p.user_id) as projects_summary,
    -- Aggregate skills into text field
    (SELECT string_agg(s.name, ', ' ORDER BY s.category, s.name) 
     FROM public.skills s WHERE s.user_id = p.user_id) as skills_summary,
    -- Aggregate certifications into text field
    (SELECT string_agg(c.name || ' (' || c.issuing_organization || ')', ', ' ORDER BY c.issue_date DESC) 
     FROM public.certifications c WHERE c.user_id = p.user_id) as certifications_summary,
    p.created_at,
    p.updated_at
FROM public.profiles p;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON public.applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_score ON public.jobs(score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_discovered_at ON public.jobs(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_settings_user_id ON public.search_settings(user_id);

-- 7. Enable Row Level Security
ALTER TABLE public.search_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
DO $$ 
BEGIN
    -- Policies for search_settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'search_settings' 
        AND policyname = 'Users can view own settings'
    ) THEN
        CREATE POLICY "Users can view own settings" ON public.search_settings
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'search_settings' 
        AND policyname = 'Users can update own settings'
    ) THEN
        CREATE POLICY "Users can update own settings" ON public.search_settings
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Policies for applications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'applications' 
        AND policyname = 'Users can view own applications'
    ) THEN
        CREATE POLICY "Users can view own applications" ON public.applications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'applications' 
        AND policyname = 'Users can manage own applications'
    ) THEN
        CREATE POLICY "Users can manage own applications" ON public.applications
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 9. Create or replace function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_search_settings_updated_at ON public.search_settings;
CREATE TRIGGER update_search_settings_updated_at
    BEFORE UPDATE ON public.search_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
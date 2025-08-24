-- JobFlow SaaS Database Schema
-- PostgreSQL/Supabase schema for multi-user support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    linkedin TEXT,
    github TEXT,
    website TEXT,
    
    -- Subscription info
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
    subscription_tier TEXT DEFAULT 'basic',
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 days'),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Usage tracking
    searches_remaining INTEGER DEFAULT 5, -- For trial users
    total_searches INTEGER DEFAULT 0,
    total_applications INTEGER DEFAULT 0,
    
    -- Admin fields
    approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profile data (JSON storage for flexibility)
CREATE TABLE public.profile_data (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Profile sections as JSONB
    strengths JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    technical_skills JSONB DEFAULT '{}'::jsonb,
    soft_skills JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    cold_outreach JSONB DEFAULT '{}'::jsonb,
    
    -- Validation
    has_fake_data BOOLEAN DEFAULT FALSE,
    last_validated TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table (user-specific job discoveries)
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Job details
    job_hash TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_min DECIMAL,
    salary_max DECIMAL,
    description TEXT,
    url TEXT,
    redirect_url TEXT,
    category TEXT,
    contract_type TEXT,
    
    -- Scoring and matching
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    score_breakdown JSONB,
    matching_skills JSONB,
    missing_skills JSONB,
    
    -- Status tracking
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    application_status TEXT DEFAULT 'not_applied',
    notes TEXT,
    
    -- Prevent duplicates per user
    UNIQUE(user_id, job_hash)
);

-- Applications table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    
    -- Generated materials
    resume_version TEXT,
    resume_content TEXT,
    resume_file_path TEXT,
    cover_letter_content TEXT,
    cover_letter_file_path TEXT,
    
    -- Outreach
    linkedin_message TEXT,
    cold_email TEXT,
    hiring_manager_research JSONB,
    
    -- Learning path
    learning_path_generated BOOLEAN DEFAULT FALSE,
    learning_path_content TEXT,
    skill_gaps JSONB,
    
    -- Application tracking
    applied_via TEXT, -- 'linkedin', 'company_site', 'email', etc
    application_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'applied', 'interviewing', 'rejected', 'accepted')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily searches table (track automated searches)
CREATE TABLE public.daily_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    search_date DATE DEFAULT CURRENT_DATE,
    queries_executed JSONB,
    total_jobs_found INTEGER DEFAULT 0,
    new_jobs_found INTEGER DEFAULT 0,
    high_score_jobs INTEGER DEFAULT 0,
    
    -- Email delivery
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_opened BOOLEAN DEFAULT FALSE,
    email_clicked BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE public.api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    api_name TEXT NOT NULL, -- 'openai', 'anthropic', 'adzuna', etc
    endpoint TEXT,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription events (Stripe webhooks)
CREATE TABLE public.subscription_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity log
CREATE TABLE public.admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id),
    details JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_score ON public.jobs(score DESC);
CREATE INDEX idx_jobs_discovered_at ON public.jobs(discovered_at DESC);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_daily_searches_user_date ON public.daily_searches(user_id, search_date);
CREATE INDEX idx_api_usage_user_created ON public.api_usage(user_id, created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile data" ON public.profile_data
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own applications" ON public.applications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own searches" ON public.daily_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own API usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Functions and Triggers

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_data_updated_at BEFORE UPDATE ON public.profile_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    status TEXT;
    trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT subscription_status, trial_ends_at 
    INTO status, trial_end
    FROM public.profiles
    WHERE id = user_id;
    
    -- Check if trial expired
    IF status = 'trial' AND trial_end < NOW() THEN
        UPDATE public.profiles
        SET subscription_status = 'expired'
        WHERE id = user_id;
        RETURN 'expired';
    END IF;
    
    RETURN status;
END;
$$ LANGUAGE plpgsql;

-- Function to track API usage
CREATE OR REPLACE FUNCTION track_api_usage(
    p_user_id UUID,
    p_api_name TEXT,
    p_endpoint TEXT,
    p_tokens INTEGER,
    p_cost DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.api_usage (user_id, api_name, endpoint, tokens_used, cost_usd)
    VALUES (p_user_id, p_api_name, p_endpoint, p_tokens, p_cost);
    
    -- Update user's total searches if it's a job search
    IF p_api_name = 'adzuna' THEN
        UPDATE public.profiles
        SET total_searches = total_searches + 1
        WHERE id = p_user_id;
        
        -- Decrement searches_remaining for trial users
        UPDATE public.profiles
        SET searches_remaining = GREATEST(0, searches_remaining - 1)
        WHERE id = p_user_id AND subscription_status = 'trial';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's remaining searches
CREATE OR REPLACE FUNCTION get_searches_remaining(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    status TEXT;
    remaining INTEGER;
BEGIN
    SELECT subscription_status, searches_remaining
    INTO status, remaining
    FROM public.profiles
    WHERE id = p_user_id;
    
    IF status = 'active' THEN
        RETURN 999999; -- Unlimited for paid users
    ELSE
        RETURN remaining;
    END IF;
END;
$$ LANGUAGE plpgsql;
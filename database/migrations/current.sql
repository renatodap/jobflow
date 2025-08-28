-- JobFlow User Profile Migration
-- This migration moves from profile.json to database-driven profiles
-- Run this AFTER the base schema.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (Core user information)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    
    -- Profile Status
    profile_complete BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- ============================================
-- JOB PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role Preferences
    desired_roles TEXT[] DEFAULT '{}',
    experience_level TEXT CHECK (experience_level IN ('Intern', 'Entry Level', 'Mid Level', 'Senior', 'Lead', 'Principal')),
    
    -- Salary Expectations
    min_salary INTEGER,
    max_salary INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    
    -- Location Preferences
    preferred_locations TEXT[] DEFAULT '{}',
    remote_preference TEXT CHECK (remote_preference IN ('Remote Only', 'Hybrid', 'On-site', 'No Preference')),
    willing_to_relocate BOOLEAN DEFAULT false,
    
    -- Work Preferences
    job_types TEXT[] DEFAULT '{}', -- Full-time, Part-time, Contract, Internship
    company_sizes TEXT[] DEFAULT '{}', -- Startup, Small, Medium, Large, Enterprise
    industries TEXT[] DEFAULT '{}', -- Tech, Finance, Healthcare, etc.
    
    -- Visa Status (Important for international candidates)
    work_authorization TEXT,
    requires_sponsorship BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================
-- EDUCATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Education Details
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    graduation_date DATE,
    gpa DECIMAL(3,2),
    max_gpa DECIMAL(3,2) DEFAULT 4.0,
    
    -- Additional Info
    honors TEXT[],
    relevant_coursework TEXT[],
    activities TEXT[],
    
    -- Order for display
    display_order INTEGER DEFAULT 0,
    is_current BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORK EXPERIENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS work_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Job Details
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    employment_type TEXT CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance')),
    location TEXT,
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    
    -- Description
    description TEXT,
    achievements TEXT[], -- Array of achievement bullets
    technologies_used TEXT[], -- Technologies/tools used in this role
    
    -- Order for display
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SKILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Skill Information
    category TEXT NOT NULL CHECK (category IN ('Programming Languages', 'Frameworks', 'Databases', 'Tools', 'Cloud', 'Soft Skills', 'Other')),
    name TEXT NOT NULL,
    proficiency TEXT CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    years_of_experience INTEGER,
    
    -- Metadata
    is_primary BOOLEAN DEFAULT false, -- Primary skills to highlight
    endorsements INTEGER DEFAULT 0, -- For future social features
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate skills
    UNIQUE(user_id, category, name)
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Project Details
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    role TEXT, -- Your role in the project
    
    -- Links
    project_url TEXT,
    github_url TEXT,
    demo_url TEXT,
    
    -- Technical Details
    technologies TEXT[], -- Technologies used
    key_features TEXT[], -- Key features/achievements
    
    -- Duration
    start_date DATE,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT false,
    
    -- Visibility
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CERTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Certification Details
    name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GENERATED MATERIALS TABLE (Store generated resumes/covers)
-- ============================================
CREATE TABLE IF NOT EXISTS generated_materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Material Details
    material_type TEXT NOT NULL CHECK (material_type IN ('resume', 'cover_letter', 'linkedin_message', 'email_template')),
    job_id TEXT, -- Reference to job this was generated for
    company_name TEXT,
    job_title TEXT,
    
    -- Content
    content TEXT NOT NULL,
    version TEXT, -- e.g., 'backend', 'frontend', 'ml', etc.
    
    -- Metadata
    ai_model_used TEXT,
    generation_cost DECIMAL(10,4), -- Track API costs
    quality_score INTEGER, -- AI self-assessment score
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days') -- Auto-cleanup old materials
);

-- ============================================
-- PROFILE COMPLETENESS VIEW
-- ============================================
CREATE OR REPLACE VIEW profile_completeness AS
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    CASE 
        WHEN p.full_name IS NOT NULL 
        AND p.email IS NOT NULL 
        AND EXISTS (SELECT 1 FROM education e WHERE e.user_id = p.user_id)
        AND EXISTS (SELECT 1 FROM work_experience w WHERE w.user_id = p.user_id)
        AND EXISTS (SELECT 1 FROM skills s WHERE s.user_id = p.user_id)
        AND EXISTS (SELECT 1 FROM job_preferences j WHERE j.user_id = p.user_id)
        THEN true
        ELSE false
    END as is_complete,
    (
        CASE WHEN p.full_name IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN p.phone IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN p.location IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM education e WHERE e.user_id = p.user_id) THEN 2 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM work_experience w WHERE w.user_id = p.user_id) THEN 2 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM skills s WHERE s.user_id = p.user_id LIMIT 5) THEN 2 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM projects pr WHERE pr.user_id = p.user_id) THEN 1 ELSE 0 END +
        CASE WHEN EXISTS (SELECT 1 FROM job_preferences j WHERE j.user_id = p.user_id) THEN 1 ELSE 0 END
    ) * 10 as completeness_score -- Score out of 100
FROM profiles p;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_job_preferences_user_id ON job_preferences(user_id);
CREATE INDEX idx_generated_materials_user_id ON generated_materials(user_id);
CREATE INDEX idx_generated_materials_created_at ON generated_materials(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_materials ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Education: Users can only manage their own education
CREATE POLICY "Users can view own education" ON education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own education" ON education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON education FOR DELETE USING (auth.uid() = user_id);

-- Work Experience: Users can only manage their own experience
CREATE POLICY "Users can view own experience" ON work_experience FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own experience" ON work_experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experience" ON work_experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experience" ON work_experience FOR DELETE USING (auth.uid() = user_id);

-- Skills: Users can only manage their own skills
CREATE POLICY "Users can view own skills" ON skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skills" ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON skills FOR DELETE USING (auth.uid() = user_id);

-- Projects: Users can only manage their own projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Certifications: Users can only manage their own certifications
CREATE POLICY "Users can view own certifications" ON certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certifications" ON certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certifications" ON certifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own certifications" ON certifications FOR DELETE USING (auth.uid() = user_id);

-- Job Preferences: Users can only manage their own preferences
CREATE POLICY "Users can view own preferences" ON job_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON job_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON job_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Generated Materials: Users can only see their own generated content
CREATE POLICY "Users can view own materials" ON generated_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materials" ON generated_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON generated_materials FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get complete user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    profile_json JSON;
BEGIN
    SELECT json_build_object(
        'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.user_id = user_uuid),
        'preferences', (SELECT row_to_json(j) FROM job_preferences j WHERE j.user_id = user_uuid),
        'education', (SELECT json_agg(e ORDER BY e.display_order) FROM education e WHERE e.user_id = user_uuid),
        'experience', (SELECT json_agg(w ORDER BY w.start_date DESC) FROM work_experience w WHERE w.user_id = user_uuid),
        'skills', (SELECT json_agg(s ORDER BY s.category, s.name) FROM skills s WHERE s.user_id = user_uuid),
        'projects', (SELECT json_agg(p ORDER BY p.display_order) FROM projects p WHERE p.user_id = user_uuid),
        'certifications', (SELECT json_agg(c ORDER BY c.issue_date DESC) FROM certifications c WHERE c.user_id = user_uuid)
    ) INTO profile_json;
    
    RETURN profile_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_preferences_updated_at BEFORE UPDATE ON job_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA MIGRATION (from profile.json)
-- ============================================
-- Uncomment and modify this section to migrate existing profile.json data

/*
-- Example migration for Renato's profile
INSERT INTO profiles (user_id, full_name, email, phone, location, github_url, linkedin_url)
VALUES (
    'YOUR_USER_ID_HERE',
    'Renato Dap',
    'renatodapapplications@gmail.com',
    '+1 (812) 262-8002',
    'Indiana, USA',
    'https://github.com/renatodap',
    'https://linkedin.com/in/renato-prado-82513b297'
);

INSERT INTO job_preferences (user_id, desired_roles, experience_level, min_salary, max_salary, preferred_locations, remote_preference, job_types)
VALUES (
    'YOUR_USER_ID_HERE',
    ARRAY['Software Engineer', 'AI Engineer', 'Full Stack Developer'],
    'Entry Level',
    40000,
    150000,
    ARRAY['San Francisco', 'New York', 'Remote'],
    'No Preference',
    ARRAY['Full-time', 'Internship']
);
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- After running this migration:
-- 1. All user profile data will be stored in the database
-- 2. Each user can have a complete profile with education, experience, skills, etc.
-- 3. Row Level Security ensures users can only access their own data
-- 4. The get_user_profile() function returns complete profile as JSON
-- 5. Generated materials are automatically cleaned up after 30 days
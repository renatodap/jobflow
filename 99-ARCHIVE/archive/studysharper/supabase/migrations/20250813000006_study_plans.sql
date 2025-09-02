-- Study Plans and Scheduling System

-- Study plans table
CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    study_hours_per_day DECIMAL(3,1) DEFAULT 3.0,
    preferred_time_slots JSONB DEFAULT '[]', -- Array of {start: "09:00", end: "11:00"}
    focus_subjects UUID[] DEFAULT '{}', -- Array of subject IDs to focus on
    difficulty_weights JSONB DEFAULT '{}', -- {subject_id: weight} for time allocation
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    generation_params JSONB DEFAULT '{}', -- Parameters used for AI generation
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table (individual study blocks)
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    session_type TEXT DEFAULT 'study' CHECK (session_type IN ('study', 'review', 'practice', 'exam_prep', 'break')),
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60
    ) STORED,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    topics TEXT[], -- Specific topics to cover
    materials UUID[], -- References to content_sources
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped', 'rescheduled')),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    effectiveness_rating INT CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study goals table
CREATE TABLE IF NOT EXISTS study_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('completion', 'mastery', 'time_based', 'score_based')),
    target_value DECIMAL(10,2) NOT NULL, -- Could be percentage, hours, or score
    current_value DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study progress tracking
CREATE TABLE IF NOT EXISTS study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    duration_minutes INT NOT NULL,
    topics_covered TEXT[],
    progress_type TEXT DEFAULT 'study' CHECK (progress_type IN ('study', 'review', 'practice', 'exam')),
    confidence_level INT CHECK (confidence_level >= 1 AND confidence_level <= 5),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study recommendations (AI-generated suggestions)
CREATE TABLE IF NOT EXISTS study_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('schedule_adjustment', 'topic_focus', 'break_suggestion', 'review_needed', 'resource_suggestion')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_data JSONB DEFAULT '{}', -- Specific data for implementing the recommendation
    valid_until DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    applied_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_status ON study_plans(status);
CREATE INDEX IF NOT EXISTS idx_study_plans_dates ON study_plans(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_study_sessions_plan_id ON study_sessions(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_scheduled_date ON study_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_status ON study_sessions(status);

CREATE INDEX IF NOT EXISTS idx_study_goals_plan_id ON study_goals(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_goals_status ON study_goals(status);

CREATE INDEX IF NOT EXISTS idx_study_progress_user_id ON study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_date ON study_progress(date);
CREATE INDEX IF NOT EXISTS idx_study_progress_subject_id ON study_progress(subject_id);

CREATE INDEX IF NOT EXISTS idx_study_recommendations_user_id ON study_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_study_recommendations_plan_id ON study_recommendations(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_recommendations_status ON study_recommendations(status);

-- Enable RLS
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own study plans" ON study_plans;
CREATE POLICY "Users can manage own study plans" ON study_plans
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own study sessions" ON study_sessions;
CREATE POLICY "Users can manage own study sessions" ON study_sessions
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM study_plans WHERE study_plans.id = study_sessions.plan_id
        )
    );

DROP POLICY IF EXISTS "Users can manage own study goals" ON study_goals;
CREATE POLICY "Users can manage own study goals" ON study_goals
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM study_plans WHERE study_plans.id = study_goals.plan_id
        )
    );

DROP POLICY IF EXISTS "Users can manage own study progress" ON study_progress;
CREATE POLICY "Users can manage own study progress" ON study_progress
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own study recommendations" ON study_recommendations;
CREATE POLICY "Users can manage own study recommendations" ON study_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- Function to calculate study statistics
CREATE OR REPLACE FUNCTION calculate_study_stats(p_user_id UUID)
RETURNS TABLE (
    total_study_time_minutes INT,
    average_daily_minutes DECIMAL(10,2),
    subjects_studied INT,
    sessions_completed INT,
    current_streak_days INT,
    longest_streak_days INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH study_data AS (
        SELECT 
            date,
            SUM(duration_minutes) as daily_minutes
        FROM study_progress
        WHERE user_id = p_user_id
        GROUP BY date
        ORDER BY date DESC
    ),
    streak_data AS (
        SELECT 
            date,
            date - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY date) as streak_group
        FROM study_data
        WHERE daily_minutes > 0
    ),
    streaks AS (
        SELECT 
            MIN(date) as start_date,
            MAX(date) as end_date,
            COUNT(*) as streak_length
        FROM streak_data
        GROUP BY streak_group
    )
    SELECT 
        COALESCE(SUM(sp.duration_minutes), 0)::INT as total_study_time_minutes,
        COALESCE(AVG(sd.daily_minutes), 0)::DECIMAL(10,2) as average_daily_minutes,
        COUNT(DISTINCT sp.subject_id)::INT as subjects_studied,
        COUNT(DISTINCT ss.id)::INT as sessions_completed,
        COALESCE(
            CASE 
                WHEN MAX(s.end_date) = CURRENT_DATE OR MAX(s.end_date) = CURRENT_DATE - INTERVAL '1 day'
                THEN MAX(CASE WHEN s.end_date >= CURRENT_DATE - INTERVAL '1 day' THEN s.streak_length ELSE 0 END)
                ELSE 0
            END, 0
        )::INT as current_streak_days,
        COALESCE(MAX(s.streak_length), 0)::INT as longest_streak_days
    FROM study_progress sp
    LEFT JOIN study_sessions ss ON ss.id = sp.session_id AND ss.status = 'completed'
    LEFT JOIN study_data sd ON TRUE
    LEFT JOIN streaks s ON TRUE
    WHERE sp.user_id = p_user_id;
END;
$$;

-- Function to generate optimal study schedule
CREATE OR REPLACE FUNCTION generate_study_schedule(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_hours_per_day DECIMAL,
    p_subject_ids UUID[]
)
RETURNS TABLE (
    session_date DATE,
    subject_id UUID,
    recommended_duration_minutes INT,
    recommended_time_slot TEXT,
    priority TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- This is a placeholder for the actual AI-powered scheduling logic
    -- The real implementation would use more sophisticated algorithms
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date as study_date
    ),
    subject_rotation AS (
        SELECT 
            unnest(p_subject_ids) as subject_id,
            random() as weight
    )
    SELECT 
        ds.study_date as session_date,
        sr.subject_id,
        LEAST(90, (p_hours_per_day * 60 / array_length(p_subject_ids, 1))::INT) as recommended_duration_minutes,
        '09:00-10:30' as recommended_time_slot,
        CASE 
            WHEN extract(dow from ds.study_date) IN (0, 6) THEN 'low'
            ELSE 'medium'
        END as priority
    FROM date_series ds
    CROSS JOIN subject_rotation sr
    ORDER BY ds.study_date, sr.weight DESC;
END;
$$;

-- Update triggers
CREATE OR REPLACE FUNCTION update_study_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_study_plans_updated_at ON study_plans;
CREATE TRIGGER update_study_plans_updated_at 
    BEFORE UPDATE ON study_plans
    FOR EACH ROW EXECUTE FUNCTION update_study_plans_updated_at();

DROP TRIGGER IF EXISTS update_study_sessions_updated_at ON study_sessions;
CREATE TRIGGER update_study_sessions_updated_at 
    BEFORE UPDATE ON study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_study_plans_updated_at();

DROP TRIGGER IF EXISTS update_study_goals_updated_at ON study_goals;
CREATE TRIGGER update_study_goals_updated_at 
    BEFORE UPDATE ON study_goals
    FOR EACH ROW EXECUTE FUNCTION update_study_plans_updated_at();

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_study_stats TO authenticated;
GRANT EXECUTE ON FUNCTION generate_study_schedule TO authenticated;
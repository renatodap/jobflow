-- AI Coaching System Migration
-- Comprehensive AI coaching with user insights, recommendations, and chat history

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Create AI coaching conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  context TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI messages table
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model_used TEXT,
  citations JSONB DEFAULT '[]',
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user insights table for AI analysis
CREATE TABLE IF NOT EXISTS public.user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'workout_pattern', 'nutrition_trend', 'recovery_status', 
    'goal_progress', 'consistency', 'performance_trend',
    'body_composition', 'sleep_quality', 'stress_level'
  )),
  insight_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  data_points_used INTEGER,
  recommendations JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coaching recommendations table
CREATE TABLE IF NOT EXISTS public.coaching_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
    'workout_adjustment', 'nutrition_guidance', 'recovery_protocol',
    'goal_adjustment', 'habit_formation', 'supplement_advice',
    'technique_improvement', 'program_change', 'lifestyle_adjustment'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reasoning TEXT,
  expected_outcome TEXT,
  action_items JSONB DEFAULT '[]',
  is_accepted BOOLEAN,
  is_completed BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  feedback TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coaching check-ins table
CREATE TABLE IF NOT EXISTS public.coaching_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_type TEXT NOT NULL CHECK (check_in_type IN (
    'daily', 'weekly', 'biweekly', 'monthly', 'milestone', 'custom'
  )),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  recovery_status INTEGER CHECK (recovery_status BETWEEN 1 AND 10),
  adherence_percentage INTEGER CHECK (adherence_percentage BETWEEN 0 AND 100),
  goals_on_track BOOLEAN,
  notes TEXT,
  coach_response TEXT,
  adjustments_made JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create knowledge base table for RAG
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN (
    'exercise_technique', 'nutrition_science', 'recovery_protocols',
    'program_design', 'injury_prevention', 'supplement_guide',
    'physiology', 'psychology', 'lifestyle', 'faq'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  author TEXT,
  credibility_score DECIMAL(3,2) CHECK (credibility_score BETWEEN 0 AND 1),
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536), -- OpenAI embedding dimension
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user preferences for AI coaching
CREATE TABLE IF NOT EXISTS public.ai_coaching_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coaching_style TEXT CHECK (coaching_style IN (
    'motivational', 'analytical', 'supportive', 'direct', 'educational'
  )) DEFAULT 'supportive',
  communication_frequency TEXT CHECK (communication_frequency IN (
    'minimal', 'daily', 'few_times_week', 'weekly', 'on_demand'
  )) DEFAULT 'few_times_week',
  focus_areas TEXT[] DEFAULT '{}',
  avoid_topics TEXT[] DEFAULT '{}',
  preferred_check_in_time TIME,
  timezone TEXT DEFAULT 'UTC',
  enable_push_notifications BOOLEAN DEFAULT TRUE,
  enable_email_summaries BOOLEAN DEFAULT TRUE,
  ai_personality_traits JSONB DEFAULT '{"humor": 0.5, "strictness": 0.5, "detail": 0.7, "empathy": 0.8}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coaching analytics table
CREATE TABLE IF NOT EXISTS public.coaching_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  engagement_score DECIMAL(3,2) CHECK (engagement_score BETWEEN 0 AND 1),
  recommendation_acceptance_rate DECIMAL(3,2),
  goal_achievement_rate DECIMAL(3,2),
  consistency_score DECIMAL(3,2),
  improvement_velocity DECIMAL(5,2),
  chat_interactions INTEGER DEFAULT 0,
  recommendations_generated INTEGER DEFAULT 0,
  recommendations_completed INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Create indexes for performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_last_message ON public.ai_conversations(last_message_at DESC);
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON public.ai_messages(created_at DESC);
CREATE INDEX idx_user_insights_user_id ON public.user_insights(user_id);
CREATE INDEX idx_user_insights_type ON public.user_insights(insight_type);
CREATE INDEX idx_user_insights_active ON public.user_insights(is_active);
CREATE INDEX idx_coaching_recommendations_user ON public.coaching_recommendations(user_id);
CREATE INDEX idx_coaching_recommendations_priority ON public.coaching_recommendations(priority);
CREATE INDEX idx_coaching_check_ins_user ON public.coaching_check_ins(user_id);
CREATE INDEX idx_coaching_check_ins_created ON public.coaching_check_ins(created_at DESC);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_knowledge_base_embedding ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_coaching_analytics_user_date ON public.coaching_analytics(user_id, metric_date DESC);

-- RLS Policies
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_analytics ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.ai_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.ai_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view own insights" ON public.user_insights
  FOR SELECT USING (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view own recommendations" ON public.coaching_recommendations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON public.coaching_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins" ON public.coaching_check_ins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own check-ins" ON public.coaching_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON public.coaching_check_ins
  FOR UPDATE USING (auth.uid() = user_id);

-- Knowledge base is public read
CREATE POLICY "Knowledge base is public" ON public.knowledge_base
  FOR SELECT USING (true);

-- Preferences policies
CREATE POLICY "Users can view own preferences" ON public.ai_coaching_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own preferences" ON public.ai_coaching_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.ai_coaching_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON public.coaching_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Function to generate user insights
CREATE OR REPLACE FUNCTION generate_user_insights(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  workout_count INTEGER;
  avg_calories DECIMAL;
  weight_trend TEXT;
  consistency_pct DECIMAL;
BEGIN
  -- Get workout statistics
  SELECT COUNT(*), AVG(calories_burned)
  INTO workout_count, avg_calories
  FROM public.workouts
  WHERE user_id = user_id_param
    AND date >= CURRENT_DATE - INTERVAL '30 days';

  -- Get weight trend
  SELECT 
    CASE 
      WHEN weight_trend_direction = 'gaining' THEN 'gaining'
      WHEN weight_trend_direction = 'losing' THEN 'losing'
      ELSE 'stable'
    END
  INTO weight_trend
  FROM public.body_trends
  WHERE user_id = user_id_param
  ORDER BY calculation_date DESC
  LIMIT 1;

  -- Calculate consistency
  consistency_pct := LEAST(100, (workout_count::DECIMAL / 20) * 100);

  -- Insert workout pattern insight
  IF workout_count > 0 THEN
    INSERT INTO public.user_insights (
      user_id, insight_type, insight_text, confidence_score, data_points_used
    ) VALUES (
      user_id_param,
      'workout_pattern',
      'You completed ' || workout_count || ' workouts in the last 30 days, averaging ' || 
      COALESCE(ROUND(avg_calories, 0)::TEXT, 'unknown') || ' calories per session.',
      0.85,
      workout_count
    );
  END IF;

  -- Insert consistency insight
  INSERT INTO public.user_insights (
    user_id, insight_type, insight_text, confidence_score, data_points_used
  ) VALUES (
    user_id_param,
    'consistency',
    'Your workout consistency is at ' || ROUND(consistency_pct, 0) || '% over the past month.',
    0.90,
    30
  );

  -- Insert body composition insight if available
  IF weight_trend IS NOT NULL THEN
    INSERT INTO public.user_insights (
      user_id, insight_type, insight_text, confidence_score, data_points_used
    ) VALUES (
      user_id_param,
      'body_composition',
      'Your weight trend is currently ' || weight_trend || ' based on recent measurements.',
      0.80,
      7
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate coaching analytics
CREATE OR REPLACE FUNCTION calculate_coaching_analytics(user_id_param UUID, date_param DATE)
RETURNS VOID AS $$
DECLARE
  engagement DECIMAL;
  acceptance_rate DECIMAL;
  completion_rate DECIMAL;
  chat_count INTEGER;
  rec_generated INTEGER;
  rec_completed INTEGER;
BEGIN
  -- Calculate engagement (based on check-ins and messages)
  SELECT 
    LEAST(1.0, COUNT(*)::DECIMAL / 7)
  INTO engagement
  FROM public.coaching_check_ins
  WHERE user_id = user_id_param
    AND created_at >= date_param - INTERVAL '7 days'
    AND created_at < date_param + INTERVAL '1 day';

  -- Calculate recommendation acceptance rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE is_accepted = true)::DECIMAL / COUNT(*)
      ELSE 0
    END
  INTO acceptance_rate
  FROM public.coaching_recommendations
  WHERE user_id = user_id_param
    AND created_at >= date_param - INTERVAL '30 days'
    AND created_at < date_param + INTERVAL '1 day';

  -- Calculate completion rate
  SELECT 
    COUNT(*) FILTER (WHERE is_completed = true),
    COUNT(*)
  INTO rec_completed, rec_generated
  FROM public.coaching_recommendations
  WHERE user_id = user_id_param
    AND created_at >= date_param - INTERVAL '30 days'
    AND created_at < date_param + INTERVAL '1 day';

  completion_rate := CASE 
    WHEN rec_generated > 0 THEN rec_completed::DECIMAL / rec_generated
    ELSE 0
  END;

  -- Count chat interactions
  SELECT COUNT(*)
  INTO chat_count
  FROM public.ai_messages
  WHERE user_id = user_id_param
    AND created_at >= date_param
    AND created_at < date_param + INTERVAL '1 day';

  -- Upsert analytics
  INSERT INTO public.coaching_analytics (
    user_id, metric_date, engagement_score, recommendation_acceptance_rate,
    goal_achievement_rate, chat_interactions, recommendations_generated,
    recommendations_completed
  ) VALUES (
    user_id_param, date_param, engagement, acceptance_rate,
    completion_rate, chat_count, rec_generated, rec_completed
  )
  ON CONFLICT (user_id, metric_date) 
  DO UPDATE SET
    engagement_score = EXCLUDED.engagement_score,
    recommendation_acceptance_rate = EXCLUDED.recommendation_acceptance_rate,
    goal_achievement_rate = EXCLUDED.goal_achievement_rate,
    chat_interactions = EXCLUDED.chat_interactions,
    recommendations_generated = EXCLUDED.recommendations_generated,
    recommendations_completed = EXCLUDED.recommendations_completed,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation metadata on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_conversations
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Seed initial knowledge base entries
INSERT INTO public.knowledge_base (category, title, content, source, credibility_score, tags) VALUES
('exercise_technique', 'Progressive Overload Principles', 'Progressive overload is the gradual increase of stress placed upon the body during exercise training. Key methods include: increasing weight, increasing reps, increasing sets, decreasing rest time, improving form, and increasing time under tension.', 'NSCA Guidelines', 0.95, ARRAY['strength', 'progression', 'fundamentals']),
('nutrition_science', 'Protein Requirements for Athletes', 'Athletes require 1.6-2.2g of protein per kg of body weight for optimal muscle protein synthesis. Distribution throughout the day (20-40g per meal) is more effective than single large doses.', 'International Society of Sports Nutrition', 0.90, ARRAY['protein', 'macros', 'recovery']),
('recovery_protocols', 'Sleep and Recovery', 'Sleep is crucial for recovery. Athletes should aim for 7-9 hours per night. Key factors: consistent sleep schedule, cool room (60-67°F), darkness, and avoiding screens 1 hour before bed.', 'Sleep Foundation', 0.85, ARRAY['sleep', 'recovery', 'performance']),
('program_design', 'Periodization Basics', 'Periodization involves systematic planning of athletic training. Macrocycle (annual plan), Mesocycle (3-6 weeks), Microcycle (typically 1 week). Phases: Preparatory, Competition, Transition.', 'Tudor Bompa Training Theory', 0.90, ARRAY['programming', 'planning', 'periodization']),
('injury_prevention', 'Warm-up Protocol', 'Effective warm-up: 5-10 min general cardio, dynamic stretching, movement-specific preparation, gradually increasing intensity. Reduces injury risk by 30-50%.', 'Sports Medicine Research', 0.88, ARRAY['warmup', 'injury-prevention', 'preparation']);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
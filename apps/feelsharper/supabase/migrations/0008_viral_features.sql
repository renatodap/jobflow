-- Viral Features Migration
-- Squads, challenges, leaderboards, and sharing infrastructure

-- Create squads table
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT,
  join_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 15,
  is_public BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create squad members table
CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  streak_days INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  total_calories INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- Create squad posts table
CREATE TABLE IF NOT EXISTS public.squad_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN (
    'milestone', 'pr', 'check_in', 'challenge', 'encouragement', 
    'weekly_recap', 'photo', 'achievement'
  )),
  content TEXT,
  payload JSONB DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create squad post reactions table
CREATE TABLE IF NOT EXISTS public.squad_post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.squad_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'fire', 'strong', 'celebrate', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'consistency', 'volume', 'distance', 'calories', 'protein', 
    'steps', 'sleep', 'weight_loss', 'muscle_gain', 'custom'
  )),
  metric TEXT NOT NULL,
  target_value DECIMAL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  rules JSONB DEFAULT '{}',
  prizes JSONB DEFAULT '[]',
  badge_icon TEXT,
  badge_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT challenge_dates CHECK (end_date > start_date)
);

-- Create challenge participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  current_value DECIMAL DEFAULT 0,
  best_value DECIMAL DEFAULT 0,
  rank INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_update TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  score DECIMAL NOT NULL,
  rank INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  achievements JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create user referrals table
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'activated', 'expired')) DEFAULT 'pending',
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_id)
);

-- Create share events table for analytics
CREATE TABLE IF NOT EXISTS public.share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN (
    'progress_card', 'achievement', 'challenge', 'squad_invite', 
    'workout', 'pr', 'streak', 'transformation'
  )),
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'facebook', 'whatsapp', 'link', 'other')),
  content_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievement badges table
CREATE TABLE IF NOT EXISTS public.achievement_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'consistency', 'strength', 'endurance', 'nutrition', 
    'community', 'milestone', 'special', 'seasonal'
  )),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  requirements JSONB NOT NULL,
  points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.achievement_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress DECIMAL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- Create streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN (
    'daily_login', 'workout', 'nutrition', 'weight', 
    'sleep', 'meditation', 'steps', 'water'
  )),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Add referral code to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS showcase_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_share_strava BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS squad_privacy TEXT CHECK (squad_privacy IN ('public', 'friends', 'private')) DEFAULT 'friends';

-- Create indexes for performance
CREATE INDEX idx_squads_join_code ON public.squads(join_code);
CREATE INDEX idx_squads_owner ON public.squads(owner_id);
CREATE INDEX idx_squad_members_squad ON public.squad_members(squad_id);
CREATE INDEX idx_squad_members_user ON public.squad_members(user_id);
CREATE INDEX idx_squad_posts_squad ON public.squad_posts(squad_id);
CREATE INDEX idx_squad_posts_created ON public.squad_posts(created_at DESC);
CREATE INDEX idx_challenges_dates ON public.challenges(start_date, end_date);
CREATE INDEX idx_challenges_slug ON public.challenges(slug);
CREATE INDEX idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);
CREATE INDEX idx_leaderboards_challenge_rank ON public.leaderboards(challenge_id, rank);
CREATE INDEX idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX idx_share_events_user ON public.share_events(user_id);
CREATE INDEX idx_share_events_type ON public.share_events(share_type);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_user_streaks_user_type ON public.user_streaks(user_id, streak_type);

-- RLS Policies
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Squad policies
CREATE POLICY "Public squads are viewable by all" ON public.squads
  FOR SELECT USING (is_public = true OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.squad_members WHERE squad_id = squads.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create squads" ON public.squads
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Squad owners can update" ON public.squads
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Squad owners can delete" ON public.squads
  FOR DELETE USING (auth.uid() = owner_id);

-- Squad member policies
CREATE POLICY "Squad members can view their squad" ON public.squad_members
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.squad_members sm WHERE sm.squad_id = squad_members.squad_id AND sm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join squads" ON public.squad_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave squads" ON public.squad_members
  FOR DELETE USING (auth.uid() = user_id);

-- Squad post policies
CREATE POLICY "Squad members can view posts" ON public.squad_posts
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.squad_members WHERE squad_id = squad_posts.squad_id AND user_id = auth.uid()
  ));

CREATE POLICY "Squad members can create posts" ON public.squad_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.squad_members WHERE squad_id = squad_posts.squad_id AND user_id = auth.uid()
  ));

-- Challenge policies
CREATE POLICY "Public challenges are viewable" ON public.challenges
  FOR SELECT USING (is_public = true OR created_by = auth.uid() OR squad_id IN (
    SELECT squad_id FROM public.squad_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Leaderboard policies (public read for public challenges)
CREATE POLICY "Public leaderboards are viewable" ON public.leaderboards
  FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can view own streaks" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(
  user_id_param UUID,
  streak_type_param TEXT,
  activity_date DATE DEFAULT CURRENT_DATE
) RETURNS VOID AS $$
DECLARE
  last_date DATE;
  current INTEGER;
  longest INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO last_date, current, longest
  FROM public.user_streaks
  WHERE user_id = user_id_param AND streak_type = streak_type_param;

  IF NOT FOUND THEN
    -- Create new streak
    INSERT INTO public.user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date, total_days)
    VALUES (user_id_param, streak_type_param, 1, 1, activity_date, 1);
  ELSIF last_date = activity_date THEN
    -- Already logged today, do nothing
    RETURN;
  ELSIF last_date = activity_date - INTERVAL '1 day' THEN
    -- Continue streak
    current := current + 1;
    longest := GREATEST(longest, current);
    
    UPDATE public.user_streaks
    SET current_streak = current,
        longest_streak = longest,
        last_activity_date = activity_date,
        total_days = total_days + 1,
        updated_at = NOW()
    WHERE user_id = user_id_param AND streak_type = streak_type_param;
  ELSE
    -- Streak broken, restart
    UPDATE public.user_streaks
    SET current_streak = 1,
        last_activity_date = activity_date,
        total_days = total_days + 1,
        updated_at = NOW()
    WHERE user_id = user_id_param AND streak_type = streak_type_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update challenge participant score
CREATE OR REPLACE FUNCTION update_challenge_score(
  challenge_id_param UUID,
  user_id_param UUID,
  new_value DECIMAL
) RETURNS VOID AS $$
BEGIN
  UPDATE public.challenge_participants
  SET current_value = new_value,
      best_value = GREATEST(best_value, new_value),
      last_update = NOW()
  WHERE challenge_id = challenge_id_param AND user_id = user_id_param;

  -- Update leaderboard
  UPDATE public.leaderboards
  SET score = new_value,
      updated_at = NOW()
  WHERE challenge_id = challenge_id_param AND user_id = user_id_param;

  -- Recalculate ranks
  WITH ranked AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY score DESC) as new_rank
    FROM public.leaderboards
    WHERE challenge_id = challenge_id_param
  )
  UPDATE public.leaderboards l
  SET rank = r.new_rank
  FROM ranked r
  WHERE l.challenge_id = challenge_id_param AND l.user_id = r.user_id;
END;
$$ LANGUAGE plpgsql;

-- Seed initial badges
INSERT INTO public.achievement_badges (slug, name, description, category, icon, color, requirements, points) VALUES
('first_workout', 'First Workout', 'Complete your first workout', 'milestone', '💪', '#10B981', '{"workouts": 1}', 10),
('week_warrior', 'Week Warrior', 'Work out 5 times in a week', 'consistency', '🗓️', '#3B82F6', '{"workouts_per_week": 5}', 25),
('protein_pro', 'Protein Pro', 'Hit protein goal 7 days straight', 'nutrition', '🥩', '#F59E0B', '{"protein_streak": 7}', 20),
('early_bird', 'Early Bird', 'Complete 10 workouts before 8 AM', 'consistency', '🌅', '#8B5CF6', '{"morning_workouts": 10}', 30),
('squad_leader', 'Squad Leader', 'Create and maintain an active squad', 'community', '👥', '#EC4899', '{"squad_members": 5}', 50),
('centurion', 'Centurion', 'Complete 100 workouts', 'milestone', '💯', '#EF4444', '{"total_workouts": 100}', 100),
('consistency_king', 'Consistency King', '30-day workout streak', 'consistency', '👑', '#F97316', '{"workout_streak": 30}', 75),
('transformation', 'Transformation', 'Achieve a 10% body change', 'milestone', '🦋', '#06B6D4', '{"body_change_percent": 10}', 100);

-- Seed initial challenges
INSERT INTO public.challenges (slug, name, description, challenge_type, metric, start_date, end_date, created_by) VALUES
('january-consistency', 'January Consistency Challenge', 'Work out at least 20 times this month', 'consistency', 'workouts', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', (SELECT id FROM auth.users LIMIT 1)),
('protein-week', 'Protein Power Week', 'Hit your protein goal every day for a week', 'protein', 'protein_days', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', (SELECT id FROM auth.users LIMIT 1));

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
-- 0003_custom_foods.sql
-- Custom foods table for user-created food entries

CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  brand TEXT,
  serving_size DECIMAL(10,3) CHECK (serving_size > 0),
  serving_unit TEXT DEFAULT 'g',
  calories_per_serving DECIMAL(10,2) CHECK (calories_per_serving >= 0),
  protein_g DECIMAL(8,2) CHECK (protein_g >= 0),
  carbs_g DECIMAL(8,2) CHECK (carbs_g >= 0),
  fat_g DECIMAL(8,2) CHECK (fat_g >= 0),
  fiber_g DECIMAL(8,2) CHECK (fiber_g >= 0),
  sugar_g DECIMAL(8,2) CHECK (sugar_g >= 0),
  sodium_mg DECIMAL(10,2) CHECK (sodium_mg >= 0),
  is_recipe BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique names per user
  UNIQUE(user_id, name)
);

-- Add updated_at trigger
CREATE TRIGGER set_custom_foods_updated_at
  BEFORE UPDATE ON public.custom_foods
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS Policies
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

-- Users can only see their own custom foods
CREATE POLICY "Users can view own custom foods" ON public.custom_foods
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own custom foods  
CREATE POLICY "Users can create custom foods" ON public.custom_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom foods
CREATE POLICY "Users can update own custom foods" ON public.custom_foods
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can delete their own custom foods
CREATE POLICY "Users can delete own custom foods" ON public.custom_foods
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_foods_user_id ON public.custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_foods_name ON public.custom_foods(user_id, name);
CREATE INDEX IF NOT EXISTS idx_custom_foods_created_at ON public.custom_foods(created_at DESC);
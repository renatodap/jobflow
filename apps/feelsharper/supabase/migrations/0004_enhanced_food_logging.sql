-- 0004_enhanced_food_logging.sql
-- Enhanced food logging: recipes, meal templates, and portion helpers

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  description TEXT,
  servings INTEGER DEFAULT 1 CHECK (servings > 0),
  prep_time_minutes INTEGER CHECK (prep_time_minutes >= 0),
  cook_time_minutes INTEGER CHECK (cook_time_minutes >= 0),
  instructions TEXT[],
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique names per user
  UNIQUE(user_id, name)
);

-- Recipe ingredients (links to foods/custom_foods)
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES public.foods(id),
  custom_food_id UUID REFERENCES public.custom_foods(id),
  quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (length(trim(unit)) > 0),
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  
  -- Must reference either a food or custom_food, but not both
  CONSTRAINT chk_ingredient_source CHECK (
    (food_id IS NOT NULL AND custom_food_id IS NULL) OR
    (food_id IS NULL AND custom_food_id IS NOT NULL)
  )
);

-- Meal templates (frequently eaten combinations)
CREATE TABLE IF NOT EXISTS public.meal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique names per user
  UNIQUE(user_id, name)
);

-- Template items (can include foods, custom foods, or recipes)
CREATE TABLE IF NOT EXISTS public.meal_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.meal_templates(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES public.foods(id),
  custom_food_id UUID REFERENCES public.custom_foods(id),
  recipe_id UUID REFERENCES public.recipes(id),
  quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (length(trim(unit)) > 0),
  
  -- Must reference exactly one source
  CONSTRAINT chk_template_item_source CHECK (
    (food_id IS NOT NULL AND custom_food_id IS NULL AND recipe_id IS NULL) OR
    (food_id IS NULL AND custom_food_id IS NOT NULL AND recipe_id IS NULL) OR
    (food_id IS NULL AND custom_food_id IS NULL AND recipe_id IS NOT NULL)
  )
);

-- Add updated_at triggers
CREATE TRIGGER set_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS Policies

-- Recipes: users can read public recipes + their own, but only modify their own
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public and own recipes" ON public.recipes
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create own recipes" ON public.recipes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recipes" ON public.recipes
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recipes" ON public.recipes
  FOR DELETE USING (user_id = auth.uid());

-- Recipe ingredients: access via recipe ownership
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe ingredients via recipe access" ON public.recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.recipes r 
      WHERE r.id = recipe_id 
      AND (r.is_public = true OR r.user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes r 
      WHERE r.id = recipe_id 
      AND r.user_id = auth.uid()
    )
  );

-- Meal templates: users can only access their own
ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own meal templates" ON public.meal_templates
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Template items: access via template ownership
ALTER TABLE public.meal_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Template items via template ownership" ON public.meal_template_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meal_templates mt 
      WHERE mt.id = template_id AND mt.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_templates mt 
      WHERE mt.id = template_id AND mt.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON public.recipes(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_templates_user_id ON public.meal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_templates_type ON public.meal_templates(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_template_items_template ON public.meal_template_items(template_id);
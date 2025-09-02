# Database Schema

> Auto-generated from migration files

## init

**File:** `supabase\migrations\0001_init.sql`

```sql
-- 0001_init.sql
-- AI Fitness Dashboard — Initial schema + RLS
-- Canonical units: kg, km, seconds, kcal
-- Convert in UI (kg↔lb, km↔mi)

-------------------------
-- Extensions & helpers
-------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-------------------------
-- Enums
-------------------------
do $$ begin
  create type goal_type_enum as enum ('weight_loss','muscle_gain','endurance','general_health','sport_specific','marathon');
exception when duplicate_object then null; end $$;

do $$ begin
  create type experience_level_enum as enum ('beginner','intermediate','advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type unit_weight_enum as enum ('kg','lb');
exception when duplicate_object then null; end $$;

do $$ begin
  create type unit_distance_enum as enum ('km','mi');
exception when duplicate_object then null; end $$;

-------------------------
-- Profiles (1:1 auth.users)
-------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  locale            text not null default 'en',              -- en/es/pt/fr
  units_weight      unit_weight_enum not null default 'kg',
  units_distance    unit_distance_enum not null default 'km',
  goal_type         goal_type_enum,
  experience        experience_level_enum,
  constraints_json  jsonb not null default '{}'::jsonb       -- injuries, time, equipment, diet, etc.
);
create trigger trg_profiles_updated before update on public.profiles
for each row execute function set_updated_at();

-------------------------
-- Goals & Plans
-------------------------
create table if not exists public.goals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          goal_type_enum not null,
  target_value  numeric,                         -- e.g. target body weight, race time(sec), 1RM(kg)
  target_date   date,
  metrics       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists idx_goals_user on public.goals(user_id);

create table if not exists public.plans (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text,
  meta          jsonb not null default '{}'::jsonb,          -- periodization, focus
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_plans_updated before update on public.plans
for each row execute function set_updated_at();
create index if not exists idx_plans_user on public.plans(user_id);

create table if not exists public.plan_days (
  id            uuid primary key default uuid_generate_v4(),
  plan_id       uuid not null references public.plans(id) on delete cascade,
  day_date      date not null,
  kind          text not null,                                -- 'strength','cardio','rest','mobility'
  payload       jsonb not null default '{}'::jsonb            -- structured prescription
);
create index if not exists idx_plan_days_plan_date on public.plan_days(plan_id, day_date);

-------------------------
-- Workouts & Sets (strength) / Cardio
-------------------------
create table if not exists public.workouts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  type          text,                                         -- 'strength' | 'cardio' | 'mobility'
  notes         text
);
create index if not exists idx_workouts_user_time on public.workouts(user_id, started_at desc);

create table if not exists public.workout_sets (
  id            uuid primary key default uuid_generate_v4(),
  workout_id    uuid not null references public.workouts(id) on delete cascade,
  set_index     int not null,
  exercise      text not null,
  weight_kg     numeric,
  reps          int,
  rpe           numeric
);
create index if not exists idx_sets_workout on public.workout_sets(workout_id);

create table if not exists public.cardio_sessions (
  id                 uuid primary key default uuid_generate_v4(),
  workout_id         uuid not null references public.workouts(id) on delete cascade,
  modality           text,                                     -- 'run','bike','row','swim'
  distance_km        numeric,
  duration_seconds   int,
  avg_hr             int,
  avg_pace_s_per_km  int
);
create index if not exists idx_cardio_workout on public.cardio_sessions(workout_id);

-------------------------
-- Meals & Items
-------------------------
create table if not exists public.meals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  eaten_at      timestamptz not null default now(),
  name          text,
  kcal          int,
  protein_g     numeric,
  carbs_g       numeric,
  fat_g         numeric,
  notes         text
);
create index if not exists idx_meals_user_time on public.meals(user_id, eaten_at desc);

create table if not exists public.meal_items (
  id            uuid primary key default uuid_generate_v4(),
  meal_id       uuid not null references public.meals(id) on delete cascade,
  food_name     text not null,
  qty           numeric,
  unit          text,
  kcal          int,
  protein_g     numeric,
  carbs_g       numeric,
  fat_g         numeric,
  source        text default 'manual'                         -- 'manual' | 'open_food_facts' | 'barcode'
);
create index if not exists idx_meal_items_meal on public.meal_items(meal_id);

-------------------------
-- Body metrics / Sleep / Subjective
-------------------------
create table if not exists public.body_metrics (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  measured_at   timestamptz not null default now(),
  weight_kg     numeric,
  bf_percent    numeric,
  chest_cm      numeric,
  waist_cm      numeric,
  hip_cm        numeric,
  thigh_cm      numeric,
  notes         text
);
create index if not exists idx_body_user_time on public.body_metrics(user_id, measured_at desc);

create table if not exists public.sleep_logs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  duration_hr   numeric,
  quality       int,                                          -- 1..5
  created_at    timestamptz not null default now()
);
create index if not exists idx_sleep_user_date on public.sleep_logs(user_id, date desc);

create table if not exists public.subjective_logs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  logged_at     timestamptz not null default now(),
  mood          int,                                          -- 1..5
  soreness      int,                                          -- 1..5
  energy        int,                                          -- 1..5
  notes         text
);
create index if not exists idx_subjective_user_time on public.subjective_logs(user_id, logged_at desc);

-------------------------
-- AI Conversations / Messages / Insights
-------------------------
create table if not exists public.ai_conversations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_ai_convos_user_time on public.ai_conversations(user_id, created_at desc);

create table if not exists public.ai_messages (
  id                uuid primary key default uuid_generate_v4(),
  conversation_id   uuid not null references public.ai_conversations(id) on delete cascade,
  role              text not null,                              -- 'user' | 'assistant' | 'tool'
  content           jsonb not null,                             -- structured message, tool calls
  created_at        timestamptz not null default now()
);
create index if not exists idx_ai_msgs_conv_time on public.ai_messages(conversation_id, created_at asc);

create table if not exists public.ai_insights (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  week_start    date not null,
  insights      jsonb not null,
  next_steps    jsonb not null,
  created_at    timestamptz not null default now(),
  unique (user_id, week_start)
);
create index if not exists idx_ai_insights_user on public.ai_insights(user_id);

-------------------------
-- Achievements / Badges
-------------------------
create table if not exists public.badges (
  id            uuid primary key default uuid_generate_v4(),
  code          text unique not null,                           -- 'streak_7', 'first_pr', etc.
  name          text not null,
  description   text,
  created_at    timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id       uuid not null references auth.users(id) on delete cascade,
  badge_id      uuid not null references public.badges(id) on delete cascade,
  earned_at     timestamptz not null default now(),
  primary key (user_id, badge_id)
);
create index if not exists idx_user_badges_user on public.user_badges(user_id);

-------------------------
-- Integrations (tokens), Settings, Notifications (opt-in)
-------------------------
create table if not exists public.integrations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  provider      text not null,                                  -- 'strava','apple_health','google_fit','garmin','mfp'
  external_id   text,
  access_token  text,
  refresh_token text,
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_integrations_updated before update on public.integrations
for each row execute function set_updated_at();
create index if not exists idx_integrations_user_provider on public.integrations(user_id, provider);

create table if not exists public.settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  theme         text default 'system',
  notifications jsonb not null default '{"email":true,"push":false}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_settings_updated before update on public.settings
for each row execute function set_updated_at();

create table if not exists public.notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          text not null,                                   -- 'reminder','insight','streak'
  payload       jsonb not null default '{}'::jsonb,
  scheduled_at  timestamptz,
  sent_at       timestamptz
);
create index if not exists idx_notifications_user_sched on public.notifications(user_id, scheduled_at);

-------------------------
-- Row-Level Security
-------------------------
alter table public.profiles          enable row level security;
alter table public.goals             enable row level security;
alter table public.plans             enable row level security;
alter table public.plan_days         enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_sets      enable row level security;
alter table public.cardio_sessions   enable row level security;
alter table public.meals             enable row level security;
alter table public.meal_items        enable row level security;
alter table public.body_metrics      enable row level security;
alter table public.sleep_logs        enable row level security;
alter table public.subjective_logs   enable row level security;
alter table public.ai_conversations  enable row level security;
alter table public.ai_messages       enable row level security;
alter table public.ai_insights       enable row level security;
alter table public.badges            enable row level security;
alter table public.user_badges       enable row level security;
alter table public.integrations      enable row level security;
alter table public.settings          enable row level security;
alter table public.notifications     enable row level security;

-- Ownership policies
create policy "profiles_owner" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "goals_owner" on public.goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "plans_owner" on public.plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "plan_days_via_plan" on public.plan_days
  for all using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy "workouts_owner" on public.workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "workout_sets_via_workout" on public.workout_sets
  for all using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

create policy "cardio_via_workout" on public.cardio_sessions
  for all using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

create policy "meals_owner" on public.meals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "meal_items_via_meal" on public.meal_items
  for all using (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()));

create policy "body_metrics_owner" on public.body_metrics
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "sleep_owner" on public.sleep_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "subjective_owner" on public.subjective_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ai_convos_owner" on public.ai_conversations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ai_messages_via_convo" on public.ai_messages
  for all using (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

create policy "ai_insights_owner" on public.ai_insights
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "badges_read_all" on public.badges
  for select using (true);  -- badges catalog is public-readable

create policy "user_badges_owner" on public.user_badges
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "integrations_owner" on public.integrations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "settings_owner" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications_owner" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-------------------------
-- Minimal seed (optional) 
-------------------------
-- insert into public.badges (id, code, name, description)
-- values (uuid_generate_v4(),'streak_7','7-day streak','Logged any activity 7 days in a row')
-- on conflict (code) do nothing;
```

## simplified_fitness

**File:** `supabase\migrations\0002_simplified_fitness.sql`

```sql
-- 0002_simplified_fitness.sql
-- Simplified fitness tracking schema focused on Food, Workouts, Weight
-- All tables enforce user-scoped RLS policies for multi-tenant safety

-------------------------
-- Food Database & Diary
-------------------------

-- Common foods library (shared, verified foods)
create table if not exists public.foods (
  id            uuid primary key default uuid_generate_v4(),
  owner_user_id uuid references auth.users(id) on delete cascade, -- null = public food, non-null = user's custom food
  name          text not null,
  brand         text,
  unit          text not null default 'g',                        -- g, ml, item, cup, etc.
  -- Macros (per unit)
  kcal          numeric not null default 0,
  protein_g     numeric not null default 0,
  carbs_g       numeric not null default 0,
  fat_g         numeric not null default 0,
  -- Key micros (per unit)
  fiber_g       numeric not null default 0,
  sugar_g       numeric not null default 0,
  sodium_mg     numeric not null default 0,
  potassium_mg  numeric not null default 0,
  vit_c_mg      numeric not null default 0,
  -- Meta
  verified_source boolean not null default false,                 -- true for USDA/verified, false for user-added
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_foods_name_search on public.foods using gin(to_tsvector('english', name || ' ' || coalesce(brand, '')));
create index if not exists idx_foods_owner on public.foods(owner_user_id);
create trigger trg_foods_updated before update on public.foods for each row execute function set_updated_at();

-- User's saved meals (combinations of foods)
create table if not exists public.meals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,                                      -- "My breakfast", "Post-workout shake"
  created_at  timestamptz not null default now()
);
create index if not exists idx_meals_user on public.meals(user_id);

-- Foods in each meal (with quantities)
create table if not exists public.meal_items (
  id                  uuid primary key default uuid_generate_v4(),
  meal_id             uuid not null references public.meals(id) on delete cascade,
  food_id             uuid not null references public.foods(id) on delete cascade,
  quantity            numeric not null,                           -- amount of this food
  unit_override       text,                                       -- if different from food's default unit
  -- Snapshot of nutrients at time of adding (for consistency)
  nutrients_snapshot  jsonb not null default '{}'::jsonb         -- {kcal, protein_g, carbs_g, fat_g, fiber_g, etc.}
);
create index if not exists idx_meal_items_meal on public.meal_items(meal_id);

-- Daily food diary entries
create table if not exists public.food_diary (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  date                date not null,
  meal_type           text not null,                              -- breakfast, lunch, dinner, snack, custom
  -- Either a direct food OR a saved meal
  food_id             uuid references public.foods(id) on delete set null,
  meal_id             uuid references public.meals(id) on delete set null,
  quantity            numeric not null,                           -- amount consumed
  notes               text,
  -- Snapshot of total nutrients for this entry
  nutrients_snapshot  jsonb not null default '{}'::jsonb,        -- calculated totals
  logged_at           timestamptz not null default now(),
  constraint chk_food_or_meal check ((food_id is not null) != (meal_id is not null)) -- exactly one must be set
);
create index if not exists idx_food_diary_user_date on public.food_diary(user_id, date desc);

-------------------------
-- Workout Tracking
-------------------------

-- Workouts (sessions)
create table if not exists public.workouts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  title       text,                                               -- "Push day", "5k run", "Leg day"
  source      text not null default 'manual',                    -- 'manual' | 'ai_parsed'
  notes       text,
  -- Session-level metrics (calculated)
  metrics     jsonb not null default '{}'::jsonb,                -- {total_volume, duration_min, exercises_count, etc.}
  created_at  timestamptz not null default now()
);
create index if not exists idx_workouts_user_date on public.workouts(user_id, date desc);

-- Exercises within workouts
create table if not exists public.exercises (
  id          uuid primary key default uuid_generate_v4(),
  workout_id  uuid not null references public.workouts(id) on delete cascade,
  name        text not null,                                     -- "Bench Press", "Squat", "5k Run"
  order_index int not null,                                      -- order within workout
  notes       text
);
create index if not exists idx_exercises_workout on public.exercises(workout_id, order_index);

-- Sets within exercises (supports strength + cardio)
create table if not exists public.sets (
  id            uuid primary key default uuid_generate_v4(),
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  set_no        int not null,                                   -- 1, 2, 3, etc.
  -- Strength data
  reps          int,
  weight        numeric,                                        -- always in kg (convert in UI)
  -- Cardio data
  distance      numeric,                                        -- always in km (convert in UI)
  duration_sec  int,
  -- Subjective
  rpe           numeric                                         -- 1-10 rate of perceived exertion
);
create index if not exists idx_sets_exercise on public.sets(exercise_id, set_no);

-------------------------
-- Body Weight Tracking
-------------------------

create table if not exists public.body_weight (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  weight      numeric not null,                                 -- always in kg (convert in UI)
  unit        text not null default 'kg',                      -- user's preferred unit for display
  created_at  timestamptz not null default now(),
  unique (user_id, date)                                       -- one weight per day max
);
create index if not exists idx_body_weight_user_date on public.body_weight(user_id, date desc);

-------------------------
-- Row-Level Security Policies
-------------------------

-- Foods: users can read all public foods + their own custom foods, but can only modify their own
alter table public.foods enable row level security;
create policy "foods_read_public_and_own" on public.foods
  for select using (owner_user_id is null or owner_user_id = auth.uid());
create policy "foods_write_own" on public.foods
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- Meals: users can only access their own
alter table public.meals enable row level security;
create policy "meals_owner" on public.meals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Meal items: access via meal ownership
alter table public.meal_items enable row level security;
create policy "meal_items_via_meal" on public.meal_items
  for all using (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()));

-- Food diary: users can only access their own
alter table public.food_diary enable row level security;
create policy "food_diary_owner" on public.food_diary
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Workouts: users can only access their own
alter table public.workouts enable row level security;
create policy "workouts_owner" on public.workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Exercises: access via workout ownership
alter table public.exercises enable row level security;
create policy "exercises_via_workout" on public.exercises
  for all using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- Sets: access via exercise -> workout ownership
alter table public.sets enable row level security;
create policy "sets_via_exercise" on public.sets
  for all using (
    exists (
      select 1 from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  );

-- Body weight: users can only access their own
alter table public.body_weight enable row level security;
create policy "body_weight_owner" on public.body_weight
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## custom_foods

**File:** `supabase\migrations\0003_custom_foods.sql`

```sql
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
```


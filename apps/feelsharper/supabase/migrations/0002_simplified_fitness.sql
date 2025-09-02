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
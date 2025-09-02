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

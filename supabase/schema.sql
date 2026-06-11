-- LifeOS database schema
-- Run this entire file in Supabase: SQL Editor → New query → paste → Run.
-- Tables match /src/db/schema.js. RLS enforces user_id = auth.uid() per AI_CONTEXT.md §8.

-- ──────────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────────

create table if not exists public.tasks (
  id          uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  type        text not null default 'one-time',
  recurrence  text,
  priority    text not null default 'medium',
  status      text not null default 'pending',
  due_date    date,
  completed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  synced_at   timestamptz
);
create index if not exists tasks_user_id_idx on public.tasks(user_id);

create table if not exists public.meals (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  meal_type  text not null,
  name       text not null,
  calories   numeric,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at  timestamptz
);
create index if not exists meals_user_id_idx on public.meals(user_id);
create index if not exists meals_user_date_idx on public.meals(user_id, date);

create table if not exists public.goals (
  id            uuid primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  category      text not null default 'personal',
  target_value  numeric not null default 1,
  current_value numeric not null default 0,
  unit          text,
  deadline      date,
  status        text not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  synced_at     timestamptz
);
create index if not exists goals_user_id_idx on public.goals(user_id);

create table if not exists public.daily_checkins (
  id          uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  weight      numeric,
  weight_unit text,
  thoughts    text,
  mood        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  synced_at   timestamptz,
  unique (user_id, date)
);
create index if not exists daily_checkins_user_id_idx on public.daily_checkins(user_id);

create table if not exists public.activities (
  id               uuid primary key,
  user_id          uuid not null references auth.users(id) on delete cascade,
  date             date not null,
  type             text not null,
  duration_minutes integer not null,
  distance         numeric,
  distance_unit    text,
  calories         numeric,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  synced_at        timestamptz
);
create index if not exists activities_user_id_idx on public.activities(user_id);

create table if not exists public.challenges (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  start_date date not null,
  status     text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at  timestamptz
);
create index if not exists challenges_user_id_idx on public.challenges(user_id);

create table if not exists public.challenge_days (
  id               uuid primary key,
  challenge_id     uuid not null references public.challenges(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  day_number       integer not null,
  date             date not null,
  rules_completed  text[] not null default '{}',
  notes            text,
  created_at       timestamptz not null default now(),
  synced_at        timestamptz
);
create index if not exists challenge_days_user_id_idx on public.challenge_days(user_id);
create index if not exists challenge_days_challenge_idx on public.challenge_days(challenge_id);

create table if not exists public.user_settings (
  id              uuid primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  weight_unit     text not null default 'kg',
  distance_unit   text not null default 'km',
  theme           text not null default 'light',
  sex             text,
  age             integer,
  height_cm       numeric,
  activity_level  text,
  daily_kcal_goal numeric,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  synced_at       timestamptz,
  unique (user_id)
);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────

alter table public.tasks           enable row level security;
alter table public.meals           enable row level security;
alter table public.goals           enable row level security;
alter table public.daily_checkins  enable row level security;
alter table public.activities      enable row level security;
alter table public.challenges      enable row level security;
alter table public.challenge_days  enable row level security;
alter table public.user_settings   enable row level security;

-- Helper macro: each table gets the same 4 policies (select/insert/update/delete)
-- where user_id = auth.uid().

-- tasks
drop policy if exists "tasks_select" on public.tasks;
drop policy if exists "tasks_insert" on public.tasks;
drop policy if exists "tasks_update" on public.tasks;
drop policy if exists "tasks_delete" on public.tasks;
create policy "tasks_select" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete" on public.tasks for delete using (auth.uid() = user_id);

-- meals
drop policy if exists "meals_select" on public.meals;
drop policy if exists "meals_insert" on public.meals;
drop policy if exists "meals_update" on public.meals;
drop policy if exists "meals_delete" on public.meals;
create policy "meals_select" on public.meals for select using (auth.uid() = user_id);
create policy "meals_insert" on public.meals for insert with check (auth.uid() = user_id);
create policy "meals_update" on public.meals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_delete" on public.meals for delete using (auth.uid() = user_id);

-- goals
drop policy if exists "goals_select" on public.goals;
drop policy if exists "goals_insert" on public.goals;
drop policy if exists "goals_update" on public.goals;
drop policy if exists "goals_delete" on public.goals;
create policy "goals_select" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete" on public.goals for delete using (auth.uid() = user_id);

-- daily_checkins
drop policy if exists "daily_checkins_select" on public.daily_checkins;
drop policy if exists "daily_checkins_insert" on public.daily_checkins;
drop policy if exists "daily_checkins_update" on public.daily_checkins;
drop policy if exists "daily_checkins_delete" on public.daily_checkins;
create policy "daily_checkins_select" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "daily_checkins_insert" on public.daily_checkins for insert with check (auth.uid() = user_id);
create policy "daily_checkins_update" on public.daily_checkins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_checkins_delete" on public.daily_checkins for delete using (auth.uid() = user_id);

-- activities
drop policy if exists "activities_select" on public.activities;
drop policy if exists "activities_insert" on public.activities;
drop policy if exists "activities_update" on public.activities;
drop policy if exists "activities_delete" on public.activities;
create policy "activities_select" on public.activities for select using (auth.uid() = user_id);
create policy "activities_insert" on public.activities for insert with check (auth.uid() = user_id);
create policy "activities_update" on public.activities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activities_delete" on public.activities for delete using (auth.uid() = user_id);

-- challenges
drop policy if exists "challenges_select" on public.challenges;
drop policy if exists "challenges_insert" on public.challenges;
drop policy if exists "challenges_update" on public.challenges;
drop policy if exists "challenges_delete" on public.challenges;
create policy "challenges_select" on public.challenges for select using (auth.uid() = user_id);
create policy "challenges_insert" on public.challenges for insert with check (auth.uid() = user_id);
create policy "challenges_update" on public.challenges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "challenges_delete" on public.challenges for delete using (auth.uid() = user_id);

-- challenge_days
drop policy if exists "challenge_days_select" on public.challenge_days;
drop policy if exists "challenge_days_insert" on public.challenge_days;
drop policy if exists "challenge_days_update" on public.challenge_days;
drop policy if exists "challenge_days_delete" on public.challenge_days;
create policy "challenge_days_select" on public.challenge_days for select using (auth.uid() = user_id);
create policy "challenge_days_insert" on public.challenge_days for insert with check (auth.uid() = user_id);
create policy "challenge_days_update" on public.challenge_days for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "challenge_days_delete" on public.challenge_days for delete using (auth.uid() = user_id);

-- user_settings
drop policy if exists "user_settings_select" on public.user_settings;
drop policy if exists "user_settings_insert" on public.user_settings;
drop policy if exists "user_settings_update" on public.user_settings;
drop policy if exists "user_settings_delete" on public.user_settings;
create policy "user_settings_select" on public.user_settings for select using (auth.uid() = user_id);
create policy "user_settings_insert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "user_settings_update" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_settings_delete" on public.user_settings for delete using (auth.uid() = user_id);

-- Adds meals.calories and the habits + habit_logs tables.
-- Run after 001_user_settings_profile.sql.

-- ──────────────────────────────────────────────
-- meals.calories
-- ──────────────────────────────────────────────
alter table public.meals
  add column if not exists calories numeric;

-- ──────────────────────────────────────────────
-- habits
-- ──────────────────────────────────────────────
create table if not exists public.habits (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  icon       text,
  status     text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at  timestamptz
);
create index if not exists habits_user_id_idx on public.habits(user_id);

alter table public.habits enable row level security;

drop policy if exists "habits_select" on public.habits;
drop policy if exists "habits_insert" on public.habits;
drop policy if exists "habits_update" on public.habits;
drop policy if exists "habits_delete" on public.habits;
create policy "habits_select" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update" on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_delete" on public.habits for delete using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- habit_logs
-- ──────────────────────────────────────────────
create table if not exists public.habit_logs (
  id         uuid primary key,
  habit_id   uuid not null references public.habits(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  synced_at  timestamptz,
  unique (habit_id, date)
);
create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists habit_logs_habit_idx on public.habit_logs(habit_id);

alter table public.habit_logs enable row level security;

drop policy if exists "habit_logs_select" on public.habit_logs;
drop policy if exists "habit_logs_insert" on public.habit_logs;
drop policy if exists "habit_logs_update" on public.habit_logs;
drop policy if exists "habit_logs_delete" on public.habit_logs;
create policy "habit_logs_select" on public.habit_logs for select using (auth.uid() = user_id);
create policy "habit_logs_insert" on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "habit_logs_update" on public.habit_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_delete" on public.habit_logs for delete using (auth.uid() = user_id);

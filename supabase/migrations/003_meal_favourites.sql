-- Meal favourites: user-curated meal templates that drive autocomplete.
-- Run after 002_calories_habits.sql.

create table if not exists public.meal_favourites (
  id          uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  calories    numeric,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  synced_at   timestamptz
);

create index if not exists meal_favourites_user_id_idx
  on public.meal_favourites(user_id);

create unique index if not exists meal_favourites_user_lower_name_unique
  on public.meal_favourites(user_id, lower(name));

alter table public.meal_favourites enable row level security;

drop policy if exists "meal_favourites_select" on public.meal_favourites;
drop policy if exists "meal_favourites_insert" on public.meal_favourites;
drop policy if exists "meal_favourites_update" on public.meal_favourites;
drop policy if exists "meal_favourites_delete" on public.meal_favourites;
create policy "meal_favourites_select" on public.meal_favourites
  for select using (auth.uid() = user_id);
create policy "meal_favourites_insert" on public.meal_favourites
  for insert with check (auth.uid() = user_id);
create policy "meal_favourites_update" on public.meal_favourites
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meal_favourites_delete" on public.meal_favourites
  for delete using (auth.uid() = user_id);

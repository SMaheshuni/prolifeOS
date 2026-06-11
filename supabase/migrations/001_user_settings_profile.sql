-- Adds profile fields to user_settings.
-- Run this in Supabase SQL Editor after the initial schema.sql.

alter table public.user_settings
  add column if not exists sex             text,
  add column if not exists age             integer,
  add column if not exists height_cm       numeric,
  add column if not exists activity_level  text,
  add column if not exists daily_kcal_goal numeric;

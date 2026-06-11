-- Challenge scoring: replace binary `completed` with a per-rule array
-- so partial-credit days are recorded honestly (4 of 5 rules done counts
-- as 4 points, not as a missed day). Backfills existing rows from the
-- old boolean, then drops the column.
--
-- The five rule IDs are fixed in src/utils/constants.js. If that list
-- ever grows past five, this migration needs no change — the array
-- holds whatever rule IDs the app writes.

alter table public.challenge_days
  add column if not exists rules_completed text[] not null default '{}';

-- Backfill: previously-completed days had all five rules; the rest had none.
update public.challenge_days
  set rules_completed = array['clean_day','activity','deep_work','hydration','daily_proof']
  where completed = true
    and (rules_completed is null or array_length(rules_completed, 1) is null);

alter table public.challenge_days
  drop column if exists completed;

alter table public.fantasy_players
add column if not exists draft_ranks jsonb;

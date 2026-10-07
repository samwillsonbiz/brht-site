alter table public.fantasy_player_market_snapshots
add column if not exists draft_ranks jsonb;

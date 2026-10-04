-- Fable Fury multiplayer room/lobby foundation.
-- Server routes use the service role; RLS stays enabled and no public table access is granted.

create table if not exists public.fable_multiplayer_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'lobby' check (status in ('lobby','active','finished','abandoned')),
  host_player_id uuid,
  run_id uuid references public.fable_game_runs(id) on delete set null,
  shared_state jsonb not null default '{}'::jsonb,
  revision bigint not null default 0,
  max_players integer not null default 6 check (max_players between 1 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fable_multiplayer_players (
  id uuid primary key,
  room_id uuid not null references public.fable_multiplayer_rooms(id) on delete cascade,
  seat integer not null check (seat between 1 and 6),
  display_name text not null,
  hero_id text,
  starting_token text check (starting_token is null or starting_token in ('healing','lucky','crystal')),
  target_number integer check (target_number is null or target_number between 1 and 6),
  ready boolean not null default false,
  player_state jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique(room_id, seat)
);

create index if not exists fable_multiplayer_rooms_code_idx on public.fable_multiplayer_rooms(code);
create index if not exists fable_multiplayer_players_room_idx on public.fable_multiplayer_players(room_id);

alter table public.fable_multiplayer_rooms enable row level security;
alter table public.fable_multiplayer_players enable row level security;

create or replace function public.fable_multiplayer_touch_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.fable_multiplayer_rooms
  set updated_at = now(), revision = revision + 1
  where id = p_room_id;
end;
$$;

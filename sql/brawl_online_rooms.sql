-- Isolated Brawl match storage. No existing BRHT, fantasy or Fable Fury tables are modified.
create table if not exists public.brawl_online_rooms (
  id text primary key,
  engine_version text not null,
  host_token_hash text not null,
  guest_token_hash text,
  invite_hash text,
  host_config jsonb not null,
  guest_config jsonb,
  game_state jsonb,
  revision bigint not null default 0,
  commands jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
alter table public.brawl_online_rooms enable row level security;
revoke all on table public.brawl_online_rooms from public, anon, authenticated;
grant select, insert, update on table public.brawl_online_rooms to service_role;
create index if not exists brawl_online_rooms_expiry_idx on public.brawl_online_rooms (expires_at);
comment on table public.brawl_online_rooms is 'Server-authoritative Brawl matches. Only the BRHT server service role may access this table; clients receive seat-specific redacted projections.';

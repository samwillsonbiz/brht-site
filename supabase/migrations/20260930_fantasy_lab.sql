create extension if not exists pgcrypto;

create table if not exists fantasy_leagues (
  espn_league_id bigint primary key,
  season_id integer not null,
  name text,
  my_team_espn_id integer,
  scoring_period_id integer,
  current_matchup_period integer,
  draft_completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists fantasy_teams (
  id uuid primary key default gen_random_uuid(),
  espn_league_id bigint not null references fantasy_leagues(espn_league_id) on delete cascade,
  espn_team_id integer not null,
  name text,
  abbreviation text,
  owner_name text,
  is_my_team boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (espn_league_id, espn_team_id)
);

create table if not exists nba_teams (
  espn_team_id integer primary key,
  abbreviation text,
  display_name text,
  updated_at timestamptz not null default now()
);

create table if not exists fantasy_players (
  espn_player_id bigint primary key,
  full_name text not null,
  first_name text,
  last_name text,
  nba_team_espn_id integer references nba_teams(espn_team_id),
  default_position_id integer,
  eligible_slots integer[] not null default '{}',
  injury_status text,
  injured boolean not null default false,
  percent_owned numeric,
  percent_started numeric,
  average_draft_position numeric,
  auction_value_average numeric,
  updated_at timestamptz not null default now()
);

create table if not exists nba_games (
  espn_event_id text primary key,
  game_date_et date not null,
  tipoff_at timestamptz not null,
  home_team_espn_id integer not null references nba_teams(espn_team_id),
  away_team_espn_id integer not null references nba_teams(espn_team_id),
  status text,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists nba_games_date_idx on nba_games(game_date_et);
create index if not exists nba_games_home_idx on nba_games(home_team_espn_id, game_date_et);
create index if not exists nba_games_away_idx on nba_games(away_team_espn_id, game_date_et);

create table if not exists fantasy_roster_assignments (
  id uuid primary key default gen_random_uuid(),
  espn_league_id bigint not null references fantasy_leagues(espn_league_id) on delete cascade,
  fantasy_team_espn_id integer,
  espn_player_id bigint not null references fantasy_players(espn_player_id) on delete cascade,
  effective_from date not null,
  effective_through date,
  source text not null default 'espn' check (source in ('espn','manual','scenario')),
  transaction_type text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_through is null or effective_through >= effective_from)
);

create index if not exists roster_assignment_player_idx
  on fantasy_roster_assignments(espn_league_id, espn_player_id, effective_from, effective_through);
create index if not exists roster_assignment_team_idx
  on fantasy_roster_assignments(espn_league_id, fantasy_team_espn_id, effective_from, effective_through);

create table if not exists fantasy_player_results (
  espn_league_id bigint not null references fantasy_leagues(espn_league_id) on delete cascade,
  espn_player_id bigint not null references fantasy_players(espn_player_id) on delete cascade,
  scoring_date date not null,
  scoring_period_id integer,
  fantasy_points numeric not null,
  finalized boolean not null default true,
  source text not null default 'espn',
  updated_at timestamptz not null default now(),
  primary key (espn_league_id, espn_player_id, scoring_date)
);

create table if not exists fantasy_player_stat_snapshots (
  id bigserial primary key,
  espn_league_id bigint not null references fantasy_leagues(espn_league_id) on delete cascade,
  espn_player_id bigint not null references fantasy_players(espn_player_id) on delete cascade,
  captured_at timestamptz not null default now(),
  season_avg numeric,
  last_30_avg numeric,
  last_7_avg numeric,
  true_avg numeric,
  games_played integer,
  raw_stats jsonb not null default '{}'::jsonb
);

create index if not exists player_snapshot_latest_idx
  on fantasy_player_stat_snapshots(espn_league_id, espn_player_id, captured_at desc);

create table if not exists fantasy_matchups (
  id uuid primary key default gen_random_uuid(),
  espn_league_id bigint not null references fantasy_leagues(espn_league_id) on delete cascade,
  matchup_period_id integer not null,
  home_team_espn_id integer not null,
  away_team_espn_id integer not null,
  start_date date,
  end_date date,
  updated_at timestamptz not null default now(),
  unique (espn_league_id, matchup_period_id, home_team_espn_id, away_team_espn_id)
);

create table if not exists projection_overrides (
  id uuid primary key default gen_random_uuid(),
  espn_league_id bigint not null references fantasy_leagues(espn_league_id) on delete cascade,
  espn_player_id bigint not null references fantasy_players(espn_player_id) on delete cascade,
  projection_avg numeric,
  injury_status_override text,
  effective_from date not null,
  effective_through date,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_through is null or effective_through >= effective_from)
);

create table if not exists fantasy_scenarios (
  id uuid primary key default gen_random_uuid(),
  espn_league_id bigint not null references fantasy_leagues(espn_league_id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists fantasy_scenario_moves (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references fantasy_scenarios(id) on delete cascade,
  espn_player_id bigint not null references fantasy_players(espn_player_id) on delete cascade,
  fantasy_team_espn_id integer,
  effective_from date not null,
  effective_through date,
  move_type text not null check (move_type in ('add','drop','trade_in','trade_out','assign','unassign')),
  created_at timestamptz not null default now(),
  check (effective_through is null or effective_through >= effective_from)
);

create table if not exists fantasy_sync_runs (
  id bigserial primary key,
  sync_type text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  success boolean,
  rows_affected integer,
  detail jsonb not null default '{}'::jsonb
);

alter table fantasy_leagues enable row level security;
alter table fantasy_teams enable row level security;
alter table nba_teams enable row level security;
alter table fantasy_players enable row level security;
alter table nba_games enable row level security;
alter table fantasy_roster_assignments enable row level security;
alter table fantasy_player_results enable row level security;
alter table fantasy_player_stat_snapshots enable row level security;
alter table fantasy_matchups enable row level security;
alter table projection_overrides enable row level security;
alter table fantasy_scenarios enable row level security;
alter table fantasy_scenario_moves enable row level security;
alter table fantasy_sync_runs enable row level security;

-- No public policies are created intentionally. The app will access this schema
-- only through server-side routes using the Supabase service-role key. The public
-- /fantasy dashboard receives normalized, read-only data from those routes.

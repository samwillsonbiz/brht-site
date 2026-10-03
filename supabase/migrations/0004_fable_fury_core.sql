-- Fable Fury base-game content/run engine.
-- Production seed rows were imported from the canonical "Fable Fury Database" Google Sheet.
-- This migration keeps the database shape and run/deck behavior reproducible in source control.

create table if not exists public.fable_cards (
  id text primary key,
  card_type text not null check (card_type in ('hero','skill','loot','event','trap','enemy','monster','special')),
  title text not null,
  subtype text,
  difficulty text,
  race text,
  version text not null default 'B',
  rules_text text,
  story_text text,
  image_hint text,
  source_sheet text not null,
  source_row integer not null,
  data jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(source_sheet, source_row)
);

create index if not exists fable_cards_type_idx on public.fable_cards(card_type);
create index if not exists fable_cards_difficulty_idx on public.fable_cards(card_type, difficulty);
create index if not exists fable_cards_subtype_idx on public.fable_cards(card_type, subtype);

create table if not exists public.fable_map_patterns (
  id text primary key,
  name text not null,
  start_cell text not null,
  rooms integer not null default 14,
  version text not null default 'B',
  grid jsonb not null,
  source_row integer not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.fable_deck_recipes (
  id text primary key,
  name text not null,
  kind text not null,
  config jsonb not null,
  description text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.fable_game_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active',
  current_realm integer not null default 1,
  current_location integer not null default 0,
  hero_ids text[] not null default '{}'::text[],
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fable_run_decks (
  run_id uuid not null references public.fable_game_runs(id) on delete cascade,
  deck_key text not null,
  draw_pile text[] not null default '{}'::text[],
  drawn_cards text[] not null default '{}'::text[],
  discard_pile text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key(run_id, deck_key)
);

alter table public.fable_cards enable row level security;
alter table public.fable_map_patterns enable row level security;
alter table public.fable_deck_recipes enable row level security;
alter table public.fable_game_runs enable row level security;
alter table public.fable_run_decks enable row level security;

create or replace function public.fable_shuffle_cards(p_cards text[])
returns text[]
language sql
volatile
as $$
  select coalesce(array_agg(card_id order by random()), '{}'::text[])
  from unnest(coalesce(p_cards, '{}'::text[])) as card_id;
$$;

create or replace function public.fable_build_placements(p_active_cells jsonb, p_cards text[])
returns jsonb
language sql
immutable
as $$
  select coalesce(jsonb_object_agg(cell, p_cards[ordinality]), '{}'::jsonb)
  from jsonb_array_elements_text(coalesce(p_active_cells,'[]'::jsonb)) with ordinality as cells(cell, ordinality)
  where ordinality <= coalesce(array_length(p_cards,1),0);
$$;

create or replace function public.fable_draw_card(p_run_id uuid, p_deck_key text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card text;
begin
  select draw_pile[1] into v_card
  from public.fable_run_decks
  where run_id = p_run_id and deck_key = p_deck_key
  for update;

  if v_card is null then
    return null;
  end if;

  update public.fable_run_decks
  set draw_pile = draw_pile[2:array_length(draw_pile,1)],
      drawn_cards = array_append(drawn_cards, v_card),
      updated_at = now()
  where run_id = p_run_id and deck_key = p_deck_key;

  return v_card;
end;
$$;

create or replace function public.fable_draw_card_details(p_run_id uuid, p_deck_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card_id text;
  v_card jsonb;
  v_remaining integer;
begin
  v_card_id := public.fable_draw_card(p_run_id,p_deck_key);
  if v_card_id is null then return jsonb_build_object('card',null,'remaining',0); end if;
  select to_jsonb(c) into v_card from public.fable_cards c where c.id=v_card_id;
  select coalesce(array_length(draw_pile,1),0) into v_remaining
  from public.fable_run_decks where run_id=p_run_id and deck_key=p_deck_key;
  return jsonb_build_object('card',v_card,'remaining',v_remaining);
end;
$$;

create or replace function public.fable_create_run(p_hero_ids text[] default '{}'::text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_loot text[]; v_events text[]; v_traps text[]; v_shrines text[];
  v_easy text[]; v_medium text[]; v_hard text[];
  v_red text[]; v_blue text[]; v_green text[]; v_yellow text[];
  v_maps text[]; v_portal text;
  v_realm1 text[]; v_realm2 text[]; v_realm3 text[];
  v_map1 jsonb; v_map2 jsonb; v_map3 jsonb;
  v_place1 jsonb; v_place2 jsonb; v_place3 jsonb;
begin
  insert into public.fable_game_runs(hero_ids, state)
  values(coalesce(p_hero_ids, '{}'::text[]), '{}'::jsonb)
  returning id into v_run_id;

  select array_agg(id order by random()) into v_loot from public.fable_cards where active and card_type='loot' and version='B';
  select array_agg(id order by random()) into v_events from public.fable_cards where active and card_type='event' and version='B';
  select array_agg(id order by random()) into v_traps from public.fable_cards where active and card_type='trap' and version='B';
  select array_agg(id order by random()) into v_shrines from public.fable_cards where active and card_type='special' and subtype='shrine' and version='B';
  select id into v_portal from public.fable_cards where active and card_type='special' and subtype='portal' and version='B' limit 1;
  select array_agg(id order by random()) into v_easy from public.fable_cards where active and card_type='enemy' and difficulty='Easy' and version='B';
  select array_agg(id order by random()) into v_medium from public.fable_cards where active and card_type='enemy' and difficulty='Medium' and version='B';
  select array_agg(id order by random()) into v_hard from public.fable_cards where active and card_type='enemy' and difficulty='Hard' and version='B';
  select array_agg(id order by random()) into v_red from public.fable_cards where active and card_type='skill' and subtype='red' and version='B';
  select array_agg(id order by random()) into v_blue from public.fable_cards where active and card_type='skill' and subtype='blue' and version='B';
  select array_agg(id order by random()) into v_green from public.fable_cards where active and card_type='skill' and subtype='green' and version='B';
  select array_agg(id order by random()) into v_yellow from public.fable_cards where active and card_type='skill' and subtype='yellow' and version='B';
  select array_agg(id order by random()) into v_maps from public.fable_map_patterns where active and version='B';

  if coalesce(array_length(v_loot,1),0) <> 60
    or coalesce(array_length(v_events,1),0) < 18
    or coalesce(array_length(v_traps,1),0) < 6
    or coalesce(array_length(v_shrines,1),0) < 3
    or coalesce(array_length(v_easy,1),0) < 4
    or coalesce(array_length(v_medium,1),0) < 4
    or coalesce(array_length(v_hard,1),0) < 4
    or coalesce(array_length(v_maps,1),0) < 3 then
    raise exception 'Fable Fury base content is incomplete';
  end if;

  v_realm1 := public.fable_shuffle_cards(array[v_portal, v_shrines[1], v_traps[1]] || v_easy[1:4] || v_events[1:7]);
  v_realm2 := public.fable_shuffle_cards(array[v_portal, v_shrines[2]] || v_traps[2:3] || v_medium[1:4] || v_events[8:13]);
  v_realm3 := public.fable_shuffle_cards(array[v_portal, v_shrines[3]] || v_traps[4:6] || v_hard[1:4] || v_events[14:18]);

  select jsonb_build_object('id',id,'name',name,'start_cell',start_cell,'grid',grid) into v_map1 from public.fable_map_patterns where id=v_maps[1];
  select jsonb_build_object('id',id,'name',name,'start_cell',start_cell,'grid',grid) into v_map2 from public.fable_map_patterns where id=v_maps[2];
  select jsonb_build_object('id',id,'name',name,'start_cell',start_cell,'grid',grid) into v_map3 from public.fable_map_patterns where id=v_maps[3];

  v_place1 := public.fable_build_placements(v_map1->'grid'->'active_cells', v_realm1);
  v_place2 := public.fable_build_placements(v_map2->'grid'->'active_cells', v_realm2);
  v_place3 := public.fable_build_placements(v_map3->'grid'->'active_cells', v_realm3);

  insert into public.fable_run_decks(run_id,deck_key,draw_pile,metadata) values
    (v_run_id,'loot',v_loot,jsonb_build_object('name','Loot Deck','starting_count',array_length(v_loot,1))),
    (v_run_id,'realm-1',v_realm1,jsonb_build_object('name','Realm 1','starting_count',14,'map',v_map1,'placements',v_place1,'revealed','[]'::jsonb,'recipe','1 Portal, 1 Shrine, 1 Trap, 4 Easy Enemies, 7 Events')),
    (v_run_id,'realm-2',v_realm2,jsonb_build_object('name','Realm 2','starting_count',14,'map',v_map2,'placements',v_place2,'revealed','[]'::jsonb,'recipe','1 Portal, 1 Shrine, 2 Traps, 4 Medium Enemies, 6 Events')),
    (v_run_id,'realm-3',v_realm3,jsonb_build_object('name','Realm 3','starting_count',14,'map',v_map3,'placements',v_place3,'revealed','[]'::jsonb,'recipe','1 Portal, 1 Shrine, 3 Traps, 4 Hard Enemies, 5 Events')),
    (v_run_id,'skills-red',v_red,jsonb_build_object('name','Red Skill Deck','starting_count',array_length(v_red,1))),
    (v_run_id,'skills-blue',v_blue,jsonb_build_object('name','Blue Skill Deck','starting_count',array_length(v_blue,1))),
    (v_run_id,'skills-green',v_green,jsonb_build_object('name','Green Skill Deck','starting_count',array_length(v_green,1))),
    (v_run_id,'skills-yellow',v_yellow,jsonb_build_object('name','Yellow Skill Deck','starting_count',array_length(v_yellow,1)));

  update public.fable_game_runs
  set state=jsonb_build_object('maps',jsonb_build_array(v_map1,v_map2,v_map3)), updated_at=now()
  where id=v_run_id;

  return jsonb_build_object(
    'run_id',v_run_id,
    'realm',1,
    'maps',jsonb_build_array(v_map1,v_map2,v_map3),
    'deck_counts',jsonb_build_object(
      'loot',60,'realm-1',14,'realm-2',14,'realm-3',14,
      'skills-red',array_length(v_red,1),'skills-blue',array_length(v_blue,1),
      'skills-green',array_length(v_green,1),'skills-yellow',array_length(v_yellow,1)
    )
  );
end;
$$;

create or replace function public.fable_reveal_location_details(p_run_id uuid, p_realm integer, p_cell text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := 'realm-' || p_realm::text;
  v_metadata jsonb;
  v_card_id text;
  v_card jsonb;
  v_already boolean;
  v_revealed jsonb;
begin
  if p_realm not between 1 and 3 then raise exception 'Invalid realm'; end if;
  select metadata into v_metadata
  from public.fable_run_decks
  where run_id=p_run_id and deck_key=v_key
  for update;
  if v_metadata is null then raise exception 'Run/realm not found'; end if;

  v_card_id := v_metadata->'placements'->>p_cell;
  if v_card_id is null then raise exception 'Cell % is not active in this realm', p_cell; end if;
  v_already := coalesce((v_metadata->'revealed') ? p_cell,false);

  if not v_already then
    v_revealed := coalesce(v_metadata->'revealed','[]'::jsonb) || to_jsonb(p_cell);
    update public.fable_run_decks
    set metadata=jsonb_set(v_metadata,'{revealed}',v_revealed,true), updated_at=now()
    where run_id=p_run_id and deck_key=v_key;
  end if;

  select to_jsonb(c) into v_card from public.fable_cards c where c.id=v_card_id;
  return jsonb_build_object(
    'cell',p_cell,
    'already_revealed',v_already,
    'card',v_card,
    'map',v_metadata->'map',
    'revealed',case when v_already then v_metadata->'revealed' else v_revealed end
  );
end;
$$;

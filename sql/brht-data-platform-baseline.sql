-- BRHT reusable multi-business data platform.
-- This baseline intentionally contains no organization names or secret hashes.
-- Apply through a Supabase migration, then create organizations through
-- POST /api/brht/admin/organizations.

begin;

create table public.brht_organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  timezone text not null default 'UTC',
  currency text not null default 'USD',
  status text not null default 'active' check (status in ('active','paused','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brht_organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint brht_organizations_currency_format check (currency ~ '^[A-Z]{3}$')
);

create table public.brht_ingest_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint brht_ingest_keys_hash_format check (key_hash ~ '^[0-9a-f]{64}$'),
  constraint brht_ingest_keys_unique_name unique (organization_id, name)
);

create table public.brht_data_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  source_key text not null,
  source_type text not null,
  display_name text not null,
  status text not null default 'active' check (status in ('active','paused','error','disconnected')),
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brht_data_sources_key_format check (source_key ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$'),
  constraint brht_data_sources_unique unique (organization_id, source_key)
);

create table public.brht_sync_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  source_id uuid references public.brht_data_sources(id) on delete set null,
  source_key text not null,
  run_key text,
  status text not null check (status in ('running','success','partial','failed')),
  started_at timestamptz not null,
  finished_at timestamptz,
  rows_read integer not null default 0 check (rows_read >= 0),
  rows_written integer not null default 0 check (rows_written >= 0),
  rows_failed integer not null default 0 check (rows_failed >= 0),
  cursor_state jsonb not null default '{}'::jsonb,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint brht_sync_runs_unique_run_key unique (organization_id, source_key, run_key)
);

create index brht_sync_runs_org_started_idx
  on public.brht_sync_runs (organization_id, started_at desc);
create index brht_sync_runs_source_started_idx
  on public.brht_sync_runs (organization_id, source_key, started_at desc);
create index brht_sync_runs_source_id_idx
  on public.brht_sync_runs (source_id);

create table public.brht_raw_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  source_key text not null,
  object_type text not null,
  record_key text not null,
  external_id text,
  occurred_at timestamptz,
  source_updated_at timestamptz,
  payload jsonb not null,
  payload_hash text not null,
  ingested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brht_raw_records_unique unique (organization_id, source_key, object_type, record_key),
  constraint brht_raw_records_payload_hash_format check (payload_hash ~ '^[0-9a-f]{64}$')
);

create index brht_raw_records_org_occurred_idx
  on public.brht_raw_records (organization_id, occurred_at desc);
create index brht_raw_records_lookup_idx
  on public.brht_raw_records (organization_id, source_key, object_type, external_id);

create table public.brht_metric_daily (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  metric_date date not null,
  source_key text not null,
  metric_key text not null,
  dimension_key text not null default 'all',
  dimensions jsonb not null default '{}'::jsonb,
  value numeric not null,
  unit text,
  source_updated_at timestamptz,
  ingested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brht_metric_daily_unique unique (
    organization_id,
    metric_date,
    source_key,
    metric_key,
    dimension_key
  ),
  constraint brht_metric_daily_key_format check (metric_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$')
);

create index brht_metric_daily_org_date_idx
  on public.brht_metric_daily (organization_id, metric_date desc);
create index brht_metric_daily_query_idx
  on public.brht_metric_daily (organization_id, metric_key, metric_date desc);
create index brht_metric_daily_dimensions_gin
  on public.brht_metric_daily using gin (dimensions);

create table public.brht_product_daily (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  metric_date date not null,
  source_key text not null,
  product_key text not null,
  product_name text not null,
  sku text,
  units_sold numeric not null default 0,
  gross_revenue numeric not null default 0,
  net_revenue numeric not null default 0,
  refunds numeric not null default 0,
  cogs numeric,
  currency text,
  metadata jsonb not null default '{}'::jsonb,
  source_updated_at timestamptz,
  ingested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brht_product_daily_unique unique (
    organization_id,
    metric_date,
    source_key,
    product_key
  )
);

create index brht_product_daily_org_date_idx
  on public.brht_product_daily (organization_id, metric_date desc);
create index brht_product_daily_product_idx
  on public.brht_product_daily (organization_id, product_key, metric_date desc);

create table public.brht_inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  source_key text not null,
  product_key text not null,
  product_name text not null,
  sku text,
  captured_at timestamptz not null,
  on_hand numeric,
  available numeric,
  committed numeric,
  incoming numeric,
  metadata jsonb not null default '{}'::jsonb,
  ingested_at timestamptz not null default now(),
  constraint brht_inventory_snapshots_unique unique (
    organization_id,
    source_key,
    product_key,
    captured_at
  )
);

create index brht_inventory_latest_idx
  on public.brht_inventory_snapshots (organization_id, product_key, captured_at desc);

create table public.brht_dashboard_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.brht_organizations(id) on delete cascade,
  dashboard_key text not null,
  title text not null,
  description text,
  is_default boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brht_dashboard_configs_unique unique (organization_id, dashboard_key)
);

create or replace function public.brht_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.brht_touch_updated_at() from public;
grant execute on function public.brht_touch_updated_at() to service_role;

create trigger brht_organizations_touch_updated_at
before update on public.brht_organizations
for each row execute function public.brht_touch_updated_at();
create trigger brht_data_sources_touch_updated_at
before update on public.brht_data_sources
for each row execute function public.brht_touch_updated_at();
create trigger brht_raw_records_touch_updated_at
before update on public.brht_raw_records
for each row execute function public.brht_touch_updated_at();
create trigger brht_metric_daily_touch_updated_at
before update on public.brht_metric_daily
for each row execute function public.brht_touch_updated_at();
create trigger brht_product_daily_touch_updated_at
before update on public.brht_product_daily
for each row execute function public.brht_touch_updated_at();
create trigger brht_dashboard_configs_touch_updated_at
before update on public.brht_dashboard_configs
for each row execute function public.brht_touch_updated_at();

create view public.brht_v_latest_inventory
with (security_invoker = true)
as
select distinct on (organization_id, source_key, product_key)
  organization_id,
  source_key,
  product_key,
  product_name,
  sku,
  captured_at,
  on_hand,
  available,
  committed,
  incoming,
  metadata
from public.brht_inventory_snapshots
order by organization_id, source_key, product_key, captured_at desc;

create view public.brht_v_source_health
with (security_invoker = true)
as
select
  s.organization_id,
  s.id as source_id,
  s.source_key,
  s.source_type,
  s.display_name,
  s.status as configured_status,
  s.last_synced_at,
  r.status as latest_run_status,
  r.started_at as latest_run_started_at,
  r.finished_at as latest_run_finished_at,
  r.rows_read,
  r.rows_written,
  r.rows_failed,
  r.error_message
from public.brht_data_sources s
left join lateral (
  select sr.*
  from public.brht_sync_runs sr
  where sr.organization_id = s.organization_id
    and sr.source_key = s.source_key
  order by sr.started_at desc
  limit 1
) r on true;

alter table public.brht_organizations enable row level security;
alter table public.brht_ingest_keys enable row level security;
alter table public.brht_data_sources enable row level security;
alter table public.brht_sync_runs enable row level security;
alter table public.brht_raw_records enable row level security;
alter table public.brht_metric_daily enable row level security;
alter table public.brht_product_daily enable row level security;
alter table public.brht_inventory_snapshots enable row level security;
alter table public.brht_dashboard_configs enable row level security;

create policy "brht server only" on public.brht_organizations
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_ingest_keys
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_data_sources
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_sync_runs
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_raw_records
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_metric_daily
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_product_daily
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_inventory_snapshots
for all to anon, authenticated using (false) with check (false);
create policy "brht server only" on public.brht_dashboard_configs
for all to anon, authenticated using (false) with check (false);

revoke all on table public.brht_organizations from anon, authenticated;
revoke all on table public.brht_ingest_keys from anon, authenticated;
revoke all on table public.brht_data_sources from anon, authenticated;
revoke all on table public.brht_sync_runs from anon, authenticated;
revoke all on table public.brht_raw_records from anon, authenticated;
revoke all on table public.brht_metric_daily from anon, authenticated;
revoke all on table public.brht_product_daily from anon, authenticated;
revoke all on table public.brht_inventory_snapshots from anon, authenticated;
revoke all on table public.brht_dashboard_configs from anon, authenticated;
revoke all on table public.brht_v_latest_inventory from anon, authenticated;
revoke all on table public.brht_v_source_health from anon, authenticated;

grant select, insert, update, delete on table public.brht_organizations to service_role;
grant select, insert, update, delete on table public.brht_ingest_keys to service_role;
grant select, insert, update, delete on table public.brht_data_sources to service_role;
grant select, insert, update, delete on table public.brht_sync_runs to service_role;
grant select, insert, update, delete on table public.brht_raw_records to service_role;
grant select, insert, update, delete on table public.brht_metric_daily to service_role;
grant select, insert, update, delete on table public.brht_product_daily to service_role;
grant select, insert, update, delete on table public.brht_inventory_snapshots to service_role;
grant select, insert, update, delete on table public.brht_dashboard_configs to service_role;
grant select on table public.brht_v_latest_inventory to service_role;
grant select on table public.brht_v_source_health to service_role;

create or replace function public.brht_dashboard_bundle(
  p_organization_slug text,
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with selected_org as (
    select o.*
    from public.brht_organizations o
    where o.slug = p_organization_slug
      and o.status <> 'archived'
    limit 1
  )
  select case
    when not exists (select 1 from selected_org) then null
    else jsonb_build_object(
      'organization', (
        select jsonb_build_object(
          'id', o.id,
          'slug', o.slug,
          'name', o.name,
          'timezone', o.timezone,
          'currency', o.currency,
          'status', o.status,
          'metadata', o.metadata
        )
        from selected_org o
      ),
      'dashboard', coalesce((
        select to_jsonb(d)
        from public.brht_dashboard_configs d
        join selected_org o on o.id = d.organization_id
        order by d.is_default desc, d.created_at asc
        limit 1
      ), '{}'::jsonb),
      'metrics', coalesce((
        select jsonb_agg(to_jsonb(m) order by m.metric_date, m.source_key, m.metric_key, m.dimension_key)
        from public.brht_metric_daily m
        join selected_org o on o.id = m.organization_id
        where m.metric_date between p_previous_start_date and p_end_date
      ), '[]'::jsonb),
      'products', coalesce((
        select jsonb_agg(to_jsonb(p) order by p.metric_date, p.product_name)
        from public.brht_product_daily p
        join selected_org o on o.id = p.organization_id
        where p.metric_date between p_previous_start_date and p_end_date
      ), '[]'::jsonb),
      'inventory', coalesce((
        select jsonb_agg(to_jsonb(i) order by i.product_name)
        from public.brht_v_latest_inventory i
        join selected_org o on o.id = i.organization_id
      ), '[]'::jsonb),
      'sources', coalesce((
        select jsonb_agg(to_jsonb(s) order by s.display_name)
        from public.brht_v_source_health s
        join selected_org o on o.id = s.organization_id
      ), '[]'::jsonb),
      'period', jsonb_build_object(
        'start', p_start_date,
        'end', p_end_date,
        'previousStart', p_previous_start_date,
        'previousEnd', p_previous_end_date
      )
    )
  end;
$$;

revoke all on function public.brht_dashboard_bundle(text, date, date, date, date)
from public, anon, authenticated;
grant execute on function public.brht_dashboard_bundle(text, date, date, date, date)
to service_role;

create or replace function public.brht_create_organization(
  p_slug text,
  p_name text,
  p_timezone text,
  p_currency text,
  p_key_name text,
  p_key_prefix text,
  p_key_hash text,
  p_sources jsonb default '[]'::jsonb,
  p_dashboard jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_organization public.brht_organizations%rowtype;
  v_source jsonb;
  v_dashboard_key text;
  v_dashboard_title text;
  v_dashboard_description text;
  v_dashboard_config jsonb;
begin
  insert into public.brht_organizations (slug, name, timezone, currency)
  values (p_slug, p_name, p_timezone, p_currency)
  returning * into v_organization;

  insert into public.brht_ingest_keys (
    organization_id,
    name,
    key_prefix,
    key_hash
  ) values (
    v_organization.id,
    p_key_name,
    p_key_prefix,
    p_key_hash
  );

  for v_source in
    select value from jsonb_array_elements(coalesce(p_sources, '[]'::jsonb))
  loop
    insert into public.brht_data_sources (
      organization_id,
      source_key,
      source_type,
      display_name,
      metadata
    ) values (
      v_organization.id,
      v_source->>'key',
      v_source->>'type',
      coalesce(v_source->>'displayName', v_source->>'name', v_source->>'key'),
      coalesce(v_source->'metadata', '{}'::jsonb)
    );
  end loop;

  v_dashboard_key := coalesce(nullif(p_dashboard->>'key', ''), 'executive');
  v_dashboard_title := coalesce(nullif(p_dashboard->>'title', ''), p_name || ' Business Dashboard');
  v_dashboard_description := nullif(p_dashboard->>'description', '');
  v_dashboard_config := coalesce(p_dashboard->'config', '{}'::jsonb);

  insert into public.brht_dashboard_configs (
    organization_id,
    dashboard_key,
    title,
    description,
    is_default,
    config
  ) values (
    v_organization.id,
    v_dashboard_key,
    v_dashboard_title,
    v_dashboard_description,
    true,
    v_dashboard_config
  );

  return jsonb_build_object(
    'id', v_organization.id,
    'slug', v_organization.slug,
    'name', v_organization.name,
    'timezone', v_organization.timezone,
    'currency', v_organization.currency,
    'dashboardKey', v_dashboard_key
  );
end;
$$;

revoke all on function public.brht_create_organization(text, text, text, text, text, text, text, jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.brht_create_organization(text, text, text, text, text, text, text, jsonb, jsonb)
to service_role;

commit;

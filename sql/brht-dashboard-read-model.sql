-- BRHT dashboard read-model checks and performance indexes.
-- Run against the existing `fablefury` PostgreSQL database as an administrator.
-- This script does not alter source data or replace the existing warehouse.

BEGIN;

-- Verify the expected objects before connecting Vercel.
SELECT
  to_regclass('public.daily_channel_metrics') AS daily_channel_metrics,
  to_regclass('public.shopify_product_daily') AS shopify_product_daily,
  to_regclass('public.inventory_snapshots') AS inventory_snapshots,
  to_regclass('public.products') AS products,
  to_regclass('public.sync_runs') AS sync_runs,
  to_regclass('public.dashboard_daily_summary') AS dashboard_daily_summary;

-- Indexes used by the dashboard's bounded date and latest-snapshot queries.
CREATE INDEX IF NOT EXISTS idx_daily_channel_metrics_date_channel
  ON public.daily_channel_metrics (date, channel);

CREATE INDEX IF NOT EXISTS idx_shopify_product_daily_date_product
  ON public.shopify_product_daily (date, product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_product_snapshot
  ON public.inventory_snapshots (product_id, snapshot_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_runs_source_finished
  ON public.sync_runs (source, finished_at DESC);

COMMIT;

-- Recommended permissions (replace `brht_dashboard_reader` with the actual role):
-- GRANT CONNECT ON DATABASE fablefury TO brht_dashboard_reader;
-- GRANT USAGE ON SCHEMA public TO brht_dashboard_reader;
-- GRANT SELECT ON public.daily_channel_metrics,
--                 public.shopify_product_daily,
--                 public.inventory_snapshots,
--                 public.products,
--                 public.sync_runs,
--                 public.dashboard_daily_summary
--   TO brht_dashboard_reader;
-- ALTER ROLE brht_dashboard_reader SET default_transaction_read_only = on;
-- ALTER ROLE brht_dashboard_reader SET statement_timeout = '12s';

# BRHT n8n workflows

The current self-hosted n8n instance is version 2.17.6 and already contains the Fable Fury PostgreSQL credential named **Postgres account**. These templates deliberately contain no passwords or ingest keys.

## Fable Fury cutover

Import these workflows into `n8n.conryd.com`:

1. `fable-fury-postgres-backfill.json`
2. `fable-fury-postgres-live-sync.json`

For each imported workflow:

1. Open every PostgreSQL node and select the existing **Postgres account** credential.
2. Create one n8n **Header Auth** credential named `BRHT — Fable Fury Ingest`:
   - Header name: `x-brht-ingest-key`
   - Header value: the Fable Fury ingest key held in the sensitive Vercel environment value `BRHT_FABLE_FURY_INGEST_KEY`.
3. Select that Header Auth credential on all three HTTP Request nodes.
4. Run the historical backfill manually.
5. Confirm all three ingest nodes return HTTP 200.
6. Compare the BRHT dashboard totals against Metabase.
7. Activate the live-sync workflow after reconciliation.

## What the two workflows do

### Historical backfill

Reads all available rows from:

- `daily_channel_metrics`
- `shopify_product_daily`
- latest `inventory_snapshots`

It groups metrics by source and sends bounded batches to the BRHT endpoint. Stable dates, dimensions, product IDs and run keys make retries idempotent.

### Live sync

Runs hourly and re-reads the latest 30 days. The overlap intentionally captures late refunds, attribution changes and corrections. Upserts update the matching daily rows without creating duplicates.

## Source mapping

The channel workflow treats known commerce channels as real revenue sources and paid-media channels as attribution sources:

- Shopify, Amazon, BackerKit, Kickstarter, retail, wholesale and direct → `sales_revenue` + `orders`
- Meta/Facebook/Instagram → `ad_spend` + `attributed_revenue` + `conversions`
- Google/Google Ads → `ad_spend` + `attributed_revenue` + `conversions`

Unknown channels with spend are treated as paid media; unknown channels without spend are retained as custom operational sources.

## Generic client template

`brht-ingest-template.json` is the minimal pattern for future businesses:

```text
Source/API/database node
         ↓
Normalize to BRHT contract
         ↓
Authenticated BRHT HTTP request
```

The full contract is documented in `docs/brht-ingestion-contract.md`.

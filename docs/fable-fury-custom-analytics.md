# Fable Fury custom analytics presentation layer

## Objective

Keep the reliable ingestion and PostgreSQL foundation that already exists, but replace Metabase as the day-to-day operating interface with a purpose-built BRHT experience on `brht.ai`.

Metabase can remain available to administrators for ad-hoc exploration and validation. It is no longer the product surface that operators or leadership have to use.

## Target architecture

```text
Shopify / Meta / Google Ads / Amazon / fulfilment / manual inputs
                               ↓
                     n8n schedules + webhooks
                               ↓
                 PostgreSQL raw + modelled data
                               ↓
                 curated read-only analytics views
                               ↓
              small authenticated analytics API
                               ↓
          Next.js server components on brht.ai
                               ↓
      custom dashboards, explanations and action queues
```

### Security boundary

The browser must never connect directly to PostgreSQL.

The current self-hosted server should expose only a narrow HTTPS API through a secure tunnel or reverse proxy. The API uses a read-only database role and can query only approved analytics views. Vercel stores the API URL and bearer token as server-side environment variables.

Private operational pages live under `/ops/*` and require separate HTTP Basic credentials at the edge. When those credentials are absent, the routes return 404.

## Recommended PostgreSQL analytics schema

Create or retain an `analytics` schema that separates business-ready models from raw ingestion tables.

1. `analytics.v_executive_kpis_daily`
   - date
   - net_revenue
   - contribution_profit
   - ad_spend
   - orders
   - average_order_value
   - contribution_margin
   - blended_roas

2. `analytics.v_channel_performance_daily`
   - date
   - channel
   - attributed_revenue
   - spend
   - orders
   - cac
   - roas

3. `analytics.v_product_health`
   - product_id
   - product_name
   - units_sold
   - net_revenue
   - contribution_margin
   - inventory_on_hand
   - stock_cover_days
   - status

4. `analytics.v_source_freshness`
   - source
   - last_successful_sync_at
   - freshness_minutes
   - rows_loaded
   - status
   - latest_error

5. `analytics.v_action_signals`
   - signal_key
   - category
   - priority
   - title
   - explanation
   - estimated_impact
   - owner
   - detected_at
   - resolved_at

The calculations belong in version-controlled SQL, not duplicated across the website. The website formats and explains the results; it should not silently invent financial logic.

## API contract

`GET /v1/executive-dashboard?range=7d|30d|90d`

Required response shape:

```json
{
  "generatedAt": "2026-11-10T07:00:00.000Z",
  "dataLabel": "Live PostgreSQL data",
  "metrics": [],
  "trend": [],
  "channels": [],
  "products": [],
  "sourceHealth": [],
  "actions": [],
  "narrative": {
    "headline": "",
    "summary": "",
    "confidence": 0
  }
}
```

The TypeScript source of truth for the full contract is `lib/fableFuryAnalytics.ts`.

## Reliability requirements

- Every ingestion run records start time, finish time, status, row count and error detail.
- Upserts use stable source identifiers so retries do not create duplicates.
- Financial metrics reconcile back to source totals within an explicit tolerance.
- Time zones and currency conversion rules are fixed and documented.
- Late-arriving refunds, fees and attribution changes update historical models safely.
- Dashboard responses include source freshness so stale numbers cannot look current.
- The API returns a generated timestamp and never includes credentials or raw customer data.

## Website modes

### Public case study

`/work/fable-fury`

Uses explicitly labelled anonymised demonstration data. It shows the architecture, decision experience and interface quality without publishing confidential business performance.

### Private command centre

`/ops/fable-fury`

Uses `FABLE_FURY_ANALYTICS_API_URL` and `FABLE_FURY_ANALYTICS_API_TOKEN`. It is protected by `BRHT_OPS_USERNAME` and `BRHT_OPS_PASSWORD`, marked no-index and served with private no-store caching.

## Cutover sequence

1. Confirm the current PostgreSQL tables and views against the five model groups above.
2. Create a read-only `brht_dashboard` database role limited to the `analytics` schema.
3. Deploy the narrow API beside PostgreSQL and expose it through HTTPS.
4. Add the four server-only environment variables in Vercel.
5. Compare the custom dashboard against Metabase for the same date ranges and sign off reconciliation.
6. Make the BRHT command centre the normal operating view; retain Metabase for audit and ad-hoc analysis.

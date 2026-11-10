# BRHT reusable data platform

## Purpose

BRHT now uses one repeatable architecture for Fable Fury and future businesses:

```text
Business systems and APIs
          ↓
   n8n connectors
          ↓
BRHT authenticated ingest API
          ↓
Supabase PostgreSQL
          ↓
BRHT server-side queries
          ↓
Custom dashboards on brht.ai
```

Metabase is not part of the presentation path. Each business receives a purpose-built dashboard at:

```text
https://brht.ai/dashboards/<organization-slug>
```

The public BRHT landing page and Fantasy Lab are separate and unchanged.

## Why this is reusable

The application is multi-tenant from the database outward. Every operational row carries an `organization_id`; every source belongs to one organization; every ingest key is scoped to one organization; and every dashboard query begins with the organization slug.

A new customer does **not** require a new application or database. Onboarding creates:

1. An organization record.
2. A one-time ingestion key for n8n.
3. The customer's initial source registry.
4. A dashboard configuration.
5. A dashboard URL and normalized ingestion URL.

## Components

### Supabase/PostgreSQL

The existing managed Supabase project contains isolated `brht_*` tables:

- `brht_organizations`
- `brht_ingest_keys`
- `brht_data_sources`
- `brht_sync_runs`
- `brht_raw_records`
- `brht_metric_daily`
- `brht_product_daily`
- `brht_inventory_snapshots`
- `brht_dashboard_configs`

The tables use RLS, explicit privilege revocation for `anon` and `authenticated`, server-only `service_role` access, scoped unique constraints, and idempotent upsert keys.

### n8n

n8n remains the connector and workflow layer. It can pull from Shopify, Meta, Google Ads, Amazon, finance systems, spreadsheets, custom APIs, or an existing PostgreSQL database. Its final step sends normalized JSON to BRHT.

A workflow does not need database credentials for the BRHT database. It needs only:

- The organization's ingest URL.
- Its `x-brht-ingest-key` secret.
- A source key/type/name.
- Normalized metric, product, inventory, or raw-record arrays.

### brht.ai

Next.js exposes three server-only surfaces:

- `POST /api/brht/ingest/[organization]` — authenticated ingestion.
- `GET /api/dashboards/[organization]` — private dashboard JSON.
- `/dashboards/[organization]` — custom dashboard interface.

No Supabase service key or customer source credential is sent to the browser.

## Current Fable Fury setup

Fable Fury is registered as the first organization:

```text
slug: fable-fury
timezone: Australia/Perth
currency: USD
```

Initial source registry:

- Shopify
- Amazon
- Meta Ads
- Google Ads
- Xero
- Fulfilment

Dashboard:

```text
/dashboards/fable-fury
```

The database and dashboard are ready. The remaining data-movement step is to update the existing Fable Fury n8n workflows—or add one migration workflow—so they send normalized records to the BRHT ingest endpoint. The ingest key is stored as a sensitive Vercel environment value for controlled transfer into n8n and is never committed to Git.

## Add another business

Call the server-only onboarding endpoint with the BRHT admin bearer token:

```http
POST /api/brht/admin/organizations
Authorization: Bearer <BRHT_PLATFORM_ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "slug": "example-business",
  "name": "Example Business",
  "timezone": "Australia/Perth",
  "currency": "AUD",
  "sources": [
    { "key": "shopify", "type": "commerce", "displayName": "Shopify" },
    { "key": "meta_ads", "type": "paid_media", "displayName": "Meta Ads" }
  ],
  "dashboard": {
    "key": "executive",
    "title": "Example Business Dashboard",
    "description": "Sales, acquisition and operational performance.",
    "config": { "default_range": "14d" }
  }
}
```

The response returns the raw organization ingest key exactly once. Store it immediately as an n8n Header Auth credential. The database stores only the SHA-256 hash.

## Metric separation

The dashboard deliberately separates real commerce revenue from advertising attribution:

- `sales_revenue` or `net_revenue` contributes to business revenue.
- `attributed_revenue` is displayed on the paid-media channel but is not added again to commerce revenue.
- `ad_spend` contributes to paid-media spend.
- Blended ROAS is commerce revenue divided by total paid-media spend.

This prevents Shopify revenue and Meta/Google attributed revenue from being counted twice.

## Security boundary

- Dashboard routes require HTTP Basic authentication in production.
- Organization onboarding requires a separate long random bearer token.
- Ingestion uses per-organization keys and constant-time hash comparison.
- Ingest keys are scoped to one organization and can be revoked independently.
- Payloads have type, count, format, and body-size limits.
- Database writes use idempotent unique keys.
- Browser clients have no direct access to BRHT tables.
- Dashboard and ingestion responses are `no-store` and `noindex`.

## Cutover from Metabase

1. Configure or update the Fable Fury n8n normalization workflows.
2. Backfill historical rows through the same ingest endpoint.
3. Reconcile 7-, 14-, 30-, and 90-day results against existing Metabase questions.
4. Use the BRHT dashboard as the normal operating interface.
5. Retain Metabase temporarily for audit and one-off SQL exploration.
6. Remove Metabase when the custom dashboards cover the required business questions.

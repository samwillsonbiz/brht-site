# BRHT dashboard connection

The Fable Fury dashboard lives at `/dashboards/fable-fury`. It is a custom Next.js interface using the same hand-built React/SVG approach as Fantasy Lab. It does not embed Metabase and it does not copy the reporting data into another database.

## Existing warehouse contract

The connector targets the tables already created for the Fable Fury reporting system:

- `daily_channel_metrics(date, channel, orders, revenue, spend, conversions, updated_at)` — required
- `shopify_product_daily(date, product_id, product_name, units_sold, updated_at)` — optional product velocity
- `inventory_snapshots(snapshot_at, product_id, product_name, available_quantity)` — optional stock cover
- `products(product_id, product_name, channel, active)` — discovered for schema coverage
- `sync_runs(id, source, status, message, started_at, finished_at)` — optional ingestion health
- `dashboard_daily_summary` — discovered for compatibility; the dashboard uses the channel table directly so it can avoid double-counting paid-media attribution as sales revenue

No browser code receives database credentials. Queries run inside Next.js server code using a small read-only connection pool, a statement timeout, and a read-only transaction.

## Preferred connection: PostgreSQL

Create or reuse a PostgreSQL role with SELECT-only access to the reporting objects, then add these Vercel server environment variables:

```text
BRHT_DATABASE_URL=postgresql://reader:password@host:port/fablefury
BRHT_DATABASE_SSL=require
BRHT_DASHBOARD_USERNAME=<private username>
BRHT_DASHBOARD_PASSWORD=<private password>
```

A private LAN address such as `192.168.x.x` is not reachable from Vercel. The existing tunnel must expose a stable hostname and port to Vercel, or the API option below should be used. Prefer TLS verification (`verify-full`) when the tunnel provides a trusted certificate.

## Alternative connection: narrow HTTPS API

When PostgreSQL should remain completely private, run a small endpoint beside the database (or behind the existing reverse proxy/n8n installation) and configure:

```text
BRHT_ANALYTICS_API_URL=https://analytics.example.com
BRHT_ANALYTICS_API_TOKEN=<bearer token>
BRHT_DASHBOARD_USERNAME=<private username>
BRHT_DASHBOARD_PASSWORD=<private password>
```

The dashboard requests:

```text
GET /v1/fable-fury/dashboard?range=7d|14d|30d|90d
Authorization: Bearer <token>
```

The response uses the `DashboardData` contract in `lib/brht-dashboard/types.ts`.

## Metric rules

The current dashboard deliberately separates sales channels from paid-media attribution:

- Sales revenue and orders: Shopify, Amazon, BackerKit, Kickstarter, retail, wholesale, direct, and mixed commerce channels.
- Ad spend: Meta, Google, TikTok, Pinterest, Bing/Microsoft Ads, and any mixed channel with spend.
- Blended ROAS: commerce revenue divided by paid-media spend.
- Average order value: commerce revenue divided by commerce orders.
- Product velocity: `shopify_product_daily` units in the selected period.
- Days of cover: latest available quantity divided by average daily units in the selected period.

This prevents Meta/Google attributed revenue from being added on top of Shopify/Amazon sales revenue.

## Cutover from Metabase

1. Add the read-only database URL or analytics API URL in Vercel Preview.
2. Open `/dashboards/fable-fury` and compare the 7-, 14-, 30-, and 90-day totals against the existing Metabase questions.
3. Resolve any channel naming differences in `lib/brht-dashboard/data.ts`.
4. Configure dashboard username/password in Preview and Production.
5. Promote the branch after reconciliation.
6. Keep Metabase temporarily for SQL exploration and audit, then remove it from the normal operating workflow once the custom dashboard is signed off.

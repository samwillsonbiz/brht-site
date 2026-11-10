# BRHT ingestion contract

## Endpoint

```http
POST https://brht.ai/api/brht/ingest/<organization-slug>
x-brht-ingest-key: <organization-ingest-key>
Content-Type: application/json
```

The endpoint accepts a maximum 8 MB JSON body and up to 5,000 entries in each array. Larger backfills should be sent as multiple requests with stable run and record keys.

## Complete payload

```json
{
  "source": {
    "key": "shopify",
    "type": "commerce",
    "displayName": "Shopify",
    "metadata": { "store": "example.myshopify.com" }
  },
  "run": {
    "key": "shopify-2026-11-10-daily",
    "status": "success",
    "startedAt": "2026-11-10T08:00:00Z",
    "finishedAt": "2026-11-10T08:01:12Z",
    "rowsRead": 42,
    "rowsWritten": 42,
    "rowsFailed": 0,
    "cursor": { "lastOrderUpdatedAt": "2026-11-10T07:59:59Z" }
  },
  "metrics": [],
  "products": [],
  "inventory": [],
  "records": []
}
```

All four data arrays are optional. One workflow can send only the data it owns.

## Source types

Recommended source types:

- `commerce`
- `paid_media`
- `finance`
- `operations`
- `crm`
- `learning`
- `workforce`
- `custom`

Source keys are stable machine names such as `shopify`, `meta_ads`, `xero`, or `state_swim_booking`.

## Daily metrics

```json
{
  "date": "2026-11-10",
  "metric": "sales_revenue",
  "value": 18432.51,
  "unit": "USD",
  "dimensionKey": "online-store",
  "dimensions": {
    "channel": "online_store",
    "channel_label": "Online Store"
  },
  "sourceUpdatedAt": "2026-11-10T08:00:00Z"
}
```

Dashboard-standard metric keys:

| Metric key | Meaning | Typical source |
|---|---|---|
| `sales_revenue` | Real sales revenue | Shopify, Amazon, booking platform |
| `net_revenue` | Revenue after refunds/discount treatment | Finance or commerce |
| `orders` | Commerce order count | Shopify, Amazon |
| `units_sold` | Units sold | Commerce/product systems |
| `ad_spend` | Advertising spend | Meta, Google, TikTok |
| `attributed_revenue` | Platform-attributed revenue | Meta, Google |
| `conversions` | Conversion count | Paid media |
| `purchases` | Purchase conversion count | Paid media |

Other metric names are stored even when the current executive dashboard does not yet visualize them.

### Dimension idempotency

A metric row is unique by:

```text
organization + date + source + metric + dimensionKey
```

Supply a stable `dimensionKey` when the metric is segmented. When omitted, BRHT derives a deterministic hash from the `dimensions` object, or uses `all` for an unsegmented total.

## Product performance

```json
{
  "date": "2026-11-10",
  "productKey": "gid://shopify/Product/1234",
  "productName": "Core Game",
  "sku": "FF-CORE",
  "unitsSold": 28,
  "grossRevenue": 2240,
  "netRevenue": 2138,
  "refunds": 102,
  "cogs": 756,
  "currency": "USD",
  "metadata": { "category": "game" },
  "sourceUpdatedAt": "2026-11-10T08:00:00Z"
}
```

A product row is unique by organization, date, source, and product key.

## Inventory snapshots

```json
{
  "productKey": "gid://shopify/Product/1234",
  "productName": "Core Game",
  "sku": "FF-CORE",
  "capturedAt": "2026-11-10T08:00:00Z",
  "onHand": 510,
  "available": 472,
  "committed": 38,
  "incoming": 1000,
  "metadata": { "warehouse": "US" }
}
```

Inventory snapshots are append-only by capture time. The dashboard uses the latest snapshot per source/product and calculates days of cover from recent unit velocity.

## Raw source records

Use raw records when a source object must be retained before a metric model is finalized:

```json
{
  "objectType": "order",
  "recordKey": "shopify-order-5678",
  "externalId": "5678",
  "occurredAt": "2026-11-10T06:23:00Z",
  "sourceUpdatedAt": "2026-11-10T06:30:00Z",
  "payload": {
    "id": 5678,
    "total": 149.95,
    "status": "paid"
  }
}
```

The raw payload is stored as JSONB with a deterministic payload hash. No customer secrets, payment credentials, or unnecessary personal data should be sent.

## Idempotency and retries

The endpoint is safe for n8n retries when stable keys are used:

- Metrics: unique date/source/metric/dimension key.
- Products: unique date/source/product key.
- Inventory: unique source/product/capture timestamp.
- Raw records: unique source/object type/record key.
- Runs: unique source/run key.

A retry updates the existing row rather than creating a duplicate.

## n8n pattern

For each source:

```text
Schedule Trigger
    ↓
Source node/API request/database query
    ↓
Code or Set node: normalize to BRHT contract
    ↓
HTTP Request: POST to BRHT ingest endpoint
    ↓
Error workflow/alert
```

Use an n8n Header Auth credential:

```text
Header name: x-brht-ingest-key
Header value: <organization key returned during onboarding>
```

Do not paste the ingest key into a Code node or workflow JSON committed to Git.

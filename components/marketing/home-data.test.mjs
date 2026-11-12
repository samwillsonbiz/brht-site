import test from "node:test";
import assert from "node:assert/strict";
import { toHomeDemo } from "./home-data.ts";
import { emptyDashboardData } from "../../lib/brht-dashboard/types.ts";

function connected() {
  const data = emptyDashboardData("fable-fury", "max");
  data.connection = "connected";
  data.source = "supabase";
  data.summary.revenue.value = 0;
  return data;
}

test("unavailable or failed connections never become zero-valued proof", () => {
  for (const connection of ["unconfigured", "unreachable", "not-found"]) {
    const data = connected();
    data.connection = connection;
    assert.equal(toHomeDemo(data), null);
  }
  const data = connected();
  data.error = "internal error";
  assert.equal(toHomeDemo(data), null);
});

test("missing revenue hides live proof; genuine zero and missing optional metrics remain distinct", () => {
  const data = connected();
  assert.equal(toHomeDemo(data).revenue, 0);
  assert.equal(toHomeDemo(data).orders, null);
  assert.equal(toHomeDemo(data).adSpend, null);
  data.summary.revenue.value = null;
  assert.equal(toHomeDemo(data), null);
});

test("paid-media attribution is excluded while refunds and currency are preserved", () => {
  const data = connected();
  data.organization.currency = "AUD";
  data.channels = [
    { channel: "Ads", kind: "paid-media", revenue: 900 },
    { channel: "Shopify", kind: "commerce", revenue: 500 },
    { channel: "BackerKit", kind: "mixed", revenue: -50 },
    { channel: "Empty", kind: "commerce", revenue: 0 },
  ];
  const result = toHomeDemo(data);
  assert.equal(result.currency, "AUD");
  assert.deepEqual(result.revenueChannels, [
    { name: "Shopify", revenue: 500 },
    { name: "BackerKit", revenue: -50 },
  ]);
  assert.equal(data.channels.length, 4);
});

test("inventory is a bounded summary and excludes unknown availability", () => {
  const data = connected();
  data.products = [
    { productName: "Unknown", availableQuantity: null, daysOfCover: 0 },
    { productName: "Long cover", availableQuantity: 40, daysOfCover: 100 },
    { productName: "Out of stock", availableQuantity: 0, daysOfCover: 0 },
    { productName: "Low cover", availableQuantity: 4, daysOfCover: 2 },
  ];
  data.dataHealth = [{ status: "healthy" }, { status: "failed" }];
  const result = toHomeDemo(data);
  assert.deepEqual(
    result.inventoryProducts.map((p) => p.name),
    ["Out of stock", "Low cover"],
  );
  assert.equal(result.healthySources, 1);
  assert.equal(result.totalSources, 2);
  assert.equal("products" in result, false);
  assert.equal("error" in result, false);
});

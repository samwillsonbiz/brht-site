import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ONE_TIME: Record<number, string> = {
  5: "sam_support_5",
  10: "sam_support_10",
  25: "sam_support_25",
  50: "sam_support_50",
  100: "sam_support_100",
};

const MONTHLY: Record<number, string> = {
  5: "sam_member_5_monthly",
  10: "sam_member_10_monthly",
  25: "sam_member_25_monthly",
};

async function stripeRequest(path: string, init?: RequestInit) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${secret}`);

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Stripe request failed");
  }
  return data;
}

async function priceIdForLookupKey(lookupKey: string) {
  const params = new URLSearchParams();
  params.append("lookup_keys[]", lookupKey);
  params.set("active", "true");
  params.set("limit", "1");

  const result = await stripeRequest(`/prices?${params.toString()}`);
  const price = result?.data?.[0];
  if (!price?.id) throw new Error(`Stripe price not found for ${lookupKey}`);
  return price.id as string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = body?.mode === "monthly" ? "monthly" : "one_time";
    const amount = Number(body?.amount);
    const projectSlug =
      typeof body?.projectSlug === "string" ? body.projectSlug.slice(0, 80) : "general";
    const projectTitle =
      typeof body?.projectTitle === "string"
        ? body.projectTitle.slice(0, 120)
        : "SAM 2028";

    const lookupKey =
      mode === "monthly" ? MONTHLY[amount] : ONE_TIME[amount];

    if (!lookupKey) {
      return NextResponse.json(
        { error: "That support amount is not available." },
        { status: 400 },
      );
    }

    const price = await priceIdForLookupKey(lookupKey);
    const origin = request.nextUrl.origin;

    const params = new URLSearchParams();
    params.set("mode", mode === "monthly" ? "subscription" : "payment");
    params.set("success_url", `${origin}/sam/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin}/sam#fund`);
    params.set("line_items[0][price]", price);
    params.set("line_items[0][quantity]", "1");
    params.set("billing_address_collection", "auto");
    params.set("metadata[source]", "brht_sam");
    params.set("metadata[project_slug]", projectSlug);
    params.set("metadata[project_title]", projectTitle);
    params.set("metadata[support_type]", mode);

    if (mode === "monthly") {
      params.set("subscription_data[metadata][source]", "brht_sam");
      params.set("subscription_data[metadata][project_slug]", projectSlug);
      params.set("subscription_data[metadata][project_title]", projectTitle);
    } else {
      params.set("customer_creation", "always");
      params.set("payment_intent_data[metadata][source]", "brht_sam");
      params.set("payment_intent_data[metadata][project_slug]", projectSlug);
      params.set("payment_intent_data[metadata][project_title]", projectTitle);
    }

    const session = await stripeRequest("/checkout/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

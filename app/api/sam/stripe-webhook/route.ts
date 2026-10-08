import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPABASE_URL = "https://zqwdooykgwkfhwyayucg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inpxd2Rvb3lrZ3drZmh3eWF5dWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDcxNjIsImV4cCI6MjEwNjMyMzE2Mn0._PjizrlrLH-5fxk_ZicCen3IuleP9BvYL9vu4l1wLNs";

function verifyStripeSignature(payload: string, signature: string, secret: string) {
  const parts = signature.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  return signatures.some((candidate) => {
    if (candidate.length !== expected.length) return false;
    return timingSafeEqual(
      Buffer.from(candidate, "hex"),
      Buffer.from(expected, "hex"),
    );
  });
}

async function supabaseRpc(fn: string, body: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function stripeGet(path: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Stripe lookup failed");
  }
  return data;
}

function subscriptionIdFromInvoice(invoice: any): string | null {
  if (typeof invoice?.subscription === "string") return invoice.subscription;
  if (typeof invoice?.parent?.subscription_details?.subscription === "string") {
    return invoice.parent.subscription_details.subscription;
  }
  const line = invoice?.lines?.data?.[0];
  if (typeof line?.subscription === "string") return line.subscription;
  if (
    typeof line?.parent?.subscription_item_details?.subscription === "string"
  ) {
    return line.parent.subscription_item_details.subscription;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  if (!verifyStripeSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;
      const projectSlug = session?.metadata?.project_slug;

      if (
        session?.mode === "payment" &&
        typeof projectSlug === "string" &&
        projectSlug !== "general"
      ) {
        await supabaseRpc("sam_apply_fund_payment", {
          p_secret: secret,
          p_event_id: event.id,
          p_event_type: event.type,
          p_source_slug: projectSlug,
          p_amount_cents: Number(session?.amount_total || 0),
          p_split_each_cents: 0,
        });
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data?.object;
      let metadata =
        invoice?.parent?.subscription_details?.metadata ||
        invoice?.subscription_details?.metadata ||
        {};

      if (metadata?.action_fund_allocation_usd !== "30") {
        const subscriptionId = subscriptionIdFromInvoice(invoice);
        if (subscriptionId) {
          const subscription = await stripeGet(
            `/subscriptions/${encodeURIComponent(subscriptionId)}`,
          );
          metadata = subscription?.metadata || {};
        }
      }

      if (metadata?.action_fund_allocation_usd === "30") {
        await supabaseRpc("sam_apply_fund_payment", {
          p_secret: secret,
          p_event_id: event.id,
          p_event_type: event.type,
          p_source_slug: "sam-full-kit",
          p_amount_cents: Number(invoice?.amount_paid || 0),
          p_split_each_cents: 1000,
        });
      }
    }
  } catch (error) {
    console.error("SAM Stripe allocation error", event.id, error);
    return NextResponse.json({ error: "Allocation failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

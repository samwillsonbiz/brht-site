import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "customer.subscription.deleted":
      console.log("SAM Stripe event", event.type, event.id);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

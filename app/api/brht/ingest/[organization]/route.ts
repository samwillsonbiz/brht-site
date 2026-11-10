import { NextResponse, type NextRequest } from "next/server";
import { ingestOrganizationPayload } from "@/lib/brht-platform/ingest";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024 * 1024;

type RouteContext = {
  params: Promise<{ organization: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Payload exceeds the 8 MB ingestion limit." },
      { status: 413 },
    );
  }

  const rawKey = request.headers.get("x-brht-ingest-key")?.trim() ?? "";
  const { organization } = await context.params;

  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Payload exceeds the 8 MB ingestion limit." },
        { status: 413 },
      );
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Request body must contain valid JSON." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = await ingestOrganizationPayload(organization, rawKey, payload);
    return NextResponse.json(
      { ok: true, ...result, ingestedAt: new Date().toISOString() },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed.";
    const unauthorized =
      message.includes("credentials") || message.includes("expired");
    const validation =
      !unauthorized &&
      (message.includes("required") ||
        message.includes("must") ||
        message.includes("invalid format") ||
        message.includes("cannot contain"));

    if (!unauthorized && !validation) {
      console.error("BRHT ingestion failed", error);
    }

    return NextResponse.json(
      {
        ok: false,
        error: unauthorized ? "Invalid ingestion credentials." : message,
      },
      {
        status: unauthorized ? 401 : validation ? 400 : 500,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  }
}

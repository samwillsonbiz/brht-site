import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sheetUrl = process.env.FANTASY_BASKETBALL_CSV_URL;

  if (!sheetUrl) {
    return NextResponse.json(
      { error: "Fantasy basketball sheet feed is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(sheetUrl, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to load fantasy basketball data." },
        { status: 502 },
      );
    }

    const csv = await response.text();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load fantasy basketball data." },
      { status: 502 },
    );
  }
}

import { NextResponse } from "next/server";

const DEFAULT_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/174l5TWQdzqHXHV112F15zFtfCW771ug439gZ66B6XHU/export?format=csv&gid=0";

export const dynamic = "force-dynamic";

export async function GET() {
  const sheetUrl = process.env.FANTASY_BASKETBALL_CSV_URL || DEFAULT_SHEET_CSV_URL;

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

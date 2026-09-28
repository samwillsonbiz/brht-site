import { NextResponse } from "next/server";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1fm_IjJEm5KoYqshtlWL4DC5bIZWupbaa-QeOIffbPAKFwXchPReA4789OGTWA0DWFAjj_AW0JQmI/pub?gid=1778478103&single=true&output=csv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(SHEET_CSV_URL, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to load RWC ticket data." },
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
      { error: "Unable to load RWC ticket data." },
      { status: 502 },
    );
  }
}

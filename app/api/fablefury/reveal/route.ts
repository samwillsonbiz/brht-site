import { NextResponse } from "next/server";
import { isSupabaseConfigured, rpc } from "@/lib/supabaseRest";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const runId = typeof body?.runId === "string" ? body.runId : "";
  const realm = Number(body?.realm);
  const cell = typeof body?.cell === "string" ? body.cell.toUpperCase() : "";

  if (!runId || ![1, 2, 3].includes(realm) || !/^[A-F][1-5]$/.test(cell)) {
    return NextResponse.json({ error: "Invalid run, realm, or location." }, { status: 400 });
  }

  try {
    const result = await rpc("fable_reveal_location_details", {
      p_run_id: runId,
      p_realm: realm,
      p_cell: cell,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Fable Fury location reveal failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reveal location." },
      { status: 500 },
    );
  }
}

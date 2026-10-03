import { NextResponse } from "next/server";
import { isSupabaseConfigured, selectRows } from "@/lib/supabaseRest";

type RunDeckRow = {
  metadata?: {
    placements?: Record<string, string>;
  } | null;
};

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
    const rows = await selectRows("fable_run_decks", {
      select: "metadata",
      run_id: `eq.${runId}`,
      deck_key: `eq.realm-${realm}`,
      limit: "1",
    }) as RunDeckRow[];

    const cardId = rows?.[0]?.metadata?.placements?.[cell];
    if (!cardId) {
      return NextResponse.json({ error: "No card is assigned to that location." }, { status: 404 });
    }

    const cards = await selectRows("fable_cards", {
      select: "id,card_type,title,subtype,difficulty,race,rules_text,story_text,source_sheet,source_row,data",
      id: `eq.${cardId}`,
      limit: "1",
    }) as Record<string, unknown>[];

    const card = cards?.[0];
    if (!card) {
      return NextResponse.json({ error: "Assigned card could not be found." }, { status: 404 });
    }

    return NextResponse.json({ cell, card });
  } catch (error) {
    console.error("Fable Fury location peek failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not peek at location." },
      { status: 500 },
    );
  }
}

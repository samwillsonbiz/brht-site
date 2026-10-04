import { NextResponse } from "next/server";
import { isSupabaseConfigured, selectRows } from "@/lib/supabaseRest";

type RunDeckRow = {
  metadata?: { placements?: Record<string, string> } | null;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const runId = typeof body?.runId === "string" ? body.runId : "";
  const realm = Number(body?.realm);
  if (!runId || ![1, 2, 3].includes(realm)) {
    return NextResponse.json({ error: "Invalid run or realm." }, { status: 400 });
  }

  try {
    const decks = await selectRows("fable_run_decks", {
      select: "metadata",
      run_id: `eq.${runId}`,
      deck_key: `eq.realm-${realm}`,
      limit: "1",
    }) as RunDeckRow[];

    const placements = decks?.[0]?.metadata?.placements ?? {};
    const ids = [...new Set(Object.values(placements).filter(Boolean))];
    if (!ids.length) return NextResponse.json({ cards: [] });

    const cards = await selectRows("fable_cards", {
      select: "id,card_type,title,subtype,difficulty,race,rules_text,story_text,source_sheet,source_row,data",
      id: `in.(${ids.join(",")})`,
    }) as Record<string, unknown>[];

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Fable Fury preload manifest failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not build preload manifest." },
      { status: 500 },
    );
  }
}

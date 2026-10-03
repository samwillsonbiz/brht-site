import { NextResponse } from "next/server";
import { isSupabaseConfigured, rpc } from "@/lib/supabaseRest";

const ALLOWED_DECKS = new Set([
  "loot",
  "skills-red",
  "skills-blue",
  "skills-green",
  "skills-yellow",
]);

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const runId = typeof body?.runId === "string" ? body.runId : "";
  const deckKey = typeof body?.deckKey === "string" ? body.deckKey : "";

  if (!runId || !ALLOWED_DECKS.has(deckKey)) {
    return NextResponse.json({ error: "Invalid run or deck." }, { status: 400 });
  }

  try {
    const result = await rpc<{ card: unknown; remaining: number }>("fable_draw_card_details", {
      p_run_id: runId,
      p_deck_key: deckKey,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Fable Fury card draw failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not draw card." },
      { status: 500 },
    );
  }
}

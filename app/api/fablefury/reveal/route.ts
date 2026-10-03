import { NextResponse } from "next/server";
import { getHero } from "@/lib/fableFuryHeroes";
import { isSupabaseConfigured, rpc, selectRows } from "@/lib/supabaseRest";

type RevealedCard = {
  id: string;
  card_type: string;
  source_sheet?: string | null;
  source_row?: number | null;
  data?: Record<string, unknown> | null;
  [key: string]: unknown;
};

type RevealResult = {
  card?: RevealedCard;
  [key: string]: unknown;
};

type RunRow = { hero_ids?: string[] | null };

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
    const result = await rpc<RevealResult>("fable_reveal_location_details", {
      p_run_id: runId,
      p_realm: realm,
      p_cell: cell,
    });

    // The current solo client already has a robust Event encounter controller: staged
    // Core Rolls, Lucky Charm rerolls, automatic state effects, result summaries, and
    // encounter locking. Feed Traps through that same controller while preserving the
    // original Trap source sheet/row so the real Trap artwork is still rendered.
    if (result?.card?.card_type === "trap") {
      const runs = await selectRows("fable_game_runs", {
        select: "hero_ids",
        id: `eq.${runId}`,
        limit: "1",
      }) as RunRow[];
      const heroId = runs?.[0]?.hero_ids?.[0];
      const heroRace = getHero(heroId).race.toLowerCase();
      const originalId = result.card.id;

      result.card = {
        ...result.card,
        id: `${originalId}::${heroRace}`,
        card_type: "event",
        data: {
          ...(result.card.data ?? {}),
          digital_card_type: "trap",
          original_card_id: originalId,
          hero_race: heroRace,
        },
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fable Fury location reveal failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reveal location." },
      { status: 500 },
    );
  }
}

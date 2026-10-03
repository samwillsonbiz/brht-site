import { NextResponse } from "next/server";
import { isSupabaseConfigured, selectRows, updateRows } from "@/lib/supabaseRest";

type RunDeckRow = {
  metadata?: {
    placements?: Record<string, string>;
    revealed?: string[];
    [key: string]: unknown;
  } | null;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const runId = typeof body?.runId === "string" ? body.runId : "";
  const realm = Number(body?.realm);
  const currentCell = typeof body?.currentCell === "string" ? body.currentCell.toUpperCase() : "";

  if (!runId || ![1, 2, 3].includes(realm) || !/^[A-F][1-5]$/.test(currentCell)) {
    return NextResponse.json({ error: "Invalid run, realm, or current location." }, { status: 400 });
  }

  try {
    const rows = await selectRows("fable_run_decks", {
      select: "metadata",
      run_id: `eq.${runId}`,
      deck_key: `eq.realm-${realm}`,
      limit: "1",
    }) as RunDeckRow[];

    const metadata = rows?.[0]?.metadata;
    if (!metadata) {
      return NextResponse.json({ error: "Realm deck not found." }, { status: 404 });
    }

    const placements = metadata.placements ?? {};
    const previouslyRevealed = metadata.revealed ?? [];
    const keep = new Set<string>([currentCell]);

    for (const cell of previouslyRevealed) {
      const cardId = placements[cell];
      if (cardId?.startsWith("special-") && cardId !== "special-portal") {
        keep.add(cell);
      }
    }

    const revealed = [...keep];
    const nextMetadata = { ...metadata, revealed };

    await updateRows("fable_run_decks", { metadata: nextMetadata }, {
      run_id: `eq.${runId}`,
      deck_key: `eq.realm-${realm}`,
    });

    return NextResponse.json({ revealed });
  } catch (error) {
    console.error("Fable Fury realm reset failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not reset realm." },
      { status: 500 },
    );
  }
}

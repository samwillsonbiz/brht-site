import { NextResponse } from "next/server";
import { isSupabaseConfigured, selectRows } from "@/lib/supabaseRest";

const MONSTER_BY_SHRINE: Record<string, string> = {
  "special-dragon-sanctuary": "monster-drakorath-jr",
  "special-giant-monolith": "monster-massive-max",
  "special-orc-temple": "monster-battleaxe-zorga",
};

const MONSTER_BY_RACE: Record<string, string> = {
  dragon: "monster-drakorath-jr",
  giant: "monster-massive-max",
  orc: "monster-battleaxe-zorga",
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const shrineId = typeof body?.shrineId === "string" ? body.shrineId : "";
  const race = typeof body?.race === "string" ? body.race.toLowerCase() : "";
  const monsterId = MONSTER_BY_SHRINE[shrineId] || MONSTER_BY_RACE[race];

  if (!monsterId) {
    return NextResponse.json({ error: "No final Monster matches that Realm 3 Shrine." }, { status: 400 });
  }

  try {
    const rows = await selectRows("fable_cards", {
      select: "id,card_type,title,subtype,difficulty,race,rules_text,story_text,source_sheet,source_row,data",
      id: `eq.${monsterId}`,
      limit: "1",
    });
    const card = Array.isArray(rows) ? rows[0] : null;
    if (!card) return NextResponse.json({ error: "Final Monster card not found." }, { status: 404 });
    return NextResponse.json({ card });
  } catch (error) {
    console.error("Fable Fury final Monster lookup failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load final Monster." },
      { status: 500 },
    );
  }
}

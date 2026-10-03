import { NextResponse } from "next/server";
import { isSupabaseConfigured, rpc } from "@/lib/supabaseRest";

type RunSetup = {
  run_id: string;
  realm: number;
  maps: Array<{
    id: string;
    name: string;
    start_cell: string;
    grid: { rows: number; columns: string[]; active_cells: string[] };
  }>;
  deck_counts: Record<string, number>;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const heroIds = Array.isArray(body?.heroIds)
    ? body.heroIds.filter((value: unknown): value is string => typeof value === "string")
    : [];

  try {
    const run = await rpc<RunSetup>("fable_create_run", { p_hero_ids: heroIds });
    return NextResponse.json(run);
  } catch (error) {
    console.error("Fable Fury run setup failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create run." },
      { status: 500 },
    );
  }
}

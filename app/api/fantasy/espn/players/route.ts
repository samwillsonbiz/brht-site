import { NextRequest, NextResponse } from "next/server";
import { fetchEspnPlayerPool } from "@/lib/espnFantasy";

export const dynamic = "force-dynamic";

function numberParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = numberParam(searchParams.get("limit"), 300);
  const scoringPeriodId = numberParam(searchParams.get("scoringPeriodId"), 0);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const statusParam = searchParams.get("status");
  const allowedStatuses = new Set(["FREEAGENT", "WAIVERS", "ONTEAM"]);
  const statuses = statusParam
    ? statusParam
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter((value) => allowedStatuses.has(value)) as Array<
        "FREEAGENT" | "WAIVERS" | "ONTEAM"
      >
    : undefined;

  try {
    const pool = await fetchEspnPlayerPool({
      limit,
      scoringPeriodId,
      status: statuses,
    });

    const players = pool
      .map((entry) => {
        const player = entry.player;
        const stats = (player?.stats ?? []).map((stat) => ({
          id: stat.id ?? null,
          appliedAverage: stat.appliedAverage ?? null,
          appliedTotal: stat.appliedTotal ?? null,
          scoringPeriodId: stat.scoringPeriodId ?? null,
          statSourceId: stat.statSourceId ?? null,
          statSplitTypeId: stat.statSplitTypeId ?? null,
          proTeamId: stat.proTeamId ?? null,
        }));

        return {
          id: player?.id ?? entry.id ?? null,
          name: player?.fullName ?? null,
          firstName: player?.firstName ?? null,
          lastName: player?.lastName ?? null,
          fantasyTeamId: entry.onTeamId ?? 0,
          proTeamId: player?.proTeamId ?? null,
          defaultPositionId: player?.defaultPositionId ?? null,
          eligibleSlots: player?.eligibleSlots ?? [],
          injuryStatus: player?.injuryStatus ?? null,
          injured: player?.injured ?? false,
          percentOwned:
            player?.ownership?.percentOwned ?? player?.percentOwned ?? null,
          percentStarted:
            player?.ownership?.percentStarted ?? player?.percentStarted ?? null,
          averageDraftPosition:
            player?.ownership?.averageDraftPosition ?? null,
          auctionValueAverage:
            player?.ownership?.auctionValueAverage ?? null,
          stats,
        };
      })
      .filter((player) =>
        query ? player.name?.toLowerCase().includes(query) : true,
      );

    return NextResponse.json({
      ok: true,
      source: "espn",
      scoringPeriodId,
      count: players.length,
      players,
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status) || 502
        : 502;

    return NextResponse.json(
      {
        ok: false,
        source: "espn",
        message: "Unable to load ESPN fantasy player pool.",
      },
      { status },
    );
  }
}

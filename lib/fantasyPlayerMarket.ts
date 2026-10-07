import {
  fetchEspnPlayerPool,
  getEspnFantasyConfig,
  type EspnFantasyPlayerPoolEntry,
} from "@/lib/espnFantasy";
import { insertRows, selectRows, upsertRows } from "@/lib/supabaseRest";

export type DraftRoomPlayer = {
  id: number | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  fantasyTeamId: number;
  proTeamId: number | null;
  defaultPositionId: number | null;
  eligibleSlots: number[];
  injuryStatus: string | null;
  injured: boolean;
  percentOwned: number | null;
  percentStarted: number | null;
  averageDraftPosition: number | null;
  auctionValueAverage: number | null;
  stats: Array<{
    id: string | null;
    appliedAverage: number | null;
    appliedTotal: number | null;
    scoringPeriodId: number | null;
    statSourceId: number | null;
    statSplitTypeId: number | null;
    proTeamId: number | null;
  }>;
};

export function serializeEspnPlayer(entry: EspnFantasyPlayerPoolEntry): DraftRoomPlayer {
  const player = entry.player;
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
    stats: (player?.stats ?? []).map((stat) => ({
      id: stat.id ?? null,
      appliedAverage: stat.appliedAverage ?? null,
      appliedTotal: stat.appliedTotal ?? null,
      scoringPeriodId: stat.scoringPeriodId ?? null,
      statSourceId: stat.statSourceId ?? null,
      statSplitTypeId: stat.statSplitTypeId ?? null,
      proTeamId: stat.proTeamId ?? null,
    })),
  };
}

export async function latestPlayerMarketSync() {
  const rows = (await selectRows("fantasy_sync_runs", {
    select: "started_at,completed_at,success,rows_affected,detail",
    sync_type: "eq.player_market",
    order: "started_at.desc",
    limit: "1",
  })) as Array<{
    started_at?: string;
    completed_at?: string;
    success?: boolean;
    rows_affected?: number;
    detail?: Record<string, unknown>;
  }>;

  return rows?.[0] ?? null;
}

export async function fetchPlayerMarket(limit = 1000) {
  const entries = await fetchEspnPlayerPool({
    limit,
    scoringPeriodId: 0,
  });

  return {
    entries,
    players: entries.map(serializeEspnPlayer),
  };
}

export async function persistPlayerMarket(
  entries: EspnFantasyPlayerPoolEntry[],
  source = "draft-room-refresh",
) {
  const config = getEspnFantasyConfig();
  const capturedAt = new Date().toISOString();
  const leagueId = Number(config.leagueId);

  const currentRows = entries
    .filter((entry) => entry.player?.id && entry.player?.fullName)
    .map((entry) => ({
      espn_player_id: entry.player!.id,
      full_name: entry.player!.fullName,
      first_name: entry.player!.firstName ?? null,
      last_name: entry.player!.lastName ?? null,
      nba_team_espn_id: entry.player!.proTeamId || null,
      default_position_id: entry.player!.defaultPositionId ?? null,
      eligible_slots: entry.player!.eligibleSlots ?? [],
      injury_status: entry.player!.injuryStatus ?? null,
      injured: Boolean(entry.player!.injured),
      percent_owned:
        entry.player!.ownership?.percentOwned ?? entry.player!.percentOwned ?? null,
      percent_started:
        entry.player!.ownership?.percentStarted ?? entry.player!.percentStarted ?? null,
      average_draft_position:
        entry.player!.ownership?.averageDraftPosition ?? null,
      auction_value_average:
        entry.player!.ownership?.auctionValueAverage ?? null,
      updated_at: capturedAt,
    }));

  await upsertRows("fantasy_players", currentRows, "espn_player_id");

  const snapshots = entries
    .filter((entry) => entry.player?.id && entry.player?.fullName)
    .map((entry) => ({
      espn_league_id: leagueId,
      espn_player_id: entry.player!.id,
      captured_at: capturedAt,
      source,
      fantasy_team_espn_id: entry.onTeamId ?? 0,
      nba_team_espn_id: entry.player!.proTeamId || null,
      default_position_id: entry.player!.defaultPositionId ?? null,
      eligible_slots: entry.player!.eligibleSlots ?? [],
      injury_status: entry.player!.injuryStatus ?? null,
      injured: Boolean(entry.player!.injured),
      percent_owned:
        entry.player!.ownership?.percentOwned ?? entry.player!.percentOwned ?? null,
      percent_started:
        entry.player!.ownership?.percentStarted ?? entry.player!.percentStarted ?? null,
      average_draft_position:
        entry.player!.ownership?.averageDraftPosition ?? null,
      auction_value_average:
        entry.player!.ownership?.auctionValueAverage ?? null,
    }));

  for (let index = 0; index < snapshots.length; index += 250) {
    await insertRows(
      "fantasy_player_market_snapshots",
      snapshots.slice(index, index + 250),
    );
  }

  await insertRows("fantasy_sync_runs", [
    {
      sync_type: "player_market",
      started_at: capturedAt,
      completed_at: new Date().toISOString(),
      success: true,
      rows_affected: currentRows.length,
      detail: {
        source,
        players: currentRows.length,
        snapshots: snapshots.length,
        leagueId,
        seasonId: Number(config.seasonId),
      },
    },
  ]);

  return {
    capturedAt,
    playerCount: currentRows.length,
    snapshotCount: snapshots.length,
  };
}

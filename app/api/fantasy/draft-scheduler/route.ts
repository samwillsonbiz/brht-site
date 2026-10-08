import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { isSupabaseConfigured, insertRows, selectRows, updateRows } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Team = { id: string; name: string };
type Ballot = {
  team_id: string;
  blocked_slots: string[];
  submitted_at: string;
  edit_salt?: string;
  edit_hash?: string;
};

const TIME_ZONE = "America/Denver";
const FIRST_HOUR = 9;
const LAST_HOUR = 23;
const DAYS = 14;
const noCache = { "Cache-Control": "no-store, max-age=0" };

function dateInLeagueTime() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function dayAfter(date: string, offset: number) {
  const anchor = new Date(`${date}T12:00:00Z`);
  anchor.setUTCDate(anchor.getUTCDate() + offset);
  return anchor.toISOString().slice(0, 10);
}

function validSlots(slots: unknown): slots is string[] {
  if (!Array.isArray(slots) || slots.length > DAYS * (LAST_HOUR - FIRST_HOUR + 1)) return false;
  const today = dateInLeagueTime();
  const allowed = new Set(Array.from({ length: DAYS }, (_, i) => dayAfter(today, i)));
  return slots.every((slot) => {
    if (typeof slot !== "string" || !/^\d{4}-\d{2}-\d{2}@\d{2}$/.test(slot)) return false;
    const [date, hour] = slot.split("@");
    const number = Number(hour);
    return allowed.has(date) && Number.isInteger(number) && number >= FIRST_HOUR && number <= LAST_HOUR;
  });
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: noCache });
}

export async function GET() {
  if (!isSupabaseConfigured()) return error("Scheduler database is not configured.", 503);
  try {
    const [teams, ballots] = await Promise.all([
      selectRows("fantasy_teams", { select: "id,name", order: "name.asc" }) as Promise<Team[]>,
      selectRows("draft_scheduler_ballots", {
        select: "team_id,blocked_slots,submitted_at",
      }) as Promise<Ballot[]>,
    ]);
    return NextResponse.json(
      { teams, ballots, timezone: TIME_ZONE, today: dateInLeagueTime() },
      { headers: noCache },
    );
  } catch (cause) {
    console.error("Draft scheduler load failed", cause);
    return error("Could not load the draft schedule.", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return error("Scheduler database is not configured.", 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid request.", 400);
  }

  const teamId = body.teamId;
  const passphrase = body.passphrase;
  const blockedSlots = body.blockedSlots;
  if (typeof teamId !== "string" || !/^[0-9a-f-]{36}$/i.test(teamId)) {
    return error("Choose a valid league team.", 400);
  }
  if (typeof passphrase !== "string" || passphrase.length < 8 || passphrase.length > 128) {
    return error("Enter an edit passphrase of at least 8 characters.", 400);
  }
  if (!validSlots(blockedSlots)) return error("Availability must be within the next two weeks.", 400);
  const uniqueSlots = Array.from(new Set(blockedSlots)).sort();

  try {
    const teams = await selectRows("fantasy_teams", { select: "id", id: `eq.${teamId}`, limit: "1" }) as Team[];
    if (!teams.length) return error("Team was not found.", 404);

    const existing = await selectRows("draft_scheduler_ballots", {
      select: "team_id,edit_salt,edit_hash",
      team_id: `eq.${teamId}`, limit: "1",
    }) as Ballot[];
    const current = existing[0];
    if (current) {
      const candidate = scryptSync(passphrase, current.edit_salt!, 32);
      const expected = Buffer.from(current.edit_hash!, "hex");
      if (expected.length !== candidate.length || !timingSafeEqual(candidate, expected)) {
        return error("Incorrect edit passphrase for this team.", 403);
      }
      const changed = await updateRows(
        "draft_scheduler_ballots",
        { blocked_slots: uniqueSlots, submitted_at: new Date().toISOString() },
        { team_id: `eq.${teamId}`, edit_hash: `eq.${current.edit_hash}` },
      ) as Ballot[];
      if (!changed.length) return error("Your availability changed elsewhere. Refresh and try again.", 409);
    } else {
      const salt = randomBytes(16).toString("hex");
      const digest = scryptSync(passphrase, salt, 32).toString("hex");
      try {
        await insertRows("draft_scheduler_ballots", [{
          team_id: teamId,
          blocked_slots: uniqueSlots,
          edit_salt: salt,
          edit_hash: digest,
          submitted_at: new Date().toISOString(),
        }]);
      } catch {
        return error("This team was just claimed. Refresh and use its edit passphrase.", 409);
      }
    }
    return NextResponse.json({ ok: true }, { headers: noCache });
  } catch (cause) {
    console.error("Draft scheduler save failed", cause);
    return error("Couldn't save availability. Try again.", 500);
  }
}

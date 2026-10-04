import { NextResponse } from "next/server";
import { getHero } from "@/lib/fableFuryHeroes";
import { insertRows, isSupabaseConfigured, rpc, selectRows, updateRows } from "@/lib/supabaseRest";

type RoomRow = {
  id: string;
  code: string;
  status: "lobby" | "active" | "finished" | "abandoned";
  host_player_id: string | null;
  run_id: string | null;
  shared_state: Record<string, unknown>;
  revision: number;
  max_players: number;
};

type PlayerRow = {
  id: string;
  room_id: string;
  seat: number;
  display_name: string;
  hero_id: string | null;
  starting_token: "healing" | "lucky" | "crystal" | null;
  target_number: number | null;
  ready: boolean;
  player_state: Record<string, unknown>;
  last_seen: string;
};

type RunSetup = {
  run_id: string;
  realm: number;
  maps: Array<Record<string, unknown>>;
  deck_counts: Record<string, number>;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(length = 6) {
  let value = "";
  for (let i = 0; i < length; i += 1) value += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return value;
}
function cleanName(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 28) : "";
}
function cleanCode(value: unknown) {
  return typeof value === "string" ? value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) : "";
}

async function roomByCode(code: string) {
  const rooms = await selectRows("fable_multiplayer_rooms", {
    select: "id,code,status,host_player_id,run_id,shared_state,revision,max_players",
    code: `eq.${code}`,
    limit: "1",
  }) as RoomRow[];
  return rooms?.[0] ?? null;
}

async function playersForRoom(roomId: string) {
  return await selectRows("fable_multiplayer_players", {
    select: "id,room_id,seat,display_name,hero_id,starting_token,target_number,ready,player_state,last_seen",
    room_id: `eq.${roomId}`,
    order: "seat.asc",
  }) as PlayerRow[];
}

async function roomPayload(room: RoomRow) {
  return { room, players: await playersForRoom(room.id) };
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const url = new URL(request.url);
  const code = cleanCode(url.searchParams.get("code"));
  const playerId = url.searchParams.get("playerId") ?? "";
  if (!code) return NextResponse.json({ error: "Room code required." }, { status: 400 });

  try {
    const room = await roomByCode(code);
    if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
    if (playerId) {
      await updateRows("fable_multiplayer_players", { last_seen: new Date().toISOString() }, {
        id: `eq.${playerId}`,
        room_id: `eq.${room.id}`,
      }).catch(() => null);
    }
    return NextResponse.json(await roomPayload(room));
  } catch (error) {
    console.error("Fable Fury room fetch failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load room." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "";

  try {
    if (action === "create") {
      const displayName = cleanName(body?.displayName) || "Host";
      const playerId = crypto.randomUUID();
      let room: RoomRow | null = null;

      for (let attempt = 0; attempt < 8 && !room; attempt += 1) {
        const code = makeCode();
        try {
          const rows = await insertRows("fable_multiplayer_rooms", [{
            code,
            status: "lobby",
            host_player_id: playerId,
            shared_state: {},
            max_players: 6,
          }]) as RoomRow[];
          room = rows?.[0] ?? null;
        } catch (error) {
          if (attempt === 7) throw error;
        }
      }
      if (!room) throw new Error("Could not allocate a room code.");

      await insertRows("fable_multiplayer_players", [{
        id: playerId,
        room_id: room.id,
        seat: 1,
        display_name: displayName,
        ready: false,
        player_state: {},
      }]);
      return NextResponse.json({ ...(await roomPayload(room)), playerId, isHost: true });
    }

    if (action === "join") {
      const code = cleanCode(body?.code);
      const displayName = cleanName(body?.displayName) || "Player";
      const room = await roomByCode(code);
      if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
      if (room.status !== "lobby") return NextResponse.json({ error: "That game has already started." }, { status: 409 });

      const players = await playersForRoom(room.id);
      if (players.length >= room.max_players) return NextResponse.json({ error: "That room is full." }, { status: 409 });
      const usedSeats = new Set(players.map((player) => player.seat));
      let seat = 1;
      while (usedSeats.has(seat) && seat <= room.max_players) seat += 1;
      const playerId = crypto.randomUUID();
      await insertRows("fable_multiplayer_players", [{
        id: playerId,
        room_id: room.id,
        seat,
        display_name: displayName,
        ready: false,
        player_state: {},
      }]);
      await rpc("fable_multiplayer_touch_room", { p_room_id: room.id });
      const fresh = await roomByCode(code);
      return NextResponse.json({ ...(await roomPayload(fresh ?? room)), playerId, isHost: false });
    }

    if (action === "configure") {
      const code = cleanCode(body?.code);
      const playerId = typeof body?.playerId === "string" ? body.playerId : "";
      const room = await roomByCode(code);
      if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
      if (room.status !== "lobby") return NextResponse.json({ error: "Game already started." }, { status: 409 });

      const players = await playersForRoom(room.id);
      const player = players.find((item) => item.id === playerId);
      if (!player) return NextResponse.json({ error: "Player not found in room." }, { status: 403 });

      const heroId = typeof body?.heroId === "string" ? body.heroId : player.hero_id;
      const startingToken = ["healing","lucky","crystal"].includes(body?.startingToken) ? body.startingToken : player.starting_token;
      const targetNumber = Number.isInteger(body?.targetNumber) && body.targetNumber >= 1 && body.targetNumber <= 6 ? body.targetNumber : player.target_number;
      const ready = typeof body?.ready === "boolean" ? body.ready : player.ready;

      if (heroId && players.some((item) => item.id !== playerId && item.hero_id === heroId)) {
        return NextResponse.json({ error: "That Hero is already taken." }, { status: 409 });
      }
      if (targetNumber && players.some((item) => item.id !== playerId && item.target_number === targetNumber)) {
        return NextResponse.json({ error: "That Target Spot is already taken." }, { status: 409 });
      }
      if (ready && (!heroId || !startingToken || !targetNumber)) {
        return NextResponse.json({ error: "Choose a Hero, Token, and Target Spot before readying up." }, { status: 400 });
      }

      await updateRows("fable_multiplayer_players", {
        hero_id: heroId,
        starting_token: startingToken,
        target_number: targetNumber,
        ready,
        last_seen: new Date().toISOString(),
      }, { id: `eq.${playerId}`, room_id: `eq.${room.id}` });
      await rpc("fable_multiplayer_touch_room", { p_room_id: room.id });
      const fresh = await roomByCode(code);
      return NextResponse.json(await roomPayload(fresh ?? room));
    }

    if (action === "start") {
      const code = cleanCode(body?.code);
      const playerId = typeof body?.playerId === "string" ? body.playerId : "";
      const room = await roomByCode(code);
      if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
      if (room.host_player_id !== playerId) return NextResponse.json({ error: "Only the host can start the game." }, { status: 403 });
      if (room.status !== "lobby") return NextResponse.json({ error: "Game already started." }, { status: 409 });

      const players = await playersForRoom(room.id);
      if (!players.length || players.some((player) => !player.ready || !player.hero_id || !player.starting_token || !player.target_number)) {
        return NextResponse.json({ error: "Every player must finish setup and be Ready." }, { status: 409 });
      }
      const heroIds = players.map((player) => player.hero_id as string);
      if (new Set(heroIds).size !== heroIds.length) return NextResponse.json({ error: "Each player needs a unique Hero." }, { status: 409 });

      const run = await rpc<RunSetup>("fable_create_run", { p_hero_ids: heroIds });

      for (const player of players) {
        const hero = getHero(player.hero_id);
        const loot = await rpc<{ card: Record<string, unknown> | null; remaining: number }>("fable_draw_card_details", {
          p_run_id: run.run_id,
          p_deck_key: "loot",
        });
        await updateRows("fable_multiplayer_players", {
          player_state: {
            health: hero.startingHealth,
            armor: hero.startingArmor,
            attackDice: hero.startingAttackDice,
            coinSlots: [2,0,0],
            tokens: {
              healing: player.starting_token === "healing" ? 1 : 0,
              lucky: player.starting_token === "lucky" ? 1 : 0,
              crystal: player.starting_token === "crystal" ? 1 : 0,
            },
            backpack: [null,null,null],
            lootInbox: loot.card ? [loot.card] : [],
            skills: [null,null,null],
            skillFaceUp: [true,true,true],
          },
        }, { id: `eq.${player.id}` });
      }

      const sharedState = {
        phase: "gear",
        realm: 1,
        partyCount: players.length,
        partyLeaderSeat: 1,
        currentActorSeat: 1,
        run,
        revealed: { "1": [], "2": [], "3": [] },
        cardsByCell: {},
        resolvedKeys: [],
        enemy: null,
        shopOpen: false,
        gameWon: null,
      };
      const updated = await updateRows("fable_multiplayer_rooms", {
        status: "active",
        run_id: run.run_id,
        shared_state: sharedState,
        revision: room.revision + 1,
        updated_at: new Date().toISOString(),
      }, { id: `eq.${room.id}` }) as RoomRow[];
      const freshRoom = updated?.[0] ?? { ...room, status: "active" as const, run_id: run.run_id, shared_state: sharedState, revision: room.revision + 1 };
      return NextResponse.json(await roomPayload(freshRoom));
    }

    return NextResponse.json({ error: "Unknown room action." }, { status: 400 });
  } catch (error) {
    console.error("Fable Fury room action failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Room action failed." }, { status: 500 });
  }
}

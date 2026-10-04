"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FABLE_HEROES, TOKEN_LABELS, getHero, type TokenKind } from "@/lib/fableFuryHeroes";
import { FABLE_TOKEN_ART } from "@/lib/fableFuryBoardAssets";
import { preloadCriticalFableAssets } from "@/lib/fableFuryPreload";

type Room = {
  id: string;
  code: string;
  status: "lobby" | "active" | "finished" | "abandoned";
  host_player_id: string | null;
  run_id: string | null;
  shared_state: Record<string, unknown>;
  revision: number;
  max_players: number;
};
type Player = {
  id: string;
  room_id: string;
  seat: number;
  display_name: string;
  hero_id: string | null;
  starting_token: TokenKind | null;
  target_number: number | null;
  ready: boolean;
  player_state: Record<string, unknown>;
};
type RoomPayload = { room: Room; players: Player[]; playerId?: string; isHost?: boolean };

async function roomPost(body: Record<string, unknown>) {
  const response = await fetch("/api/fablefury/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Room request failed.");
  return data as RoomPayload;
}

export default function FableFuryMultiplayerLobby() {
  const router = useRouter();
  const [mode, setMode] = useState<"entry" | "lobby">("entry");
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const me = useMemo(() => players.find((player) => player.id === playerId) ?? null, [players, playerId]);
  const hero = useMemo(() => getHero(me?.hero_id), [me?.hero_id]);
  const allReady = players.length > 0 && players.every((player) => player.ready);
  const takenHeroes = new Set(players.filter((player) => player.id !== playerId).map((player) => player.hero_id).filter(Boolean));
  const takenTargets = new Set(players.filter((player) => player.id !== playerId).map((player) => player.target_number).filter(Boolean));

  useEffect(() => { void preloadCriticalFableAssets(); }, []);

  useEffect(() => {
    if (!room?.code || !playerId) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/fablefury/rooms?code=${encodeURIComponent(room.code)}&playerId=${encodeURIComponent(playerId)}`, { cache: "no-store" });
        const data = await response.json() as RoomPayload & { error?: string };
        if (!cancelled && response.ok) {
          setRoom(data.room);
          setPlayers(data.players);
        }
      } catch {}
    };
    void refresh();
    const timer = window.setInterval(refresh, 900);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [room?.code, playerId]);

  async function createRoom() {
    setBusy("create"); setError(null);
    try {
      const data = await roomPost({ action: "create", displayName: displayName.trim() || "Host" });
      setRoom(data.room); setPlayers(data.players); setPlayerId(data.playerId ?? null); setIsHost(true); setMode("lobby");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create room."); }
    finally { setBusy(null); }
  }

  async function joinRoom() {
    setBusy("join"); setError(null);
    try {
      const data = await roomPost({ action: "join", code: joinCode, displayName: displayName.trim() || "Player" });
      setRoom(data.room); setPlayers(data.players); setPlayerId(data.playerId ?? null); setIsHost(false); setMode("lobby");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not join room."); }
    finally { setBusy(null); }
  }

  async function configure(patch: Record<string, unknown>) {
    if (!room || !playerId) return;
    setBusy("configure"); setError(null);
    try {
      const data = await roomPost({ action: "configure", code: room.code, playerId, ...patch });
      setRoom(data.room); setPlayers(data.players);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update player."); }
    finally { setBusy(null); }
  }

  async function startGame() {
    if (!room || !playerId) return;
    setBusy("start"); setError(null);
    try {
      const data = await roomPost({ action: "start", code: room.code, playerId });
      setRoom(data.room); setPlayers(data.players);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not start game."); }
    finally { setBusy(null); }
  }

  if (mode === "entry") {
    return <main className="min-h-screen bg-[radial-gradient(circle_at_50%_15%,rgba(105,39,170,.32),transparent_35%),linear-gradient(180deg,#12071c,#050307)] px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl flex-col items-center justify-center">
        <button onClick={() => router.push("/fablefury/deckbuilder/run")} className="absolute left-5 top-5 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs font-black text-white/55">← Back</button>
        <div className="text-[10px] font-black uppercase tracking-[.35em] text-[#d99bff]">Fable Fury Multiplayer</div>
        <h1 className="mt-3 text-center text-5xl font-black tracking-[-.05em] text-[#fff1c7] sm:text-7xl">PLAY TOGETHER</h1>
        <p className="mt-4 max-w-2xl text-center text-sm leading-6 text-white/45">Create a room on one computer, share the code, and let up to six Heroes join from their own browsers.</p>
        <div className="mt-10 w-full max-w-xl rounded-[30px] border border-white/10 bg-white/[.035] p-6 shadow-2xl">
          <label className="text-[10px] font-black uppercase tracking-[.14em] text-white/40">Your name</label>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Player name" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-black outline-none focus:border-[#d17cff]/60" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button disabled={!!busy} onClick={createRoom} className="rounded-2xl border-2 border-[#ffce67] bg-[linear-gradient(180deg,#6b2bc8,#45128f_52%,#2b0a63)] px-5 py-4 font-black tracking-[.12em] text-[#fff0bd] disabled:opacity-40">HOST GAME</button>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ROOM CODE" className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 text-center font-black uppercase tracking-[.16em] outline-none focus:border-[#d17cff]/60" />
              <button disabled={!!busy || !joinCode.trim()} onClick={joinRoom} className="rounded-2xl bg-[#fff0bd] px-5 py-4 font-black text-[#29180b] disabled:opacity-40">JOIN</button>
            </div>
          </div>
          {error && <div className="mt-4 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</div>}
        </div>
      </div>
    </main>;
  }

  if (!room || !me) {
    return <main className="grid min-h-screen place-items-center bg-[#08040d] text-white">Loading room…</main>;
  }

  if (room.status === "active") {
    const run = room.shared_state?.run as { run_id?: string } | undefined;
    return <main className="min-h-screen bg-[radial-gradient(circle_at_50%_20%,rgba(82,166,130,.16),transparent_35%),#080d12] px-5 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[30px] border border-emerald-300/20 bg-emerald-300/[.06] p-7 text-center">
          <div className="text-[10px] font-black uppercase tracking-[.24em] text-emerald-300">Shared Run Created</div>
          <h1 className="mt-2 text-4xl font-black text-[#fff1c7]">ROOM {room.code}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/55">All players are now attached to the same shuffled Fable Fury run and the same server-side decks. The room/player state layer is live.</p>
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-white/10 bg-black/25 p-4 text-left text-xs text-white/50">
            <div><strong className="text-white/75">Run:</strong> {run?.run_id ?? room.run_id ?? "—"}</div>
            <div className="mt-1"><strong className="text-white/75">Party:</strong> {players.length} Hero{players.length === 1 ? "" : "es"}</div>
            <div className="mt-1"><strong className="text-white/75">You:</strong> {hero.name} · Target {me.target_number}</div>
          </div>
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm leading-6 text-amber-50/75">The next wiring pass moves the live Realm/combat state into this shared room so each browser can control its own Hero without desync. I am intentionally not launching two independent local engines and pretending they are multiplayer.</div>
        </div>
      </div>
    </main>;
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_50%_15%,rgba(105,39,170,.28),transparent_35%),#08040d] px-4 py-6 text-white">
    <div className="mx-auto max-w-[1450px]">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[.035] p-5">
        <div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#d99bff]">Multiplayer Lobby</div><h1 className="mt-1 text-4xl font-black text-[#fff1c7]">ROOM {room.code}</h1><p className="mt-1 text-xs text-white/40">Share this code with up to {room.max_players - 1} more players.</p></div>
        <div className="rounded-2xl border border-[#ffce67]/30 bg-[#ffce67]/10 px-5 py-3 text-center"><div className="text-[9px] font-black uppercase tracking-[.14em] text-white/40">Players</div><div className="text-2xl font-black text-[#fff0bd]">{players.length}/{room.max_players}</div></div>
      </header>

      {error && <div className="mt-4 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</div>}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section>
          <div className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Choose your Hero</div>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {FABLE_HEROES.map((candidate) => {
              const taken = takenHeroes.has(candidate.id);
              const selected = me.hero_id === candidate.id;
              return <button key={candidate.id} disabled={taken || !!busy} onClick={() => configure({ heroId: candidate.id, ready: false })} className={`overflow-hidden rounded-[22px] border text-left transition disabled:opacity-25 ${selected ? "border-[#ffd66b] bg-amber-300/10 shadow-[0_0_28px_rgba(255,199,79,.18)]" : "border-white/10 bg-white/[.03] hover:border-[#b85cff]/50"}`}><img src={candidate.mat} alt={candidate.name} className="aspect-[4/3] w-full object-cover" /><div className="p-3"><div className="font-black">{candidate.name}</div><div className="text-[10px] text-white/40">{candidate.race} · {candidate.role}{taken ? " · TAKEN" : ""}</div></div></button>;
            })}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div><div className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Starting Token</div><div className="mt-3 grid grid-cols-3 gap-2">{(["lucky","crystal","healing"] as TokenKind[]).map((token) => <button key={token} disabled={!!busy} onClick={() => configure({ startingToken: token, ready: false })} className={`rounded-2xl border p-3 ${me.starting_token === token ? "border-[#ffd66b] bg-amber-300/10" : "border-white/10 bg-white/[.03]"}`}><img src={FABLE_TOKEN_ART[token]} alt={TOKEN_LABELS[token]} className="mx-auto h-20 object-contain" /><div className="mt-2 text-[10px] font-black">{TOKEN_LABELS[token]}</div></button>)}</div></div>
            <div><div className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Target Spot</div><div className="mt-3 grid grid-cols-6 gap-2">{[1,2,3,4,5,6].map((target) => { const taken = takenTargets.has(target); return <button key={target} disabled={taken || !!busy} onClick={() => configure({ targetNumber: target, ready: false })} className={`grid aspect-square place-items-center rounded-xl border text-xl font-black disabled:opacity-20 ${me.target_number === target ? "border-[#ffd66b] bg-[#ffd66b] text-[#251509]" : "border-white/10 bg-black/20"}`}>{target}</button>; })}</div></div>
          </div>

          <button disabled={!me.hero_id || !me.starting_token || !me.target_number || !!busy} onClick={() => configure({ ready: !me.ready })} className={`mt-5 w-full rounded-2xl px-5 py-4 text-lg font-black disabled:opacity-30 ${me.ready ? "border border-emerald-300/30 bg-emerald-300/10 text-emerald-200" : "bg-[#fff0bd] text-[#29180b]"}`}>{me.ready ? "✓ READY — CLICK TO CHANGE" : "READY UP"}</button>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[26px] border border-white/10 bg-white/[.035] p-4">
            <div className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Party</div>
            <div className="mt-3 space-y-2">{players.map((player) => { const h = player.hero_id ? getHero(player.hero_id) : null; return <div key={player.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">{h ? <img src={h.mat} alt={h.name} className="h-16 w-20 rounded-lg object-cover" /> : <div className="grid h-16 w-20 place-items-center rounded-lg border border-dashed border-white/10 text-[9px] text-white/20">No Hero</div>}<div className="min-w-0 flex-1"><div className="truncate font-black">{player.display_name}{player.id === room.host_player_id ? " ★" : ""}</div><div className="truncate text-[10px] text-white/40">{h?.name ?? "Choosing Hero"}{player.target_number ? ` · Target ${player.target_number}` : ""}</div></div><div className={`text-[10px] font-black uppercase ${player.ready ? "text-emerald-300" : "text-white/25"}`}>{player.ready ? "Ready" : "Setting up"}</div></div>; })}</div>
          </div>

          {isHost ? <button disabled={!allReady || !!busy} onClick={startGame} className="w-full rounded-2xl border-2 border-[#ffce67] bg-[linear-gradient(180deg,#6b2bc8,#45128f_52%,#2b0a63)] px-5 py-5 text-lg font-black tracking-[.12em] text-[#fff0bd] disabled:opacity-30">{busy === "start" ? "BUILDING SHARED RUN…" : "START GAME"}</button> : <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4 text-center text-sm text-white/45">{me.ready ? "Waiting for the host to start…" : "Finish your setup and Ready Up."}</div>}
        </aside>
      </div>
    </div>
  </main>;
}

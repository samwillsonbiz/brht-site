"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FABLE_CARD_BACKS, mapArt } from "@/lib/fableFuryAssets";
import { FABLE_BOARD_ART, FABLE_TOKEN_ART } from "@/lib/fableFuryBoardAssets";
import { FABLE_HEROES, TOKEN_LABELS, getHero, type TokenKind } from "@/lib/fableFuryHeroes";

type Screen = "home" | "heroes" | "token" | "map" | "board";
type MapInfo = { id: string; name: string; start_cell: string; grid: { rows: number; columns: string[]; active_cells: string[] } };
type RunSetup = { run_id: string; realm: number; maps: MapInfo[]; deck_counts: Record<string, number> };

const HOME_VISUAL = "https://drive.google.com/uc?export=view&id=1K60zjAGZQ_mzcX87EPEE4MCHO_-i58Pl";
const HOME_AUDIO = "https://drive.google.com/uc?export=download&id=1t-cKYyHNhGAMlLdAM1ZhT_KP43CYpmmy";

function boardCellPosition(cell: string) {
  const columnIndex = cell.charCodeAt(0) - 65;
  const rowIndex = Number(cell.slice(1)) - 1;
  return { left: `${16.45 + columnIndex * 12.86}%`, top: `${19.45 + rowIndex * 16.12}%` };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

function playStartSfx() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.23, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "triangle";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(180, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.18);
    osc2.frequency.setValueAtTime(720, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.22);
    osc1.connect(gain);
    osc2.connect(gain);
    osc1.start();
    osc2.start(ctx.currentTime + 0.04);
    osc1.stop(ctx.currentTime + 0.34);
    osc2.stop(ctx.currentTime + 0.34);
    window.setTimeout(() => void ctx.close(), 500);
  } catch {
    // Sound is enhancement-only.
  }
}

function FantasyButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative min-w-[190px] rounded-[18px] border-2 border-[#ffce67] bg-[linear-gradient(180deg,#6b2bc8_0%,#45128f_52%,#2b0a63_100%)] px-10 py-4 text-xl font-black tracking-[.18em] text-[#fff0bd] shadow-[0_0_0_3px_rgba(77,20,145,.45),0_14px_35px_rgba(0,0,0,.55),0_0_30px_rgba(128,56,255,.3)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_0_3px_rgba(255,206,103,.35),0_18px_45px_rgba(0,0,0,.65),0_0_46px_rgba(149,75,255,.55)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="absolute inset-x-5 top-1 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <span className="relative drop-shadow-[0_2px_0_rgba(50,11,86,.9)]">{children}</span>
    </button>
  );
}

function ScreenBackdrop({ children, video = false }: { children: React.ReactNode; video?: boolean }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040d] text-white">
      {video ? null : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(94,34,157,.35),transparent_34%),radial-gradient(circle_at_50%_85%,rgba(37,113,84,.22),transparent_42%),linear-gradient(180deg,#13071e_0%,#08040d_56%,#040307_100%)]" />
          <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(115deg,transparent_0_70px,rgba(255,255,255,.02)_71px_72px)]" />
        </>
      )}
      <div className="relative z-10 min-h-screen">{children}</div>
    </main>
  );
}

export default function FableFuryIntroPrototype() {
  const [screen, setScreen] = useState<Screen>("home");
  const [heroId, setHeroId] = useState(FABLE_HEROES[0].id);
  const [hoveredHeroId, setHoveredHeroId] = useState<string | null>(null);
  const [token, setToken] = useState<TokenKind | null>(null);
  const [run, setRun] = useState<RunSetup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapLeaving, setMapLeaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hero = useMemo(() => getHero(heroId), [heroId]);
  const hoveredHero = useMemo(() => FABLE_HEROES.find((item) => item.id === hoveredHeroId) ?? null, [hoveredHeroId]);
  const map = run?.maps?.[0] ?? null;
  const mapImage = mapArt(map?.id);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.38;
    audio.muted = false;
    void audio.play().then(() => setSoundOn(true)).catch(() => setSoundOn(false));
  }, []);

  function enableSound() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.volume = 0.38;
    void audio.play().then(() => setSoundOn(true)).catch(() => setSoundOn(false));
  }

  function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.muted = true;
      setSoundOn(false);
    } else {
      audio.muted = false;
      audio.volume = 0.38;
      void audio.play().catch(() => undefined);
      setSoundOn(true);
    }
  }

  function startGame() {
    enableSound();
    playStartSfx();
    window.setTimeout(() => setScreen("heroes"), 180);
  }

  function chooseHero(id: string) {
    playStartSfx();
    setHeroId(id);
    setHoveredHeroId(null);
    window.setTimeout(() => setScreen("token"), 130);
  }

  async function chooseToken(nextToken: TokenKind) {
    setToken(nextToken);
    setLoading(true);
    setError(null);
    playStartSfx();
    try {
      const setup = await postJson<RunSetup>("/api/fablefury/run", { heroIds: [hero.id] });
      setRun(setup);
      window.setTimeout(() => setScreen("map"), 220);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the run.");
    } finally {
      setLoading(false);
    }
  }

  function enterRealm() {
    if (!map) return;
    playStartSfx();
    setMapLeaving(true);
    window.setTimeout(() => {
      setScreen("board");
      setMapLeaving(false);
    }, 760);
  }

  if (screen === "home") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <img src={HOME_VISUAL} alt="Fable Fury cave" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,transparent_0%,rgba(0,0,0,.04)_45%,rgba(0,0,0,.38)_100%)]" />
        <audio ref={audioRef} src={HOME_AUDIO} autoPlay loop preload="auto" />

        <div className="absolute right-5 top-5 z-30">
          <button
            type="button"
            aria-label="Settings"
            onClick={() => setSettingsOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 text-lg text-white/80 backdrop-blur-md transition hover:bg-black/65"
          >
            ⚙
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/15 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
              <button type="button" onClick={toggleSound} className="w-full rounded-xl px-3 py-3 text-left text-xs font-black uppercase tracking-[.12em] text-white/80 transition hover:bg-white/10">
                {soundOn ? "🔊 Mute" : "🔇 Sound On"}
              </button>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-[7vh] z-20 flex justify-center px-5">
          <div className="animate-[ffStartFloat_2.7s_ease-in-out_infinite]">
            <FantasyButton onClick={startGame}>START</FantasyButton>
          </div>
        </div>

        <style jsx global>{`
          @keyframes ffStartFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes ffTokenFloat { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(2deg)} }
          @keyframes ffGlowPulse { 0%,100%{opacity:.42;transform:scale(.92)} 50%{opacity:.9;transform:scale(1.08)} }
        `}</style>
      </main>
    );
  }

  if (screen === "heroes") {
    return (
      <ScreenBackdrop>
        <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col px-4 py-6 sm:px-7">
          <header className="mb-5 text-center">
            <div className="text-[10px] font-black uppercase tracking-[.38em] text-[#d99bff]">Choose Your Hero</div>
            <h2 className="mt-2 text-4xl font-black tracking-[-.04em] text-[#fff1c7] sm:text-6xl">WHO WILL ENTER THE REALM?</h2>
          </header>

          <div className="relative flex min-h-0 flex-1 items-stretch justify-center gap-2 overflow-hidden rounded-[30px] border border-[#a75bff]/35 bg-[#170923]/70 p-2 shadow-[0_30px_80px_rgba(0,0,0,.65)] sm:gap-3 sm:p-3">
            {FABLE_HEROES.map((candidate, index) => {
              const hovered = hoveredHeroId === candidate.id;
              return (
                <button
                  type="button"
                  key={candidate.id}
                  onMouseEnter={() => setHoveredHeroId(candidate.id)}
                  onMouseLeave={() => setHoveredHeroId(null)}
                  onFocus={() => setHoveredHeroId(candidate.id)}
                  onBlur={() => setHoveredHeroId(null)}
                  onClick={() => chooseHero(candidate.id)}
                  className={`group relative min-w-0 overflow-hidden rounded-[20px] border-2 transition-all duration-300 ${hovered ? "z-10 flex-[1.55] border-[#ffdc72] shadow-[0_0_35px_rgba(196,90,255,.72)]" : "flex-1 border-[#812ce0]/70 opacity-90 hover:opacity-100"}`}
                >
                  <img src={candidate.mat} alt={candidate.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: `${42 + (index % 3) * 8}% center` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100618] via-transparent to-black/15" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-left sm:p-4">
                    <div className="text-[9px] font-black uppercase tracking-[.16em] text-[#f2bdff]">{candidate.race} · {candidate.role}</div>
                    <div className="mt-1 text-sm font-black leading-tight text-[#fff0bd] drop-shadow-lg sm:text-lg">{candidate.name}</div>
                  </div>
                </button>
              );
            })}

            {hoveredHero && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 hidden w-[min(43vw,670px)] -translate-x-1/2 -translate-y-1/2 rounded-[26px] border-2 border-[#ffd96a] bg-[#09040d]/95 p-3 shadow-[0_30px_90px_rgba(0,0,0,.85),0_0_50px_rgba(170,64,255,.6)] backdrop-blur-lg lg:block">
                <img src={hoveredHero.mat} alt={`${hoveredHero.name} hero mat`} className="w-full rounded-[18px]" />
                <div className="mt-2 flex items-center justify-between px-2 pb-1">
                  <strong className="text-xl text-[#fff0bd]">{hoveredHero.name}</strong>
                  <span className="text-[10px] font-black uppercase tracking-[.14em] text-white/45">Click to choose</span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 text-center text-[10px] font-bold uppercase tracking-[.18em] text-white/35">Hover a hero to inspect the full mat · click to select</div>
        </div>
      </ScreenBackdrop>
    );
  }

  if (screen === "token") {
    const tokenOrder: TokenKind[] = ["lucky", "crystal", "healing"];
    return (
      <ScreenBackdrop>
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-10 text-center">
          <div className="text-[10px] font-black uppercase tracking-[.38em] text-[#d99bff]">{hero.name}</div>
          <h2 className="mt-2 text-4xl font-black tracking-[-.04em] text-[#fff1c7] sm:text-6xl">CHOOSE YOUR STARTING TOKEN</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/45">One token comes with you into the Realm. Choose wisely.</p>

          <div className="mt-12 grid w-full grid-cols-3 gap-3 sm:gap-8">
            {tokenOrder.map((kind, index) => (
              <button
                type="button"
                key={kind}
                disabled={loading}
                onClick={() => void chooseToken(kind)}
                className="group relative flex min-h-[330px] flex-col items-center justify-center rounded-[30px] border border-white/10 bg-white/[.025] p-4 transition duration-300 hover:-translate-y-2 hover:border-[#d27cff]/70 hover:bg-[#8e35d8]/10 disabled:opacity-40"
              >
                <div className="absolute inset-8 rounded-full bg-[#a83cff]/20 blur-3xl transition group-hover:bg-[#d45cff]/30" />
                <div className="relative" style={{ animation: `ffTokenFloat ${3.1 + index * .45}s ease-in-out ${index * .18}s infinite` }}>
                  <div className="absolute inset-2 rounded-full bg-[#ffd86a]/25 blur-2xl" style={{ animation: "ffGlowPulse 2.4s ease-in-out infinite" }} />
                  <img src={FABLE_TOKEN_ART[kind]} alt={TOKEN_LABELS[kind]} className="relative h-36 w-36 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,.55)] sm:h-48 sm:w-48" />
                </div>
                <div className="relative mt-7 text-base font-black uppercase tracking-[.08em] text-[#fff0bd] sm:text-xl">{TOKEN_LABELS[kind]}</div>
              </button>
            ))}
          </div>
          {loading && <div className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#e7c2ff]">Building your Realm…</div>}
          {error && <div className="mt-6 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}
        </div>
      </ScreenBackdrop>
    );
  }

  if (screen === "map" && map) {
    return (
      <ScreenBackdrop>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
          <div className={`absolute inset-0 transition duration-700 ${mapLeaving ? "opacity-100" : "opacity-0"}`}>
            <BoardStage map={map} heroName={hero.name} token={token} compact />
          </div>

          <div className={`relative z-20 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${mapLeaving ? "translate-x-[-37vw] translate-y-[34vh] scale-[.34] opacity-90" : "translate-x-0 translate-y-0 scale-100 opacity-100"}`}>
            <div className="mb-4 text-center transition-opacity duration-300" style={{ opacity: mapLeaving ? 0 : 1 }}>
              <div className="text-[10px] font-black uppercase tracking-[.38em] text-[#d99bff]">Realm One</div>
              <h2 className="mt-2 text-5xl font-black tracking-[-.05em] text-[#fff1c7]">{map.name}</h2>
            </div>
            {mapImage ? (
              <img src={mapImage} alt={map.name} className="w-[min(68vw,650px)] rounded-[28px] border-2 border-[#ffd66b]/70 shadow-[0_35px_95px_rgba(0,0,0,.72),0_0_55px_rgba(137,56,255,.38)]" />
            ) : (
              <div className="grid aspect-[3/2] w-[min(68vw,650px)] place-items-center rounded-[28px] border border-white/15 bg-white/5 text-white/50">Map art loading…</div>
            )}
            <div className="mt-7 transition-opacity duration-300" style={{ opacity: mapLeaving ? 0 : 1 }}>
              <FantasyButton onClick={enterRealm}>ENTER REALM</FantasyButton>
            </div>
          </div>
        </div>
      </ScreenBackdrop>
    );
  }

  if (screen === "board" && map) {
    return <BoardStage map={map} heroName={hero.name} token={token} />;
  }

  return (
    <ScreenBackdrop>
      <div className="grid min-h-screen place-items-center text-white/60">Preparing Realm…</div>
    </ScreenBackdrop>
  );
}

function BoardStage({ map, heroName, token, compact = false }: { map: MapInfo; heroName: string; token: TokenKind | null; compact?: boolean }) {
  const mapImage = mapArt(map.id);
  return (
    <main className="min-h-screen bg-[#090d13] text-white">
      <div className={`mx-auto max-w-[1550px] p-4 md:p-7 ${compact ? "opacity-95" : "animate-[ffBoardIn_.7s_ease-out_both]"}`}>
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#d59bff]">Realm 1 · {heroName}</div>
            <h1 className="mt-1 text-3xl font-black tracking-[-.04em] text-[#fff1c7] md:text-5xl">{map.name}</h1>
          </div>
          {token && (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white/55">
              <img src={FABLE_TOKEN_ART[token]} alt="" className="h-8 w-8 object-contain" />
              {TOKEN_LABELS[token]}
            </div>
          )}
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#d7c293] shadow-[0_28px_80px_rgba(0,0,0,.55)]">
            <img src={FABLE_BOARD_ART} alt="Fable Fury board" className="w-full" />
            {map.grid.active_cells.map((cell) => (
              <div key={cell} className={`absolute z-20 w-[8.4%] -translate-x-1/2 -translate-y-1/2 ${cell === map.start_cell ? "drop-shadow-[0_0_14px_rgba(255,224,112,1)]" : ""}`} style={boardCellPosition(cell)}>
                <img src={FABLE_CARD_BACKS.location} alt="Hidden Location" className="w-full rounded-md shadow-lg" />
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-1.5 py-0.5 text-[7px] font-black">{cell}</span>
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-[#af64ff]/25 bg-[#160c20] p-4 shadow-xl">
              <div className="text-[9px] font-black uppercase tracking-[.15em] text-[#d7a2ff]">Map Card</div>
              {mapImage && <img src={mapImage} alt={map.name} className="mt-3 w-full rounded-[18px] border border-white/10" />}
              <div className="mt-3 flex items-center justify-between text-xs text-white/45">
                <span>Start: <strong className="text-[#ffe3a0]">{map.start_cell}</strong></span>
                <span>{map.grid.active_cells.length} locations</span>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[.035] p-5">
              <div className="text-[9px] font-black uppercase tracking-[.15em] text-white/35">Front-end checkpoint</div>
              <div className="mt-2 text-lg font-black text-[#fff0bd]">Hero → Token → Map → Board</div>
              <p className="mt-2 text-sm leading-6 text-white/45">This is the handoff point you asked for. Once the feel is right, the live event, trap, shrine and enemy systems can be dropped back behind this board.</p>
              <a href="/fablefury/deckbuilder/run/classic" className="mt-4 inline-flex rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-xs font-black text-white/60 transition hover:border-[#d78aff]/50 hover:text-white">Open current playable prototype</a>
            </div>
          </aside>
        </section>
      </div>
      <style jsx global>{`
        @keyframes ffBoardIn { from { opacity:0; transform:scale(.985); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </main>
  );
}
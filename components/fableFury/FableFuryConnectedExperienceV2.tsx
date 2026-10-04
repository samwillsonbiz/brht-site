"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FABLE_HEROES, TOKEN_LABELS, getHero, type TokenKind } from "@/lib/fableFuryHeroes";
import { FABLE_TOKEN_ART } from "@/lib/fableFuryBoardAssets";
import { preloadCriticalFableAssets } from "@/lib/fableFuryPreload";
import { FABLE_BOOTSTRAP_KEY } from "@/components/fableFury/FableFuryConnectedExperience";

type Screen = "home" | "heroes" | "token";

function FantasyButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-w-[190px] rounded-[18px] border-2 border-[#ffce67] bg-[linear-gradient(180deg,#6b2bc8_0%,#45128f_52%,#2b0a63_100%)] px-10 py-4 text-xl font-black tracking-[.18em] text-[#fff0bd] shadow-[0_0_0_3px_rgba(77,20,145,.45),0_14px_35px_rgba(0,0,0,.55),0_0_30px_rgba(128,56,255,.3)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_0_3px_rgba(255,206,103,.35),0_18px_45px_rgba(0,0,0,.65),0_0_46px_rgba(149,75,255,.55)]"
    >
      <span className="absolute inset-x-5 top-1 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <span className="relative">{children}</span>
    </button>
  );
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(94,34,157,.35),transparent_34%),radial-gradient(circle_at_50%_85%,rgba(37,113,84,.22),transparent_42%),linear-gradient(180deg,#13071e_0%,#08040d_56%,#040307_100%)]" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </main>
  );
}

export default function FableFuryConnectedExperienceV2() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("home");
  const [heroId, setHeroId] = useState(FABLE_HEROES[0].id);
  const [hoveredHeroId, setHoveredHeroId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hero = useMemo(() => getHero(heroId), [heroId]);
  const hoveredHero = useMemo(() => FABLE_HEROES.find((item) => item.id === hoveredHeroId) ?? null, [hoveredHeroId]);

  useEffect(() => {
    void preloadCriticalFableAssets();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.38;
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
      void audio.play().then(() => setSoundOn(true)).catch(() => setSoundOn(false));
    }
  }

  function startGame() {
    enableSound();
    setScreen("heroes");
  }

  function chooseHero(id: string) {
    setHeroId(id);
    setHoveredHeroId(null);
    setScreen("token");
  }

  function chooseToken(token: TokenKind) {
    window.sessionStorage.setItem(FABLE_BOOTSTRAP_KEY, JSON.stringify({ heroId: hero.id, token }));
    router.push("/fablefury/deckbuilder/run/play");
  }

  const settings = (
    <div className="fixed right-5 top-5 z-[200]">
      <button type="button" aria-label="Settings" onClick={() => setSettingsOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/45 text-lg text-white/80 backdrop-blur-md transition hover:bg-black/65">⚙</button>
      {settingsOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/15 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
          <button type="button" onClick={toggleSound} className="w-full rounded-xl px-3 py-3 text-left text-xs font-black uppercase tracking-[.12em] text-white/80 transition hover:bg-white/10">{soundOn ? "🔊 Mute" : "🔇 Sound On"}</button>
        </div>
      )}
    </div>
  );

  if (screen === "home") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <video autoPlay loop muted playsInline preload="auto" poster="/api/fablefury/media/home-video?poster=1" className="absolute inset-0 h-full w-full object-cover" src="/api/fablefury/media/home-video" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,transparent_0%,rgba(0,0,0,.04)_48%,rgba(0,0,0,.36)_100%)]" />
        <audio ref={audioRef} src="/api/fablefury/media/home-audio" autoPlay loop preload="auto" />
        {settings}
        <div className="absolute inset-x-0 bottom-[7vh] z-20 flex flex-col items-center justify-center gap-3 px-5">
          <div className="animate-[ffStartFloat_2.7s_ease-in-out_infinite]"><FantasyButton onClick={startGame}>START</FantasyButton></div>
          <button type="button" onClick={() => router.push("/fablefury/deckbuilder/run/multiplayer")} className="rounded-xl border border-white/15 bg-black/45 px-5 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/65 backdrop-blur-md transition hover:border-[#d27cff]/60 hover:text-white">Multiplayer Beta</button>
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
      <Backdrop>
        {settings}
        <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col px-4 py-6 sm:px-7">
          <header className="mb-5 text-center">
            <div className="text-[10px] font-black uppercase tracking-[.38em] text-[#d99bff]">Choose Your Hero</div>
            <h2 className="mt-2 text-4xl font-black tracking-[-.04em] text-[#fff1c7] sm:text-6xl">WHO WILL ENTER THE REALM?</h2>
          </header>
          <div className="relative flex min-h-0 flex-1 items-stretch justify-center gap-2 overflow-hidden rounded-[30px] border border-[#a75bff]/35 bg-[#170923]/70 p-2 shadow-[0_30px_80px_rgba(0,0,0,.65)] sm:gap-3 sm:p-3">
            {FABLE_HEROES.map((candidate, index) => {
              const hovered = hoveredHeroId === candidate.id;
              return (
                <button type="button" key={candidate.id} onMouseEnter={() => setHoveredHeroId(candidate.id)} onMouseLeave={() => setHoveredHeroId(null)} onFocus={() => setHoveredHeroId(candidate.id)} onBlur={() => setHoveredHeroId(null)} onClick={() => chooseHero(candidate.id)} className={`group relative min-w-0 overflow-hidden rounded-[20px] border-2 transition-all duration-300 ${hovered ? "z-10 flex-[1.55] border-[#ffdc72] shadow-[0_0_35px_rgba(196,90,255,.72)]" : "flex-1 border-[#812ce0]/70 opacity-90 hover:opacity-100"}`}>
                  <img src={candidate.mat} alt={candidate.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: `${42 + (index % 3) * 8}% center` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100618] via-transparent to-black/15" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-left sm:p-4"><div className="text-[9px] font-black uppercase tracking-[.16em] text-[#f2bdff]">{candidate.race} · {candidate.role}</div><div className="mt-1 text-sm font-black leading-tight text-[#fff0bd] drop-shadow-lg sm:text-lg">{candidate.name}</div></div>
                </button>
              );
            })}
            {hoveredHero && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 hidden w-[min(43vw,670px)] -translate-x-1/2 -translate-y-1/2 rounded-[26px] border-2 border-[#ffd96a] bg-[#09040d]/95 p-3 shadow-[0_30px_90px_rgba(0,0,0,.85),0_0_50px_rgba(170,64,255,.6)] backdrop-blur-lg lg:block">
                <img src={hoveredHero.mat} alt={`${hoveredHero.name} hero mat`} className="w-full rounded-[18px]" />
                <div className="mt-2 flex items-center justify-between px-2 pb-1"><strong className="text-xl text-[#fff0bd]">{hoveredHero.name}</strong><span className="text-[10px] font-black uppercase tracking-[.14em] text-white/45">Click to choose</span></div>
              </div>
            )}
          </div>
          <div className="mt-4 text-center text-[10px] font-bold uppercase tracking-[.18em] text-white/35">Hover a hero to inspect the full mat · click to select</div>
        </div>
      </Backdrop>
    );
  }

  const tokenOrder: TokenKind[] = ["lucky", "crystal", "healing"];
  return (
    <Backdrop>
      {settings}
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-10 text-center">
        <div className="text-[10px] font-black uppercase tracking-[.38em] text-[#d99bff]">{hero.name}</div>
        <h2 className="mt-2 text-4xl font-black tracking-[-.04em] text-[#fff1c7] sm:text-6xl">CHOOSE YOUR STARTING TOKEN</h2>
        <div className="mt-12 grid w-full grid-cols-3 gap-3 sm:gap-8">
          {tokenOrder.map((kind, index) => (
            <button type="button" key={kind} onClick={() => chooseToken(kind)} className="group relative flex min-h-[330px] flex-col items-center justify-center rounded-[30px] border border-white/10 bg-white/[.025] p-4 transition duration-300 hover:-translate-y-2 hover:border-[#d27cff]/70 hover:bg-[#8e35d8]/10">
              <div className="absolute inset-8 rounded-full bg-[#a83cff]/20 blur-3xl transition group-hover:bg-[#d45cff]/30" />
              <div className="relative" style={{ animation: `ffTokenFloat ${3.1 + index * .45}s ease-in-out ${index * .18}s infinite` }}><div className="absolute inset-2 rounded-full bg-[#ffd86a]/25 blur-2xl" style={{ animation: "ffGlowPulse 2.4s ease-in-out infinite" }} /><img src={FABLE_TOKEN_ART[kind]} alt={TOKEN_LABELS[kind]} className="relative h-36 w-36 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,.55)] sm:h-48 sm:w-48" /></div>
              <div className="relative mt-7 text-base font-black uppercase tracking-[.08em] text-[#fff0bd] sm:text-xl">{TOKEN_LABELS[kind]}</div>
            </button>
          ))}
        </div>
      </div>
    </Backdrop>
  );
}

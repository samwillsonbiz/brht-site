"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FableFurySoloRunV2 from "@/components/fableFury/FableFurySoloRunV2";
import { FABLE_TOKEN_ART } from "@/lib/fableFuryBoardAssets";
import { FABLE_HEROES, TOKEN_LABELS, getHero, type TokenKind } from "@/lib/fableFuryHeroes";
import { FABLE_BOOTSTRAP_KEY } from "@/components/fableFury/FableFuryConnectedExperience";

type BootstrapDraft = { heroId: string; token: TokenKind };
type Stage = "loading" | "target" | "booting" | "map" | "playing" | "error";
type MapPreview = { src: string; name: string };

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function findButton(root: HTMLElement, predicate: (button: HTMLButtonElement) => boolean) {
  return Array.from(root.querySelectorAll<HTMLButtonElement>("button")).find(predicate) ?? null;
}

async function waitFor<T>(getter: () => T | null | undefined, timeoutMs = 16000): Promise<T> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = getter();
    if (value) return value;
    await sleep(90);
  }
  throw new Error("The playable table took too long to initialise.");
}

function TargetScreen({ heroId, token, onChoose }: { heroId: string; token: TokenKind; onChoose: (value: number) => void }) {
  const hero = getHero(heroId);
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08040d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(110,43,180,.38),transparent_36%),linear-gradient(180deg,#13071e,#050308)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-10 text-center">
        <div className="text-[10px] font-black uppercase tracking-[.38em] text-[#d99bff]">{hero.name} · {TOKEN_LABELS[token]}</div>
        <h1 className="mt-3 text-4xl font-black tracking-[-.04em] text-[#fff1c7] sm:text-6xl">CHOOSE YOUR TARGET SPOT</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">Enemy targeted attacks roll a six-sided die. If it lands on your number, you are hit.</p>

        <div className="mt-10 flex items-center justify-center gap-5 rounded-[28px] border border-white/10 bg-white/[.035] px-7 py-5">
          <img src={hero.mat} alt={hero.name} className="h-24 w-32 rounded-xl object-cover" />
          <img src={FABLE_TOKEN_ART[token]} alt={TOKEN_LABELS[token]} className="h-20 w-20 object-contain" />
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-6 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <button
              type="button"
              key={number}
              onClick={() => onChoose(number)}
              className="group grid aspect-square place-items-center rounded-[22px] border-2 border-[#9e49ee]/60 bg-[linear-gradient(180deg,#311151,#160820)] text-3xl font-black text-[#fff0bd] shadow-[0_15px_35px_rgba(0,0,0,.5)] transition hover:-translate-y-2 hover:scale-105 hover:border-[#ffd66b] hover:bg-[linear-gradient(180deg,#6423a9,#281044)] hover:shadow-[0_0_38px_rgba(171,76,255,.55)] sm:text-5xl"
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function FableFuryPlayableBridge() {
  const router = useRouter();
  const engineRef = useRef<HTMLDivElement | null>(null);
  const bootStarted = useRef(false);
  const [draft, setDraft] = useState<BootstrapDraft | null>(null);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [status, setStatus] = useState("Preparing your hero…");
  const [mapPreview, setMapPreview] = useState<MapPreview | null>(null);
  const [mapLeaving, setMapLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hero = useMemo(() => (draft ? FABLE_HEROES.find((item) => item.id === draft.heroId) ?? null : null), [draft]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(FABLE_BOOTSTRAP_KEY);
      if (!raw) {
        router.replace("/fablefury/deckbuilder/run");
        return;
      }
      const parsed = JSON.parse(raw) as BootstrapDraft;
      if (!parsed.heroId || !parsed.token) throw new Error("Invalid setup data.");
      setDraft(parsed);
      setStage("target");
    } catch {
      router.replace("/fablefury/deckbuilder/run");
    }
  }, [router]);

  useEffect(() => {
    if (stage !== "booting" || !draft || !hero || targetNumber == null || bootStarted.current) return;
    bootStarted.current = true;

    let cancelled = false;
    async function bootstrapPlayableRun() {
      try {
        const root = await waitFor(() => engineRef.current);
        setStatus(`Locking in ${hero!.name}…`);

        const heroButton = await waitFor(() => findButton(root, (button) => (button.textContent ?? "").includes(hero!.name)));
        heroButton.click();
        await sleep(130);

        const tokenButton = await waitFor(() => findButton(root, (button) => (button.textContent ?? "").includes(TOKEN_LABELS[draft!.token])));
        tokenButton.click();
        await sleep(130);

        const targetButton = await waitFor(() => findButton(root, (button) => (button.textContent ?? "").trim() === String(targetNumber)));
        targetButton.click();
        await sleep(130);

        setStatus("Shuffling the Realm and dealing your starting Loot…");
        const lockButton = await waitFor(() => findButton(root, (button) => (button.textContent ?? "").includes("Lock Hero & Deal Starting Loot")));
        lockButton.click();

        const pocketButton = await waitFor(() => findButton(root, (button) => /^Pocket [123]$/.test((button.textContent ?? "").trim()) && !button.disabled), 20000);
        await sleep(180);
        pocketButton.click();

        const enterButton = await waitFor(() => findButton(root, (button) => (button.textContent ?? "").includes("Enter Realm 1") && !button.disabled), 12000);
        setStatus("Placing your map and Location deck…");
        enterButton.click();

        const mapLabel = await waitFor(() => Array.from(root.querySelectorAll<HTMLElement>("div")).find((element) => element.textContent?.trim() === "Realm 1 Map") ?? null, 16000);
        const mapContainer = mapLabel.parentElement?.parentElement;
        const mapImage = mapContainer?.querySelector<HTMLImageElement>("img") ?? null;

        if (cancelled) return;
        if (mapImage?.src) {
          setMapPreview({ src: mapImage.src, name: mapImage.alt || "Realm One" });
          setStage("map");
        } else {
          // The run is fully live even if the presentation extraction ever changes.
          setStage("playing");
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not initialise the playable run.");
        setStage("error");
      }
    }

    void bootstrapPlayableRun();
    return () => { cancelled = true; };
  }, [draft, hero, stage, targetNumber]);

  function chooseTarget(number: number) {
    setTargetNumber(number);
    setStage("booting");
  }

  function enterRealm() {
    setMapLeaving(true);
    window.setTimeout(() => {
      window.sessionStorage.removeItem(FABLE_BOOTSTRAP_KEY);
      setStage("playing");
      setMapLeaving(false);
    }, 720);
  }

  if (stage === "loading" || !draft || !hero) {
    return <main className="grid min-h-screen place-items-center bg-[#08040d] text-sm font-black uppercase tracking-[.18em] text-[#e4c4ff]">Loading Fable Fury…</main>;
  }

  if (stage === "target") {
    return <TargetScreen heroId={draft.heroId} token={draft.token} onChoose={chooseTarget} />;
  }

  return (
    <main className="relative min-h-screen bg-[#090d13]">
      <div
        ref={engineRef}
        className={`min-h-screen transition-opacity duration-500 ${stage === "playing" ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={stage !== "playing"}
      >
        <FableFurySoloRunV2 />
      </div>

      {stage === "booting" && (
        <div className="fixed inset-0 z-[900] grid place-items-center bg-[#08040d] px-5 text-center text-white">
          <div>
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#a557f0]/25 border-t-[#ffd66b]" />
            <div className="mt-7 text-[10px] font-black uppercase tracking-[.32em] text-[#dba8ff]">Building Realm One</div>
            <div className="mt-2 text-2xl font-black text-[#fff0bd]">{status}</div>
            <div className="mt-3 text-xs text-white/35">2 Coins · {TOKEN_LABELS[draft.token]} · starting Loot are being placed into your Backpack.</div>
          </div>
        </div>
      )}

      {stage === "map" && mapPreview && (
        <div className="fixed inset-0 z-[950] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(89,28,145,.28),transparent_38%),#08040d] px-5 py-8 text-white">
          <div className={`relative flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${mapLeaving ? "translate-x-[38vw] translate-y-[28vh] scale-[.32] opacity-70" : "scale-100 opacity-100"}`}>
            <div className="mb-4 text-center transition-opacity duration-300" style={{ opacity: mapLeaving ? 0 : 1 }}>
              <div className="text-[10px] font-black uppercase tracking-[.38em] text-[#d99bff]">Realm One</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-.04em] text-[#fff1c7] sm:text-6xl">{mapPreview.name}</h1>
            </div>
            <img src={mapPreview.src} alt={mapPreview.name} className="w-[min(68vw,650px)] rounded-[28px] border-2 border-[#ffd66b]/70 shadow-[0_35px_95px_rgba(0,0,0,.72),0_0_55px_rgba(137,56,255,.38)]" />
            <button
              type="button"
              onClick={enterRealm}
              className="mt-7 rounded-[18px] border-2 border-[#ffce67] bg-[linear-gradient(180deg,#6b2bc8,#45128f_52%,#2b0a63)] px-10 py-4 text-xl font-black tracking-[.18em] text-[#fff0bd] shadow-[0_15px_40px_rgba(0,0,0,.55)] transition hover:-translate-y-1 hover:scale-105"
              style={{ opacity: mapLeaving ? 0 : 1 }}
            >
              ENTER REALM
            </button>
          </div>
        </div>
      )}

      {stage === "error" && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-[#08040d] p-5 text-white">
          <div className="w-full max-w-lg rounded-[28px] border border-red-300/20 bg-red-400/10 p-6 text-center">
            <div className="text-2xl font-black text-red-100">Could not finish automatic setup</div>
            <p className="mt-3 text-sm leading-6 text-white/55">{error}</p>
            <button onClick={() => { setStage("playing"); setError(null); }} className="mt-5 rounded-xl bg-[#fff0bd] px-5 py-3 font-black text-[#29180b]">Open Playable Table</button>
            <button onClick={() => router.replace("/fablefury/deckbuilder/run")} className="ml-2 mt-5 rounded-xl border border-white/15 px-5 py-3 font-bold text-white/60">Restart</button>
          </div>
        </div>
      )}
    </main>
  );
}

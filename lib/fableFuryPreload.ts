import { FABLE_CARD_BACKS, cardFrontArt, mapArt } from "@/lib/fableFuryAssets";
import { FABLE_BACKPACK_ART, FABLE_BOARD_ART, FABLE_STAT_ART, FABLE_TOKEN_ART } from "@/lib/fableFuryBoardAssets";
import { FABLE_HEROES } from "@/lib/fableFuryHeroes";

type FableCardLite = {
  id: string;
  card_type?: string | null;
  source_sheet?: string | null;
  source_row?: number | null;
  subtype?: string | null;
};

const loaded = new Set<string>();
const inflight = new Map<string, Promise<void>>();

export function preloadImage(src: string | null | undefined) {
  if (!src || typeof window === "undefined" || loaded.has(src)) return Promise.resolve();
  const existing = inflight.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => { loaded.add(src); inflight.delete(src); resolve(); };
    image.onerror = () => { inflight.delete(src); resolve(); };
    image.src = src;
  });
  inflight.set(src, promise);
  return promise;
}

export async function preloadImages(urls: Array<string | null | undefined>, concurrency = 6) {
  const queue = [...new Set(urls.filter((value): value is string => !!value && !loaded.has(value)))];
  if (!queue.length || typeof window === "undefined") return;

  let cursor = 0;
  async function worker() {
    while (cursor < queue.length) {
      const index = cursor++;
      await preloadImage(queue[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));
}

export function criticalFableAssets() {
  return [
    ...FABLE_HEROES.map((hero) => hero.mat),
    FABLE_BOARD_ART,
    FABLE_BACKPACK_ART,
    ...Object.values(FABLE_TOKEN_ART),
    ...Object.values(FABLE_STAT_ART),
    ...Object.values(FABLE_CARD_BACKS),
  ];
}

export async function preloadCriticalFableAssets() {
  await preloadImages(criticalFableAssets(), 8);
}

export async function preloadRealmAssets(runId: string, realm: number, mapId?: string | null) {
  try {
    const response = await fetch("/api/fablefury/preload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, realm }),
    });
    if (!response.ok) return;
    const data = await response.json() as { cards?: FableCardLite[] };
    await preloadImages([
      mapArt(mapId),
      ...(data.cards ?? []).map((card) => cardFrontArt(card)),
    ], 8);
  } catch {
    // Preloading is an optimization only; never block the game on it.
  }
}

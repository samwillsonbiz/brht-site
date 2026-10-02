"use client";

import { useEffect, useState } from "react";

type Score = {
  vibe: number;
  consensus: number;
  heat: number;
  confidence: number;
  sampleSize: number;
};

type Result = { score?: Score };

function vibeStyle(vibe: number) {
  if (vibe >= 67) return { text: "text-emerald-600", bg: "bg-emerald-50", label: "positive" };
  if (vibe <= 33) return { text: "text-rose-600", bg: "bg-rose-50", label: "negative" };
  return { text: "text-amber-600", bg: "bg-amber-50", label: "mixed" };
}

export default function LiveTopicScore({
  query,
  youtubeVideoIds = [],
  allowYouTubeSearch = false,
}: {
  query: string;
  youtubeVideoIds?: string[];
  allowYouTubeSearch?: boolean;
}) {
  const [score, setScore] = useState<Score | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams({ q: query });
        if (youtubeVideoIds.length) params.set("youtubeVideoIds", youtubeVideoIds.slice(0, 12).join(","));
        if (allowYouTubeSearch) params.set("youtubeSearch", "1");

        const response = await fetch(`/api/outside-feed/search?${params.toString()}`);
        if (!response.ok) throw new Error("score failed");
        const data = (await response.json()) as Result;
        if (!cancelled && data.score) setScore(data.score);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [query, allowYouTubeSearch, youtubeVideoIds.join(",")]);

  if (!score) {
    return (
      <div className="rounded-[18px] border border-[#17213a]/[0.06] bg-[#f8faff] px-4 py-3 text-right">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/32">Vibe</div>
        <div className="mt-1 text-2xl font-[800] tracking-[-0.05em] text-[#17213a]/22">{failed ? "—" : "…"}</div>
        <div className="mt-1 text-[9px] font-semibold text-[#17213a]/30">{failed ? "no score" : "scoring live"}</div>
      </div>
    );
  }

  if (score.sampleSize === 0) {
    return (
      <div className="rounded-[18px] border border-[#17213a]/[0.06] bg-[#f8faff] px-4 py-3">
        <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/38">Vibe</div>
        <div className="mt-1 text-[36px] font-[850] leading-none tracking-[-0.07em] text-[#17213a]/24">—</div>
        <div className="mt-2 text-[9px] font-semibold leading-4 text-[#17213a]/36">Attention detected.<br />No measured reactions yet.</div>
      </div>
    );
  }

  const style = vibeStyle(score.vibe);
  const lowSample = score.sampleSize < 100;

  return (
    <div className={`rounded-[18px] border border-[#17213a]/[0.05] px-4 py-3 ${style.bg}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/38">Vibe</div>
          <div className={`mt-0.5 text-[36px] font-[850] leading-none tracking-[-0.07em] ${style.text}`}>{score.vibe}</div>
          <div className={`mt-1 text-[9px] font-extrabold uppercase tracking-[0.05em] ${style.text}`}>{style.label}</div>
        </div>
        <div className="pb-0.5 text-right text-[9px] font-bold leading-4 text-[#17213a]/40">
          <div><span className="text-[#101a33]/72">{score.consensus}</span> consensus</div>
          <div><span className="text-[#101a33]/72">{score.heat}</span> heat</div>
          <div><span className="text-[#101a33]/72">{score.confidence}</span> confidence</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#17213a]/[0.06] pt-2 text-[9px] font-semibold text-[#17213a]/36">
        <span>{score.sampleSize} reactions</span>
        {lowSample && <span className="text-amber-600">low sample</span>}
      </div>
    </div>
  );
}

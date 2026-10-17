"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Headphones, Search, X } from "lucide-react";
import type { BabeEpisode } from "./episodes";
import { BabeLogo } from "../brand";
import { PODCAST_ARCHIVE_URL } from "./episodes";

function niceDate(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-AU", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

function niceDuration(value: string): string {
  if (!value) return "";
  if (/^\d+$/.test(value)) {
    const minutes = Math.round(Number(value) / 60);
    return minutes + " min";
  }
  const bits = value.split(":").map(Number);
  if (bits.length === 3) return bits[0] + "h " + bits[1] + "m";
  if (bits.length === 2) return bits[0] + " min";
  return value;
}

export default function BabeEpisodeBrowser({ episodes }: { episodes: BabeEpisode[] }) {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [visible, setVisible] = useState(12);

  const seasons = useMemo(() => [...new Set(episodes.map(e => e.season).filter((s): s is number => s !== null))].sort((a, b) => b - a), [episodes]);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    return episodes.filter(ep => {
      const matchesSeason = season === "all" || String(ep.season) === season;
      const matchesQuery = !query || (ep.title + " " + ep.description + " " + (ep.number ?? "")).toLowerCase().includes(query);
      return matchesSeason && matchesQuery;
    }).sort((a, b) => sort === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [episodes, search, season, sort]);

  const changeSeason = (s: string) => { setSeason(s); setVisible(12); };
  const changeSearch = (s: string) => { setSearch(s); setVisible(12); };

  return (
    <main className="min-h-screen bg-[#FAF5EE] text-[#1F1B24] babe-archive">
      <header className="sticky top-0 z-30 border-b border-[#E6DCCF] bg-[#FAF5EE] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/babe" className="flex items-center gap-3" aria-label="Back to Babe podcast homepage">
            <BabeLogo small/>
          </Link>
          <Link href="/babe#listen" className="inline-flex items-center gap-2 text-xs font-bold sm:text-sm"><ArrowLeft size={16}/> Back to the show</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-5 pb-24 pt-12 sm:px-8 lg:pt-20">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[.18em] text-[#C2473C]">Every question. Every rabbit hole.</div>
            <h1 className="mt-5 text-[clamp(3.7rem,9vw,7rem)] font-black leading-[.95] tracking-[-.075em]">The <em className="font-normal text-[#C2473C]" style={{fontFamily:"Georgia,serif"}}>archive.</em></h1>
            <p className="mt-5 max-w-[620px] text-base leading-8 text-[#4A4450]">From curious questions to heated debates—find the conversation you want to jump into.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#F4C9C4] px-5 py-3 text-xs font-black"><Headphones size={16}/>{episodes.length ? episodes.length + " episodes available" : "Podcast archive"}</div>
        </div>

        {episodes.length ? (
          <>
            <div className="mt-12 rounded-[25px] border border-[#E6DCCF] bg-white p-5 shadow-sm sm:p-7">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="relative flex min-w-0 items-center">
                  <Search className="pointer-events-none absolute left-4 h-5 w-5 text-[#90867f]" />
                  <input aria-label="Search episodes" type="search" placeholder="Search topics, episodes, or guests..." value={search} onChange={e => changeSearch(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#E6DCCF] bg-[#faf6f0] py-3 pl-12 pr-12 text-sm font-medium outline-none transition placeholder:text-[#a59a91] focus:border-[#C2473C] focus:ring-2 focus:ring-[#CFE8E1]" />
                  {search && <button type="button" onClick={() => changeSearch("")} aria-label="Clear search" className="absolute right-3 grid h-9 w-9 place-items-center rounded-full hover:bg-[#e9ddd2]"><X size={17}/></button>}
                </label>
                <label className="flex items-center gap-2 rounded-2xl bg-[#faf6f0] px-4 text-xs font-bold text-[#4A4450]">
                  Sort
                  <select value={sort} onChange={e => setSort(e.target.value as "newest" | "oldest")} className="h-14 flex-1 bg-transparent text-sm font-bold text-[#1F1B24] outline-none">
                    <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
                  </select>
                </label>
              </div>
              {!!seasons.length && <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by season">
                <button type="button" onClick={() => changeSeason("all")} aria-pressed={season === "all"} className={"rounded-full px-4 py-2 text-xs font-bold transition " + (season === "all" ? "bg-[#1F1B24] text-white" : "bg-[#f3eee8] hover:bg-[#e9dfd8]")}>All seasons</button>
                {seasons.map(s => <button type="button" key={s} onClick={() => changeSeason(String(s))} aria-pressed={season === String(s)}
                  className={"rounded-full px-4 py-2 text-xs font-bold transition " + (season === String(s) ? "bg-[#1F1B24] text-white" : "bg-[#f3eee8] hover:bg-[#e9dfd8]")}>Season {s}</button>)}
              </div>}
            </div>

            <div aria-live="polite" className="mt-8 text-xs font-bold text-[#978980]">{results.length} {results.length === 1 ? "episode" : "episodes"} found</div>

            {results.length ? <div className="mt-4 divide-y divide-[#211d1d]/10 rounded-[25px] border border-[#E6DCCF] bg-white">
              {results.slice(0, visible).map((episode, index) => <a href={episode.link} target="_blank" rel="noopener noreferrer" key={episode.id}
                className="group flex flex-col gap-4 p-5 transition hover:bg-[#F2EADF] sm:flex-row sm:items-center sm:gap-7 sm:p-7">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4C9C4] text-lg font-black tracking-tight text-[#7b463d] sm:h-16 sm:w-16">
                  {episode.number != null ? String(episode.number).padStart(2, "0") : String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#978780]">
                    <span>{episode.season !== null ? "Season " + episode.season : "Podcast episode"}</span>
                    {episode.date && <span>{niceDate(episode.date)}</span>}
                    {episode.duration && <span>{niceDuration(episode.duration)}</span>}
                  </div>
                  <h2 className="mt-2 text-xl font-black tracking-[-.04em] transition group-hover:text-[#1B5E5C] sm:text-2xl">{episode.title}</h2>
                  {episode.description && <p className="mt-2 line-clamp-2 max-w-[850px] text-sm leading-6 text-[#6b625d]">{episode.description}</p>}
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 self-start text-xs font-bold sm:self-center">Listen <ArrowUpRight size={17}/></span>
              </a>)}
            </div> : <div className="mt-6 rounded-2xl border border-dashed border-[#c8bbb3] bg-white p-10 text-center">
              <div className="text-xl font-black">No episodes match that search.</div>
              <p className="mt-2 text-sm text-[#766b65]">Try a different topic or clear your filters.</p>
              <button type="button" onClick={() => {changeSearch("");changeSeason("all");}} className="mt-5 font-bold underline underline-offset-4">Show all episodes</button>
            </div>}
            {results.length > visible && <div className="mt-9 text-center"><button type="button" onClick={() => setVisible(v => v + 12)} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#1F1B24] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#493b37]">Load more episodes <ArrowRight size={17}/></button></div>}
          </>
        ) : <div className="mt-12 rounded-[27px] border border-[#E6DCCF] bg-white p-8 sm:p-12">
          <h2 className="text-2xl font-black tracking-[-.04em]">The episode feed is temporarily unavailable.</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#4A4450]">You can still browse and search the full archive on our podcast host. Please check back here shortly.</p>
          <a target="_blank" rel="noopener noreferrer" href={PODCAST_ARCHIVE_URL} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1F1B24] px-6 py-3 text-sm font-bold text-white">Browse episodes on Buzzsprout <ArrowUpRight size={17}/></a>
        </div>}

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-[#E6DCCF] pt-7 text-xs font-medium text-[#857770] sm:flex-row">
          <Link className="inline-flex items-center gap-2 font-bold text-[#1F1B24]" href="/babe"><ArrowLeft size={15}/> Back to Babe</Link>
          <span>Sam + Tayla · Conversations worth having.</span>
        </div>
      </div>
    </main>
  );
}

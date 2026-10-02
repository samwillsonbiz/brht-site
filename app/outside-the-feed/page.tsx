"use client";

import { Menu, Search, ShieldCheck, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AutoTrendingFeed from "./auto-trending-feed";

const PLATFORMS = ["Google", "Reddit", "Instagram", "TikTok", "X", "Bluesky", "YouTube", "OpenAI"];

export default function OutsideTheFeedPage() {
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = search.trim();
    router.push(clean ? `/outside-the-feed/search?q=${encodeURIComponent(clean)}` : "/outside-the-feed/search");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#101a33] selection:bg-[#2878ff] selection:text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
      <header className="sticky top-0 z-40 border-b border-[#17213a]/[0.06] bg-[#f6f8fc]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-5 lg:px-8">
          <a href="/outside-the-feed" className="flex items-center gap-2.5 font-semibold tracking-[-0.025em]"><span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2878ff] shadow-[0_6px_18px_rgba(40,120,255,0.28)]"><span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#9ec3ff]" /></span><span className="text-[17px] font-bold">Global Reacts</span></a>
          <nav className="hidden flex-1 items-center gap-6 text-[13px] font-semibold text-[#17213a]/52 md:flex"><a href="#live-trends" className="text-[#17213a]">Now</a><a href="/outside-the-feed/search" className="transition hover:text-[#17213a]">Search</a><a href="#principles" className="transition hover:text-[#17213a]">Why this exists</a></nav>
          <div className="ml-auto hidden items-center gap-2 md:flex"><a href="/outside-the-feed/search" className="grid h-9 w-9 place-items-center rounded-full border border-[#17213a]/8 bg-white text-[#17213a]/60 hover:text-[#2878ff]" aria-label="Search"><Search className="h-4 w-4" /></a><a href="/outside-the-feed/membership" className="rounded-full bg-[#2878ff] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(40,120,255,0.2)] hover:bg-[#1769e8]">Membership</a></div>
          <button type="button" onClick={() => setMobileMenu((value) => !value)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white md:hidden" aria-label="Menu">{mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
        {mobileMenu && <div className="border-t border-[#17213a]/6 bg-white px-5 py-4 md:hidden"><div className="grid gap-1 text-sm font-semibold"><a href="#live-trends" onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-3 hover:bg-[#2878ff]/5">Now</a><a href="/outside-the-feed/search" className="rounded-xl px-3 py-3 hover:bg-[#2878ff]/5">Search</a><a href="/outside-the-feed/membership" className="rounded-xl px-3 py-3 hover:bg-[#2878ff]/5">Membership</a></div></div>}
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-6 pt-14 text-center lg:px-8 lg:pb-7 lg:pt-20">
        <h1 className="mx-auto max-w-[980px] text-[clamp(3.2rem,6.4vw,6rem)] font-[760] leading-[0.95] tracking-[-0.065em]"><span className="text-[#101a33]">Get outside </span><span className="text-[#2878ff]">your feed.</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-[#17213a]/48">A real front page of the internet again. What is getting attention, what it means, where it came from and how people are reacting.</p>

        <form onSubmit={submitSearch} className="group mx-auto mt-7 flex w-full max-w-[760px] items-center gap-3 rounded-[20px] border border-[#2878ff]/12 bg-white p-2.5 text-left shadow-[0_14px_42px_rgba(33,56,108,0.08)] transition focus-within:border-[#2878ff]/28"><Search className="ml-3 h-5 w-5 shrink-0 text-[#2878ff]/65" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-[15px] font-semibold outline-none placeholder:text-[#17213a]/30 md:text-[16px]" placeholder="Search a topic..." /><button type="submit" className="hidden rounded-2xl bg-[#2878ff] px-4 py-3 text-xs font-bold text-white sm:block">Search</button></form>

        <div className="mx-auto mt-4 flex max-w-[920px] flex-wrap items-center justify-center gap-x-1.5 gap-y-1.5 text-[11px] font-bold text-[#17213a]/42"><span className="mr-1 text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#17213a]/28">Across</span>{PLATFORMS.map((platform, index) => <span key={platform} className="inline-flex items-center gap-1.5"><span className="rounded-full border border-[#17213a]/[0.07] bg-white px-2.5 py-1.5 shadow-sm">{platform}</span>{index < PLATFORMS.length - 1 && <span className="text-[#17213a]/16">·</span>}</span>)}</div>
        <p className="mx-auto mt-2 max-w-2xl text-[11px] font-semibold leading-5 text-[#17213a]/35">One public view of what is actually getting attention — and how people are reacting across the internet.</p>
      </section>

      <AutoTrendingFeed />

      <section id="principles" className="border-y border-[#17213a]/[0.06] bg-white"><div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8 lg:py-20"><div><h2 className="text-4xl font-[750] leading-[1] tracking-[-0.055em] md:text-5xl">No ads.<br />No algorithm.<br />No propaganda.</h2><a href="/outside-the-feed/membership" className="mt-6 inline-flex rounded-full bg-[#2878ff] px-4 py-2.5 text-xs font-extrabold text-white">See the membership model →</a></div><div className="grid gap-4 sm:grid-cols-2">{[["System-created topics", "Users do not submit front-page cards. Trends are detected from broad public attention signals."],["One topic, one thread", "Canonical topics accumulate context and discussion rather than spawning endless duplicate posts."],["No invisible personalization", "The public front page is the public front page. Categories and follows are explicit choices."],["Show the disagreement", "Attention, sentiment and truth are kept separate. Scores include sample size and confidence."]].map(([title, copy]) => <div key={title} className="rounded-[20px] border border-[#17213a]/[0.07] bg-[#f6f8fc] p-5"><ShieldCheck className="h-5 w-5 text-[#2878ff]" /><h3 className="mt-3 text-base font-bold">{title}</h3><p className="mt-1.5 text-sm leading-6 text-[#17213a]/48">{copy}</p></div>)}</div></div></section>
    </main>
  );
}

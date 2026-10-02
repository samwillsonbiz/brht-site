"use client";

import { LockKeyhole, Menu, Search, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import AutoTrendingFeed from "./auto-trending-feed";

export default function OutsideTheFeedPage() {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <main
      className="min-h-screen bg-[#f6f8fc] text-[#101a33] selection:bg-[#2878ff] selection:text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}
    >
      <header className="sticky top-0 z-40 border-b border-[#17213a]/[0.06] bg-[#f6f8fc]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-5 lg:px-8">
          <a href="/outside-the-feed" className="flex items-center gap-2.5 font-semibold tracking-[-0.025em]">
            <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2878ff] shadow-[0_6px_18px_rgba(40,120,255,0.28)]">
              <span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#9ec3ff]" />
            </span>
            <span className="text-[17px] font-bold">Outside the Feed</span>
          </a>

          <nav className="hidden flex-1 items-center gap-6 text-[13px] font-semibold text-[#17213a]/52 md:flex">
            <a href="#live-trends" className="text-[#17213a]">Now</a>
            <button type="button" onClick={() => setPaywallOpen(true)} className="transition hover:text-[#17213a]">Following</button>
            <a href="#principles" className="transition hover:text-[#17213a]">Why this exists</a>
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-[#2878ff]/15 bg-[#2878ff]/7 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">100% ad free</span>
            <button type="button" onClick={() => setPaywallOpen(true)} className="grid h-9 w-9 place-items-center rounded-full border border-[#17213a]/8 bg-white text-[#17213a]/60 hover:text-[#2878ff]" aria-label="Search"><Search className="h-4 w-4" /></button>
            <button type="button" onClick={() => setPaywallOpen(true)} className="rounded-full bg-[#2878ff] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(40,120,255,0.2)] hover:bg-[#1769e8]">Membership</button>
          </div>

          <button type="button" onClick={() => setMobileMenu((value) => !value)} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white md:hidden" aria-label="Menu">{mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>

        {mobileMenu && (
          <div className="border-t border-[#17213a]/6 bg-white px-5 py-4 md:hidden">
            <div className="grid gap-1 text-sm font-semibold">
              <a href="#live-trends" onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-3 hover:bg-[#2878ff]/5">Now</a>
              <button type="button" onClick={() => setPaywallOpen(true)} className="rounded-xl px-3 py-3 text-left hover:bg-[#2878ff]/5">Search</button>
              <button type="button" onClick={() => setPaywallOpen(true)} className="rounded-xl px-3 py-3 text-left hover:bg-[#2878ff]/5">Following</button>
              <button type="button" onClick={() => setPaywallOpen(true)} className="rounded-xl px-3 py-3 text-left hover:bg-[#2878ff]/5">Membership</button>
            </div>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-10 pt-14 text-center lg:px-8 lg:pb-12 lg:pt-20">
        <h1 className="mx-auto max-w-[920px] text-[clamp(3rem,6vw,5.7rem)] font-[760] leading-[0.95] tracking-[-0.06em] text-[#101a33]">
          Get outside your feed.
          <span className="mt-1 block text-[#2878ff]">See what&apos;s actually trending.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[660px] text-[16px] leading-7 tracking-[-0.01em] text-[#17213a]/50 md:text-lg">
          What people are talking about, how they feel, and where the conversation is moving.
        </p>

        <button type="button" onClick={() => setPaywallOpen(true)} className="group mx-auto mt-7 flex w-full max-w-[760px] items-center gap-3 rounded-[20px] border border-[#2878ff]/12 bg-white p-2.5 text-left shadow-[0_14px_42px_rgba(33,56,108,0.08)] transition hover:-translate-y-0.5 hover:border-[#2878ff]/24">
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#2878ff]/65" />
          <span className="flex-1 py-3 text-[15px] text-[#17213a]/36 md:text-[16px]">Search a topic...</span>
          <span className="hidden rounded-2xl bg-[#2878ff] px-4 py-3 text-xs font-bold text-white sm:block">Search</span>
        </button>
      </section>

      <AutoTrendingFeed />

      <section id="principles" className="border-y border-[#17213a]/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8 lg:py-20">
          <div>
            <h2 className="text-4xl font-[750] leading-[1] tracking-[-0.055em] md:text-5xl">You pay us.<br />Advertisers don&apos;t.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["No ads", "No promoted posts or sponsored trends."],
              ["No invisible personalization", "The public front page is the public front page."],
              ["No outrage optimization", "We do not make more money when you stay angry or scroll longer."],
              ["Show the disagreement", "Scores include sample size and confidence, not just a headline."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[20px] border border-[#17213a]/[0.07] bg-[#f6f8fc] p-5">
                <ShieldCheck className="h-5 w-5 text-[#2878ff]" />
                <h3 className="mt-3 text-base font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#17213a]/48">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {paywallOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101a33]/32 px-4 backdrop-blur-md" onMouseDown={(event) => { if (event.currentTarget === event.target) setPaywallOpen(false); }}>
          <div className="w-full max-w-[520px] rounded-[30px] bg-white p-7 shadow-[0_35px_100px_rgba(16,26,51,0.28)]">
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#2878ff]/10 text-[#2878ff]"><LockKeyhole className="h-5 w-5" /></div>
              <button type="button" onClick={() => setPaywallOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f6f8fc]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">Outside the Feed membership</div>
            <h2 className="mt-2 text-3xl font-[750] leading-[1.05] tracking-[-0.045em]">Go deeper on anything.</h2>
            <p className="mt-4 text-sm leading-6 text-[#17213a]/52">Search topics, compare communities, follow changes over time and inspect the conversation behind the score.</p>
            <button type="button" className="mt-7 w-full rounded-2xl bg-[#2878ff] px-5 py-4 text-sm font-extrabold text-white">Join the early membership</button>
            <p className="mt-3 text-center text-[11px] font-semibold text-[#17213a]/32">Prototype only — billing is not connected yet.</p>
          </div>
        </div>
      )}
    </main>
  );
}

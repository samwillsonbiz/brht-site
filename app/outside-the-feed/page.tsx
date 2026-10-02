"use client";

import { BarChart3, EyeOff, Globe2, LockKeyhole, Menu, Search, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import AutoTrendingFeed from "./auto-trending-feed";
import LiveSourceLab from "./live-source-lab";

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
            <a href="#source-lab" className="transition hover:text-[#17213a]">Sources</a>
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
              <a href="#source-lab" onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-3 hover:bg-[#2878ff]/5">Sources</a>
              <button type="button" onClick={() => setPaywallOpen(true)} className="rounded-xl px-3 py-3 text-left hover:bg-[#2878ff]/5">Search</button>
              <button type="button" onClick={() => setPaywallOpen(true)} className="rounded-xl px-3 py-3 text-left hover:bg-[#2878ff]/5">Membership</button>
            </div>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-[1280px] px-5 pb-12 pt-16 text-center lg:px-8 lg:pt-24">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#2878ff]/12 bg-white px-3.5 py-2 text-[11px] font-bold text-[#2878ff] shadow-sm"><Globe2 className="h-3.5 w-3.5" /> The front page outside your algorithm</div>
        <h1 className="mx-auto max-w-[1020px] text-[clamp(3.2rem,7vw,6.9rem)] font-[750] leading-[0.93] tracking-[-0.06em] text-[#101a33]">Get outside your feed.<span className="mt-2 block text-[#2878ff]">See what everyone else sees.</span></h1>
        <p className="mx-auto mt-7 max-w-[790px] text-[17px] leading-7 tracking-[-0.015em] text-[#17213a]/52 md:text-xl md:leading-8">A quantified front page of what is getting attention right now — discovered from live public signals, then scored for vibe, consensus, heat and confidence.</p>

        <button type="button" onClick={() => setPaywallOpen(true)} className="group mx-auto mt-9 flex w-full max-w-[790px] items-center gap-3 rounded-[22px] border border-[#2878ff]/12 bg-white p-2.5 text-left shadow-[0_18px_55px_rgba(33,56,108,0.09)] transition hover:-translate-y-0.5 hover:border-[#2878ff]/24">
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#2878ff]/65" />
          <span className="flex-1 py-3 text-[15px] text-[#17213a]/38 md:text-[17px]">Search any topic and read the internet...</span>
          <span className="hidden rounded-2xl bg-[#2878ff] px-4 py-3 text-xs font-bold text-white sm:block">Search with membership</span>
        </button>

        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-[#17213a]/38">
          <span className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-[#2878ff]" /> No personalized ranking</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#2878ff]" /> No ads or sponsored topics</span>
          <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5 text-[#2878ff]" /> Scores show sample + confidence</span>
        </div>
      </section>

      <AutoTrendingFeed />

      <div id="source-lab">
        <LiveSourceLab />
      </div>

      <section id="principles" className="border-y border-[#17213a]/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8 lg:py-28">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#2878ff]">The business model is the feature</div>
            <h2 className="mt-4 text-4xl font-[750] leading-[1] tracking-[-0.055em] md:text-6xl">You pay us.<br />Advertisers don&apos;t.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["No ads", "No promoted posts, sponsored trends, or brands buying their way into what looks important."],
              ["No outrage optimization", "We do not make more money when you stay angry, scroll longer, or fight in comments."],
              ["No invisible personalization", "The public front page is the same public front page. Your chosen follows are separate and explicit."],
              ["Show the disagreement", "Vibe is paired with consensus, sample size and confidence so a loud minority cannot silently become 'the internet'."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[22px] border border-[#17213a]/[0.07] bg-[#f6f8fc] p-5">
                <ShieldCheck className="h-5 w-5 text-[#2878ff]" />
                <h3 className="mt-4 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#17213a]/48">{copy}</p>
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
            <h2 className="mt-2 text-3xl font-[750] leading-[1.05] tracking-[-0.045em]">The front page is public. Going deeper is yours.</h2>
            <p className="mt-4 text-sm leading-6 text-[#17213a]/52">Search anything, follow topics deliberately, compare communities, inspect historical shifts and see the arguments behind the score — without ads shaping what you see.</p>
            <button type="button" className="mt-7 w-full rounded-2xl bg-[#2878ff] px-5 py-4 text-sm font-extrabold text-white">Join the early membership</button>
            <p className="mt-3 text-center text-[11px] font-semibold text-[#17213a]/32">Prototype only — billing is not connected yet.</p>
          </div>
        </div>
      )}
    </main>
  );
}

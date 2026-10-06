"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  Play,
  ReceiptText,
  ShieldCheck,
  Star,
  Vote,
  X,
} from "lucide-react";

type Issue = { name: string; votes: number };
type Project = { tag: string; title: string; copy: string; raised: number; target: number; featured?: boolean };

const initialIssues: Issue[] = [
  { name: "Cost of living", votes: 15574 },
  { name: "Housing affordability", votes: 14282 },
  { name: "Government waste", votes: 11960 },
  { name: "Healthcare costs", votes: 10853 },
  { name: "Congressional stock trading", votes: 9518 },
  { name: "Immigration reform", votes: 8410 },
  { name: "Education", votes: 7622 },
  { name: "Energy + infrastructure", votes: 6000 },
];

const projects: Project[] = [
  {
    tag: "PROJECT 01",
    title: "Where did the money go?",
    copy: "Build a plain-English public spending explorer and turn the findings into short-form explainers anyone can understand.",
    raised: 73420,
    target: 100000,
  },
  {
    tag: "COMMUNITY #1",
    title: "Congressional stock trading",
    copy: "Research existing proposals, publish an evidence brief and build public-facing advocacy tools around the issue.",
    raised: 113750,
    target: 125000,
    featured: true,
  },
  {
    tag: "PROJECT 03",
    title: "Healthcare price reality check",
    copy: "Compare published prices, cash prices and insured rates, then explain the gaps without jargon.",
    raised: 43200,
    target: 80000,
  },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function SamPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voteNotice, setVoteNotice] = useState("");
  const [fundingProject, setFundingProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState(25);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    document.title = "SAM — AI Political Parody";
    setMyVote(window.localStorage.getItem("samPriorityVote"));
  }, []);

  const sortedIssues = useMemo(() => [...issues].sort((a, b) => b.votes - a.votes), [issues]);
  const totalVotes = issues.reduce((sum, item) => sum + item.votes, 0);

  function voteFor(name: string) {
    if (myVote) {
      setVoteNotice(`Prototype rule: one person, one priority vote. Your current choice is “${myVote}.”`);
      return;
    }

    setIssues((current) =>
      current.map((issue) => (issue.name === name ? { ...issue, votes: issue.votes + 1 } : issue)),
    );
    setMyVote(name);
    window.localStorage.setItem("samPriorityVote", name);
    setVoteNotice(`Vote recorded locally for “${name}.” No data was transmitted.`);
  }

  function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoined(true);
    event.currentTarget.reset();
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#f7f5ef] text-[#101827] selection:bg-[#d62232] selection:text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
    >
      <div className="bg-[#050b18] px-4 py-2 text-center text-[10px] font-black tracking-[0.16em] text-[#e9edf5] sm:text-[11px]">
        AI-GENERATED POLITICAL PARODY · SAM IS NOT A REAL CANDIDATE OR PUBLIC OFFICIAL
      </div>

      <header className="sticky top-0 z-40 border-b border-[#08152f]/10 bg-[#f7f5ef]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1180px] items-center px-5 lg:px-0">
          <a href="#top" className="text-[30px] font-black tracking-[-0.075em] text-[#08152f]">
            SAM<span className="ml-1 text-[16px] text-[#d62232]">★</span>
            <span className="ml-2 text-[9px] font-black tracking-[0.2em] text-[#d62232]">20XX</span>
          </a>
          <nav className="ml-auto hidden items-center gap-7 text-[12px] font-extrabold text-[#08152f] md:flex">
            <a className="transition hover:text-[#d62232]" href="#watch">Watch</a>
            <a className="transition hover:text-[#d62232]" href="#agenda">The Agenda</a>
            <a className="transition hover:text-[#d62232]" href="#fund">Fund the Push</a>
            <a className="transition hover:text-[#d62232]" href="#receipts">Receipts</a>
          </nav>
          <a
            href="#join"
            className="ml-5 hidden rounded-sm border border-[#08152f] px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] sm:inline-flex"
          >
            Join the movement
          </a>
        </div>
      </header>

      <section
        id="top"
        className="relative overflow-hidden bg-[#08152f] text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 76% 20%, #214f9e 0, #0c224a 30%, #08152f 72%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />
        <div className="relative mx-auto grid max-w-[1180px] gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-0 lg:py-20">
          <div>
            <div className="text-[10px] font-black tracking-[0.23em] text-[#a9c5ff]">
              AMERICA&apos;S AI PARODY POLITICIAN
            </div>
            <div className="mt-7 text-[clamp(6rem,14vw,10.8rem)] font-black leading-[0.68] tracking-[-0.09em]">
              SAM<span className="align-top text-[0.28em] text-[#d62232]">★</span>
            </div>
            <div className="mt-6 text-[24px] font-black tracking-[0.36em]">
              20<span className="text-[#f06d79]">XX</span>
            </div>
            <h1 className="mt-7 max-w-[680px] text-[clamp(2.5rem,5.2vw,4rem)] font-black leading-[0.93] tracking-[-0.055em]">
              He&apos;s not running for office.
              <br />
              <span className="text-[#f06d79]">He&apos;s running out of patience.</span>
            </h1>
            <p className="mt-6 max-w-[590px] text-[16px] font-medium leading-7 text-[#c4cede]">
              Polished speeches. Uncomfortable facts. Dry humor. Zero pretending that Sam is actually human.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a href="#watch" className="inline-flex items-center gap-2 rounded-sm bg-[#d62232] px-5 py-3.5 text-[12px] font-black uppercase tracking-[0.08em] text-white">
                Watch Sam <Play className="h-3.5 w-3.5 fill-current" />
              </a>
              <a href="#agenda" className="inline-flex items-center gap-2 rounded-sm border border-white/35 bg-white/[0.04] px-5 py-3.5 text-[12px] font-black uppercase tracking-[0.08em] text-white">
                Tell Sam what matters <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-5 text-[11px] font-bold text-[#98a9c4]">
              1 person = 1 priority vote &nbsp;•&nbsp; Funding flows will be public
            </div>
          </div>

          <div className="relative mx-auto h-[500px] w-full max-w-[510px] overflow-hidden rounded-xl border border-white/20 bg-gradient-to-b from-[#275eb0] to-[#081a3a] shadow-[0_35px_80px_rgba(0,0,0,.45)] lg:h-[600px]">
            <div className="absolute right-4 top-4 z-20 bg-white px-3 py-2 text-[9px] font-black tracking-[0.14em] text-[#08152f]">
              AI POLITICAL PARODY
            </div>
            <div className="absolute left-1/2 top-[84px] w-[130%] -translate-x-1/2 text-center text-[34px] font-black tracking-[-0.05em] text-white/[0.12]">
              SAM &nbsp; SAM &nbsp; SAM
            </div>

            <div className="absolute bottom-[70px] left-1/2 h-[410px] w-[310px] -translate-x-1/2">
              <div className="absolute bottom-0 left-[30px] h-[270px] w-[250px] bg-gradient-to-br from-[#172b55] to-[#07142c]" style={{ clipPath: "polygon(28% 0,72% 0,100% 21%,92% 100%,8% 100%,0 21%)" }} />
              <div className="absolute left-[114px] top-[175px] h-[150px] w-[82px] bg-white" style={{ clipPath: "polygon(0 0,100% 0,50% 100%)" }} />
              <div className="absolute left-[145px] top-[216px] h-[172px] w-[21px] bg-[#d62232]" style={{ clipPath: "polygon(18% 0,82% 0,100% 12%,62% 100%,38% 100%,0 12%)" }} />
              <div className="absolute left-[80px] top-[18px] h-[180px] w-[150px] rounded-[48%] bg-gradient-to-b from-[#e2b28f] to-[#ba8264]" />
              <div className="absolute left-[78px] top-[3px] h-[88px] w-[154px] rounded-[80px_80px_30px_30px] bg-[#322522]" style={{ clipPath: "polygon(4% 100%,4% 40%,20% 12%,51% 0,79% 14%,96% 44%,96% 100%,76% 67%,53% 57%,29% 64%)" }} />
              <div className="absolute left-[117px] top-[95px] h-[7px] w-[7px] rounded-full bg-[#241d1a]" />
              <div className="absolute left-[184px] top-[95px] h-[7px] w-[7px] rounded-full bg-[#241d1a]" />
              <div className="absolute left-[103px] top-[80px] h-[7px] w-[36px] rounded-full bg-[#44302a]" />
              <div className="absolute left-[176px] top-[80px] h-[7px] w-[36px] rounded-full bg-[#44302a]" />
              <div className="absolute left-[130px] top-[143px] h-[9px] w-[50px] rounded-[50%] border-b-[4px] border-[#7a443e]" />
            </div>

            <div className="absolute bottom-8 left-1/2 z-10 flex w-[315px] -translate-x-1/2 items-center gap-3 border border-white/20 bg-[#0a1c3d] px-5 py-4 shadow-2xl">
              <div className="grid h-[50px] w-[50px] place-items-center rounded-full border-2 border-white bg-[#d62232]">
                <Star className="h-5 w-5 fill-white" />
              </div>
              <div>
                <div className="text-[29px] font-black leading-none tracking-[-0.06em]">SAM</div>
                <div className="mt-1 text-[8px] font-black tracking-[0.1em] text-[#c8d3e7]">
                  THE POLITICIAN ISN&apos;T REAL.
                  <br />THE PROBLEMS ARE.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#d62232] px-4 py-3 text-center text-[12px] font-black tracking-[0.05em] text-white sm:text-[13px]">
        THE POLITICIAN ISN&apos;T REAL. THE PROBLEMS ARE.
        <span className="mx-4 text-[#ffc3c8]">★</span>
        HUMOR FIRST. RECEIPTS ALWAYS.
        <span className="mx-4 hidden text-[#ffc3c8] sm:inline">★</span>
        <span className="hidden sm:inline">YOU PICK THE PRIORITIES.</span>
      </div>

      <section id="watch" className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">FROM THE PODIUM</div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Sam says the quiet part
                <br />
                <span className="text-[#d62232]">into a microphone.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#677084]">
              Short-form political parody built for Reels, TikTok and Shorts: campaign-speech visuals, original satire, current issues and a recurring fictional universe.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1.45fr_.78fr_.78fr]">
            {[
              ["OFFICIAL STATEMENT", "“My fellow Americans, apparently this is real.”", "THE BRIEFING", "0:42", "blue"],
              ["NATIONAL EMERGENCY*", "When the obvious solution somehow requires 900 pages.", "*SATIRE", "0:31", "blue"],
              ["SAM RESPONDS", "“I asked the staff if this was satire. They said no.”", "PRESS ROOM", "0:27", "red"],
            ].map(([tag, title, meta, time, tone], index) => (
              <article key={title} className={index === 0 ? "md:col-span-2 lg:col-span-1" : ""}>
                <div className={"relative flex min-h-[360px] items-end overflow-hidden border-t-4 p-7 text-white " + (index === 0 ? "border-[#d62232] lg:min-h-[470px]" : "border-[#08152f]") + (tone === "red" ? " bg-gradient-to-br from-[#7d1520] to-[#240812]" : " bg-gradient-to-br from-[#2b5caf] to-[#0b2148]")}>
                  <div className="absolute -right-10 top-24 rotate-90 text-[88px] font-black tracking-[-0.08em] text-white/[0.08]">SAM</div>
                  <button type="button" aria-label="Play concept video" className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/45 bg-white/10 backdrop-blur">
                    <Play className="h-5 w-5 fill-white" />
                  </button>
                  <div className="relative">
                    <div className="text-[9px] font-black tracking-[0.15em] text-[#d7e3fb]">{tag}</div>
                    <div className="mt-2 max-w-[430px] text-[26px] font-black leading-[1.04] tracking-[-0.035em]">{title}</div>
                  </div>
                </div>
                <div className="flex justify-between py-3 text-[9px] font-black tracking-[0.1em] text-[#747d8d]">
                  <span>{meta}</span><span>{time}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="agenda" className="bg-[#08152f] px-5 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">THE SAM AGENDA</div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                You decide what
                <br />gets the microphone.
              </h2>
            </div>
            <div>
              <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#b7c2d5]">
                Everyone gets one priority vote. Money does not buy extra influence in this prototype.
              </p>
              <div className="mt-4 text-[12px] font-bold text-[#8fa0bd]">
                <span className="mr-2 text-[28px] font-black text-white">{totalVotes.toLocaleString()}</span>
                priority votes cast
              </div>
            </div>
          </div>

          <div className="border-t border-white/15">
            {sortedIssues.map((issue, index) => {
              const pct = (issue.votes / totalVotes) * 100;
              const selected = myVote === issue.name;
              return (
                <div key={issue.name} className="relative grid grid-cols-[38px_1fr_58px] items-center gap-3 border-b border-white/15 py-4 sm:grid-cols-[55px_1fr_75px_125px]">
                  <div className="text-[20px] font-medium text-[#7686a2]">{String(index + 1).padStart(2, "0")}</div>
                  <div className="text-[15px] font-extrabold sm:text-[17px]">{issue.name}</div>
                  <div className="text-right text-[18px] font-black sm:text-[22px]">{pct.toFixed(1)}%</div>
                  <button
                    type="button"
                    onClick={() => voteFor(issue.name)}
                    className={"col-start-2 col-end-4 mt-1 border px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] transition sm:col-auto sm:mt-0 " + (selected ? "border-white bg-white text-[#08152f]" : "border-white/40 text-white hover:bg-white hover:text-[#08152f]")}
                  >
                    {selected ? "Your vote" : "Vote"}
                  </button>
                  <div className="absolute bottom-0 left-0 h-[2px] bg-[#d62232]" style={{ width: `${pct}%` }} />
                </div>
              );
            })}
          </div>
          <div className="mt-4 min-h-5 text-[12px] font-bold text-[#a9c5ff]">{voteNotice}</div>
        </div>
      </section>

      <section id="fund" className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">MAKE SOMETHING HAPPEN</div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Don&apos;t just donate.
                <br />
                <span className="text-[#d62232]">Fund an outcome.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#677084]">
              Prototype funding flows are intentionally disabled until the operating entity, payment flow and applicable compliance requirements are finalized.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {projects.map((project) => {
              const pct = Math.min(100, Math.round((project.raised / project.target) * 100));
              return (
                <article key={project.title} className={"flex min-h-[430px] flex-col bg-white p-7 " + (project.featured ? "border-2 border-[#d62232] shadow-[0_20px_60px_rgba(8,21,47,.12)]" : "border border-[#d8dadf]")}>
                  <div className="flex justify-between text-[9px] font-black tracking-[0.1em] text-[#778095]">
                    <span>{project.tag}</span><span className="text-[#d62232]">{pct}%</span>
                  </div>
                  <h3 className="mt-9 text-[31px] font-black leading-[1] tracking-[-0.045em]">{project.title}</h3>
                  <p className="mt-4 flex-1 text-[14px] font-medium leading-6 text-[#677084]">{project.copy}</p>
                  <div className="mt-6 h-[7px] bg-[#ecebe6]"><div className="h-full bg-[#d62232]" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-3 flex items-end justify-between">
                    <strong className="text-[20px]">{money(project.raised)}</strong>
                    <span className="max-w-[120px] text-right text-[9px] font-bold leading-4 text-[#8b92a0]">prototype of {money(project.target)} target</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFundingProject(project); setAmount(25); }}
                    className={"mt-5 inline-flex items-center justify-center gap-2 rounded-sm px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.08em] text-white " + (project.featured ? "bg-[#d62232]" : "bg-[#08152f]")}
                  >
                    Fund this push <CircleDollarSign className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="receipts" className="bg-gradient-to-br from-[#102b5f] to-[#07142d] px-5 py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">THE RECEIPTS</div>
            <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
              If we ask for trust,
              <br />we show the math.
            </h2>
            <p className="mt-6 max-w-[560px] text-[15px] font-medium leading-7 text-[#b7c2d5]">
              Once money actually moves, every funded project should show what came in, what went out, what was produced, and what happened next.
            </p>
          </div>

          <div className="rounded-lg bg-[#f8f9fb] p-7 text-[#101827] shadow-[0_25px_60px_rgba(0,0,0,.35)]">
            <div className="flex justify-between text-[9px] font-black tracking-[0.13em] text-[#6f788a]">
              <span>PUBLIC LEDGER</span><span className="text-[#d62232]">PROTOTYPE</span>
            </div>
            <div className="border-b border-[#ddd] py-7">
              <div className="text-[11px] font-bold text-[#8d95a3]">Community projects funded</div>
              <div className="mt-1 text-[58px] font-black leading-none tracking-[-0.05em]">03</div>
            </div>
            {[
              ["Prototype funds shown", "$230,370"],
              ["Real funds collected", "$0"],
              ["Unexplained spending", "$0"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-[#e3e5e8] py-4 text-[12px] font-bold">
                <span>{label}</span><strong>{value}</strong>
              </div>
            ))}
            <div className="mt-4 text-[9px] font-semibold leading-4 text-[#8d95a3]">
              Live financial data will appear here only after compliant fundraising is activated.
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#efebe3] px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">CAMPAIGN MERCH. SORT OF.</div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Wear the joke.
                <br /><span className="text-[#d62232]">Keep the point.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#677084]">
              Commercial merch can live separately from any future regulated political fundraising. These are concept products only.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <article className="flex min-h-[350px] flex-col justify-between bg-[#08152f] p-7 text-white">
              <div className="grid flex-1 place-items-center text-center text-[64px] font-black leading-[.8] tracking-[-0.08em]">SAM<br /><span className="mt-4 text-[18px] tracking-[0.25em]">20XX</span></div>
              <div className="flex items-end justify-between"><strong className="text-[13px]">Not On Your Ballot Tee</strong><span className="text-[9px] opacity-60">Concept · $32</span></div>
            </article>
            <article className="flex min-h-[350px] flex-col justify-between bg-[#e7dcc8] p-7 text-[#08152f]">
              <div className="grid flex-1 place-items-center text-center text-[62px] font-black tracking-[-0.08em]">SAM★</div>
              <div className="flex items-end justify-between"><strong className="text-[13px]">Running Out of Patience Cap</strong><span className="text-[9px] opacity-60">Concept · $28</span></div>
            </article>
            <article className="flex min-h-[350px] flex-col justify-between bg-[#d62232] p-7 text-white">
              <div className="grid flex-1 place-items-center text-center text-[28px] font-black leading-[1.04] tracking-[-0.04em]">THE POLITICIAN<br />ISN&apos;T REAL.<br />THE PROBLEMS ARE.</div>
              <div className="flex items-end justify-between"><strong className="text-[13px]">Receipt Pack</strong><span className="text-[9px] opacity-70">Concept · $12</span></div>
            </article>
          </div>
        </div>
      </section>

      <section id="join" className="bg-[#d62232] px-5 py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <div className="text-[10px] font-black tracking-[0.22em] text-[#ffd0d5]">JOIN THE MOVEMENT</div>
            <h2 className="mt-4 text-[clamp(2.6rem,5.3vw,4.5rem)] font-black leading-[0.93] tracking-[-0.06em]">
              Sam can&apos;t hold office.
              <br />He can hold attention.
            </h2>
            <p className="mt-5 max-w-[560px] text-[14px] font-semibold leading-6 text-[#ffd0d5]">
              Get the next speech, vote on priorities and help shape the fictional campaign universe.
            </p>
          </div>
          <form onSubmit={join} className="bg-white p-6 text-[#101827]">
            <label className="text-[9px] font-black tracking-[0.12em]">EMAIL ADDRESS</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input required type="email" placeholder="you@example.com" className="min-w-0 flex-1 border border-[#d3d6dc] px-4 py-3 text-[14px] outline-none focus:border-[#153b79]" />
              <button className="bg-[#08152f] px-5 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-white">Join Sam</button>
            </div>
            <div className="mt-2 text-[9px] font-semibold leading-4 text-[#8d95a3]">
              {joined ? "You're in — for this prototype only. No email was transmitted or stored." : "Prototype signup — no data is transmitted in this demo."}
            </div>
          </form>
        </div>
      </section>

      <footer className="bg-[#050b18] px-5 pb-6 pt-14 text-[#c3ccdc]">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[.55fr_1.55fr_.45fr]">
          <div className="text-[50px] font-black tracking-[-0.08em] text-white">SAM<span className="text-[#d62232]">★</span></div>
          <div>
            <div className="text-[9px] font-black tracking-[0.13em] text-white">PARODY DISCLOSURE</div>
            <p className="mt-3 max-w-[720px] text-[11px] font-medium leading-5 text-[#8d99ae]">
              SAM is an AI-generated fictional political parody personality. SAM is not a real person, candidate, elected official, political party, campaign committee, or government representative. This prototype does not accept donations, campaign contributions or payments.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[11px] font-bold">
            <a href="#watch">Watch</a><a href="#agenda">Agenda</a><a href="#fund">Projects</a><a href="#receipts">Receipts</a>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[1180px] border-t border-[#1c2940] pt-5 text-[8px] font-bold tracking-[0.13em] text-[#66758d]">
          © 20XX SAM PROJECT — FICTIONAL CAMPAIGN PROTOTYPE
        </div>
      </footer>

      {fundingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
          <button type="button" aria-label="Close" onClick={() => setFundingProject(null)} className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-[520px] bg-white p-8 shadow-2xl">
            <button type="button" onClick={() => setFundingProject(null)} className="absolute right-4 top-4 text-[#70798a]" aria-label="Close funding prototype">
              <X className="h-6 w-6" />
            </button>
            <div className="text-[9px] font-black tracking-[0.16em] text-[#153b79]">PROTOTYPE FUNDING FLOW</div>
            <h3 className="mt-3 text-[38px] font-black leading-none tracking-[-0.05em]">Fund this push</h3>
            <p className="mt-4 text-[14px] font-semibold leading-6 text-[#747d8d]">{fundingProject.title}</p>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAmount(value)}
                  className={"border px-2 py-3 text-[12px] font-black " + (amount === value ? "border-[#08152f] bg-[#08152f] text-white" : "border-[#d4d7dc] bg-white text-[#08152f]")}
                >
                  ${value}
                </button>
              ))}
            </div>

            <button type="button" className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 bg-[#08152f] px-4 py-4 text-[10px] font-black uppercase tracking-[0.08em] text-white opacity-75">
              Checkout disabled pending legal + entity setup <ShieldCheck className="h-4 w-4" />
            </button>
            <p className="mt-3 text-[9px] font-semibold leading-4 text-[#8d95a3]">
              No payment information is collected. This demonstrates the intended experience only.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

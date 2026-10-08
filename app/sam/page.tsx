"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Play, ShieldCheck, X } from "lucide-react";

type Issue = { slug: string; name: string; votes: number };
type Project = {
  tag: string;
  title: string;
  copy: string;
  raised: number;
  target: number;
  featured?: boolean;
};

const initialIssues: Issue[] = [
  { slug: "cost-of-living", name: "Cost of living", votes: 0 },
  { slug: "housing-affordability", name: "Housing affordability", votes: 0 },
  { slug: "government-waste", name: "Government waste", votes: 0 },
  { slug: "healthcare-costs", name: "Healthcare costs", votes: 0 },
  { slug: "congressional-stock-trading", name: "Congressional stock trading", votes: 0 },
  { slug: "immigration-reform", name: "Immigration reform", votes: 0 },
  { slug: "education", name: "Education", votes: 0 },
  { slug: "energy-infrastructure", name: "Energy + infrastructure", votes: 0 },
];

const SAM_SUPABASE_URL = "https://zqwdooykgwkfhwyayucg.supabase.co";
const SAM_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxd2Rvb3lrZ3drZmh3eWF5dWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDcxNjIsImV4cCI6MjEwNjMyMzE2Mn0._PjizrlrLH-5fxk_ZicCen3IuleP9BvYL9vu4l1wLNs";

async function samRpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SAM_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SAM_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SAM_SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

const projects: Project[] = [
  {
    tag: "PROJECT 01",
    title: "Where did the money go?",
    copy: "Build a plain-English public spending explorer and turn the findings into short explainers normal people can actually use.",
    raised: 73420,
    target: 100000,
  },
  {
    tag: "COMMUNITY #1",
    title: "Congressional stock trading",
    copy: "Research the current rules, compare reform proposals, publish the evidence and build a public-facing pressure campaign.",
    raised: 113750,
    target: 125000,
    featured: true,
  },
  {
    tag: "PROJECT 03",
    title: "Healthcare price reality check",
    copy: "Compare published prices, cash prices and insured rates, then show where the money is actually going.",
    raised: 43200,
    target: 80000,
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function SamPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voteNotice, setVoteNotice] = useState("");
  const [fundingProject, setFundingProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState(25);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    document.title = "SAM 2028 — AI Leadership";

    let voterId = window.localStorage.getItem("samVoterId");
    if (!voterId) {
      voterId = crypto.randomUUID();
      window.localStorage.setItem("samVoterId", voterId);
    }

    setMyVote(window.localStorage.getItem("samPriorityVote"));

    const loadVotes = async () => {
      try {
        const rows = await samRpc<Array<{ slug: string; name: string; votes: number | string }>>(
          "sam_get_issue_totals",
          {},
        );
        setIssues(rows.map((row) => ({
          slug: row.slug,
          name: row.name,
          votes: Number(row.votes),
        })));
      } catch {
        setVoteNotice("Live totals are temporarily unavailable. Please try again shortly.");
      }
    };

    loadVotes();
    const timer = window.setInterval(loadVotes, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedIssues = useMemo(
    () => [...issues].sort((a, b) => b.votes - a.votes),
    [issues],
  );
  const totalVotes = issues.reduce((sum, issue) => sum + issue.votes, 0);

  async function voteFor(issue: Issue) {
    const voterId = window.localStorage.getItem("samVoterId");
    if (!voterId) {
      setVoteNotice("Unable to identify this browser. Refresh and try again.");
      return;
    }

    try {
      setVoteNotice("Recording your vote…");
      await samRpc<string>("sam_cast_vote", {
        p_voter_id: voterId,
        p_issue_slug: issue.slug,
      });

      window.localStorage.setItem("samPriorityVote", issue.slug);
      setMyVote(issue.slug);

      const rows = await samRpc<Array<{ slug: string; name: string; votes: number | string }>>(
        "sam_get_issue_totals",
        {},
      );
      setIssues(rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        votes: Number(row.votes),
      })));
      setVoteNotice(`Your active priority is “${issue.name}.” You can change it anytime.`);
    } catch {
      setVoteNotice("That vote did not go through. Please try again.");
    }
  }

  async function startCheckout(
    supportAmount: number,
    project?: Project | null,
  ) {
    setCheckoutBusy(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/sam/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "one_time",
          amount: supportAmount,
          projectSlug: project
            ? project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
            : "general",
          projectTitle: project?.title || "SAM 2028",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Unable to start checkout.");
      }
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Unable to start checkout.",
      );
      setCheckoutBusy(false);
    }
  }

  function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoined(true);
    event.currentTarget.reset();
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#f7f4ed] text-[#0f1728] selection:bg-[#d82335] selection:text-white"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      }}
    >
      <div className="relative z-50 bg-[#040a16] px-4 py-2 text-center text-[9px] font-black tracking-[0.15em] text-[#e9edf5] sm:text-[10px]">
        AI LEADERSHIP YOU CAN TRUST · BUILT TO REPRESENT PEOPLE, NOT SPECIAL INTERESTS
      </div>

      <header className="sticky top-0 z-40 border-b border-[#08152f]/10 bg-[#f7f4ed]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center px-5 lg:px-8">
          <a
            href="#top"
            className="text-[30px] font-black tracking-[-0.075em] text-[#08152f]"
          >
            SAM<span className="ml-1 text-[15px] text-[#d82335]">★</span>
            <span className="ml-2 text-[9px] font-black tracking-[0.22em] text-[#d82335]">
              2028
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-7 text-[12px] font-extrabold text-[#08152f]/80 md:flex">
            <a className="transition hover:text-[#d82335]" href="#agenda">
              Cast Your Vote
            </a>
            <a className="transition hover:text-[#d82335]" href="#fund">
              Fund Action
            </a>
            <a className="transition hover:text-[#d82335]" href="#watch">
              Watch
            </a>
          </nav>

          <a
            href="#join"
            className="ml-5 hidden rounded-sm bg-[#08152f] px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-white sm:inline-flex"
          >
            Join Sam
          </a>
        </div>
      </header>

      <section id="top" className="relative min-h-[720px] overflow-hidden bg-[#07142c] text-white lg:min-h-[790px]">
        <img
          src="/sam/Campaign%20Speech%20with%20Patriotic%20Backdrop.png"
          alt="AI-generated image of fictional parody politician Sam speaking at a campaign-style rally"
          className="absolute inset-0 h-full w-full object-cover object-[67%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,11,25,.98)_0%,rgba(4,11,25,.91)_32%,rgba(4,11,25,.52)_58%,rgba(4,11,25,.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,11,25,.75)_0%,transparent_35%)]" />

        <div className="relative mx-auto flex min-h-[720px] max-w-[1240px] items-center px-5 py-20 lg:min-h-[790px] lg:px-8">
          <div className="max-w-[690px]">
            <ImageTag>AI POLITICAL PARODY</ImageTag>

            <div className="mt-7 text-[clamp(6rem,13vw,11rem)] font-black leading-[0.68] tracking-[-0.095em]">
              SAM<span className="align-top text-[0.27em] text-[#e42b3f]">★</span>
            </div>

            <div className="mt-7 text-[20px] font-black tracking-[0.39em] sm:text-[24px]">
              20<span className="text-[#f16b78]">28</span>
            </div>

            <h1 className="mt-8 max-w-[760px] text-[clamp(2.6rem,5.5vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
              Real Leadership.
              <br />
              Real Action.
              <br />
              <span className="text-[#f16b78]">Zero Corruption.</span>
            </h1>

            <p className="mt-6 max-w-[620px] text-[15px] font-medium leading-7 text-[#d0d8e5] sm:text-[17px]">
              Leadership by the people, for the people. Your votes set the agenda —
              not corporate donors, party insiders, or special interests.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#agenda"
                className="inline-flex items-center gap-2 rounded-sm bg-[#d82335] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.09em] text-white transition hover:bg-[#ec3045]"
              >
                Cast Your Vote <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#fund"
                className="inline-flex items-center gap-2 rounded-sm border border-white/35 bg-white/[0.06] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.09em] text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Fund Action <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold tracking-[0.02em] text-[#9fadc3]">
              <span>1 ACTIVE PRIORITY PER BROWSER · BETA</span>
              <span>•</span>
              <span>FUNDING FLOWS WILL BE PUBLIC</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 hidden text-right text-[8px] font-bold tracking-[0.13em] text-white/55 md:block">
          FICTIONAL CAMPAIGN IMAGE
          <br />
          AI-GENERATED
        </div>
      </section>

      <div className="bg-[#d82335] px-4 py-3 text-center text-[11px] font-black tracking-[0.05em] text-white sm:text-[13px]">
        YOUR VOTE SETS THE AGENDA
        <span className="mx-4 text-[#ffc0c8]">★</span>
        YOUR SUPPORT FUNDS THE ACTION
        <span className="mx-4 hidden text-[#ffc0c8] md:inline">★</span>
        <span className="hidden md:inline">SAM ANSWERS TO THE PEOPLE.</span>
      </div>

      <section id="agenda" className="bg-[#07142c] px-5 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">
                THE SAM AGENDA
              </div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                You decide what
                <br />gets the microphone.
              </h2>
            </div>
            <div>
              <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#b7c2d5]">
                Choose one active priority. You can change it anytime. Funding never
                buys an extra vote or a louder voice.
              </p>
              <div className="mt-4 text-[12px] font-bold text-[#8fa0bd]">
                <span className="mr-2 text-[28px] font-black text-white">
                  {totalVotes.toLocaleString()}
                </span>
                live votes
              </div>
            </div>
          </div>

          <div className="border-t border-white/15">
            {sortedIssues.map((issue, index) => {
              const pct = totalVotes > 0 ? (issue.votes / totalVotes) * 100 : 0;
              const selected = myVote === issue.slug;
              return (
                <div
                  key={issue.slug}
                  className="relative grid grid-cols-[38px_1fr_58px] items-center gap-3 border-b border-white/15 py-4 sm:grid-cols-[55px_1fr_75px_125px]"
                >
                  <div className="text-[20px] font-medium text-[#7686a2]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[15px] font-extrabold sm:text-[17px]">
                    {issue.name}
                  </div>
                  <div className="text-right text-[18px] font-black sm:text-[22px]">
                    {pct.toFixed(1)}%
                  </div>
                  <button
                    type="button"
                    onClick={() => voteFor(issue)}
                    className={
                      "col-start-2 col-end-4 mt-1 border px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] transition sm:col-auto sm:mt-0 " +
                      (selected
                        ? "border-white bg-white text-[#08152f]"
                        : "border-white/40 text-white hover:bg-white hover:text-[#08152f]")
                    }
                  >
                    {selected ? "Your vote" : myVote ? "Switch" : "Vote"}
                  </button>
                  <div
                    className="absolute bottom-0 left-0 h-[2px] bg-[#d82335]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex min-h-5 flex-wrap items-center justify-between gap-4 text-[12px] font-bold text-[#a9c5ff]">
            <span>{voteNotice}</span>
            <span className="text-[#8fa0bd]">
              Beta voting is live now. Verified accounts are the next anti-abuse upgrade.
            </span>
          </div>
        </div>
      </section>

      <section id="fund" className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">
                TURN A VOTE INTO ACTION
              </div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Back the work.
                <br />
                <span className="text-[#d82335]">Fund real action.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#667084]">
              Choose the work you want pushed forward. Funding is still disabled in
              this prototype while the legal entity and compliant payment flow are
              being finalized.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {projects.map((project) => {
              const pct = Math.min(
                100,
                Math.round((project.raised / project.target) * 100),
              );
              return (
                <article
                  key={project.title}
                  className={
                    "flex min-h-[430px] flex-col bg-white p-7 " +
                    (project.featured
                      ? "border-2 border-[#d82335] shadow-[0_22px_70px_rgba(8,21,47,.13)]"
                      : "border border-[#d8dadf]")
                  }
                >
                  <div className="flex justify-between text-[9px] font-black tracking-[0.1em] text-[#778095]">
                    <span>{project.tag}</span>
                    <span className="text-[#d82335]">{pct}%</span>
                  </div>

                  <h3 className="mt-9 text-[31px] font-black leading-[1] tracking-[-0.045em]">
                    {project.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[14px] font-medium leading-6 text-[#667084]">
                    {project.copy}
                  </p>

                  <div className="mt-6 h-[7px] bg-[#ecebe6]">
                    <div
                      className="h-full bg-[#d82335]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <strong className="text-[20px]">{money(project.raised)}</strong>
                    <span className="max-w-[120px] text-right text-[9px] font-bold leading-4 text-[#8b92a0]">
                      prototype of {money(project.target)} target
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFundingProject(project);
                      setAmount(25);
                      setCheckoutError("");
                    }}
                    className={
                      "mt-5 inline-flex items-center justify-center gap-2 rounded-sm px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.09em] text-white " +
                      (project.featured ? "bg-[#d82335]" : "bg-[#08152f]")
                    }
                  >
                    Fund this push <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="watch" className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">
                FROM SAM
              </div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,5rem)] font-black leading-[0.92] tracking-[-0.065em]">
                The message,
                <br />
                <span className="text-[#d82335]">without the handlers.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#667084]">
              Short speeches, responses and explainers built around the issues the
              community votes to put on Sam&apos;s desk.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                label: "THE BRIEFING",
                title: "“My fellow Americans, apparently this is real.”",
                image: "/sam/Relax%20Campaign%20speech.png",
                pos: "object-[center_18%]",
              },
              {
                label: "SAM RESPONDS",
                title: "When the obvious solution somehow requires 900 pages.",
                image: "/sam/Upper%20Body%20Speech.png",
                pos: "object-[center_12%]",
              },
              {
                label: "FROM THE DESK",
                title: "The issue the public voted to the top this week.",
                image: "/sam/Upper%20Body%20Desk.png",
                pos: "object-[center_12%]",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="group relative aspect-[4/5] overflow-hidden bg-[#08152f]"
              >
                <img
                  src={item.image}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover ${item.pos} transition duration-700 group-hover:scale-[1.015]`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041027]/95 via-[#041027]/12 to-transparent" />
                <button
                  type="button"
                  aria-label="Play prototype Sam video"
                  className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-white/50 bg-black/20 text-white backdrop-blur-sm"
                >
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <div className="text-[8px] font-black tracking-[0.15em] text-white/60">
                    {item.label}
                  </div>
                  <h3 className="mt-2 text-[24px] font-black leading-[1.03] tracking-[-0.045em] text-white">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#08152f] px-5 py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="overflow-hidden border border-white/10 bg-[#061126]">
            <img
              src="/sam/Jeans%20Town%20hall.png"
              alt="AI-generated town hall scene featuring fictional Sam"
              className="aspect-[4/5] w-full object-cover object-[center_12%]"
            />
          </div>

          <div className="max-w-[580px]">
            <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">
              REPRESENTATION, NOT ACCESS
            </div>
            <h2 className="mt-4 text-[clamp(2.8rem,5.5vw,4.7rem)] font-black leading-[0.92] tracking-[-0.06em]">
              Leadership should answer
              <br />
              <span className="text-[#f16b78]">to the people.</span>
            </h2>
            <p className="mt-6 text-[15px] font-medium leading-7 text-[#c0cada]">
              The public sets the priorities. Support helps fund the work. But money
              never buys a louder vote, a private line, or a different answer.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "People choose the priorities",
                "One person, one priority vote",
                "Money never buys more influence",
                "Results stay visible to everyone",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-[12px] font-extrabold">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#d82335]">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-[520px] overflow-hidden bg-[#07142c] text-white">
        <img
          src="/sam/Upper%20Body%20Speech.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-[#07142c]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07142c] via-[#07142c]/85 to-[#07142c]/35" />

        <div className="relative mx-auto flex min-h-[520px] max-w-[1240px] items-center px-5 py-20 lg:px-8">
          <blockquote className="max-w-[800px]">
            <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">
              THE DIFFERENCE
            </div>
            <p className="mt-6 text-[clamp(2.9rem,6vw,5.4rem)] font-black leading-[0.91] tracking-[-0.065em]">
              “The public sets the priorities.
              <br />
              <span className="text-[#f16b78]">Leadership answers to them.”</span>
            </p>
          </blockquote>
        </div>
      </section>

      <section className="bg-[#efebe3] px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">
                SAM 2028
              </div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Wear the movement.
                <br />
                <span className="text-[#d82335]">Make the point.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#667084]">
              Concept products only for now. Commerce and any future regulated
              political fundraising will be structured and disclosed separately.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <article className="flex min-h-[350px] flex-col justify-between bg-[#08152f] p-7 text-white">
              <div className="grid flex-1 place-items-center text-center text-[64px] font-black leading-[.8] tracking-[-0.08em]">
                SAM
                <br />
                <span className="mt-4 text-[18px] tracking-[0.25em]">2028</span>
              </div>
              <div className="flex items-end justify-between">
                <strong className="text-[13px]">Not On Your Ballot Tee</strong>
                <span className="text-[9px] opacity-60">Concept · $32</span>
              </div>
            </article>

            <article className="flex min-h-[350px] flex-col justify-between bg-[#e7dcc8] p-7 text-[#08152f]">
              <div className="grid flex-1 place-items-center text-center text-[62px] font-black tracking-[-0.08em]">
                SAM★
              </div>
              <div className="flex items-end justify-between">
                <strong className="text-[13px]">
                  SAM 2028 Cap
                </strong>
                <span className="text-[9px] opacity-60">Concept · $28</span>
              </div>
            </article>

            <article className="flex min-h-[350px] flex-col justify-between bg-[#d82335] p-7 text-white">
              <div className="grid flex-1 place-items-center text-center text-[28px] font-black leading-[1.04] tracking-[-0.04em]">
                THE POLITICIAN
                <br />
                ISN&apos;T REAL.
                <br />
                THE PROBLEMS ARE.
              </div>
              <div className="flex items-end justify-between">
                <strong className="text-[13px]">Receipt Pack</strong>
                <span className="text-[9px] opacity-70">Concept · $12</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="join" className="bg-[#d82335] px-5 py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <div className="text-[10px] font-black tracking-[0.22em] text-[#ffd0d5]">
              JOIN THE MOVEMENT
            </div>
            <h2 className="mt-4 text-[clamp(2.6rem,5.3vw,4.5rem)] font-black leading-[0.93] tracking-[-0.06em]">
              If you want representation,
              <br />
              help build it.
            </h2>
            <p className="mt-5 max-w-[560px] text-[14px] font-semibold leading-6 text-[#ffd0d5]">
              Vote on priorities, get the next briefing and help shape what Sam
              takes on next.
            </p>
          </div>

          <form onSubmit={join} className="bg-white p-6 text-[#101827]">
            <label className="text-[9px] font-black tracking-[0.12em]">
              EMAIL ADDRESS
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                required
                type="email"
                placeholder="you@example.com"
                className="min-w-0 flex-1 border border-[#d3d6dc] px-4 py-3 text-[14px] outline-none focus:border-[#153b79]"
              />
              <button className="bg-[#08152f] px-5 py-3 text-[10px] font-black uppercase tracking-[0.09em] text-white">
                Join Sam
              </button>
            </div>
            <div className="mt-2 text-[9px] font-semibold leading-4 text-[#8d95a3]">
              {joined
                ? "You're in — for this prototype only. No email was transmitted or stored."
                : "Prototype signup — no data is transmitted in this demo."}
            </div>
          </form>
        </div>
      </section>

      <footer className="bg-[#040a16] px-5 pb-6 pt-14 text-[#c3ccdc]">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[.55fr_1.55fr_.45fr]">
          <div className="text-[50px] font-black tracking-[-0.08em] text-white">
            SAM<span className="text-[#d82335]">★</span>
          </div>

          <div>
            <div className="text-[9px] font-black tracking-[0.13em] text-white">
              PARODY DISCLOSURE
            </div>
            <p className="mt-3 max-w-[720px] text-[11px] font-medium leading-5 text-[#8d99ae]">
              SAM is an AI-generated fictional public-facing personality. SAM is not
              a real person, candidate, elected official, political party, campaign
              committee, or government representative. Support payments fund the
              SAM media, research and social-issues awareness project and do not buy
              votes or political influence.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-[11px] font-bold">
            <a href="#watch">Watch</a>
            <a href="#agenda">Agenda</a>
            <a href="#fund">Projects</a>
            <a href="#receipts">Receipts</a>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1180px] border-t border-[#1c2940] pt-5 text-[8px] font-bold tracking-[0.13em] text-[#66758d]">
          © 2028 SAM PROJECT — FICTIONAL CAMPAIGN PROTOTYPE
        </div>
      </footer>

      {fundingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setFundingProject(null)}
            className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-[520px] bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setFundingProject(null)}
              className="absolute right-4 top-4 text-[#70798a]"
              aria-label="Close funding prototype"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-[9px] font-black tracking-[0.16em] text-[#153b79]">
              SECURE STRIPE CHECKOUT
            </div>
            <h3 className="mt-3 text-[38px] font-black leading-none tracking-[-0.05em]">
              Fund this push
            </h3>
            <p className="mt-4 text-[14px] font-semibold leading-6 text-[#747d8d]">
              {fundingProject.title}
            </p>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAmount(value)}
                  className={
                    "border px-2 py-3 text-[12px] font-black " +
                    (amount === value
                      ? "border-[#08152f] bg-[#08152f] text-white"
                      : "border-[#d4d7dc] bg-white text-[#08152f]")
                  }
                >
                  ${value}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => startCheckout(amount, fundingProject)}
              disabled={checkoutBusy}
              className="mt-5 flex w-full items-center justify-center gap-2 bg-[#08152f] px-4 py-4 text-[9px] font-black uppercase tracking-[0.08em] text-white disabled:opacity-60"
            >
              {checkoutBusy ? "Opening Stripe…" : "Continue to secure checkout"}
              <ShieldCheck className="h-4 w-4" />
            </button>

            {checkoutError ? (
              <p className="mt-3 text-[10px] font-bold leading-4 text-[#b4232f]">
                {checkoutError}
              </p>
            ) : null}

            <p className="mt-3 text-[9px] font-semibold leading-4 text-[#8d95a3]">
              Payments are processed by Stripe. Financial support never buys an
              additional priority vote or changes how votes are counted.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

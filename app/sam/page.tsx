"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Megaphone,
  Play,
  ShieldCheck,
  Users,
  Vote,
  X,
} from "lucide-react";

type Issue = { slug: string; name: string; votes: number };
type Cycle = { slug: string; label: string; starts_at: string; ends_at: string };

type Project = {
  tag: string;
  title: string;
  copy: string;
  raised: number;
  target: number;
  level: number;
  nextTarget: number;
  levelOne: string[];
  featured?: boolean;
};

type MembershipTier = {
  amount: number;
  name: string;
  subtitle: string;
  benefits: string[];
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

const projects: Project[] = [
  {
    tag: "CURRENT ACTION 01",
    title: "Congressional stock trading reform",
    copy: "Make the rules understandable, show where reform proposals differ, and give constituents a simple way to act together.",
    raised: 0,
    target: 10000,
    level: 1,
    nextTarget: 50000,
    levelOne: [
      "Research + source-backed public explainer",
      "Short-form video and shareable campaign assets",
      "One coordinated constituent outreach action",
    ],
    featured: true,
  },
  {
    tag: "CURRENT ACTION 02",
    title: "Healthcare price transparency",
    copy: "Turn confusing healthcare pricing into something normal people can compare, understand, share, and act on.",
    raised: 0,
    target: 10000,
    level: 1,
    nextTarget: 50000,
    levelOne: [
      "Collect and organize public pricing evidence",
      "Build a plain-English comparison tool",
      "Coordinate one public awareness + action push",
    ],
  },
  {
    tag: "CURRENT ACTION 03",
    title: "Government spending transparency",
    copy: "Follow the money, explain it without political jargon, and build public tools that make waste and trade-offs easier to see.",
    raised: 0,
    target: 10000,
    level: 1,
    nextTarget: 50000,
    levelOne: [
      "Build the first public spending explorer",
      "Publish weekly evidence-led explainers",
      "Create one coordinated accountability action",
    ],
  },
];

const membershipTiers: MembershipTier[] = [
  {
    amount: 10,
    name: "SAM Access",
    subtitle: "The core membership.",
    benefits: [
      "Up to 60 minutes of SAM AI chat each week",
      "Monthly focus briefing + progress recap",
      "Member access to new SAM tools as they launch",
    ],
  },
  {
    amount: 25,
    name: "SAM Sticker Club",
    subtitle: "Digital access + something physical.",
    benefits: [
      "Everything in SAM Access",
      "Monthly sticker / bumper sticker pack",
      "US shipping included at launch",
    ],
    featured: true,
  },
  {
    amount: 50,
    name: "SAM Shirt Club",
    subtitle: "Wear the issue of the month.",
    benefits: [
      "Everything in Sticker Club",
      "One SAM shirt each month",
      "Member apparel preferences saved to your account",
    ],
  },
  {
    amount: 100,
    name: "SAM Full Kit",
    subtitle: "The complete monthly drop.",
    benefits: [
      "Everything in Shirt Club",
      "Monthly hat or premium SAM merch item",
      "Early access to new member experiences",
    ],
  },
];

const SAM_SUPABASE_URL = "https://zqwdooykgwkfhwyayucg.supabase.co";
const SAM_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inpxd2Rvb3lrZ3drZmh3eWF5dWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDcxNjIsImV4cCI6MjEwNjMyMzE2Mn0._PjizrlrLH-5fxk_ZicCen3IuleP9BvYL9vu4l1wLNs";

async function samRpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(SAM_SUPABASE_URL + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: {
      apikey: SAM_SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SAM_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const appleFont =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export default function SamPage() {
  const [issues, setIssues] = useState(initialIssues);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voteNotice, setVoteNotice] = useState("");
  const [fundingProject, setFundingProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState(25);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [joinNotice, setJoinNotice] = useState("");

  useEffect(() => {
    document.title = "SAM 2028 — Collective action, directed by the people";

    let voterId = window.localStorage.getItem("samVoterId");
    if (!voterId) {
      voterId = crypto.randomUUID();
      window.localStorage.setItem("samVoterId", voterId);
    }

    const load = async () => {
      try {
        const [cycleRows, voteRows] = await Promise.all([
          samRpc<Cycle[]>("sam_get_current_cycle", {}),
          samRpc<Array<{ slug: string; name: string; votes: number | string }>>(
            "sam_get_issue_totals",
            {},
          ),
        ]);

        const currentCycle = cycleRows[0] ?? null;
        setCycle(currentCycle);
        if (currentCycle) {
          setMyVote(
            window.localStorage.getItem("samPriorityVote:" + currentCycle.slug),
          );
        }

        setIssues(
          voteRows.map((row) => ({
            slug: row.slug,
            name: row.name,
            votes: Number(row.votes),
          })),
        );
      } catch {
        setVoteNotice("Live voting is temporarily unavailable. Please try again shortly.");
      }
    };

    load();
    const timer = window.setInterval(async () => {
      try {
        const voteRows = await samRpc<
          Array<{ slug: string; name: string; votes: number | string }>
        >("sam_get_issue_totals", {});
        setIssues(
          voteRows.map((row) => ({
            slug: row.slug,
            name: row.name,
            votes: Number(row.votes),
          })),
        );
      } catch {
        // Keep the last successful totals on screen.
      }
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  const sortedIssues = useMemo(
    () => [...issues].sort((a, b) => b.votes - a.votes),
    [issues],
  );

  const totalVotes = issues.reduce((sum, issue) => sum + issue.votes, 0);

  const nextFocusLabel = useMemo(() => {
    if (!cycle) return "next month";
    const date = new Date(cycle.ends_at);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }, [cycle]);

  async function voteFor(issue: Issue) {
    const voterId = window.localStorage.getItem("samVoterId");
    if (!voterId || !cycle) {
      setVoteNotice("Voting is still loading. Try again in a moment.");
      return;
    }

    try {
      setVoteNotice("Recording your vote…");
      await samRpc<string>("sam_cast_vote", {
        p_voter_id: voterId,
        p_issue_slug: issue.slug,
      });

      window.localStorage.setItem(
        "samPriorityVote:" + cycle.slug,
        issue.slug,
      );
      setMyVote(issue.slug);

      const rows = await samRpc<
        Array<{ slug: string; name: string; votes: number | string }>
      >("sam_get_issue_totals", {});
      setIssues(
        rows.map((row) => ({
          slug: row.slug,
          name: row.name,
          votes: Number(row.votes),
        })),
      );
      setVoteNotice(
        "Your " +
          cycle.label +
          " vote is now “" +
          issue.name +
          ".” You can change it until the monthly ballot closes.",
      );
    } catch {
      setVoteNotice("That vote did not go through. Please try again.");
    }
  }

  async function startCheckout(
    mode: "one_time" | "monthly",
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
          mode,
          amount: supportAmount,
          projectSlug: project
            ? project.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
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

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoinNotice("Joining…");

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");

    try {
      await samRpc<boolean>("sam_join_list", { p_email: email });
      setJoinNotice("You’re on the list.");
      form.reset();
    } catch {
      setJoinNotice("That email could not be saved. Please try again.");
    }
  }

  return (
    <main
      className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased"
      style={{ fontFamily: appleFont }}
    >
      <div className="bg-[#07142c] px-4 py-2.5 text-center text-[10px] font-semibold tracking-[0.08em] text-white/88">
        AI LEADERSHIP YOU CAN TRUST · PEOPLE SET THE AGENDA · MONEY NEVER BUYS A VOTE
      </div>

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/82 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/72">
        <div className="mx-auto flex h-[64px] max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="text-[25px] font-semibold tracking-[-0.055em] text-[#07142c]"
          >
            SAM<span className="ml-1 text-[#d82335]">★</span>
            <span className="ml-2 text-[10px] font-semibold tracking-[0.18em] text-[#d82335]">
              2028
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-7 text-[12px] font-semibold text-[#4b4b50] md:flex">
            <a className="transition hover:text-[#d82335]" href="#why">Why</a>
            <a className="transition hover:text-[#d82335]" href="#agenda">Vote</a>
            <a className="transition hover:text-[#d82335]" href="#fund">Action Funds</a>
            <a className="transition hover:text-[#d82335]" href="#membership">Membership</a>
          </nav>

          <a
            href="#membership"
            className="ml-5 inline-flex rounded-full bg-[#07142c] px-4 py-2.5 text-[11px] font-semibold text-white"
          >
            Join SAM
          </a>
        </div>
      </header>

      <section
        id="top"
        className="relative min-h-[720px] overflow-hidden bg-[#07142c] text-white lg:min-h-[800px]"
      >
        <img
          src="/sam/Campaign%20Speech%20with%20Patriotic%20Backdrop.png"
          alt="AI-generated image of fictional SAM speaking at a campaign-style event"
          className="absolute inset-0 h-full w-full object-cover object-[67%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,11,25,.98)_0%,rgba(4,11,25,.9)_34%,rgba(4,11,25,.55)_58%,rgba(4,11,25,.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,11,25,.72)_0%,transparent_38%)]" />

        <div className="relative mx-auto flex min-h-[720px] max-w-6xl items-center px-4 py-20 sm:px-6 lg:min-h-[800px] lg:px-8">
          <div className="max-w-[720px]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a9c5ff]">
              Representation, the way it was supposed to work
            </div>

            <div className="mt-6 text-[clamp(5.6rem,13vw,10rem)] font-semibold leading-[0.72] tracking-[-0.095em]">
              SAM<span className="align-top text-[0.25em] text-[#e42b3f]">★</span>
            </div>

            <h1 className="mt-9 max-w-[740px] text-[clamp(3rem,6.5vw,5.7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              Collective power.
              <br />
              <span className="text-[#f16b78]">Directed by the people.</span>
            </h1>

            <p className="mt-7 max-w-[620px] text-[17px] font-medium leading-7 text-[#d5ddea] sm:text-[19px] sm:leading-8">
              Your representatives are supposed to represent you. SAM gives people a
              way to make that mandate visible, coordinated, and much harder to ignore.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#agenda"
                className="inline-flex items-center gap-2 rounded-full bg-[#d82335] px-5 py-3.5 text-[12px] font-semibold text-white transition hover:bg-[#ea3045]"
              >
                Vote this month <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#why"
                className="inline-flex items-center gap-2 rounded-full border border-white/28 bg-white/[0.08] px-5 py-3.5 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/14"
              >
                See how it works <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-white/58">
              <span>Vote monthly</span>
              <span>•</span>
              <span>One coordinated action</span>
              <span>•</span>
              <span>Transparent funding levels</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 hidden text-right text-[8px] font-medium tracking-[0.11em] text-white/45 md:block">
          AI-GENERATED SAM IMAGE
          <br />
          SAM IS NOT A REAL CANDIDATE OR OFFICEHOLDER
        </div>
      </section>

      <section id="why" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-[13px] font-semibold text-[#d82335]">Why SAM exists</p>
            <h2 className="mt-3 text-[clamp(2.7rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              Your representatives are supposed to represent you.
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#6e6e73]">
              That was always the deal: constituents make their priorities known,
              elected officials carry that mandate into government, and the public can
              see whether they followed through. Today, those voices often compete with
              donors, lobbyists, party machinery and organized special interests. SAM
              puts the public mandate back in one visible place.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Vote,
                title: "You choose the priority.",
                copy: "Every month, the community votes. One person gets one active priority vote for that cycle.",
              },
              {
                icon: Megaphone,
                title: "SAM concentrates attention.",
                copy: "The winning issue becomes the primary focus of weekly videos, emails, explainers and public conversation.",
              },
              {
                icon: Users,
                title: "Then we act together.",
                copy: "One coordinated action gives thousands of individual voices the same timing, message and destination.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[26px] border border-black/[0.06] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,.03),0_12px_34px_rgba(0,0,0,.035)]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef3ff] text-[#153b79]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-7 text-[23px] font-semibold leading-tight tracking-[-0.035em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-[#6e6e73]">
                    {item.copy}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-[28px] bg-[#07142c] p-7 text-white sm:p-9">
            <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a9c5ff]">
                  The simple idea
                </p>
                <p className="mt-3 text-[31px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[40px]">
                  Representation should not depend on
                  <br />
                  <span className="text-[#f16b78]">who can buy the most access.</span>
                </p>
              </div>
              <p className="text-[15px] leading-7 text-[#bcc7d9]">
                Everyone gets the same public vote. Money can help fund research,
                tools, distribution and coordinated action — but it never buys a louder
                ballot. The people decide the mandate first.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="agenda" className="bg-[#07142c] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold text-[#a9c5ff]">
                {cycle ? cycle.label + " ballot" : "This month’s ballot"}
              </p>
              <h2 className="mt-3 text-[clamp(4rem,8vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
                VOTE<span className="text-[#f16b78]">.</span>
              </h2>
            </div>
            <div className="lg:pb-1">
              <p className="max-w-[520px] text-[16px] leading-7 text-[#bcc7d9]">
                The #1 issue becomes SAM’s main focus for {nextFocusLabel}. The top
                three issues become the starting point for the next three action funds.
              </p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-[34px] font-semibold tracking-[-0.04em]">
                  {totalVotes.toLocaleString()}
                </span>
                <span className="text-[12px] font-medium text-[#8291aa]">live votes</span>
              </div>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04]">
            {sortedIssues.map((issue, index) => {
              const pct = totalVotes > 0 ? (issue.votes / totalVotes) * 100 : 0;
              const selected = myVote === issue.slug;

              return (
                <div
                  key={issue.slug}
                  className={
                    "relative grid grid-cols-[34px_1fr_64px] items-center gap-3 px-4 py-4 sm:grid-cols-[44px_1fr_72px_116px] sm:px-5 " +
                    (index !== sortedIssues.length - 1 ? "border-b border-white/10" : "")
                  }
                >
                  <div className="text-[14px] font-medium text-[#70809b]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold sm:text-[16px]">{issue.name}</div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10 sm:hidden">
                      <div className="h-full rounded-full bg-[#d82335]" style={{ width: String(pct) + "%" }} />
                    </div>
                  </div>
                  <div className="text-right text-[17px] font-semibold">{pct.toFixed(1)}%</div>
                  <button
                    type="button"
                    onClick={() => voteFor(issue)}
                    className={
                      "col-start-2 col-end-4 mt-1 rounded-full border px-3 py-2 text-[10px] font-semibold transition sm:col-auto sm:mt-0 " +
                      (selected
                        ? "border-white bg-white text-[#07142c]"
                        : "border-white/24 text-white hover:bg-white hover:text-[#07142c]")
                    }
                  >
                    {selected ? "Your vote" : myVote ? "Switch vote" : "Vote"}
                  </button>
                  <div className="absolute bottom-0 left-0 hidden h-[2px] bg-[#d82335] sm:block" style={{ width: String(pct) + "%" }} />
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-2 text-[12px] text-[#93a0b7] sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-[#c3cede]">{voteNotice}</span>
            <span>Beta: one active vote per browser each month. Verified member voting is next.</span>
          </div>

          <div className="mt-9 rounded-[22px] border border-white/10 bg-white/[0.05] p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#a9c5ff]">
                  What happens after the vote
                </p>
                <p className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.035em]">
                  One public mandate. One coordinated action.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Email officials", "Call / text", "Public comment", "Share campaign"].map((item) => (
                  <div key={item} className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2.5 text-center text-[10px] font-semibold text-[#d5ddea]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fund" className="border-y border-black/[0.06] bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold text-[#153b79]">Three action funds. Clear levels.</p>
              <h2 className="mt-3 text-[clamp(2.9rem,5.8vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.055em]">
                Fund a specific outcome,
                <br />
                <span className="text-[#d82335]">not a vague promise.</span>
              </h2>
            </div>
            <p className="max-w-[540px] text-[16px] leading-7 text-[#6e6e73]">
              Each current cause starts at Level 1 with a $10,000 goal and a public
              plan for what that level funds. If it reaches Level 1, the next plan and
              Level 2 goal are published before more money is requested.
            </p>
          </div>

          <div className="mt-9 rounded-[24px] bg-[#f5f5f7] p-6 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr] lg:items-center">
              <div>
                <p className="text-[12px] font-semibold text-[#d82335]">How monthly rotation works</p>
                <p className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.035em]">
                  Next month’s top three votes become the next three action funds.
                </p>
              </div>
              <p className="text-[13px] leading-6 text-[#6e6e73]">
                Money already raised remains attached to the cause it was raised for.
                If that cause returns to the top three later, it resumes with its
                existing balance. Funds are not silently redirected to an unrelated issue.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {projects.map((project) => {
              const pct =
                project.target > 0
                  ? Math.min(100, Math.round((project.raised / project.target) * 100))
                  : 0;

              return (
                <article
                  key={project.title}
                  className={
                    "flex min-h-[570px] flex-col rounded-[26px] border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.03),0_12px_34px_rgba(0,0,0,.035)] " +
                    (project.featured ? "border-[#d82335]" : "border-black/[0.07]")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
                      {project.tag}
                    </span>
                    <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-[10px] font-semibold text-[#153b79]">
                      Level {project.level}
                    </span>
                  </div>

                  <h3 className="mt-7 text-[29px] font-semibold leading-[1.02] tracking-[-0.04em]">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-[14px] leading-6 text-[#6e6e73]">{project.copy}</p>

                  <div className="mt-7 rounded-[18px] bg-[#f5f5f7] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
                      What Level 1 pays for
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {project.levelOne.map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#153b79]" strokeWidth={2} />
                          <span className="text-[12px] leading-5 text-[#4b4b50]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-7">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-[#86868b]">Raised</p>
                        <p className="mt-1 text-[26px] font-semibold tracking-[-0.04em]">{money(project.raised)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-medium text-[#86868b]">Level 1 goal</p>
                        <p className="mt-1 text-[16px] font-semibold">{money(project.target)}</p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ececf0]">
                      <div className="h-full rounded-full bg-[#d82335]" style={{ width: String(pct) + "%" }} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#86868b]">
                      <span>{pct}% funded</span>
                      <span>Level 2: {money(project.nextTarget)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFundingProject(project);
                        setAmount(25);
                        setCheckoutError("");
                      }}
                      className={
                        "mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[11px] font-semibold text-white " +
                        (project.featured ? "bg-[#d82335]" : "bg-[#07142c]")
                      }
                    >
                      Fund Level 1 <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="membership" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold text-[#d82335]">Membership, not pay-to-vote</p>
              <h2 className="mt-3 text-[clamp(2.9rem,5.8vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.055em]">
                Support the system.
                <br />
                <span className="text-[#6e6e73]">Get something real back.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[16px] leading-7 text-[#6e6e73]">
              The main way to support SAM is membership: AI access, member tools and
              physical monthly drops. Every tier gets the exact same public ballot.
              More money never means more votes.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {membershipTiers.map((tier) => (
              <article
                key={tier.amount}
                className={
                  "relative flex min-h-[430px] flex-col rounded-[26px] border p-6 shadow-[0_1px_2px_rgba(0,0,0,.03),0_12px_34px_rgba(0,0,0,.035)] " +
                  (tier.featured
                    ? "border-[#d82335] bg-[#07142c] text-white"
                    : "border-black/[0.07] bg-white")
                }
              >
                {tier.featured ? (
                  <span className="absolute right-5 top-5 rounded-full bg-[#d82335] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-white">
                    Popular
                  </span>
                ) : null}

                <p className={tier.featured ? "text-[12px] font-semibold text-[#a9c5ff]" : "text-[12px] font-semibold text-[#153b79]"}>
                  {tier.name}
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-[46px] font-semibold leading-none tracking-[-0.06em]">
                    {"$"}{tier.amount}
                  </span>
                  <span className={tier.featured ? "pb-1 text-[12px] text-white/55" : "pb-1 text-[12px] text-[#86868b]"}>
                    / month
                  </span>
                </div>

                <p className={tier.featured ? "mt-3 text-[13px] text-white/65" : "mt-3 text-[13px] text-[#6e6e73]"}>
                  {tier.subtitle}
                </p>

                <div className="mt-7 space-y-3">
                  {tier.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2.5">
                      <span className={tier.featured ? "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[#07142c]" : "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eef3ff] text-[#153b79]"}>
                        <Check className="h-3 w-3" strokeWidth={2.2} />
                      </span>
                      <span className={tier.featured ? "text-[13px] leading-5 text-white/84" : "text-[13px] leading-5 text-[#4b4b50]"}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => startCheckout("monthly", tier.amount, null)}
                  disabled={checkoutBusy}
                  className={
                    "mt-auto rounded-full px-4 py-3 text-[11px] font-semibold transition disabled:opacity-50 " +
                    (tier.featured
                      ? "bg-[#d82335] text-white hover:bg-[#ea3045]"
                      : "bg-[#07142c] text-white hover:bg-[#122747]")
                  }
                >
                  {checkoutBusy ? "Opening Stripe…" : "Choose " + tier.name}
                </button>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border border-black/[0.06] bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-[13px] font-semibold">Prefer not to subscribe?</p>
              <p className="mt-1 text-[12px] leading-5 text-[#6e6e73]">
                One-time support stays available as a secondary option for the SAM media project.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
              {[10, 25, 50, 100].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => startCheckout("one_time", value, null)}
                  disabled={checkoutBusy}
                  className="rounded-full bg-[#f2f2f7] px-4 py-2.5 text-[11px] font-semibold text-[#3a3a3c] transition hover:bg-[#e7e7ec] disabled:opacity-50"
                >
                  {"$"}{value}
                </button>
              ))}
            </div>
          </div>

          {checkoutError ? (
            <div className="mt-4 rounded-[16px] border border-[#d82335]/25 bg-[#fff2f4] px-4 py-3 text-[12px] font-semibold text-[#a61f2d]">
              {checkoutError}
            </div>
          ) : null}

          <p className="mt-4 text-[11px] leading-5 text-[#86868b]">
            Member chat is the next product build and physical benefits require a valid US shipping address.
            Stripe checkout is currently operating in sandbox while launch setup is completed.
          </p>
        </div>
      </section>

      <section id="watch" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
            <div>
              <p className="text-[13px] font-semibold text-[#153b79]">The monthly focus in public</p>
              <h2 className="mt-3 text-[clamp(2.8rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
                The issue follows you
                <br />
                <span className="text-[#6e6e73]">through the whole month.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[16px] leading-7 text-[#6e6e73]">
              Weekly social videos, the month’s emails and the coordinated action all
              reinforce the same public mandate instead of chasing a different headline every day.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "WEEKLY VIDEO",
                title: "Explain the problem without the political fog.",
                image: "/sam/Relax%20Campaign%20speech.png",
                pos: "object-[center_18%]",
              },
              {
                label: "PUBLIC ACTION",
                title: "Take the month’s mandate out into the real world.",
                image: "/sam/Half%20body%20hand%20shake.png",
                pos: "object-[center_18%]",
              },
              {
                label: "PROGRESS REPORT",
                title: "Show what changed, what didn’t, and what comes next.",
                image: "/sam/Signing%20Paperwork.png",
                pos: "object-[center_18%]",
              },
            ].map((item) => (
              <article key={item.title} className="group relative aspect-[4/5] overflow-hidden rounded-[26px] bg-[#07142c]">
                <img
                  src={item.image}
                  alt=""
                  className={"absolute inset-0 h-full w-full object-cover " + item.pos + " transition duration-700 group-hover:scale-[1.015]"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041027]/95 via-[#041027]/10 to-transparent" />
                <div className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/38 bg-black/18 text-white backdrop-blur-sm">
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="text-[9px] font-semibold tracking-[0.11em] text-white/55">{item.label}</div>
                  <h3 className="mt-2 text-[23px] font-semibold leading-[1.05] tracking-[-0.035em] text-white">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="bg-[#07142c] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold text-[#a9c5ff]">Stay in the loop</p>
            <h2 className="mt-3 text-[clamp(2.7rem,5vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              Make a difference.
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-6 text-[#b7c2d5]">
              Get the monthly ballot, the focus briefing and the coordinated action when it goes live.
            </p>
          </div>

          <form onSubmit={join} className="rounded-[22px] bg-white p-5 text-[#1d1d1f]">
            <label className="text-[11px] font-semibold text-[#6e6e73]">Email address</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                required
                name="email"
                type="email"
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-full border border-black/[0.12] bg-[#f5f5f7] px-4 py-3 text-[14px] outline-none focus:border-[#153b79]"
              />
              <button className="rounded-full bg-[#d82335] px-5 py-3 text-[11px] font-semibold text-white">
                Join the list
              </button>
            </div>
            <div className="mt-2 min-h-4 text-[10px] font-medium text-[#86868b]">{joinNotice}</div>
          </form>
        </div>
      </section>

      <footer className="bg-[#040a16] px-4 pb-7 pt-14 text-[#aab5c7] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.5fr_1.5fr_.5fr]">
          <div className="text-[42px] font-semibold tracking-[-0.07em] text-white">
            SAM<span className="text-[#d82335]">★</span>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
              AI + activity disclosure
            </p>
            <p className="mt-3 max-w-[760px] text-[11px] leading-5 text-[#7f8ca1]">
              SAM is an AI-generated civic media and issue-awareness project, not a real
              candidate, elected official, political party, campaign committee or government representative.
              Membership and project support do not purchase votes or additional political influence.
              Support is not tax-deductible as a charitable contribution unless explicitly stated.
              Any future regulated political-committee activity would be separately organized and disclosed.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-[11px] font-semibold">
            <a href="#why">Why SAM</a>
            <a href="#agenda">Vote</a>
            <a href="#fund">Action Funds</a>
            <a href="#membership">Membership</a>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-5 text-[9px] font-medium tracking-[0.08em] text-[#5d6a7d]">
          © 2028 SAM PROJECT · AI-GENERATED CIVIC MEDIA PROJECT
        </div>
      </footer>

      {fundingProject && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setFundingProject(null)}
            className="absolute inset-0 bg-[#020813]/82 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-[520px] rounded-[26px] bg-white p-7 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setFundingProject(null)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f7] text-[#6e6e73]"
              aria-label="Close funding window"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#153b79]">
              {fundingProject.title} · Level {fundingProject.level}
            </div>

            <h3 className="mt-3 text-[36px] font-semibold leading-[0.98] tracking-[-0.05em]">
              Help fund the next action.
            </h3>

            <p className="mt-4 text-[13px] leading-6 text-[#6e6e73]">
              Level 1 goal: {money(fundingProject.target)}. Your support remains attached
              to this cause and does not affect how your public vote is counted.
            </p>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAmount(value)}
                  className={
                    "rounded-[13px] border px-2 py-3 text-[12px] font-semibold " +
                    (amount === value
                      ? "border-[#07142c] bg-[#07142c] text-white"
                      : "border-black/[0.1] bg-white text-[#07142c]")
                  }
                >
                  {"$"}{value}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => startCheckout("one_time", amount, fundingProject)}
              disabled={checkoutBusy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#d82335] px-4 py-4 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              {checkoutBusy ? "Opening Stripe…" : "Continue to secure checkout"}
              <ShieldCheck className="h-4 w-4" />
            </button>

            {checkoutError ? (
              <p className="mt-3 text-[10px] font-semibold leading-4 text-[#b4232f]">
                {checkoutError}
              </p>
            ) : null}

            <p className="mt-3 text-[9px] leading-4 text-[#86868b]">
              Stripe sandbox is active while launch setup is completed. Project funding is
              separate from the monthly public ballot.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

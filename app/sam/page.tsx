"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Play,
  ShieldCheck,
  X,
} from "lucide-react";

type Issue = { slug: string; name: string; votes: number };
type Cycle = { slug: string; label: string; starts_at: string; ends_at: string };

type Project = {
  slug: string;
  tag: string;
  title: string;
  copy: string;
  target: number;
  delivers: string[];
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
  { slug: "cost-of-living", name: "Cost of living & inflation", votes: 0 },
  { slug: "healthcare-costs", name: "Healthcare affordability", votes: 0 },
  { slug: "money-in-politics", name: "Money in politics & corruption", votes: 0 },
  { slug: "housing-affordability", name: "Housing affordability", votes: 0 },
  { slug: "federal-debt-spending", name: "Federal debt & government spending", votes: 0 },
  { slug: "immigration-border", name: "Immigration & border policy", votes: 0 },
  { slug: "reproductive-rights", name: "Reproductive rights & abortion", votes: 0 },
  { slug: "gun-violence-public-safety", name: "Gun violence & public safety", votes: 0 },
  { slug: "drug-addiction-fentanyl", name: "Drug addiction & fentanyl", votes: 0 },
  { slug: "climate-energy", name: "Climate & energy", votes: 0 },
];

const projects: Project[] = [
  {
    slug: "follow-the-money-campaign",
    tag: "ACTION 01 · REACH",
    title: "Run the Follow the Money campaign",
    copy: "A real $10,000 national issue-awareness campaign showing how campaign money, PAC spending and lobbying shape political access.",
    target: 10000,
    delivers: [
      "$2,000 for source-backed creative and short-form video",
      "$7,000 in paid digital distribution",
      "$1,000 for measurement and a public results report",
    ],
    featured: true,
  },
  {
    slug: "muckrock-transparency-grant",
    tag: "ACTION 02 · HELP",
    title: "Give $10,000 to MuckRock",
    copy: "A direct grant to the nonprofit MuckRock Foundation, which helps people file, track and share public-records requests and supports government-transparency reporting.",
    target: 10000,
    delivers: [
      "Recipient: MuckRock Foundation, a 501(c)(3)",
      "Grant confirmed with the recipient before release",
      "Receipt and follow-up published publicly",
    ],
  },
  {
    slug: "sam-influence-tracker",
    tag: "ACTION 03 · BUILD",
    title: "Build the SAM Influence Tracker",
    copy: "A public tool that makes federal campaign money and lobbying records easier for normal people to explore in one place.",
    target: 10000,
    delivers: [
      "Use public FEC campaign-finance data",
      "Add Senate lobbying-disclosure records",
      "Release a searchable first version free to the public",
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
      "$30 every month allocated to the 3 current Action Funds ($10 each)",
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
  const [fundTotals, setFundTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "SAM 2028 — Collective action, directed by the people";

    let voterId = window.localStorage.getItem("samVoterId");
    if (!voterId) {
      voterId = crypto.randomUUID();
      window.localStorage.setItem("samVoterId", voterId);
    }

    const load = async () => {
      try {
        const [cycleRows, voteRows, fundRows] = await Promise.all([
          samRpc<Cycle[]>("sam_get_current_cycle", {}),
          samRpc<Array<{ slug: string; name: string; votes: number | string }>>(
            "sam_get_issue_totals",
            {},
          ),
          samRpc<Array<{ project_slug: string; raised_cents: number | string }>>(
            "sam_get_action_funds",
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
        setFundTotals(
          Object.fromEntries(
            fundRows.map((row) => [
              row.project_slug,
              Number(row.raised_cents) / 100,
            ]),
          ),
        );
      } catch {
        setVoteNotice("Live voting is temporarily unavailable. Please try again shortly.");
      }
    };

    load();
    const timer = window.setInterval(async () => {
      try {
        const [voteRows, fundRows] = await Promise.all([
          samRpc<Array<{ slug: string; name: string; votes: number | string }>>(
            "sam_get_issue_totals",
            {},
          ),
          samRpc<Array<{ project_slug: string; raised_cents: number | string }>>(
            "sam_get_action_funds",
            {},
          ),
        ]);
        setIssues(
          voteRows.map((row) => ({
            slug: row.slug,
            name: row.name,
            votes: Number(row.votes),
          })),
        );
        setFundTotals(
          Object.fromEntries(
            fundRows.map((row) => [
              row.project_slug,
              Number(row.raised_cents) / 100,
            ]),
          ),
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
          projectSlug: project ? project.slug : "general",
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
        {/* Mobile: full-bleed crop with the subject held to the right. */}
        <img
          src="/sam/Campaign%20Speech%20with%20Patriotic%20Backdrop.png"
          alt="AI-generated image of fictional SAM speaking at a campaign-style event"
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] lg:hidden"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,11,25,.98)_0%,rgba(4,11,25,.9)_48%,rgba(4,11,25,.42)_78%,rgba(4,11,25,.16)_100%)] lg:hidden" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,11,25,.78)_0%,transparent_42%)] lg:hidden" />

        {/* Desktop: the photograph occupies only the right side. This creates a
            protected text zone instead of relying on object-position to avoid overlap. */}
        <div className="absolute inset-y-0 right-0 hidden left-[43%] overflow-hidden lg:block">
          <img
            src="/sam/Campaign%20Speech%20with%20Patriotic%20Backdrop.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#07142c_0%,rgba(7,20,44,.92)_10%,rgba(7,20,44,.55)_24%,rgba(7,20,44,.12)_46%,rgba(7,20,44,0)_68%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,11,25,.62)_0%,transparent_34%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-6xl items-center px-4 py-20 sm:px-6 lg:min-h-[800px] lg:px-8">
          <div className="max-w-[720px] lg:max-w-[610px]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#a9c5ff]">
              Representation, the way it was supposed to be
            </div>

            <div className="mt-6 text-[clamp(5.6rem,13vw,10rem)] font-semibold leading-[0.72] tracking-[-0.095em]">
              SAM<span className="align-top text-[0.25em] text-[#e42b3f]">★</span>
              <span className="ml-5 align-middle text-[0.28em] font-semibold tracking-[0.14em] text-white/88">
                2028
              </span>
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
          <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-16">
            <h2 className="text-[clamp(5rem,11vw,9rem)] font-semibold leading-[0.78] tracking-[-0.085em] text-[#07142c]">
              Represent<span className="text-[#d82335]">.</span>
            </h2>

            <div className="max-w-[520px] lg:pb-2">
              <p className="text-[clamp(1.7rem,3.2vw,2.55rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-[#1d1d1f]">
                You tell Sam what matters.
                <br />
                Sam makes it his priority.
              </p>

              <p className="mt-6 text-[16px] leading-7 text-[#6e6e73]">
                No donors setting the agenda. No lobbyists buying access.
                <span className="font-semibold text-[#07142c]"> You vote. Sam represents.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="agenda" className="bg-[#07142c] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_20px_70px_rgba(0,0,0,.16)] sm:p-7 lg:p-8">
            <div className="grid gap-5 lg:grid-cols-[1fr_.9fr] lg:items-end">
              <div>
                <p className="text-[12px] font-semibold text-[#d82335]">
                  {cycle ? cycle.label + " ballot" : "This month’s ballot"}
                </p>
                <h2 className="mt-1 text-[clamp(5.8rem,12vw,10rem)] font-semibold leading-[0.78] tracking-[-0.085em] text-[#07142c]">
                  VOTE<span className="text-[#d82335]">.</span>
                </h2>
              </div>
              <div className="lg:pb-1">
                <p className="max-w-[500px] text-[14px] leading-6 text-[#6e6e73]">
                  Pick what you want Sam to represent next month. The #1 issue becomes
                  his primary focus.
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[28px] font-semibold tracking-[-0.04em] text-[#07142c]">
                    {totalVotes.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-[#86868b]">live votes</span>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[18px] border border-black/[0.08]">
              {sortedIssues.map((issue, index) => {
                const pct = totalVotes > 0 ? (issue.votes / totalVotes) * 100 : 0;
                const selected = myVote === issue.slug;

                return (
                  <div
                    key={issue.slug}
                    className={
                      "relative grid grid-cols-[28px_1fr_54px] items-center gap-2.5 px-3 py-3 sm:grid-cols-[36px_1fr_64px_104px] sm:px-4 " +
                      (index !== sortedIssues.length - 1 ? "border-b border-black/[0.07]" : "")
                    }
                  >
                    <div className="text-[12px] font-medium text-[#a0a0a6]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold leading-5 text-[#1d1d1f] sm:text-[14px]">
                        {issue.name}
                      </div>
                    </div>
                    <div className="text-right text-[14px] font-semibold text-[#07142c]">
                      {pct.toFixed(1)}%
                    </div>
                    <button
                      type="button"
                      onClick={() => voteFor(issue)}
                      className={
                        "col-start-2 col-end-4 rounded-full border px-3 py-1.5 text-[9px] font-semibold transition sm:col-auto " +
                        (selected
                          ? "border-[#07142c] bg-[#07142c] text-white"
                          : "border-black/[0.1] bg-[#f5f5f7] text-[#07142c] hover:border-[#07142c]")
                      }
                    >
                      {selected ? "Your vote" : myVote ? "Switch" : "Vote"}
                    </button>
                    <div
                      className="absolute bottom-0 left-0 h-[2px] bg-[#d82335]"
                      style={{ width: String(pct) + "%" }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-1.5 text-[10px] text-[#86868b] sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-[#3a3a3c]">{voteNotice}</span>
              <span>One active vote per browser each month.</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-[16px] bg-[#f5f5f7] px-4 py-3">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#153b79]">
                Then Sam represents it
              </span>
              {["Weekly videos", "Member emails", "Public action", "Funded impact"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-[9px] font-semibold text-[#4b4b50]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fund" className="border-y border-black/[0.06] bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#d82335]">Put money behind the mandate</p>
              <h2 className="mt-2 text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
                Fund<span className="text-[#d82335]">.</span>
              </h2>
            </div>
            <p className="max-w-[470px] text-[14px] leading-6 text-[#6e6e73]">
              You chose the issue. Now choose what Sam actually does about it.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 rounded-[18px] bg-[#f5f5f7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
                Launch focus
              </span>
              <span className="ml-2 text-[14px] font-semibold text-[#1d1d1f]">
                Money in politics & corruption
              </span>
            </div>
            <p className="text-[10px] leading-4 text-[#86868b]">
              Future months use the previous ballot winner.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {projects.map((project) => {
              const raised = fundTotals[project.slug] ?? 0;
              const pct =
                project.target > 0
                  ? Math.min(100, Math.round((raised / project.target) * 100))
                  : 0;

              return (
                <article
                  key={project.title}
                  className={
                    "flex flex-col rounded-[22px] border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,.03),0_10px_26px_rgba(0,0,0,.03)] " +
                    (project.featured ? "border-[#d82335]" : "border-black/[0.07]")
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
                      {project.tag}
                    </span>
                    <span className="shrink-0 rounded-full bg-[#eef3ff] px-2.5 py-1 text-[9px] font-semibold text-[#153b79]">
                      $10K goal
                    </span>
                  </div>

                  <h3 className="mt-5 text-[24px] font-semibold leading-[1] tracking-[-0.04em]">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-[12px] leading-5 text-[#6e6e73]">{project.copy}</p>

                  <div className="mt-5 space-y-2">
                    {project.delivers.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#153b79]" strokeWidth={2} />
                        <span className="text-[11px] leading-4.5 text-[#4b4b50]">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-black/[0.06] pt-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-medium text-[#86868b]">Raised</p>
                        <p className="mt-0.5 text-[22px] font-semibold tracking-[-0.04em]">{money(raised)}</p>
                      </div>
                      <p className="text-[10px] font-semibold text-[#07142c]">
                        {money(project.target)} goal
                      </p>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ececf0]">
                      <div className="h-full rounded-full bg-[#d82335]" style={{ width: String(pct) + "%" }} />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFundingProject(project);
                        setAmount(25);
                        setCheckoutError("");
                      }}
                      className={
                        "mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[10px] font-semibold text-white " +
                        (project.featured ? "bg-[#d82335]" : "bg-[#07142c]")
                      }
                    >
                      Fund this action <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-4 max-w-4xl text-[9px] leading-4 text-[#99999f]">
            Third-party grants are confirmed with the recipient before release. The
            Influence Tracker would use public FEC and U.S. Senate lobbying-disclosure data.
          </p>
        </div>
      </section>

      <section id="membership" className="bg-[#f5f5f7] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#d82335]">Membership, not pay-to-vote</p>
              <h2 className="mt-2 text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
                Support<span className="text-[#d82335]">.</span>
              </h2>
            </div>
            <p className="max-w-[500px] text-[14px] leading-6 text-[#6e6e73]">
              Support Sam, get member access and monthly drops. Every tier gets the same vote.
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,.03),0_12px_34px_rgba(0,0,0,.03)]">
            {membershipTiers.map((tier, index) => (
              <article
                key={tier.amount}
                className={
                  "relative grid gap-4 px-5 py-5 sm:grid-cols-[170px_1fr_auto] sm:items-center sm:px-6 " +
                  (index !== membershipTiers.length - 1 ? "border-b border-black/[0.07] " : "") +
                  (tier.featured ? "bg-[#07142c] text-white" : "bg-white")
                }
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className={tier.featured ? "text-[11px] font-semibold text-[#a9c5ff]" : "text-[11px] font-semibold text-[#153b79]"}>
                      {tier.name}
                    </p>
                    {tier.featured ? (
                      <span className="rounded-full bg-[#d82335] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.07em] text-white">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-[34px] font-semibold leading-none tracking-[-0.055em]">
                      {"$"}{tier.amount}
                    </span>
                    <span className={tier.featured ? "pb-0.5 text-[10px] text-white/55" : "pb-0.5 text-[10px] text-[#86868b]"}>
                      / month
                    </span>
                  </div>
                </div>

                <div className="grid gap-1.5 sm:grid-cols-3 sm:gap-3">
                  {tier.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2">
                      <Check
                        className={tier.featured ? "mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f16b78]" : "mt-0.5 h-3.5 w-3.5 shrink-0 text-[#153b79]"}
                        strokeWidth={2}
                      />
                      <span className={tier.featured ? "text-[10px] leading-4 text-white/78" : "text-[10px] leading-4 text-[#5f6368]"}>
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
                    "rounded-full px-4 py-2.5 text-[10px] font-semibold transition disabled:opacity-50 " +
                    (tier.featured
                      ? "bg-[#d82335] text-white hover:bg-[#ea3045]"
                      : "bg-[#07142c] text-white hover:bg-[#122747]")
                  }
                >
                  {checkoutBusy ? "Opening…" : "Choose"}
                </button>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[18px] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold">Prefer a one-time contribution?</p>
              <p className="mt-0.5 text-[10px] text-[#86868b]">Support the SAM media project without subscribing.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[10, 25, 50, 100].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => startCheckout("one_time", value, null)}
                  disabled={checkoutBusy}
                  className="rounded-full bg-[#f2f2f7] px-3 py-2 text-[10px] font-semibold text-[#3a3a3c] transition hover:bg-[#e7e7ec] disabled:opacity-50"
                >
                  {"$"}{value}
                </button>
              ))}
            </div>
          </div>

          {checkoutError ? (
            <div className="mt-3 rounded-[14px] border border-[#d82335]/25 bg-[#fff2f4] px-4 py-3 text-[11px] font-semibold text-[#a61f2d]">
              {checkoutError}
            </div>
          ) : null}

          <p className="mt-3 text-[9px] leading-4 text-[#99999f]">
            Member chat is the next product build. Physical benefits require a valid US shipping address.
            Stripe checkout is currently in sandbox.
          </p>
        </div>
      </section>

      <section id="watch" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[#153b79]">The monthly focus in public</p>
              <h2 className="mt-2 text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
                Watch<span className="text-[#d82335]">.</span>
              </h2>
            </div>
            <p className="max-w-[500px] text-[14px] leading-6 text-[#6e6e73]">
              Weekly videos, briefings and real-world action stay focused on the issue people chose.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[1.45fr_.55fr]">
            <article className="group relative aspect-[16/10] overflow-hidden rounded-[26px] bg-[#07142c]">
              <img
                src="/sam/Relax%20Campaign%20speech.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_18%] transition duration-700 group-hover:scale-[1.015]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041027]/95 via-[#041027]/8 to-transparent" />
              <div className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/38 bg-black/18 text-white backdrop-blur-sm">
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <div className="text-[9px] font-semibold tracking-[0.11em] text-white/55">WEEKLY VIDEO</div>
                <h3 className="mt-2 max-w-[540px] text-[24px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-[30px]">
                  Explain the problem without the political fog.
                </h3>
              </div>
            </article>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {[
                {
                  label: "PUBLIC ACTION",
                  title: "Take the mandate into the real world.",
                  image: "/sam/Jeans%20Town%20hall.png",
                  pos: "object-[center_22%]",
                },
                {
                  label: "PROGRESS REPORT",
                  title: "Show what changed and what comes next.",
                  image: "/sam/Signing%20Paperwork.png",
                  pos: "object-[center_18%]",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#07142c] lg:aspect-auto lg:min-h-[250px]"
                >
                  <img
                    src={item.image}
                    alt=""
                    className={"absolute inset-0 h-full w-full object-cover " + item.pos + " transition duration-700 group-hover:scale-[1.015]"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041027]/94 via-[#041027]/8 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className="text-[8px] font-semibold tracking-[0.1em] text-white/55">{item.label}</div>
                    <h3 className="mt-1.5 text-[15px] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[18px]">
                      {item.title}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="join" className="bg-[#07142c] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="text-[12px] font-semibold text-[#a9c5ff]">Stay in the loop</p>
            <h2 className="mt-3 text-[clamp(2.7rem,5vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              Make a <span className="text-[#f16b78]">difference.</span>
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
              {fundingProject.tag}
            </div>

            <h3 className="mt-3 text-[36px] font-semibold leading-[0.98] tracking-[-0.05em]">
              Help fund the next action.
            </h3>

            <p className="mt-4 text-[13px] leading-6 text-[#6e6e73]">
              Goal: {money(fundingProject.target)}. This money is earmarked for this
              specific action and does not affect how your public vote is counted.
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

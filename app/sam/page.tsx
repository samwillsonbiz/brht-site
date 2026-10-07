"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Play, ShieldCheck, X } from "lucide-react";

type Issue = { name: string; votes: number };
type Project = {
  tag: string;
  title: string;
  copy: string;
  raised: number;
  target: number;
  featured?: boolean;
};

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

function ImageTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#061127]/65 px-3 py-2 text-[9px] font-black tracking-[0.14em] text-white backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-[#ef4050]" />
      {children}
    </span>
  );
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

  const sortedIssues = useMemo(
    () => [...issues].sort((a, b) => b.votes - a.votes),
    [issues],
  );
  const totalVotes = issues.reduce((sum, issue) => sum + issue.votes, 0);

  function voteFor(name: string) {
    if (myVote) {
      setVoteNotice(
        `Prototype rule: one person, one priority vote. Your current choice is “${myVote}.”`,
      );
      return;
    }
    setIssues((current) =>
      current.map((issue) =>
        issue.name === name ? { ...issue, votes: issue.votes + 1 } : issue,
      ),
    );
    setMyVote(name);
    window.localStorage.setItem("samPriorityVote", name);
    setVoteNotice(
      `Vote recorded locally for “${name}.” No data was transmitted.`,
    );
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
        AI-GENERATED POLITICAL PARODY · SAM IS NOT A REAL CANDIDATE OR PUBLIC
        OFFICIAL
      </div>

      <header className="sticky top-0 z-40 border-b border-[#08152f]/10 bg-[#f7f4ed]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center px-5 lg:px-8">
          <a
            href="#top"
            className="text-[30px] font-black tracking-[-0.075em] text-[#08152f]"
          >
            SAM<span className="ml-1 text-[15px] text-[#d82335]">★</span>
            <span className="ml-2 text-[9px] font-black tracking-[0.22em] text-[#d82335]">
              20XX
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-7 text-[12px] font-extrabold text-[#08152f]/80 md:flex">
            <a className="transition hover:text-[#d82335]" href="#watch">
              Watch
            </a>
            <a className="transition hover:text-[#d82335]" href="#agenda">
              The Agenda
            </a>
            <a className="transition hover:text-[#d82335]" href="#fund">
              Fund the Push
            </a>
            <a className="transition hover:text-[#d82335]" href="#receipts">
              Receipts
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
              20<span className="text-[#f16b78]">XX</span>
            </div>

            <h1 className="mt-8 max-w-[720px] text-[clamp(2.6rem,5.5vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
              He&apos;s not running
              <br className="hidden sm:block" /> for office.
              <br />
              <span className="text-[#f16b78]">He&apos;s running out of patience.</span>
            </h1>

            <p className="mt-6 max-w-[570px] text-[15px] font-medium leading-7 text-[#d0d8e5] sm:text-[17px]">
              Political parody with a straight face. Sharp commentary, uncomfortable
              facts, dry humor — and an AI politician who can&apos;t actually ask you
              to vote for him.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#watch"
                className="inline-flex items-center gap-2 rounded-sm bg-[#d82335] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.09em] text-white transition hover:bg-[#ec3045]"
              >
                Watch Sam <Play className="h-3.5 w-3.5 fill-current" />
              </a>
              <a
                href="#agenda"
                className="inline-flex items-center gap-2 rounded-sm border border-white/35 bg-white/[0.06] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.09em] text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Tell Sam what matters <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold tracking-[0.02em] text-[#9fadc3]">
              <span>1 PERSON = 1 PRIORITY VOTE</span>
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
        THE POLITICIAN ISN&apos;T REAL. THE PROBLEMS ARE.
        <span className="mx-4 text-[#ffc0c8]">★</span>
        HUMOR FIRST. RECEIPTS ALWAYS.
        <span className="mx-4 hidden text-[#ffc0c8] md:inline">★</span>
        <span className="hidden md:inline">YOU PICK THE PRIORITIES.</span>
      </div>

      <section id="watch" className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">
                FROM THE PODIUM
              </div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,5rem)] font-black leading-[0.92] tracking-[-0.065em]">
                Sam says the quiet part
                <br />
                <span className="text-[#d82335]">into a microphone.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#667084]">
              The feed is the front door: campaign-grade visuals, deadpan delivery,
              original parody, current issues and a recurring fictional political
              universe.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.55fr_.72fr]">
            <article className="group overflow-hidden bg-[#07142c]">
              <div className="relative min-h-[500px] overflow-hidden sm:min-h-[590px]">
                <img
                  src="/sam/Confident%20American%20Campaign%20Speech.png"
                  alt="AI-generated portrait of fictional parody politician Sam at a campaign podium"
                  className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.015]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040a16] via-[#040a16]/12 to-transparent" />

                <button
                  type="button"
                  aria-label="Play prototype Sam video"
                  className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 bg-[#061127]/35 text-white backdrop-blur-md transition group-hover:scale-105"
                >
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </button>

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                  <div className="text-[9px] font-black tracking-[0.16em] text-[#b9c9e7]">
                    OFFICIAL STATEMENT*
                  </div>
                  <h3 className="mt-3 max-w-[650px] text-[30px] font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-[43px]">
                    “My fellow Americans, apparently this is real.”
                  </h3>
                  <div className="mt-5 flex items-center gap-4 text-[9px] font-black tracking-[0.12em] text-white/60">
                    <span>THE BRIEFING</span>
                    <span>•</span>
                    <span>0:42</span>
                    <span>•</span>
                    <span>*PARODY</span>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-5">
              {[
                {
                  label: "NATIONAL EMERGENCY*",
                  title: "When the obvious solution somehow requires 900 pages.",
                  image: "/sam/Half%20body%20Rally.png",
                  pos: "object-[75%_center]",
                },
                {
                  label: "SAM RESPONDS",
                  title: "“I asked the staff if this was satire. They said no.”",
                  image: "/sam/Relax%20Campaign%20speech.png",
                  pos: "object-[50%_center]",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="group relative min-h-[285px] overflow-hidden bg-[#08152f]"
                >
                  <img
                    src={item.image}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover ${item.pos} transition duration-700 group-hover:scale-[1.02]`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041027]/95 via-[#041027]/30 to-transparent" />
                  <button
                    type="button"
                    aria-label="Play prototype Sam video"
                    className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/45 bg-black/15 text-white backdrop-blur-sm"
                  >
                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="text-[8px] font-black tracking-[0.15em] text-white/60">
                      {item.label}
                    </div>
                    <h3 className="mt-2 text-[22px] font-black leading-[1.05] tracking-[-0.04em] text-white">
                      {item.title}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#08152f] text-white">
        <div className="absolute inset-y-0 right-0 w-full lg:w-[56%]">
          <img
            src="/sam/Jeans%20Town%20hall.png"
            alt="AI-generated town hall scene featuring fictional parody politician Sam"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#08152f]/25 lg:bg-gradient-to-r lg:from-[#08152f] lg:via-[#08152f]/35 lg:to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[610px] max-w-[1240px] items-center px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
          <div className="max-w-[570px] rounded-sm bg-[#08152f]/88 p-6 backdrop-blur-sm lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">
              LISTEN FIRST
            </div>
            <h2 className="mt-4 text-[clamp(2.8rem,5.5vw,4.7rem)] font-black leading-[0.92] tracking-[-0.06em]">
              The agenda doesn&apos;t
              <br />come from a donor room.
            </h2>
            <p className="mt-6 max-w-[530px] text-[15px] font-medium leading-7 text-[#c0cada]">
              People surface what they want addressed. Sam turns the top priorities
              into explainers, arguments and projects — then the community can see
              what actually happened.
            </p>
            <div className="mt-7 overflow-hidden border border-white/10 lg:max-w-[430px]">
              <img
                src="/sam/Half%20body%20hand%20shake.png"
                alt="AI-generated image of fictional parody politician Sam greeting a supporter"
                className="aspect-[16/9] w-full object-cover object-center"
              />
            </div>
            <div className="mt-7 grid gap-3 text-[12px] font-extrabold sm:grid-cols-2">
              {[
                "People choose the priorities",
                "Evidence before talking points",
                "Show the strongest counterargument",
                "Publish the receipts",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#d82335]">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                Everyone gets one priority vote. Money does not buy extra influence
                in this prototype.
              </p>
              <div className="mt-4 text-[12px] font-bold text-[#8fa0bd]">
                <span className="mr-2 text-[28px] font-black text-white">
                  {totalVotes.toLocaleString()}
                </span>
                priority votes cast
              </div>
            </div>
          </div>

          <div className="border-t border-white/15">
            {sortedIssues.map((issue, index) => {
              const pct = (issue.votes / totalVotes) * 100;
              const selected = myVote === issue.name;
              return (
                <div
                  key={issue.name}
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
                    onClick={() => voteFor(issue.name)}
                    className={
                      "col-start-2 col-end-4 mt-1 border px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] transition sm:col-auto sm:mt-0 " +
                      (selected
                        ? "border-white bg-white text-[#08152f]"
                        : "border-white/40 text-white hover:bg-white hover:text-[#08152f]")
                    }
                  >
                    {selected ? "Your vote" : "Vote"}
                  </button>
                  <div
                    className="absolute bottom-0 left-0 h-[2px] bg-[#d82335]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4 min-h-5 text-[12px] font-bold text-[#a9c5ff]">
            {voteNotice}
          </div>
        </div>
      </section>

      <section id="fund" className="px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">
                MAKE SOMETHING HAPPEN
              </div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Don&apos;t just donate.
                <br />
                <span className="text-[#d82335]">Fund an outcome.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#667084]">
              These are prototype project flows only. Checkout stays disabled until
              the operating entity, payment flow and applicable compliance
              requirements are finalized.
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

      <section className="bg-[#0a1730] px-5 py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-16">
          <div className="relative overflow-hidden border border-white/10 bg-[#061126] shadow-[0_28px_80px_rgba(0,0,0,.24)]">
            <img
              src="/sam/Upper%20Body%20Desk.png"
              alt="AI-generated campaign strategy room featuring fictional parody politician Sam"
              className="aspect-[16/10] h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4">
              <ImageTag>BEHIND THE PODIUM</ImageTag>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">
              HOW SAM WORKS
            </div>
            <h2 className="mt-4 text-[clamp(2.8rem,5.5vw,4.7rem)] font-black leading-[0.92] tracking-[-0.06em]">
              Listen. Research.
              <br />
              <span className="text-[#f16b78]">Make the point land.</span>
            </h2>
            <p className="mt-6 max-w-[560px] text-[15px] font-medium leading-7 text-[#bdc8da]">
              The joke is the delivery, not the homework. The idea is to start with
              what people care about, understand the strongest evidence and
              counterarguments, then turn it into something people will actually
              watch.
            </p>

            <div className="mt-8 border-t border-white/15">
              {[
                ["01", "Listen", "Surface the issues people actually want addressed."],
                ["02", "Research", "Separate the strongest evidence from the talking points."],
                ["03", "Say it straight", "Use parody and humor to make the argument memorable."],
                ["04", "Show the receipts", "Publish what was funded, produced and learned."],
              ].map(([number, title, copy]) => (
                <div
                  key={number}
                  className="grid grid-cols-[42px_105px_1fr] gap-3 border-b border-white/15 py-4"
                >
                  <span className="text-[11px] font-black text-[#f16b78]">{number}</span>
                  <strong className="text-[13px]">{title}</strong>
                  <span className="text-[12px] leading-5 text-[#9eabc0]">{copy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="receipts"
        className="bg-gradient-to-br from-[#102b5f] to-[#061126] px-5 py-20 text-white lg:py-28"
      >
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <div className="mb-7 overflow-hidden border border-white/10 bg-[#07142c]">
              <img
                src="/sam/Signing%20Paperwork.png"
                alt="AI-generated image of fictional parody politician Sam reviewing paperwork"
                className="aspect-[16/9] w-full object-cover object-center"
              />
            </div>
            <div className="text-[10px] font-black tracking-[0.22em] text-[#a9c5ff]">
              THE RECEIPTS
            </div>
            <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
              If we ask for trust,
              <br />we show the math.
            </h2>
            <p className="mt-6 max-w-[560px] text-[15px] font-medium leading-7 text-[#b7c2d5]">
              Once money actually moves, every funded project should show what came
              in, what went out, what was produced and what happened next.
            </p>
          </div>

          <div className="rounded-lg bg-[#f8f9fb] p-7 text-[#101827] shadow-[0_25px_60px_rgba(0,0,0,.35)]">
            <div className="flex justify-between text-[9px] font-black tracking-[0.13em] text-[#6f788a]">
              <span>PUBLIC LEDGER</span>
              <span className="text-[#d82335]">PROTOTYPE</span>
            </div>

            <div className="border-b border-[#ddd] py-7">
              <div className="text-[11px] font-bold text-[#8d95a3]">
                Community projects shown
              </div>
              <div className="mt-1 text-[58px] font-black leading-none tracking-[-0.05em]">
                03
              </div>
            </div>

            {[
              ["Prototype funds shown", "$230,370"],
              ["Real funds collected", "$0"],
              ["Unexplained spending", "$0"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between border-b border-[#e3e5e8] py-4 text-[12px] font-bold"
              >
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}

            <div className="mt-4 flex items-start gap-2 text-[9px] font-semibold leading-4 text-[#8d95a3]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#153b79]" />
              Live financial data appears here only after compliant fundraising is
              activated.
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
              THE WHOLE JOKE
            </div>
            <p className="mt-6 text-[clamp(2.9rem,6vw,5.4rem)] font-black leading-[0.91] tracking-[-0.065em]">
              “The politician isn&apos;t real.
              <br />
              <span className="text-[#f16b78]">The problems are.”</span>
            </p>
          </blockquote>
        </div>
      </section>

      <section className="bg-[#efebe3] px-5 py-20 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black tracking-[0.22em] text-[#153b79]">
                CAMPAIGN MERCH. SORT OF.
              </div>
              <h2 className="mt-4 text-[clamp(2.8rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em]">
                Wear the joke.
                <br />
                <span className="text-[#d82335]">Keep the point.</span>
              </h2>
            </div>
            <p className="max-w-[520px] text-[15px] font-medium leading-7 text-[#667084]">
              Concept products only for now. Any real commerce and any future
              political fundraising would be structured and disclosed separately.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <article className="flex min-h-[350px] flex-col justify-between bg-[#08152f] p-7 text-white">
              <div className="grid flex-1 place-items-center text-center text-[64px] font-black leading-[.8] tracking-[-0.08em]">
                SAM
                <br />
                <span className="mt-4 text-[18px] tracking-[0.25em]">20XX</span>
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
                  Running Out of Patience Cap
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
              Sam can&apos;t hold office.
              <br />
              He can hold attention.
            </h2>
            <p className="mt-5 max-w-[560px] text-[14px] font-semibold leading-6 text-[#ffd0d5]">
              Get the next speech, vote on priorities and help shape the fictional
              campaign universe.
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
              SAM is an AI-generated fictional political parody personality. SAM is
              not a real person, candidate, elected official, political party,
              campaign committee, or government representative. This prototype does
              not accept donations, campaign contributions or payments.
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
          © 20XX SAM PROJECT — FICTIONAL CAMPAIGN PROTOTYPE
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
              PROTOTYPE FUNDING FLOW
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
              className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 bg-[#08152f] px-4 py-4 text-[9px] font-black uppercase tracking-[0.08em] text-white opacity-75"
            >
              Checkout disabled pending legal + entity setup
              <ShieldCheck className="h-4 w-4" />
            </button>

            <p className="mt-3 text-[9px] font-semibold leading-4 text-[#8d95a3]">
              No payment information is collected. This demonstrates the intended
              experience only.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

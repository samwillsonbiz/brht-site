"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Database,
  Menu,
  Trophy,
  X,
} from "lucide-react";

const items = [
  {
    href: "/fantasy",
    label: "Weekly Matchup",
    description: "Projection, players and streaming planner",
    icon: Trophy,
    exact: true,
  },
  {
    href: "/fantasy/draft",
    label: "Draft Board",
    description: "First-6-week targets, ADP and mock-draft research",
    icon: CalendarDays,
  },
  {
    href: "/fantasy/outlook",
    label: "6-Week Outlook",
    description: "Schedule strength, roster fit and future weeks",
    icon: BarChart3,
  },
  {
    href: "/fantasy/admin",
    label: "Admin & Sync",
    description: "ESPN, Supabase, player data and manual controls",
    icon: Database,
  },
];

export default function FantasyMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open Fantasy Lab menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed right-4 top-[72px] z-[70] inline-flex h-11 items-center gap-2 rounded-full border border-black/[0.08] bg-white/90 px-3.5 text-sm font-semibold text-[#1d1d1f] shadow-[0_8px_30px_rgba(0,0,0,0.10)] backdrop-blur-2xl transition hover:bg-white md:right-5 md:top-5"
      >
        <Menu className="h-4 w-4" />
        <span className="hidden sm:inline">Menu</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close Fantasy Lab menu"
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-[min(92vw,390px)] flex-col border-l border-black/[0.08] bg-[#f5f5f7]/95 shadow-[-20px_0_70px_rgba(0,0,0,0.16)] backdrop-blur-3xl">
            <div className="flex items-start justify-between border-b border-black/[0.06] px-6 pb-5 pt-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                  BRHT
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                  Fantasy Lab
                </div>
                <div className="mt-1 text-sm text-black/45">All tools in one place</div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05] text-black/60 transition hover:bg-black/[0.08]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35">
                Tools
              </div>
              <nav className="space-y-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-[20px] border px-4 py-4 transition ${
                        active
                          ? "border-black/[0.08] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                          : "border-transparent hover:border-black/[0.05] hover:bg-white/65"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                          active ? "bg-[#1d1d1f] text-white" : "bg-white text-black/55"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tracking-tight text-[#1d1d1f]">
                            {item.label}
                          </span>
                          {active ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Here
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 text-xs leading-5 text-black/45">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-black/25 transition group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-7 rounded-[22px] border border-black/[0.06] bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.035)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      Current mode
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#1d1d1f]">Pre-draft</div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    2027
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-black/45">
                  Use Draft Board for mock-draft research now. After the real ESPN draft, official rosters will sync into Matchup and Outlook automatically.
                </p>
              </div>
            </div>

            <div className="border-t border-black/[0.06] px-6 py-4 text-xs text-black/35">
              ESPN → BRHT → Supabase
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  CircleDot,
  Database,
  Menu,
  Trophy,
  X,
} from "lucide-react";

const appleFont =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const items = [
  { href: "/fantasy", label: "Matchup", icon: Trophy, exact: true },
  { href: "/fantasy/draft/live", label: "Draft Room", icon: CircleDot },
  { href: "/fantasy/draft", label: "Draft Board", icon: CalendarDays, exact: true },
  { href: "/fantasy/draft-scheduler", label: "Draft Scheduler", icon: Clock3 },
  { href: "/fantasy/outlook", label: "6-Week Outlook", icon: BarChart3 },
  { href: "/fantasy/admin", label: "Admin", icon: Database },
];

function currentLabel(pathname: string) {
  if (pathname.startsWith("/fantasy/draft/live")) return "Draft Room";
  if (pathname.startsWith("/fantasy/draft-scheduler")) return "Draft Scheduler";
  if (pathname.startsWith("/fantasy/draft")) return "Draft Board";
  if (pathname.startsWith("/fantasy/outlook")) return "6-Week Outlook";
  if (pathname.startsWith("/fantasy/admin")) return "Admin";
  return "Matchup";
}

export default function FantasyMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);
  const [resolvedHeader, setResolvedHeader] = useState(false);

  useEffect(() => {
    setOpen(false);
    const target = document.querySelector<HTMLElement>(
      ".fantasy-shell main > header > div",
    );
    setHeaderTarget(target);
    setResolvedHeader(true);
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

  const menuButton = (
    <button
      type="button"
      aria-label="Open Fantasy Lab menu"
      aria-expanded={open}
      onClick={() => setOpen(true)}
      className="fantasy-menu-trigger ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/60 transition hover:bg-black/[0.05] hover:text-black"
    >
      <Menu className="h-[18px] w-[18px]" />
    </button>
  );

  return (
    <>
      {resolvedHeader && headerTarget
        ? createPortal(menuButton, headerTarget)
        : resolvedHeader
          ? (
              <header
                className="sticky top-0 z-[80] border-b border-black/[0.06] bg-white/80 text-[#1d1d1f] backdrop-blur-2xl"
                style={{ fontFamily: appleFont }}
              >
                <div className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-5 md:px-8">
                  <div className="flex min-w-0 items-center gap-3">
                    <Link
                      href="/fantasy"
                      className="shrink-0 text-[15px] font-semibold tracking-[-0.01em]"
                    >
                      Fantasy Lab
                    </Link>
                    <span className="text-black/20">/</span>
                    <span className="truncate text-sm font-medium text-black/45">
                      {currentLabel(pathname)}
                    </span>
                  </div>
                  {menuButton}
                </div>
              </header>
            )
          : null}

      {open ? (
        <div
          className="fixed inset-0 z-[100] text-[#1d1d1f]"
          style={{ fontFamily: appleFont }}
        >
          <button
            type="button"
            aria-label="Close Fantasy Lab menu"
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col border-l border-black/[0.07] bg-[#f5f5f7] shadow-[-18px_0_60px_rgba(0,0,0,0.14)]">
            <div className="flex h-[64px] items-center justify-between border-b border-black/[0.06] px-5">
              <div className="text-[16px] font-semibold tracking-[-0.02em]">
                Fantasy Lab
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-black/55 transition hover:bg-black/[0.05] hover:text-black"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
              {items.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[14px] px-3.5 py-3 transition ${
                      active
                        ? "bg-white shadow-[0_4px_18px_rgba(0,0,0,0.04)]"
                        : "hover:bg-white/70"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${
                        active
                          ? "bg-[#1d1d1f] text-white"
                          : "bg-white text-black/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[15px] tracking-[-0.01em] ${
                        active ? "font-semibold" : "font-medium text-black/65"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

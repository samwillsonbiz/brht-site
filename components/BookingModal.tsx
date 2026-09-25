"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Mail, X } from "lucide-react";
import { BRHT_BOOKING_EVENT } from "@/lib/booking";

const bookingUrl = process.env.NEXT_PUBLIC_BRHT_BOOKING_URL?.trim() || "";
const emailHref =
  "mailto:samwillsonbiz@gmail.com?subject=BRHT%20CFO%20Strategy%20Call";

export default function BookingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(BRHT_BOOKING_EVENT, handler);
    return () => window.removeEventListener(BRHT_BOOKING_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close booking"
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[110] cursor-default bg-[#020807]/80 backdrop-blur-[4px]"
      />
      <div className="fixed left-1/2 top-1/2 z-[120] h-[min(88vh,820px)] w-[min(1180px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1513] shadow-[0_40px_140px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          aria-label="Close booking"
          onClick={() => setOpen(false)}
          className="absolute right-5 top-5 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#101c18]/90 text-white/65 backdrop-blur transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid h-full min-h-0 lg:grid-cols-[0.42fr_0.58fr]">
          <aside className="relative overflow-y-auto border-r border-white/[0.07] bg-[#08110f] p-7 text-white md:p-9">
            <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#b8f34a]/10 blur-[90px]" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b8f34a]">
                BRHT CFO
              </p>
              <h2 className="mt-4 max-w-sm text-[38px] font-black leading-[0.98] tracking-[-0.05em] md:text-[48px]">
                Book a Strategy Call.
              </h2>
              <p className="mt-5 max-w-sm text-[13px] leading-6 text-white/55">
                A focused conversation about your numbers, systems and the decisions in front of the business.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "30-minute working conversation",
                  "No sales deck or long discovery process",
                  "Leave with a clearer next step",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[12px] font-semibold text-white/68">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#60d9c7]" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-[#9bd739]/25 bg-[#122016] p-4">
                <div className="flex items-center gap-2 text-[#b8f34a]">
                  <CalendarDays className="h-4 w-4" />
                  <p className="text-[9px] font-black uppercase tracking-[0.16em]">
                    Limited weekday availability
                  </p>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-white/55">
                  New times are released on a rolling basis so the calendar stays focused and useful.
                </p>
              </div>

              <div className="mt-8 border-t border-white/[0.07] pt-6">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/28">
                  Prefer email?
                </p>
                <a
                  href={emailHref}
                  className="mt-3 inline-flex items-center gap-2 text-[12px] font-extrabold text-white/72 transition hover:text-[#b8f34a]"
                >
                  <Mail className="h-4 w-4" />
                  Email BRHT CFO
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </aside>

          <div className="min-h-0 overflow-hidden bg-[#f5f6f2]">
            {bookingUrl ? (
              <iframe
                title="Book a BRHT CFO Strategy Call"
                src={bookingUrl}
                className="h-full w-full border-0 bg-white"
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <div className="max-w-md">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e9f7dc] text-[#6d9c26]">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-[26px] font-black tracking-[-0.035em] text-[#14201c]">
                    Scheduling is almost ready.
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#66736d]">
                    The booking experience is built. Connect the live Google Calendar appointment-schedule link to show real availability here.
                  </p>
                  <a
                    href={emailHref}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#b8f34a] px-5 py-3.5 text-[12px] font-black text-[#07100e]"
                  >
                    Email about a Strategy Call <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Mail, X } from "lucide-react";
import { BRHT_BOOKING_EVENT } from "@/lib/booking";

const bookingUrl =
  process.env.NEXT_PUBLIC_BRHT_BOOKING_URL?.trim() ||
  "https://calendly.com/samwillsonbiz/brht-cfo-strategy-call";
const emailHref =
  "mailto:samwillsonbiz@gmail.com?subject=BRHT%20CFO%20Strategy%20Call";

export default function BookingModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [help, setHelp] = useState("");

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

  const sendInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(
      "BRHT CFO Strategy Call" + (company ? " — " + company : "")
    );
    const body = encodeURIComponent(
      [
        "Name: " + name,
        "Email: " + email,
        "Company: " + company,
        website ? "Website: " + website : "",
        "",
        "What I'd like help with:",
        help,
      ]
        .filter(Boolean)
        .join("\n")
    );
    window.location.href =
      "mailto:samwillsonbiz@gmail.com?subject=" + subject + "&body=" + body;
  };

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
                  Monday–Friday · 30 minutes · limited daily openings · 24-hour notice · rolling 14-day window.
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
              <div className="h-full overflow-y-auto p-6 md:p-8">
                <div className="mx-auto max-w-xl">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e9f7dc] text-[#6d9c26]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#6b7a73]">
                        Strategy call request
                      </p>
                      <h3 className="mt-1 text-[28px] font-black tracking-[-0.04em] text-[#14201c]">
                        Tell us what you need.
                      </h3>
                      <p className="mt-2 text-[12px] leading-5 text-[#66736d]">
                        Send a quick note now. We can coordinate the right time directly while live booking is being connected.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={sendInquiry} className="mt-7 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">Name</span>
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] text-[#14201c] outline-none transition focus:border-[#83bc31]"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">Work email</span>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] text-[#14201c] outline-none transition focus:border-[#83bc31]"
                          placeholder="you@company.com"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">Company</span>
                        <input
                          required
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] text-[#14201c] outline-none transition focus:border-[#83bc31]"
                          placeholder="Company name"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">Website</span>
                        <input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] text-[#14201c] outline-none transition focus:border-[#83bc31]"
                          placeholder="company.com"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">
                        What would you like help with?
                      </span>
                      <textarea
                        required
                        rows={5}
                        value={help}
                        onChange={(e) => setHelp(e.target.value)}
                        className="resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] leading-5 text-[#14201c] outline-none transition focus:border-[#83bc31]"
                        placeholder="Forecasting, cash flow, reporting, systems, pricing, fundraising..."
                      />
                    </label>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8f34a] px-5 py-4 text-[12px] font-black text-[#07100e] transition hover:bg-[#c5f760]"
                    >
                      Send Strategy Call Request <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

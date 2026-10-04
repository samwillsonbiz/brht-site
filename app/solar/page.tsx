"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  Cable,
  CheckCircle2,
  Factory,
  Gauge,
  HardHat,
  Home,
  Mail,
  MapPin,
  Menu,
  PanelTop,
  Ruler,
  Settings2,
  ShieldCheck,
  Sun,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const projectTypes = [
  "Custom residential",
  "Commercial / industrial",
  "Battery + backup",
  "Off-grid / hybrid",
  "Solar upgrade / expansion",
  "Not sure yet",
];

const services = [
  {
    icon: Ruler,
    title: "Custom System Design",
    copy:
      "A solar plan built around the property, roof geometry, real energy use, future loads and the way you actually want the system to perform.",
  },
  {
    icon: BatteryCharging,
    title: "Battery & Backup",
    copy:
      "Battery storage, essential-load planning and backup architecture designed as part of the system — not bolted on as an afterthought.",
  },
  {
    icon: Building2,
    title: "Complex & Commercial",
    copy:
      "Multi-roof, high-load and operationally complex projects that need proper planning, staging and clean coordination from design through commissioning.",
  },
  {
    icon: Cable,
    title: "Energy Integration",
    copy:
      "Plan for EV charging, electrification, smart loads, future expansion and monitoring so the installation is ready for what comes next.",
  },
];

const process = [
  {
    number: "01",
    title: "Understand",
    icon: MapPin,
    copy:
      "We map the site, usage, roof, switchboard, constraints, priorities and future energy plans before recommending equipment.",
  },
  {
    number: "02",
    title: "Engineer",
    icon: Ruler,
    copy:
      "We model the system architecture, production, storage, layout and electrical approach around the project — not a preset package.",
  },
  {
    number: "03",
    title: "Build",
    icon: HardHat,
    copy:
      "The installation is coordinated as a project: equipment, trades, approvals, site work, testing and commissioning.",
  },
  {
    number: "04",
    title: "Evolve",
    icon: Gauge,
    copy:
      "After commissioning, monitoring and system visibility make it easier to optimise performance and plan future additions.",
  },
];

const fit = [
  {
    icon: Home,
    label: "Architectural residential",
    title: "A clean energy system that belongs on the property.",
    copy:
      "For homes where layout, aesthetics, battery placement, future EV loads and resilience matter as much as panel count.",
  },
  {
    icon: Factory,
    label: "Commercial & industrial",
    title: "Design around the operation, not just the roof.",
    copy:
      "For businesses with meaningful daytime loads, larger switchboards, multiple buildings, staged works or expansion plans.",
  },
  {
    icon: BatteryCharging,
    label: "Hybrid & resilience",
    title: "Solar, storage and backup designed together.",
    copy:
      "For projects where outage resilience, battery strategy, generator interaction or reduced grid reliance changes the design brief.",
  },
  {
    icon: Wrench,
    label: "Upgrades & expansions",
    title: "Make the existing system part of the next one.",
    copy:
      "For properties adding batteries, EV charging, more generation or replacing ageing components without starting blindly from zero.",
  },
];

function BrhtLogo() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex items-center">
        <span className="text-[27px] font-black tracking-[-0.055em] text-white">
          BRHT
        </span>
        <span className="inline-flex -skew-x-12 gap-[3px] pt-1">
          <span className="h-4 w-[7px] rounded-full bg-[#b8f34a]" />
          <span className="mt-1 h-4 w-[7px] rounded-full bg-[#97e533]" />
        </span>
      </div>
      <span className="h-6 w-px bg-white/18" />
      <span className="text-[12px] font-bold uppercase tracking-[0.33em] text-[#b8f34a]">
        Solar
      </span>
    </div>
  );
}

function SolarArrayGraphic() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#0d1615]/96 p-4 shadow-[0_32px_90px_rgba(0,0,0,0.42)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#60d9c7]">
            Project model
          </p>
          <p className="mt-1 text-[15px] font-extrabold text-white">
            Integrated energy architecture
          </p>
        </div>
        <span className="rounded-full border border-[#b8f34a]/25 bg-[#b8f34a]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#b8f34a]">
          Illustrative
        </span>
      </div>

      <div className="relative min-h-[300px] overflow-hidden rounded-[18px] border border-[#2d413a] bg-[#111d19] p-5">
        <div className="absolute inset-0 opacity-[0.17] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute -right-10 -top-8 h-40 w-40 rounded-full bg-[#b8f34a]/12 blur-[55px]" />
        <div className="absolute -bottom-8 -left-6 h-36 w-36 rounded-full bg-[#34d6c3]/10 blur-[50px]" />

        <div className="relative grid h-full gap-4 md:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[16px] border border-white/[0.08] bg-[#0d1714]/88 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
                Roof plane A
              </span>
              <Sun className="h-5 w-5 text-[#b8f34a]" />
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2 [transform:skewY(-5deg)]">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[1.5/1] rounded-[3px] border border-[#77d9cc]/30 bg-[linear-gradient(135deg,#17352f_0%,#1d4d43_58%,#275e52_100%)] shadow-[inset_0_0_12px_rgba(96,217,199,0.06)]"
                >
                  <div className="h-full w-full border-l border-t border-white/[0.05]" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold text-white/42">
              <span className="h-2 w-2 rounded-full bg-[#34d6c3] shadow-[0_0_12px_rgba(52,214,195,0.8)]" />
              Layout follows usable roof, shading and access constraints
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[16px] border border-[#9bd739]/30 bg-[#122016] p-4">
              <BatteryCharging className="h-6 w-6 text-[#b8f34a]" />
              <p className="mt-4 text-[9px] font-black uppercase tracking-[0.15em] text-white/34">
                Storage
              </p>
              <p className="mt-1 text-[17px] font-black text-white">
                Battery ready
              </p>
              <p className="mt-2 text-[10.5px] leading-5 text-white/48">
                Reserve, backup and future expansion considered at design stage.
              </p>
            </div>

            <div className="rounded-[16px] border border-[#2d4c44] bg-[#10201c] p-4">
              <Zap className="h-6 w-6 text-[#60d9c7]" />
              <p className="mt-4 text-[9px] font-black uppercase tracking-[0.15em] text-white/34">
                Loads
              </p>
              <p className="mt-1 text-[17px] font-black text-white">
                EV + electrification
              </p>
              <p className="mt-2 text-[10.5px] leading-5 text-white/48">
                Plan the electrical future before it becomes a retrofit problem.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          ["Design", "Site-specific"],
          ["Build", "Project-led"],
          ["Future", "Expansion-ready"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[14px] border border-white/[0.08] bg-[#14201c] px-4 py-3"
          >
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/30">
              {label}
            </p>
            <p className="mt-1 text-[11px] font-extrabold text-white/78">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureBar() {
  const items = [
    [Ruler, "Designed for the property", "Roof, loads, site constraints and future plans drive the system."],
    [BatteryCharging, "Storage considered early", "Battery and backup decisions are designed into the project."],
    [ShieldCheck, "Installation quality matters", "A clean build, commissioning and documentation are part of the job."],
    [Gauge, "Built beyond handover", "Monitoring and expansion planning keep the system useful long term."],
  ] as const;

  return (
    <div className="border-t border-white/[0.08] bg-[#091312]/92">
      <div className="mx-auto grid max-w-[1440px] px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {items.map(([Icon, title, copy], index) => (
          <div
            key={title}
            className={
              "flex gap-5 py-9 lg:px-8 " +
              (index !== 3 ? "lg:border-r lg:border-white/[0.08]" : "")
            }
          >
            <Icon className="mt-1 h-9 w-9 shrink-0 text-[#b8f34a]" strokeWidth={1.8} />
            <div>
              <h3 className="max-w-[190px] text-[16px] font-extrabold leading-6 text-white">
                {title}
              </h3>
              <p className="mt-2 max-w-[235px] text-[13px] leading-6 text-white/54">
                {copy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState(projectTypes[0]);
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("BRHT Solar Project Enquiry — " + type);
    const body = encodeURIComponent(
      [
        "Name: " + name,
        "Email: " + email,
        "Phone: " + phone,
        "Project location: " + location,
        "Project type: " + type,
        "",
        "Project details:",
        details,
      ].join("\n"),
    );
    window.location.href =
      "mailto:samwillsonbiz@gmail.com?subject=" + subject + "&body=" + body;
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close project enquiry"
        onClick={onClose}
        className="fixed inset-0 z-[110] cursor-default bg-[#020807]/80 backdrop-blur-[5px]"
      />
      <div className="fixed left-1/2 top-1/2 z-[120] max-h-[90vh] w-[min(1040px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-white/10 bg-[#0b1513] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          aria-label="Close project enquiry"
          onClick={onClose}
          className="absolute right-5 top-5 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#101c18]/90 text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid lg:grid-cols-[0.42fr_0.58fr]">
          <aside className="relative overflow-hidden border-b border-white/[0.07] bg-[#08110f] p-7 text-white md:p-9 lg:border-b-0 lg:border-r">
            <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#b8f34a]/10 blur-[90px]" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b8f34a]">
                BRHT Solar
              </p>
              <h2 className="mt-4 max-w-sm text-[38px] font-black leading-[0.98] tracking-[-0.05em] md:text-[48px]">
                Tell us about the project.
              </h2>
              <p className="mt-5 max-w-sm text-[13px] leading-6 text-white/55">
                Start with the property, what you are trying to achieve and any constraints you already know about.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Site and energy needs first",
                  "No forced package sizing",
                  "Plan for batteries, EVs and future loads",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-[12px] font-semibold text-white/68"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#60d9c7]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="bg-[#f5f6f2] p-6 text-[#14201c] md:p-8">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">
                    Name
                  </span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] outline-none transition focus:border-[#83bc31]"
                    placeholder="Your name"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] outline-none transition focus:border-[#83bc31]"
                    placeholder="you@email.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">
                    Phone
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] outline-none transition focus:border-[#83bc31]"
                    placeholder="Best contact number"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">
                    Project location
                  </span>
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] outline-none transition focus:border-[#83bc31]"
                    placeholder="Suburb / city"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">
                  Project type
                </span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] outline-none transition focus:border-[#83bc31]"
                >
                  {projectTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65736c]">
                  What are you trying to achieve?
                </span>
                <textarea
                  required
                  rows={5}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] leading-5 outline-none transition focus:border-[#83bc31]"
                  placeholder="Tell us about the property, current energy use, batteries, EVs, backup needs, timeline or anything unusual about the site."
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8f34a] px-5 py-4 text-[12px] font-black text-[#07100e] transition hover:bg-[#c5f760]"
              >
                Send Project Enquiry <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[10px] leading-5 text-[#7a8781]">
                This opens your email client with the project details pre-filled.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SolarPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#07100e] text-white selection:bg-lime-300 selection:text-[#07100e]"
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07100e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-8">
          <a href="#top" aria-label="BRHT Solar home">
            <BrhtLogo />
          </a>

          <nav className="hidden items-center gap-6 text-[11.5px] font-semibold text-white/64 lg:flex">
            <a className="transition hover:text-[#b8f34a]" href="#services">
              What We Build
            </a>
            <a className="transition hover:text-[#b8f34a]" href="#system">
              Our Approach
            </a>
            <a className="transition hover:text-[#b8f34a]" href="#process">
              Process
            </a>
            <a className="transition hover:text-[#b8f34a]" href="#fit">
              Project Fit
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setProjectOpen(true)}
            className="hidden items-center gap-2 rounded-[12px] bg-[#b8f34a] px-6 py-3.5 text-[12.5px] font-extrabold text-[#09110f] shadow-[0_0_34px_rgba(184,243,74,0.12)] transition hover:bg-[#c5f760] lg:inline-flex"
          >
            Start a Project <ArrowRight className="h-4 w-4" />
          </button>

          <button
            aria-label="Toggle menu"
            className="rounded-md border border-white/10 p-2 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-5 py-4 lg:hidden">
            <div className="grid gap-3 text-sm text-white/75">
              {[
                ["#services", "What We Build"],
                ["#system", "Our Approach"],
                ["#process", "Process"],
                ["#fit", "Project Fit"],
              ].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setProjectOpen(true);
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-lime-300 px-4 py-3 font-bold text-[#07100e]"
              >
                Start a Project <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_10%,rgba(165,235,69,0.12)_0%,rgba(120,200,60,0.045)_24%,transparent_48%),radial-gradient(ellipse_at_18%_25%,rgba(38,160,140,0.055)_0%,transparent_40%),linear-gradient(180deg,#07100e_0%,#07110f_62%,#081311_100%)]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-[126px] h-36 opacity-50">
            <svg viewBox="0 0 1600 260" preserveAspectRatio="none" className="h-full w-full">
              <g fill="none" stroke="#d7ddd8" strokeOpacity="0.24" strokeWidth="1.1">
                <path d="M0 235 L170 215 L280 236 L420 198 L560 230 L720 194 L870 228 L1010 188 L1170 232 L1320 202 L1450 226 L1600 192" />
                <path d="M0 248 L190 230 L320 246 L470 216 L620 246 L770 214 L920 242 L1080 208 L1240 246 L1400 218 L1600 244" />
                <path d="M0 260 L1600 260" strokeOpacity="0.14" />
              </g>
            </svg>
          </div>

          <div className="relative mx-auto max-w-[1440px] px-6 lg:px-8">
            <div className="grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[0.98fr_1.02fr] lg:gap-14 lg:py-20">
              <div className="max-w-[650px]">
                <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.34em] text-white/60">
                  Custom solar installation projects
                </p>
                <h1 className="text-[52px] font-black leading-[0.93] tracking-[-0.058em] text-white sm:text-[66px] lg:text-[78px]">
                  Solar that fits
                  <span className="block text-[#b8f34a]">the site.</span>
                  <span className="block">Not the sales template.</span>
                </h1>
                <p className="mt-7 max-w-[610px] text-[17px] leading-8 text-white/58">
                  Custom solar, battery and energy projects designed around the property,
                  real load, architecture, resilience and what you plan to add next.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setProjectOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#b8f34a] px-7 py-4 text-[13px] font-black text-[#09110f] shadow-[0_0_34px_rgba(184,243,74,0.12)] transition hover:bg-[#c5f760]"
                  >
                    Plan My Project <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="#process"
                    className="inline-flex items-center justify-center rounded-[12px] border border-white/12 bg-white/[0.035] px-7 py-4 text-[13px] font-bold text-white/74 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    See Our Process
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[11px] font-semibold text-white/42">
                  {[
                    "Custom layouts",
                    "Battery planning",
                    "Commercial capable",
                    "Expansion ready",
                  ].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#60d9c7]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-[#b8f34a]/5 blur-[80px]" />
                <div className="relative">
                  <SolarArrayGraphic />
                </div>
              </div>
            </div>
          </div>

          <FeatureBar />
        </section>

        <section id="services" className="scroll-mt-24 bg-[#f4f4ef] py-20 text-[#101714] md:py-24">
          <div className="mx-auto max-w-[1280px] px-5 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#557064]">
                  What we build
                </p>
                <h2 className="max-w-[620px] text-4xl font-black leading-[0.98] tracking-[-0.05em] md:text-[58px]">
                  The right system is a project, not a package.
                </h2>
              </div>
              <p className="max-w-[610px] text-[16px] leading-8 text-[#586760] lg:justify-self-end">
                Good solar starts before the equipment list. We design around the
                physical site, the electrical system, current usage, future demand and
                the outcome you actually care about.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {services.map(({ icon: Icon, title, copy }, index) => (
                <article
                  key={title}
                  className={
                    "group rounded-[22px] border p-7 transition duration-300 md:p-8 " +
                    (index === 1
                      ? "border-[#9bd739]/45 bg-[#10201b] text-white shadow-[0_22px_70px_rgba(15,23,20,0.12)]"
                      : "border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(15,23,20,0.055)] hover:-translate-y-1")
                  }
                >
                  <div
                    className={
                      "grid h-12 w-12 place-items-center rounded-full " +
                      (index === 1
                        ? "border border-[#b8f34a]/30 bg-[#b8f34a]/10 text-[#b8f34a]"
                        : "bg-[#e6f0e2] text-[#1d7f6d]")
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-7 text-[26px] font-black tracking-[-0.035em]">
                    {title}
                  </h3>
                  <p
                    className={
                      "mt-4 max-w-xl text-[14px] leading-7 " +
                      (index === 1 ? "text-white/58" : "text-[#63716a]")
                    }
                  >
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="system"
          className="scroll-mt-24 relative overflow-hidden border-y border-white/[0.06] bg-[#07100e] py-24 md:py-28"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(184,243,74,0.08),transparent_26%),radial-gradient(circle_at_18%_65%,rgba(52,214,195,0.05),transparent_24%)]" />
          <div className="relative mx-auto max-w-[1320px] px-5 md:px-8">
            <div className="text-center">
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#b8f34a]">
                Designed as one system
              </p>
              <h2 className="mx-auto max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-5xl">
                <span className="block text-white">Site in.</span>
                <span className="block text-[#b8f34a]">Energy system out.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[13px] leading-6 text-white/48">
                The design connects the physical property, electrical loads and future
                priorities before equipment is locked in.
              </p>
            </div>

            <div className="relative mt-14 overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0a1512]/80 px-5 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.24)] md:px-8 md:py-10">
              <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:38px_38px]" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.76fr_1fr]">
                <div className="rounded-[24px] border border-[#2b4b42] bg-[#101b17]">
                  <div className="border-b border-white/[0.08] px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#60d9c7]">
                      Project inputs
                    </p>
                    <h3 className="mt-1 text-[28px] font-black leading-none text-white">
                      The Site
                    </h3>
                  </div>
                  <div className="grid grid-cols-2">
                    {[
                      [Sun, "Sun & shading"],
                      [PanelTop, "Roof & structure"],
                      [Gauge, "Energy profile"],
                      [Zap, "Switchboard"],
                      [BatteryCharging, "Backup goals"],
                      [Settings2, "Future loads"],
                    ].map(([Icon, label], index) => {
                      const ItemIcon = Icon as React.ElementType;
                      return (
                        <div
                          key={label as string}
                          className={
                            "flex items-center gap-3 px-5 py-4 " +
                            (index % 2 === 0 ? "border-r border-white/[0.07] " : "") +
                            (index < 4 ? "border-b border-white/[0.07]" : "")
                          }
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#34d6c3]/35 bg-[#34d6c3]/10 text-[#60d9c7]">
                            <ItemIcon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                          </div>
                          <p className="text-[12px] font-extrabold text-white/76">{label as string}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative flex min-h-[250px] items-center justify-center">
                  <div className="absolute left-[12%] right-[12%] top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-[#34d6c3]/45 via-[#86d973]/55 to-[#b8f34a]/55 lg:block" />
                  <div className="relative grid h-[190px] w-[190px] place-items-center rounded-full border border-[#b8f34a]/25 bg-[#0f1b16] shadow-[0_0_70px_rgba(184,243,74,0.10)]">
                    <div className="absolute inset-[-18px] rounded-full border border-[#b8f34a]/10" />
                    <div className="text-center">
                      <div className="mx-auto flex w-fit items-center gap-1.5">
                        <span className="text-[30px] font-black tracking-[-0.07em] text-white">
                          BRHT
                        </span>
                        <span className="inline-flex -skew-x-12 gap-[2px]">
                          <span className="h-4 w-[7px] rounded-full bg-[#b8f34a]" />
                          <span className="mt-1 h-4 w-[7px] rounded-full bg-[#97e533]" />
                        </span>
                      </div>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b8f34a]">
                        Solar Design
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-[#9bd739]/40 bg-[#101b17] shadow-[0_0_54px_rgba(155,215,57,0.09)]">
                  <div className="border-b border-white/[0.08] px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b8f34a]">
                      Integrated output
                    </p>
                    <h3 className="mt-1 text-[28px] font-black leading-none text-white">
                      The System
                    </h3>
                  </div>
                  <div>
                    {[
                      [PanelTop, "Generation", "Right-sized solar layout"],
                      [BatteryCharging, "Storage", "Battery + backup strategy"],
                      [Cable, "Electrical", "Loads, EVs and expansion"],
                      [Gauge, "Visibility", "Monitoring and performance"],
                    ].map(([Icon, kicker, title], index) => {
                      const ItemIcon = Icon as React.ElementType;
                      return (
                        <div
                          key={kicker as string}
                          className={
                            "flex items-center gap-4 px-5 py-3.5 " +
                            (index !== 3 ? "border-b border-white/[0.07]" : "")
                          }
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#b8f34a]/30 bg-[#b8f34a]/10 text-[#b8f34a]">
                            <ItemIcon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                          </div>
                          <div>
                            <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/35">
                              {kicker as string}
                            </p>
                            <p className="mt-1 text-[12.5px] font-extrabold leading-[1.35] text-white/82">
                              {title as string}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 bg-[#f4f4ef] py-16 text-[#101714] md:py-20">
          <div className="mx-auto max-w-[1280px] px-5 md:px-8">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#557064]">
              Our process
            </p>
            <h2 className="text-4xl font-black tracking-[-0.045em] md:text-[52px]">
              A project from first question to first kilowatt.
            </h2>

            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {process.map((step, index) => (
                <div key={step.number} className="relative pr-3 lg:pr-5">
                  {index < process.length - 1 && (
                    <div className="absolute left-[52px] right-[-12px] top-[21px] hidden h-[2px] bg-gradient-to-r from-[#b8f34a]/60 to-[#b8f34a]/20 lg:block" />
                  )}

                  <div className="relative flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b8f34a] text-[12px] font-black text-[#101714] shadow-[0_6px_18px_rgba(184,243,74,0.18)]">
                      {step.number}
                    </span>
                    <h3 className="text-[21px] font-black tracking-[-0.025em]">
                      {step.title}
                    </h3>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <step.icon className="mt-1 h-5 w-5 shrink-0 text-[#1f806f]" />
                    <p className="max-w-[260px] text-[14px] leading-7 text-[#586760]">
                      {step.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="fit" className="scroll-mt-24 bg-white py-20 text-[#101714] md:py-24">
          <div className="mx-auto max-w-[1240px] px-5 md:px-8">
            <div className="max-w-3xl">
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#557064]">
                Project fit
              </p>
              <h2 className="text-4xl font-black leading-[0.98] tracking-[-0.045em] md:text-[54px]">
                Best for projects where the details matter.
              </h2>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#66736d]">
                If the job can be solved by picking a generic package from a dropdown,
                you probably do not need a custom project team. BRHT Solar is built for
                the projects with more moving parts.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {fit.map(({ icon: Icon, label, title, copy }) => (
                <article
                  key={label}
                  className="rounded-[22px] border border-black/[0.07] bg-[#fbfbf9] p-7 shadow-[0_12px_38px_rgba(15,23,20,0.05)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e7f3df] text-[#247b69]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#66736d]">
                      {label}
                    </p>
                  </div>
                  <h3 className="mt-6 text-[24px] font-black leading-[1.05] tracking-[-0.035em]">
                    {title}
                  </h3>
                  <p className="mt-4 text-[14px] leading-7 text-[#65736c]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-[#07100e] px-5 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[30px] border border-[#9bd739]/25 bg-[radial-gradient(circle_at_80%_15%,rgba(184,243,74,0.12),transparent_28%),linear-gradient(135deg,#0f1e19_0%,#0b1513_100%)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.24)] md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b8f34a]">
                  Have a property in mind?
                </p>
                <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.05em] md:text-[58px]">
                  Start with the project. We&apos;ll work backwards to the system.
                </h2>
                <p className="mt-5 max-w-2xl text-[14px] leading-7 text-white/52">
                  Tell us what the property needs, what you want the system to do and
                  what makes the site different. That is enough to start the conversation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProjectOpen(true)}
                className="inline-flex h-fit items-center justify-center gap-2 rounded-[12px] bg-[#b8f34a] px-7 py-4 text-[13px] font-black text-[#09110f] transition hover:bg-[#c5f760]"
              >
                Start a Solar Project <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#07100e] px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 border-t border-white/[0.07] pt-8 md:flex-row md:items-center md:justify-between">
          <BrhtLogo />
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-semibold text-white/38">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#60d9c7]" />
              Custom project planning
            </span>
            <a
              href="mailto:samwillsonbiz@gmail.com?subject=BRHT%20Solar%20Project"
              className="inline-flex items-center gap-2 transition hover:text-[#b8f34a]"
            >
              <Mail className="h-4 w-4 text-[#60d9c7]" />
              Email BRHT Solar
            </a>
          </div>
        </div>
      </footer>

      <ProjectModal open={projectOpen} onClose={() => setProjectOpen(false)} />
    </div>
  );
}

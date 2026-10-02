import { Check, Search, ShieldCheck } from "lucide-react";

const features = [
  "Comment and react in permanent topic threads",
  "Unlimited topic search and deeper public-reaction reads",
  "Platform-by-platform sentiment and Bubble Gap",
  "Follow topics, people and brands",
  "Alerts when attention or sentiment changes",
  "Longer trend history and topic timelines",
  "Saved topics and explicit category feeds",
];

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#101a33]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}>
      <header className="border-b border-[#17213a]/[0.06] bg-[#f6f8fc]/95">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-5 px-5 lg:px-8">
          <a href="/outside-the-feed" className="flex items-center gap-2.5 font-bold tracking-[-0.025em]">
            <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2878ff] shadow-[0_6px_18px_rgba(40,120,255,0.28)]"><span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#9ec3ff]" /></span>
            <span>Global Reacts</span>
          </a>
          <nav className="ml-auto flex items-center gap-4 text-xs font-bold text-[#17213a]/55">
            <a href="/outside-the-feed" className="hover:text-[#101a33]">Home</a>
            <a href="/outside-the-feed/search" className="inline-flex items-center gap-1.5 hover:text-[#101a33]"><Search className="h-3.5 w-3.5" /> Search</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1040px] px-5 py-16 text-center lg:px-8 lg:py-24">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#2878ff]">Membership funds the front page</div>
        <h1 className="mx-auto mt-4 max-w-4xl text-[clamp(3.2rem,7vw,6rem)] font-[800] leading-[0.94] tracking-[-0.065em]">The users are the customers.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[#17213a]/55">No advertising business waiting in the wings. No need to maximize rage, watch time or clicks. The public homepage stays public; membership pays for the deeper tools and community.</p>

        <div className="mx-auto mt-12 grid max-w-[860px] gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-[#17213a]/[0.07] bg-white p-7 text-left shadow-[0_20px_60px_rgba(33,56,108,0.06)]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#17213a]/36">Free forever</div>
            <div className="mt-3 text-4xl font-[850] tracking-[-0.055em]">$0</div>
            <p className="mt-3 text-sm leading-6 text-[#17213a]/52">The actual front page of the internet should be available to everyone.</p>
            <div className="mt-7 space-y-3 text-sm font-semibold text-[#17213a]/65">
              {["Global trending homepage", "Attention + Vibe", "Topic summaries and source links", "Read public discussions", "Basic sentiment and source breadth"].map((item) => <div key={item} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2878ff]" />{item}</div>)}
            </div>
          </div>

          <div className="relative rounded-[28px] border border-[#2878ff]/20 bg-[#101a33] p-7 text-left text-white shadow-[0_25px_70px_rgba(16,26,51,0.18)]">
            <span className="absolute right-5 top-5 rounded-full bg-[#2878ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em]">Founding plan</span>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-white/45">Global Reacts member</div>
            <div className="mt-3 flex items-end gap-2"><span className="text-4xl font-[850] tracking-[-0.055em]">$5.99</span><span className="pb-1 text-sm font-bold text-white/45">/ month</span></div>
            <div className="mt-1 text-xs font-bold text-[#8eb8ff]">or $49 / year</div>
            <div className="mt-7 space-y-3 text-sm font-semibold text-white/76">
              {features.map((item) => <div key={item} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#78a9ff]" />{item}</div>)}
            </div>
            <button type="button" className="mt-8 w-full rounded-2xl bg-[#2878ff] px-5 py-4 text-sm font-extrabold text-white">Join founding membership</button>
            <p className="mt-3 text-center text-[10px] font-semibold text-white/32">Prototype — billing is not connected yet.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#17213a]/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1040px] gap-8 px-5 py-14 md:grid-cols-3 lg:px-8">
          {[
            ["No ads", "Nothing can buy its way onto the front page."],
            ["No algorithmic feed", "Choose categories and follows explicitly. We do not secretly reshape the public homepage around you."],
            ["One topic, one thread", "The system creates canonical topics. Discussion accumulates instead of being fragmented across duplicate posts."],
          ].map(([title, copy]) => <div key={title}><ShieldCheck className="h-5 w-5 text-[#2878ff]" /><h2 className="mt-3 text-xl font-[800] tracking-[-0.03em]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#17213a]/52">{copy}</p></div>)}
        </div>
      </section>
    </main>
  );
}

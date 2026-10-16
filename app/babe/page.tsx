"use client";

import { useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Heart, Camera,
  Mail, Menu, MessageCircle, Mic2, Play, Radio, Sparkles, X,
} from "lucide-react";

const links = {
  spotify: "https://open.spotify.com/show/0pobL9iyx43mYTYgacAUvw",
  apple: "https://podcasts.apple.com/us/podcast/babe-what-do-you-know-about/id1647107172",
  archive: "https://babewhatdoyouknowabout.buzzsprout.com/",
  instagram: "https://www.instagram.com/babe_what_do_you_know/",
  taylaTikTok: "https://www.tiktok.com/@tattletayla",
  contact: "mailto:samwillsonbiz@gmail.com?subject=Babe%20What%20Do%20You%20Know%20About%20-%20Let%27s%20Talk",
  sponsor: "mailto:samwillsonbiz@gmail.com?subject=Babe%20What%20Do%20You%20Know%20About%20-%20Partnership",
};

const episodes = [
  { number: "73", title: "Geopolitical Tensions", type: "THE BIG CONVERSATIONS", length: "54 min", date: "Aug 28, 2024", href: "https://babewhatdoyouknowabout.buzzsprout.com/2041257/episodes/15654910-geopolitical-tensions?t=0", color: "bg-[#d2ddf0]", detail: "The world is complicated. We get into it." },
  { number: "72", title: "Creativity", type: "LIFE & BIG IDEAS", length: "42 min", date: "Aug 14, 2024", href: "https://babewhatdoyouknowabout.buzzsprout.com/2041257/episodes/15574676-creativity", color: "bg-[#f3c2b1]", detail: "On dreaming bigger, making things, and finding your way." },
  { number: "69", title: "Sleep Token Reaction", type: "POP CULTURE", length: "46 min", date: "Jul 3, 2024", href: "https://babewhatdoyouknowabout.buzzsprout.com/2041257/episodes/15354352-sleep-token-reaction-with-scott-salvesen?t=0", color: "bg-[#e5dfb7]", detail: "Strong opinions, a special guest, and a little music." },
];

function PillLink({ href, children, dark = false, external = false }: { href: string; children: React.ReactNode; dark?: boolean; external?: boolean }) {
  return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
    className={"inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 " +
      (dark ? "bg-[#211d1d] text-white hover:bg-[#3c3132]" : "bg-[#f57760] text-[#211d1d] hover:bg-[#ff957d]")}>
    {children}<ArrowUpRight size={16} strokeWidth={2.5}/></a>;
}

function SpotifyMark() {
  return <svg role="img" aria-label="Spotify" viewBox="0 0 32 32" width="34" height="34">
    <circle cx="16" cy="16" r="16" fill="#1DB954"/>
    <path d="M7 12c6-2 13-1.2 18 2" fill="none" stroke="#12351e" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M8.4 17c5.3-1.6 11-1 15 1.6" fill="none" stroke="#12351e" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M10 21.5c4.2-1.2 8.5-.5 12 1.4" fill="none" stroke="#12351e" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
function ApplePodcastMark() {
  return <svg role="img" aria-label="Apple Podcasts" viewBox="0 0 32 32" width="34" height="34">
    <circle cx="16" cy="16" r="16" fill="#A449E8"/>
    <g fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
      <path d="M11 21a9 9 0 1 1 10 0"/>
      <path d="M12.7 18.4a5.5 5.5 0 1 1 6.6 0"/>
    </g>
    <circle cx="16" cy="16" r="2.3" fill="white"/>
    <path d="M14.1 20.2c-.7 0-1.1.6-.9 1.4l1 5.2c.1.5.5.8 1 .8h1.6c.5 0 .9-.3 1-.8l1-5.2c.2-.8-.2-1.4-.9-1.4z" fill="white"/>
  </svg>;
}

function Kicker({children}:{children:React.ReactNode}) {
  return <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#895d5b]"><span className="h-1.5 w-1.5 rounded-full bg-[#f57760]"/>{children}</div>;
}

export default function BabePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { window.location.href = "mailto:?subject=Come%20check%20out%20Babe%2C%20What%20Do%20You%20Know%20About%3F&body=" + encodeURIComponent(window.location.href); }
  };
  const close = () => setMenuOpen(false);
  return (
    <div className="min-h-screen overflow-hidden bg-[#fcf9f3] font-sans text-[#211d1d] selection:bg-[#ffb8a8]">
      <header className="sticky top-0 z-40 border-b border-[#221c1b]/10 bg-[#fcf9f3]/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-[1220px] items-center justify-between gap-5 px-5 sm:px-8" aria-label="Main navigation">
          <a href="#top" onClick={close} className="flex items-center gap-3 text-left" aria-label="Babe What Do You Know About home">
            <span className="flex h-10 w-10 rotate-[-8deg] items-center justify-center rounded-[14px] bg-[#f57760] text-2xl font-black text-[#211d1d]">b.</span>
            <span className="text-[15px] font-black leading-[1.05] tracking-[-0.055em]">babe,<br/>what do you know about?</span>
          </a>
          <div className="hidden items-center gap-9 text-sm font-semibold text-[#514b46] md:flex">
            <a className="transition hover:text-[#df624e]" href="#listen">Listen &amp; follow</a>
            <a className="transition hover:text-[#df624e]" href="/babe/archive">Episodes</a>
            <a className="transition hover:text-[#df624e]" href="#about">About us</a>
            <a className="transition hover:text-[#df624e]" href="#community">Community</a>
            <a className="transition hover:text-[#df624e]" href="#work-with-us">Work with us</a>
          </div>
          <div className="flex items-center gap-2">
            <a href="/babe/archive" className="hidden min-h-10 items-center gap-2 rounded-full bg-[#211d1d] px-5 text-xs font-bold text-white transition hover:bg-[#48403d] sm:inline-flex">Find an episode <ArrowUpRight size={15}/></a>
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#211d1d]/10 md:hidden">{menuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
          </div>
        </nav>
        {menuOpen && <div className="flex flex-col gap-1 border-t border-black/10 bg-[#fcf9f3] px-5 py-3 font-semibold md:hidden">
          {[["Listen & follow","#listen"],["All episodes","/babe/archive"],["About us","#about"],["Community","#community"],["Work with us","#work-with-us"]].map(([name,href]) =>
            <a key={href} href={href} onClick={close} className="rounded-xl px-3 py-3 hover:bg-[#f6eee7]">{name}</a>
          )}
        </div>}
      </header>

      <main id="top">
        <section className="relative mx-auto grid max-w-[1220px] items-center gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12 lg:pb-20 lg:pt-16">
          <div className="relative z-10">
            <h1 className="mt-0 max-w-[740px] text-[clamp(3.7rem,7.6vw,7.45rem)] font-black leading-[0.93] tracking-[-0.075em]">
              Life is<br/>better with<br/><span className="font-normal italic text-[#e36d59]" style={{fontFamily:"Georgia, 'Times New Roman', serif"}}>a little</span><br/>debate.
            </h1>
            <p className="mt-8 max-w-[505px] text-lg leading-[1.75] text-[#6b625d] sm:text-xl">
              Two married people. A lot of opinions. Real conversations about life, culture, and the things we probably should have Googled first.
            </p>
            <div className="mt-9">
              <PillLink href="#listen">Listen &amp; follow</PillLink>
            </div>
          </div>

          <div className="relative isolate mx-auto w-full max-w-[560px]">
            <div className="absolute -left-8 top-14 h-40 w-40 rounded-full bg-[#c0d5d2]/70 blur-[2px] sm:-left-14"/>
            <div className="absolute -right-6 -bottom-8 h-36 w-36 rounded-full bg-[#edb8c4] sm:-right-12"/>
            <div className="relative rotate-[2.5deg] overflow-hidden rounded-[35px] border-[10px] border-[#211d1d] bg-[#f6b8a4] shadow-[18px_20px_0px_#e7e2d9] sm:rounded-[45px]">
              <div className="relative flex min-h-[445px] flex-col p-7 sm:min-h-[520px] sm:p-10">
                <div className="flex items-start justify-between">
                  <div className="rounded-full border-2 border-[#211d1d] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em]">A podcast &amp; a community</div>
                  <Mic2 size={29} strokeWidth={1.7}/>
                </div>
                <div className="relative mt-auto">
                  <div className="absolute -right-1 -top-36 rotate-[14deg] rounded-full border-[3px] border-[#211d1d] bg-[#ffe8ba] px-6 py-5 text-center text-sm font-black leading-tight shadow-[5px_6px_0_#211d1d] sm:-right-4 sm:-top-48 sm:px-8 sm:py-7 sm:text-base">Wait.<br/>WHAT?!</div>
                  <div className="text-[clamp(5.3rem,12vw,9.6rem)] font-black leading-[.78] tracking-[-0.1em]">babe<span className="text-[#fcebd9]">.</span></div>
                  <div className="mt-7 max-w-[400px] text-[clamp(2.4rem,5.9vw,4.8rem)] font-black leading-[0.98] tracking-[-0.075em]">what do<br/>you know<br/>about?</div>
                  <div className="mt-7 flex items-center justify-between gap-3 border-t-2 border-[#211d1d]/50 pt-5 text-[11px] font-black uppercase tracking-[0.13em]">
                    <span>WITH SAM + TAYLA</span><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#211d1d]"/> ON THE RECORD</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -left-6 hidden rotate-[-10deg] rounded-xl bg-[#d4e5c8] px-6 py-4 text-sm font-bold shadow-[5px_5px_0px_#211d1d] sm:block">Not always agreeing.<br/>Always talking. <span>♡</span></div>
          </div>
        </section>

        <div className="border-y border-[#211d1d] bg-[#ffe5d7]">
          <div className="mx-auto flex max-w-[1220px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 text-center text-xs font-black uppercase tracking-[0.16em] sm:justify-between sm:px-8">
            <span>73 episodes in the archive</span><span className="hidden text-[#e36d59] sm:block">✳</span>
            <span>4 seasons of conversations</span><span className="hidden text-[#e36d59] sm:block">✳</span>
            <span>One very opinionated couple</span>
          </div>
        </div>

        <section id="listen" className="scroll-mt-28 bg-[#fffdf9] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-[1220px]">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div><Kicker>01 / Listen in</Kicker><h2 className="mt-5 max-w-[780px] text-5xl font-black leading-[1.02] tracking-[-0.06em] sm:text-7xl">A good place<br/><em className="font-normal text-[#e36d59]" style={{fontFamily:"Georgia,serif"}}>to start.</em></h2></div>
              <a href="/babe/archive" className="inline-flex items-center gap-2 border-b-2 border-[#211d1d] pb-2 text-sm font-bold">Search all 73 episodes <ArrowUpRight size={17}/></a>
            </div>
            <p className="mt-6 text-base text-[#766d67]">Pick your favourite listening app, then tap <strong className="text-[#211d1d]">Follow</strong> there to hear what comes next.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <a href={links.spotify} target="_blank" rel="noopener noreferrer" className="group flex min-h-24 items-center gap-4 rounded-2xl border border-[#211d1d]/10 bg-[#f4f0ea] px-6 py-5 transition hover:-translate-y-1 hover:bg-[#eae4dd]">
                <SpotifyMark/>
                <span className="min-w-0 flex-1"><strong className="block text-lg font-black tracking-[-.04em]">Spotify</strong><span className="text-xs font-medium text-[#786e66]">Open &amp; follow</span></span>
                <ArrowUpRight size={18} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
              </a>
              <a href={links.apple} target="_blank" rel="noopener noreferrer" className="group flex min-h-24 items-center gap-4 rounded-2xl border border-[#211d1d]/10 bg-[#f4f0ea] px-6 py-5 transition hover:-translate-y-1 hover:bg-[#eae4dd]">
                <ApplePodcastMark/>
                <span className="min-w-0 flex-1"><strong className="block text-lg font-black tracking-[-.04em]">Apple Podcasts</strong><span className="text-xs font-medium text-[#786e66]">Open &amp; follow</span></span>
                <ArrowUpRight size={18} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
              </a>
              <a href={links.archive} target="_blank" rel="noopener noreferrer" className="group flex min-h-24 items-center gap-4 rounded-2xl border border-[#211d1d]/10 bg-[#f4f0ea] px-6 py-5 transition hover:-translate-y-1 hover:bg-[#eae4dd]">
                <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#211d1d] text-xs font-black text-white">•••</span>
                <span className="min-w-0 flex-1"><strong className="block text-lg font-black tracking-[-.04em]">Other apps</strong><span className="text-xs font-medium text-[#786e66]">See all platforms</span></span>
                <ArrowUpRight size={18} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-black tracking-[-.04em]">A few conversations to try</h3>
              <a href="/babe/archive" className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">Browse the archive <ArrowRight size={16}/></a>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {episodes.map((ep)=><a target="_blank" rel="noopener noreferrer" href={ep.href} key={ep.number}
                className="group overflow-hidden rounded-[26px] border border-[#211d1d]/10 bg-[#fffdf9] transition duration-200 hover:-translate-y-1 hover:shadow-[8px_9px_0_#e4d9d0]">
                <div className={"relative flex h-[183px] flex-col justify-between p-6 " + ep.color}>
                  <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-[.15em]"><span>EP {ep.number}</span><span>{ep.type}</span></div>
                  <div className="flex items-end justify-between gap-4"><div className="text-[36px] font-black leading-[.98] tracking-[-.06em]">{ep.title}</div><span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#211d1d] text-white transition group-hover:scale-110"><Play size={19} fill="currentColor"/></span></div>
                </div>
                <div className="p-6"><div className="flex justify-between text-xs font-bold text-[#a19892]"><span>{ep.date}</span><span>{ep.length}</span></div><p className="mt-4 text-sm leading-6 text-[#6b625d]">{ep.detail}</p></div>
              </a>)}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-28 bg-[#e4e9df] px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto grid max-w-[1220px] gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
            <div><Kicker>02 / Meet the hosts</Kicker><h2 className="mt-6 text-5xl font-black leading-[1.05] tracking-[-.06em] sm:text-7xl">Same team.<br/><em className="font-normal" style={{fontFamily:"Georgia,serif"}}>Different</em><br/>takes.</h2>
            <p className="mt-7 max-w-sm text-base leading-8 text-[#665f58]">Married in real life, curious about just about everything, and not afraid to challenge each other&apos;s point of view.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex min-h-[360px] flex-col justify-between rounded-[28px] bg-[#282222] p-8 text-[#fff5e9]">
                <div className="flex justify-between"><div className="text-[11px] font-black uppercase tracking-[.16em] text-[#f3c0af]">Meet Sam</div><MessageCircle size={24}/></div>
                <div><div className="mb-2 text-[88px] font-black leading-none tracking-[-.1em] text-[#ffa68f]">S.</div><h3 className="text-3xl font-black tracking-[-.05em]">The big-picture thinker.</h3><p className="mt-4 text-sm leading-7 text-[#e5d8d0]">Entrepreneurial energy, endless questions, and a tendency to turn every conversation into a deep dive.</p></div>
              </div>
              <div className="flex min-h-[360px] flex-col justify-between rounded-[28px] bg-[#f5c3ae] p-8">
                <div className="flex justify-between"><div className="text-[11px] font-black uppercase tracking-[.16em]">Meet Tayla</div><Sparkles size={24}/></div>
                <div><div className="mb-2 text-[88px] font-black leading-none tracking-[-.1em] text-[#fff9ee]">T.</div><h3 className="text-3xl font-black tracking-[-.05em]">The straight-talking spark.</h3><p className="mt-4 text-sm leading-7 text-[#574942]">Sharp takes, real stories, and absolutely no problem saying what the rest of us are thinking.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="community" className="scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1220px]">
            <div className="mx-auto max-w-[770px] text-center"><div className="flex justify-center"><Kicker>03 / Your turn to talk</Kicker></div><h2 className="mt-6 text-5xl font-black leading-[1.05] tracking-[-.065em] sm:text-7xl">Don&apos;t just listen.<br/><em className="font-normal text-[#e36d59]" style={{fontFamily:"Georgia,serif"}}>Get in on it.</em></h2><p className="mx-auto mt-6 max-w-[570px] text-lg leading-8 text-[#6b625d]">Have a hot take? An idea for an episode? A question for us? This is your invitation to be part of the conversation.</p></div>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <a className="group flex min-h-[295px] flex-col justify-between rounded-[27px] bg-[#f4c7b8] p-8 transition hover:-translate-y-1" href={links.instagram} target="_blank" rel="noopener noreferrer"><div className="flex justify-between"><Camera size={29}/><ArrowUpRight size={21} className="transition group-hover:translate-x-1 group-hover:-translate-y-1"/></div><div><h3 className="text-2xl font-black tracking-[-.04em]">Join the conversation</h3><p className="mt-3 text-sm leading-6 text-[#67524b]">Follow the podcast for discussions, questions, polls and a chance to weigh in.</p><p className="mt-5 text-xs font-extrabold">@babe_what_do_you_know</p></div></a>
              <a className="group flex min-h-[295px] flex-col justify-between rounded-[27px] bg-[#e5e7d0] p-8 transition hover:-translate-y-1" href={links.taylaTikTok} target="_blank" rel="noopener noreferrer"><div className="flex justify-between"><Radio size={29}/><ArrowUpRight size={21} className="transition group-hover:translate-x-1 group-hover:-translate-y-1"/></div><div><h3 className="text-2xl font-black tracking-[-.04em]">More Tayla, less filter</h3><p className="mt-3 text-sm leading-6 text-[#5b5c4c]">Keep up with Tayla&apos;s takes, everyday moments and short-form stories.</p><p className="mt-5 text-xs font-extrabold">@tattletayla on TikTok</p></div></a>
              <a className="group flex min-h-[295px] flex-col justify-between rounded-[27px] bg-[#ded9ee] p-8 transition hover:-translate-y-1" href={links.contact}><div className="flex justify-between"><Mail size={29}/><ArrowUpRight size={21} className="transition group-hover:translate-x-1 group-hover:-translate-y-1"/></div><div><h3 className="text-2xl font-black tracking-[-.04em]">Pitch us a topic</h3><p className="mt-3 text-sm leading-6 text-[#5c566b]">Got a question, a ridiculous hypothetical, or something we should unpack? Send it our way.</p><p className="mt-5 text-xs font-extrabold">OUR INBOX IS OPEN</p></div></a>
            </div>
            <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#211d1d]/10 px-6 py-5 text-sm sm:flex-row sm:items-center">
              <p className="text-[#6b625d]"><strong className="text-[#211d1d]">Know someone who would love this?</strong> Send them our corner of the internet.</p>
              <button onClick={share} type="button" className="inline-flex items-center gap-2 font-black underline underline-offset-4">{copied ? "Link copied!" : "Share this page"} <ArrowUpRight size={16}/></button>
            </div>
          </div>
        </section>

        <section id="work-with-us" className="scroll-mt-28 bg-[#282222] px-5 py-24 text-[#fff7eb] sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[1.3fr_.7fr]">
            <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#f7ab99]">04 / Let's make something together</div><h2 className="mt-6 text-5xl font-black leading-[1.05] tracking-[-.065em] sm:text-7xl">Good conversations<br/>make <em className="font-normal text-[#f7ab99]" style={{fontFamily:"Georgia,serif"}}>good company.</em></h2><p className="mt-6 max-w-xl text-base leading-8 text-[#ded0c7]">Brands, fellow creators, interesting guests: if we could make something worth talking about together, we'd love to hear from you.</p></div>
            <div className="flex flex-col gap-5 lg:items-end"><PillLink href={links.sponsor}>Let's collaborate</PillLink><p className="max-w-[250px] text-sm leading-6 text-[#d8bdb3] lg:text-right">Podcast partnerships, social collaborations, guest ideas, and beyond.</p></div>
          </div>
        </section>
        <section className="bg-[#f5c3ae] px-5 py-20 text-center sm:px-8">
          <Heart className="mx-auto h-8 w-8" strokeWidth={1.6}/>
          <p className="mx-auto mt-6 max-w-[750px] text-3xl font-black leading-tight tracking-[-.05em] sm:text-5xl">We don&apos;t have all the answers.<br/>But we&apos;ve got a lot of questions.</p>
          <a href="#top" className="mt-9 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4">Back to the top <ArrowDown className="rotate-180" size={16}/></a>
        </section>
      </main>
      <footer className="bg-[#fcf9f3] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1220px] flex-col justify-between gap-8 md:flex-row md:items-end">
          <div><div className="text-3xl font-black tracking-[-.07em]">babe<span className="text-[#e36d59]">.</span></div><div className="mt-1 text-xs font-semibold">what do you know about?</div><p className="mt-4 text-xs text-[#938781]">Made for conversations worth having. © {new Date().getFullYear()} Sam &amp; Tayla.</p></div>
          <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-[#615a54]">
            <a href={links.spotify} target="_blank" rel="noopener noreferrer" className="hover:text-[#df624e]">Spotify</a>
            <a href={links.apple} target="_blank" rel="noopener noreferrer" className="hover:text-[#df624e]">Apple Podcasts</a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#df624e]">Instagram</a>
            <a href={links.taylaTikTok} target="_blank" rel="noopener noreferrer" className="hover:text-[#df624e]">TikTok</a>
            <a href={links.contact} className="hover:text-[#df624e]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

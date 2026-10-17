"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, Headphones, Menu, MessageCircle, Play, Search, X } from "lucide-react";
import { BabeLogo, BrandMark } from "./brand";

const links = {
  spotify: "https://open.spotify.com/show/0pobL9iyx43mYTYgacAUvw",
  apple: "https://podcasts.apple.com/us/podcast/babe-what-do-you-know-about/id1647107172",
  archive: "https://babewhatdoyouknowabout.buzzsprout.com/",
  instagram: "https://www.instagram.com/babe_what_do_you_know/",
  tiktok: "https://www.tiktok.com/@tattletayla",
  contact: "mailto:samwillsonbiz@gmail.com?subject=Babe%20Podcast%20-%20Episode%20idea",
  sponsors: "mailto:samwillsonbiz@gmail.com?subject=Babe%20Podcast%20-%20Partnership",
};

const episodes = [
  { title: "Geopolitical tensions", number: 73, date: "28 August 2024", url: "https://babewhatdoyouknowabout.buzzsprout.com/2041257/episodes/15654910-geopolitical-tensions?t=0" },
  { title: "Creativity", number: 72, date: "14 August 2024", url: "https://babewhatdoyouknowabout.buzzsprout.com/2041257/episodes/15574676-creativity" },
  { title: "Sleep Token reaction", number: 69, date: "3 July 2024", url: "https://babewhatdoyouknowabout.buzzsprout.com/2041257/episodes/15354352-sleep-token-reaction-with-scott-salvesen?t=0" },
];

function SpotifyIcon() { return <svg viewBox="0 0 36 36" width="38" height="38" role="img" aria-label="Spotify logo"><circle cx="18" cy="18" r="18" fill="#1DB954"/><g fill="none" stroke="#102919" strokeLinecap="round"><path d="M8 13.5c7-2.1 14.5-1.4 20 1.8" strokeWidth="3"/><path d="M9.4 19c6-1.7 12.8-1 17.2 1.8" strokeWidth="2.6"/><path d="M11 24c5.2-1 10-.5 13.9 1.9" strokeWidth="2.3"/></g></svg>; }
function AppleIcon(){return <svg viewBox="0 0 36 36" width="38" height="38" role="img" aria-label="Apple Podcasts logo"><rect width="36" height="36" rx="10" fill="#A246DA"/><g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 22a9 9 0 1 1 12 0"/><path d="M14.5 19a5.5 5.5 0 1 1 7 0"/></g><circle cx="18" cy="17" r="2.4" fill="white"/><path d="M15.8 21.6c-.6 0-1 .7-.9 1.3l1 6c.1.8.5 1.1 1.2 1.1h1.8c.7 0 1.1-.3 1.2-1.1l1-6c.1-.6-.3-1.3-.9-1.3z" fill="white"/></svg>;}
function PrimaryButton({ href, children, pale = false }: { href:string; children: React.ReactNode; pale?:boolean }){return <a className={"babe-button "+(pale?"white":"coral")} href={href}>{children}<ArrowRight size={18}/></a>;}

export default function BabePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div>
    <header className="babe-nav">
      <div className="babe-container babe-nav-inside">
        <a href="#top" aria-label="Babe podcast homepage" onClick={() => setMenuOpen(false)}><BabeLogo small/></a>
        <nav aria-label="Podcast navigation" className="babe-nav-links">
          <a href="#listen">Listen</a><a href="/babe/archive">Episodes</a><a href="#about">About</a><a href="#community">Community</a>
        </nav>
        <div className="babe-nav-right">
          <a href="#listen" className="babe-button">Listen &amp; follow <ArrowRight size={15}/></a>
          <button aria-label={menuOpen?"Close menu":"Open menu"} aria-expanded={menuOpen} className="babe-mobile-toggle" onClick={() => setMenuOpen(o=>!o)}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
        </div>
      </div>
      {menuOpen && <nav className="babe-mobile-nav" aria-label="Mobile navigation">{[["Listen","#listen"],["Episodes","/babe/archive"],["About","#about"],["Community","#community"]].map(([label,href])=><a key={href} href={href} onClick={()=>setMenuOpen(false)}>{label}</a>)}</nav>}
    </header>

    <main id="top">
      <section className="babe-hero">
        <div className="babe-container babe-hero-layout">
          <div>
            <h1 className="babe-title">Two voices.<br/>One <span className="babe-script">good</span><br/>conversation.</h1>
            <p className="babe-body">Tayla and Sam take a topic, rarely see it the same way, and work out what&apos;s actually going on. Curious questions, strong opinions and no need to agree.</p>
            <PrimaryButton href="#listen">Listen &amp; follow</PrimaryButton>
          </div>
          <div className="babe-hero-art" aria-label="Tayla and Sam, each in their own host colour">
            <div className="babe-person">
              <img src="/babe/tayla.webp" alt="Tayla" className="babe-photo tayla" width="310" height="310" />
              <span>Tayla</span>
            </div>
            <div className="babe-person">
              <img src="/babe/sam.webp" alt="Sam" className="babe-photo sam" width="310" height="310" />
              <span>Sam</span>
            </div>
            <span className="babe-overlap-sticker">Two voices. One middle.</span>
          </div>
        </div>
      </section>
      <div className="babe-steps"><div className="babe-container"><span>Different takes</span><span>Curious questions</span><span>Worth talking about</span></div></div>

      <section id="listen" className="babe-section" style={{background:"#FAF5EE",scrollMarginTop:90}}>
        <div className="babe-container">
          <div className="babe-section-head">
            <div><div className="babe-eyebrow">The podcast</div><h2 className="babe-title">Start <span className="babe-script" style={{color:"#C2473C"}}>listening.</span></h2><p className="babe-body">Find us in your podcast app, then hit Follow so we&apos;re there when you want us.</p></div>
            <a className="babe-text-link" href="/babe/archive"><Search size={17}/> Search the full archive <ArrowUpRight size={17}/></a>
          </div>

          <div className="babe-platforms">
            <a href={links.spotify} target="_blank" rel="noopener noreferrer" className="babe-platform"><SpotifyIcon/><div><div className="babe-platform-name">Spotify</div><div className="babe-platform-caption">Listen &amp; follow</div></div><ArrowUpRight className="babe-platform-arrow" size={19}/></a>
            <a href={links.apple} target="_blank" rel="noopener noreferrer" className="babe-platform"><AppleIcon/><div><div className="babe-platform-name">Apple Podcasts</div><div className="babe-platform-caption">Listen &amp; follow</div></div><ArrowUpRight className="babe-platform-arrow" size={19}/></a>
            <a href={links.archive} target="_blank" rel="noopener noreferrer" className="babe-platform"><Headphones size={34} color="#1F1B24"/><div><div className="babe-platform-name">Other apps</div><div className="babe-platform-caption">Browse listening options</div></div><ArrowUpRight className="babe-platform-arrow" size={19}/></a>
          </div>

          <div className="babe-episodes-heading"><h3>Not sure where to start?</h3><a href="/babe/archive" className="babe-text-link">All 73 episodes <ArrowRight size={17}/></a></div>
          <div className="babe-episode-grid">
            {episodes.map(episode=><a href={episode.url} key={episode.number} target="_blank" rel="noopener noreferrer" className="babe-episode">
              <div className="babe-episode-top"><div className="small">EP {episode.number}</div><div className="babe-episode-title">{episode.title}</div></div>
              <div className="babe-episode-bottom"><span>{episode.date}</span><span style={{display:"inline-flex",alignItems:"center",gap:5}}>Listen <Play size={14}/></span></div>
            </a>)}
          </div>
        </div>
      </section>

      <section id="about" className="babe-section babe-about" style={{scrollMarginTop:90}}>
        <div className="babe-container babe-about-grid">
          <div className="babe-about-copy"><div className="babe-eyebrow">The idea</div><h2 className="babe-title">Two voices.<br/><span className="babe-script" style={{color:"#237573"}}>Meeting</span><br/>in the middle.</h2><p className="babe-body">We&apos;re married. That doesn&apos;t mean we agree. Every episode is a chance to challenge each other, ask better questions and sometimes change our minds.</p></div>
          <div className="babe-host-cards">
            <div className="babe-host coral"><small>Tayla / Coral</small><div><h3>The first take.</h3><p>Honest, curious and not afraid to say what she thinks.</p></div></div>
            <div className="babe-host teal"><small>Sam / Teal</small><div><h3>Not so fast.</h3><p>Always ready for a question, a different angle or a deeper dive.</p></div></div>
          </div>
        </div>
      </section>

      <section id="community" className="babe-section babe-community" style={{scrollMarginTop:90}}>
        <div className="babe-container babe-community-grid">
          <div><div className="babe-eyebrow">Your turn</div><h2 className="babe-title">You&apos;ve heard us.<br/><span className="babe-script" style={{color:"#C2473C"}}Now you.</span></h2><p className="babe-body">What should we argue about next? Bring your questions, your hot takes and the topics you want us to unpack.</p></div>
          <div className="babe-community-actions">
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="babe-action-card"><div><strong>Join the conversation</strong><span>Find us on Instagram</span></div><MessageCircle size={24}/></a>
            <a href={links.contact} className="babe-action-card"><div><strong>Suggest a topic</strong><span>Send a question for a future episode</span></div><ArrowUpRight size={24}/></a>
            <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="babe-action-card"><div><strong>More from Tayla</strong><span>Everyday takes on TikTok</span></div><ArrowUpRight size={24}/></a>
          </div>
        </div>
      </section>
      <section className="babe-partners"><div className="babe-container babe-partners-inner"><div><h2 className="babe-title">Let&apos;s make something worth talking about.</h2><p>Brands, interesting guests and fellow creators: we&apos;re open to good collaborations.</p></div><PrimaryButton href={links.sponsors} pale>Work with us</PrimaryButton></div></section>
    </main>
    <footer className="babe-footer"><div className="babe-container babe-footer-inner"><div><BabeLogo small dark/><p className="copyright">© {new Date().getFullYear()} Babe, What Do You Know About? Made for conversations worth having.</p></div><div className="babe-footer-links"><a href={links.spotify} target="_blank" rel="noopener noreferrer">Spotify</a><a href={links.apple} target="_blank" rel="noopener noreferrer">Apple Podcasts</a><a href="/babe/archive">Episodes</a><a href={links.instagram} target="_blank" rel="noopener noreferrer">Instagram</a><a href={links.sponsors}>Partnerships</a></div></div></footer>
  </div>;
}

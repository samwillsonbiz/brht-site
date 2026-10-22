
"use client";

import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, Droplets, Heart, Leaf,
  Menu, Sparkles, X
} from "lucide-react";
import s from "./cecilia.module.css";

type Need = "dry" | "simple" | "body";
const STORE = "https://ceciliasproducts.com";
const needs: Array<{
  id: Need;
  number: string;
  title: string;
  description: string;
  icon: typeof Droplets;
}> = [
  {
    id: "dry",
    number: "01",
    title: "My skin feels dry.",
    description: "I want my face to feel comfortable, soft, and nourished again.",
    icon: Droplets
  },
  {
    id: "simple",
    number: "02",
    title: "I need a simpler routine.",
    description: "I want good everyday care without a complicated regimen.",
    icon: Sparkles
  },
  {
    id: "body",
    number: "03",
    title: "My body needs care.",
    description: "I want to give dry-feeling hands and body a little attention.",
    icon: Heart
  }
];

const recommendations: Record<Need, {
  headline: string;
  intro: string;
  product: string;
  summary: string;
  price: string;
  url: string;
  artLabel: string;
  artSubline: string;
  additional: string;
  additionalName: string;
  additionalUrl: string;
}> = {
  dry: {
    headline: "Comfort for thirsty skin.",
    intro: "When your face feels dry, start with a thoughtfully formulated moisturizer. A little care, morning and night, can be a beautiful thing.",
    product: "Cecilia’s Day & Night Moisturizer",
    summary: "Cecilia’s signature moisturizer since 1990, made with aloe vera, nourishing plant oils, and a botanical essential-oil blend.",
    price: "$29.00 USD",
    url: STORE + "/products/prod12",
    artLabel: "Everyday moisture",
    artSubline: "A simple place to start",
    additional: "Looking for a finishing step?",
    additionalName: "Explore Emerald Jade Serum",
    additionalUrl: STORE + "/products/prod19"
  },
  simple: {
    headline: "Less to do. More care.",
    intro: "The best routine is often one you enjoy enough to keep. Start with cleansing and an everyday moisturizer; add steps only when they feel useful.",
    product: "Cecilia’s Day & Night Moisturizer",
    summary: "One uncomplicated daily essential designed for morning and evening use. Cecilia calls it her bestselling formulation since 1990.",
    price: "$29.00 USD",
    url: STORE + "/products/prod12",
    artLabel: "The daily essential",
    artSubline: "Keep what works",
    additional: "Want an optional finishing step?",
    additionalName: "Explore Emerald Jade Serum",
    additionalUrl: STORE + "/products/prod19"
  },
  body: {
    headline: "A little comfort, every day.",
    intro: "If your hands and body feel dry, a lotion that fits easily into daily life is a good starting point. Small habits make room for everyday softness.",
    product: "Cecilia’s Hand and Body Lotions",
    summary: "Aloe vera and plant oils in a daily lotion, with several scent choices including a fragrance-free option.",
    price: "$22.00 USD",
    url: STORE + "/products/prod30",
    artLabel: "Care beyond the face",
    artSubline: "Everyday body care",
    additional: "Prefer to explore first?",
    additionalName: "See the full body care collection",
    additionalUrl: STORE + "/collections/all"
  }
};

function BotanicalIllustration() {
  return (
    <svg className={s.leafSvg} viewBox="0 0 420 560" fill="none" role="img" aria-label="Decorative botanical illustration">
      <path d="M207 544C201 484 200 445 213 399C236 324 201 260 195 203C189 141 200 86 217 26"
        stroke="#476e4e" strokeWidth="4" strokeLinecap="round" />
      <path d="M211 422C166 382 125 374 66 365M220 372C274 334 305 293 340 251M202 296C147 275 112 235 89 202M198 217C256 186 275 153 297 113M197 158C165 135 149 109 142 84"
        stroke="#5a805b" strokeWidth="3" strokeLinecap="round" />
      <g fill="#6f9471" fillOpacity=".91" stroke="#4a7554" strokeWidth="1">
        <ellipse cx="138" cy="386" rx="29" ry="75" transform="rotate(-55 138 386)" />
        <ellipse cx="77" cy="357" rx="24" ry="61" transform="rotate(-82 77 357)" />
        <ellipse cx="281" cy="330" rx="29" ry="73" transform="rotate(43 281 330)" />
        <ellipse cx="340" cy="251" rx="23" ry="64" transform="rotate(57 340 251)" />
        <ellipse cx="147" cy="262" rx="24" ry="62" transform="rotate(-53 147 262)" />
        <ellipse cx="91" cy="195" rx="23" ry="61" transform="rotate(-27 91 195)" />
        <ellipse cx="248" cy="190" rx="24" ry="65" transform="rotate(42 248 190)" />
        <ellipse cx="292" cy="119" rx="24" ry="64" transform="rotate(29 292 119)" />
        <ellipse cx="155" cy="123" rx="20" ry="51" transform="rotate(-38 155 123)" />
        <ellipse cx="227" cy="51" rx="23" ry="62" transform="rotate(20 227 51)" />
      </g>
      <g stroke="#c4d8ba" strokeOpacity=".52">
        <path d="M214 423 134 371M220 367 291 319M197 289 138 253M201 208 271 173M198 154 152 113" />
      </g>
    </svg>
  );
}

export default function CeciliaNeedFirst() {
  const [need, setNeed] = useState<Need>("dry");
  const [menuOpen, setMenuOpen] = useState(false);
  const selection = recommendations[need];

  const choose = (nextNeed: Need) => {
    setNeed(nextNeed);
    document.getElementById("recommendation")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <main className={s.site}>
      <div className={s.topline}>Cecilia&apos;s Products · Thoughtfully formulated since 1990</div>

      <header className={s.nav}>
        <a href="#top" className={s.brand} aria-label="Cecilia's Products home">
          Cecilia&apos;s
          <span>Natural health &amp; beauty</span>
        </a>
        <nav className={s.navLinks} aria-label="Primary navigation">
          <a href="#find">Find what you need</a>
          <a href="#recommendation">Cecilia&apos;s edit</a>
          <a href="#founder">Meet Cecilia</a>
        </nav>
        <a className={s.navShop} href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer">
          Browse the full shop <ArrowUpRight size={15} strokeWidth={1.6}/>
        </a>
        <button className={s.menuToggle} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21}/> : <Menu size={21}/>}
        </button>
        {menuOpen && <nav className={s.mobileNav} aria-label="Mobile navigation">
          <a href="#find" onClick={() => setMenuOpen(false)}>Find what you need</a>
          <a href="#recommendation" onClick={() => setMenuOpen(false)}>Cecilia&apos;s edit</a>
          <a href="#founder" onClick={() => setMenuOpen(false)}>Meet Cecilia</a>
          <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Browse the full shop ↗</a>
        </nav>}
      </header>

      <section className={s.hero} id="top" aria-labelledby="hero-title">
        <div className={s.heroLeft}>
          <span className={s.eyebrow}>Above pure. Beyond natural.</span>
          <h1 id="hero-title" className={s.serif}>What does your skin <em>need today?</em></h1>
          <p>Skincare doesn&apos;t have to be complicated. Let Cecilia&apos;s decades of formulation experience help you discover a simpler, more thoughtful place to begin.</p>
          <a href="#find" className={s.primary}>Find my skincare starting point <ArrowRight size={16}/></a>
          <div className={s.heroBelow}>
            <span>Three simple ways to start</span>
            <a href="#founder" className={s.subtleLink}>Meet the woman behind it <ArrowUpRight size={14}/></a>
          </div>
        </div>
        <div className={s.heroVisual}>
          <span className={s.heroCircle} aria-hidden="true"/>
          <BotanicalIllustration/>
          <span className={s.heroYear} aria-hidden="true">1990</span>
          <span className={s.heroVisualNote}>Nature first. Always.</span>
        </div>
      </section>

      <section className={s.section} id="find" aria-labelledby="find-title">
        <div className={s.shell}>
          <div className={s.sectionIntro}>
            <span className={s.eyebrow}>Start with you, not a product shelf</span>
            <h2 id="find-title" className={s.serif}>Tell us what <em>feels familiar.</em></h2>
            <p>Choose what sounds most like you. We&apos;ll show you a simple place to start — without asking you to learn an entire skincare range first.</p>
          </div>
          <div className={s.needGrid}>
            {needs.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={[s.needCard, need === item.id ? s.needCardSelected : ""].filter(Boolean).join(" ")}
                  onClick={() => choose(item.id)}
                  aria-pressed={need === item.id}
                >
                  <div className={s.needTop}>
                    <span className={s.needNum}>{item.number}</span>
                    <span className={s.needIcon}><Icon size={21} strokeWidth={1.35}/></span>
                  </div>
                  <strong className={s.needTitle}>{item.title}</strong>
                  <span className={s.needDescription}>{item.description}</span>
                  <span className={s.needAction}>See Cecilia&apos;s suggestion <ArrowRight size={16}/></span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={s.recommendation} id="recommendation" aria-label="Your suggested starting point">
        <div className={s.shell}>
          <div className={s.recGrid}>
            <div className={s.recCopy} aria-live="polite">
              <span className={s.eyebrow}>One considered place to start</span>
              <h2 className={s.serif}>{selection.headline}</h2>
              <p>{selection.intro}</p>
              <h3 className={s.recProduct}>{selection.product}</h3>
              <div className={s.recMeta}>{selection.summary}<br/><strong className={s.recPrice}>{selection.price}</strong></div>
              <div className={s.recActions}>
                <a className={s.primary} href={selection.url} target="_blank" rel="noopener noreferrer">
                  View this on Cecilia&apos;s store <ArrowUpRight size={16}/>
                </a>
              </div>
              <div className={s.recSecondary}>
                {selection.additional}{" "}
                <a href={selection.additionalUrl} target="_blank" rel="noopener noreferrer">
                  {selection.additionalName} ↗
                </a>
              </div>
            </div>
            <div className={s.recVisual} aria-label="Botanical product editorial design placeholder">
              <div className={s.recDecor}>
                <div className={s.recDecorInner}>
                  <Leaf size={47} strokeWidth={1.1}/>
                  <strong>{selection.artLabel}</strong>
                  <span>{selection.artSubline}</span>
                </div>
              </div>
              <span className={s.recVisualCorner}>A more considered kind of care</span>
            </div>
          </div>
        </div>
      </section>

      <section className={s.founder} id="founder" aria-labelledby="founder-title">
        <div className={[s.shell,s.founderInner].join(" ")}>
          <div className={s.founderLeft}>
            <span className={s.eyebrow}>Behind every formulation</span>
            <h2 id="founder-title" className={s.serif}>Experience you can <em>feel good about.</em></h2>
          </div>
          <div className={s.founderRight}>
            <p>Meet Cecilia Salvesen — founder, formulator, aromatherapy educator, and author. She established her first natural health and beauty clinic in South Africa in 1990. Her approach is rooted in thoughtful ingredients and decades of practical experience.</p>
            <div className={s.founderDetails}>
              <div><strong>Since 1990</strong><span>Creating natural beauty products</span></div>
              <div><strong>Author &amp; educator</strong><span>Sharing botanical knowledge</span></div>
            </div>
            <a className={s.subtleLink} href={STORE + "/pages/about-cecilia"} target="_blank" rel="noopener noreferrer">
              Get to know Cecilia <ArrowUpRight size={16}/>
            </a>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={[s.shell,s.footerInner].join(" ")}>
          <div>
            <div className={s.footerBrand}>Cecilia&apos;s<small>Natural health &amp; beauty</small></div>
            <p>Good skincare starts with understanding what your skin needs. Discover natural beauty from a founder who has spent decades making it her craft.</p>
          </div>
          <div className={s.footerCol}>
            <h3>Explore</h3>
            <a href="#find">Find your starting point</a>
            <a href="#recommendation">Cecilia&apos;s suggestion</a>
            <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer">Shop all products ↗</a>
          </div>
          <div className={s.footerCol}>
            <h3>About Cecilia</h3>
            <a href="#founder">Our founder</a>
            <a href={STORE + "/pages/about-cecilia"} target="_blank" rel="noopener noreferrer">Her story ↗</a>
            <a href={STORE + "/pages/cecilias-formulation-philosophy"} target="_blank" rel="noopener noreferrer">Formulation philosophy ↗</a>
          </div>
        </div>
        <div className={s.shell}>
          <div className={s.footline}>
            <span>© 2026 Cecilia&apos;s Products · Concept storefront presentation</span>
            <span>Preview only. Recommendations are general, not medical advice. Purchases take place on Cecilia&apos;s Shopify store.</span>
          </div>
        </div>
      </footer>
      <div className={s.demoNote}>Storefront concept · Preview only</div>
    </main>
  );
}

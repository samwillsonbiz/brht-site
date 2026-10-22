
"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Droplets, Heart, Leaf, Menu, Search, Sun, X
} from "lucide-react";
import s from "./cecilia.module.css";

const STORE = "https://ceciliasproducts.com";
const SCENES = {
  hero: "https://unsplash.com/photos/a-woman-is-putting-a-lotion-on-her-face-zoYLGk2oULA/download?force=true&w=1400",
  softness: "https://unsplash.com/photos/a-woman-putting-cream-on-her-face-NdcuSGxKbwE/download?force=true&w=950",
  serum: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=950&q=85&fit=crop",
  body: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=950&q=85&fit=crop",
  ritual: "https://unsplash.com/photos/woman-applying-cream-to-her-face-in-mirror-Vpcy3ytvQVw/download?force=true&w=1200"
};

const products = [
  {
    key:"moisturizer",
    name:"Cecilia's Day & Night Moisturizer",
    benefit:"For everyday softness",
    price:"$29.00",
    tag:"Signature favorite",
    href:STORE + "/products/prod12",
    tone:"tone1"
  },
  {
    key:"blu",
    name:"Blu Jade Serum",
    benefit:"For a nourished-looking glow",
    price:"$20.00",
    tag:"",
    href:STORE + "/products/prod6",
    tone:"tone2"
  },
  {
    key:"emerald",
    name:"Emerald Jade Serum",
    benefit:"For a botanical finishing touch",
    price:"$20.00",
    tag:"Plant-based serum",
    href:STORE + "/products/prod19",
    tone:"tone3"
  },
  {
    key:"lotion",
    name:"Hand and Body Lotions",
    benefit:"For soft, comfortable body care",
    price:"$22.00",
    tag:"",
    href:STORE + "/products/prod30",
    tone:"tone4"
  }
];

function EditorialImage({
  src, alt, className, fallback, loading = "lazy"
}: {
  src:string; alt:string; className?:string; fallback:string; loading?:"lazy"|"eager"
}) {
  const [activeSrc, setActiveSrc] = useState(src);
  return (
    <img
      alt={alt}
      src={activeSrc}
      loading={loading}
      className={className}
      onError={() => { if (activeSrc !== fallback) setActiveSrc(fallback); }}
    />
  );
}

export default function CeciliaStorefront() {
  const [menuOpen,setMenuOpen] = useState(false);
  const [images,setImages] = useState<Record<string,string>>({});
  useEffect(() => {
    let live = true;
    fetch("/cecilia/api/products")
      .then(r => {
        if (!r.ok) throw new Error("Product images unavailable");
        return r.json();
      })
      .then((data: {products?:Array<{key:string;image:string|null}>}) => {
        if (!live) return;
        const next:Record<string,string> = {};
        for (const item of data.products || []) {
          if (item.image && /^https?:\/\//.test(item.image)) next[item.key]=item.image;
        }
        setImages(next);
      }).catch(() => {});
    return () => { live = false; };
  }, []);

  return (
    <main className={s.site}>
      <div className={s.announcement}>Thoughtful botanical care since 1990 · Complimentary US shipping on orders over $100 at the live store</div>
      <header className={s.nav}>
        <a href="#top" className={s.logo} aria-label="Cecilia's home" onClick={() => setMenuOpen(false)}>
          Cecilia&apos;s <small>Natural health &amp; beauty</small>
        </a>
        <nav className={s.navLinks} aria-label="Main navigation">
          <a href="#shop">Shop favorites</a>
          <a href="#benefits">Discover your care</a>
          <a href="#ritual">The ritual</a>
          <a href="#founder">Our founder</a>
        </nav>
        <div className={s.navEnd}>
          <a className={s.iconLink} href={STORE + "/search"} aria-label="Search the live store" target="_blank" rel="noopener noreferrer"><Search size={18} strokeWidth={1.6}/></a>
          <a className={s.navCta} href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer">Shop the collection <ArrowUpRight size={15}/></a>
          <button className={[s.iconLink,s.mobileMenuButton].join(" ")} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen?<X size={18}/>:<Menu size={19}/>}
          </button>
        </div>
        {menuOpen && <nav className={s.mobileNav} aria-label="Mobile menu">
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop favorites</a>
          <a href="#benefits" onClick={() => setMenuOpen(false)}>Discover your care</a>
          <a href="#ritual" onClick={() => setMenuOpen(false)}>The ritual</a>
          <a href="#founder" onClick={() => setMenuOpen(false)}>Our founder</a>
          <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Browse everything ↗</a>
        </nav>}
      </header>

      <section className={s.hero} id="top">
        <div className={s.heroContent}>
          <span className={s.eyebrow}>Above pure · Beyond natural</span>
          <h1 className={s.serif}>Feel wonderful <em>in your skin.</em></h1>
          <p>That soft, nourished, just-took-a-moment-for-yourself feeling. Discover botanical skincare and everyday rituals thoughtfully formulated by Cecilia since 1990.</p>
          <div className={s.heroButtons}>
            <a className={s.darkButton} href="#shop">Shop everyday favorites <ArrowRight size={17}/></a>
            <a className={s.simpleLink} href="#benefits">Explore what your skin needs <ArrowUpRight size={15}/></a>
          </div>
        </div>
        <div className={s.heroVisual}>
          <EditorialImage
            src={SCENES.hero}
            fallback="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1350&q=85&fit=crop"
            alt="Natural skincare ritual in a warm, softly lit setting"
            loading="eager"
          />
          <div className={s.heroCaption}>The beauty of feeling good.</div>
        </div>
      </section>

      <div className={s.heartline}>
        <span><Leaf size={19} strokeWidth={1.25}/> Botanically inspired</span>
        <span><Heart size={19} strokeWidth={1.25}/> Made with intention</span>
        <span><Sun size={19} strokeWidth={1.25}/> Everyday feel-good rituals</span>
      </div>

      <section className={s.section} id="benefits">
        <div className={s.sectionHead}>
          <div>
            <span className={s.eyebrow}>Natural care that fits your life</span>
            <h2 className={s.serif}>The feeling you want.<br/><em>The care you need.</em></h2>
          </div>
          <p>Start with what matters to you. Find a little extra softness, a dewy-looking finish, or a body-care ritual worth looking forward to.</p>
        </div>

        <div className={s.categories}>
          <article className={s.catCard}>
            <a className={s.catMedia} href={STORE + "/products/prod12"} target="_blank" rel="noopener noreferrer" aria-label="Explore everyday face moisturizer">
              <EditorialImage src={SCENES.softness} fallback="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&q=85&fit=crop" alt="Enjoying a gentle facial skincare ritual" />
              <span className={s.catMediaLabel}><b>Feel deeply<br/>nourished.</b><i><ArrowUpRight size={20}/></i></span>
            </a>
            <p className={s.catSub}>For skin that feels dry or in need of a little softness. Discover everyday facial moisture.</p>
          </article>
          <article className={s.catCard}>
            <a className={s.catMedia} href={STORE + "/products/prod19"} target="_blank" rel="noopener noreferrer" aria-label="Explore botanical facial serums">
              <EditorialImage src={SCENES.serum} fallback="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=950&q=85&fit=crop" alt="Serum and botanical beauty essentials arranged in soft light"/>
              <span className={s.catMediaLabel}><b>Love your<br/>natural glow.</b><i><ArrowUpRight size={20}/></i></span>
            </a>
            <p className={s.catSub}>For a luminous-looking finish and the pleasure of a beautiful last step in your face-care routine.</p>
          </article>
          <article className={s.catCard}>
            <a className={s.catMedia} href={STORE + "/products/prod30"} target="_blank" rel="noopener noreferrer" aria-label="Explore hand and body care">
              <EditorialImage src={SCENES.body} fallback="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=950&q=85&fit=crop" alt="Natural skincare products in a calm daily self-care setting" />
              <span className={s.catMediaLabel}><b>Make every day<br/>feel softer.</b><i><ArrowUpRight size={20}/></i></span>
            </a>
            <p className={s.catSub}>For hands and body that deserve daily attention. Explore comforting botanical lotions.</p>
          </article>
        </div>
      </section>

      <section className={s.productsSection} id="shop">
        <div className={s.productsInner}>
          <div className={s.sectionHead}>
            <div>
              <span className={s.eyebrow}>The Cecilia&apos;s edit</span>
              <h2 className={s.serif}>A few very <em>good things.</em></h2>
            </div>
            <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer" className={s.simpleLink}>Explore the full collection <ArrowUpRight size={16}/></a>
          </div>
          <div className={s.productGrid}>
            {products.map((p) => <article className={s.productItem} key={p.key}>
              <a className={[s.productImage,s[p.tone]].join(" ")} href={p.href} target="_blank" rel="noopener noreferrer">
                {images[p.key] ?
                  <img src={images[p.key]} alt={p.name} loading="lazy" onError={e => {e.currentTarget.style.display="none";}}/>:
                  <div className={s.productPlaceholder}>{p.name}</div>}
                {p.tag && <span className={s.productPill}>{p.tag}</span>}
              </a>
              <div className={s.productBody}>
                <span className={s.productBenefit}>{p.benefit}</span>
                <h3><a href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a></h3>
                <div className={s.productPrice}>
                  <span>{p.price} USD</span>
                  <a href={p.href} target="_blank" rel="noopener noreferrer">View product <ArrowUpRight size={14}/></a>
                </div>
              </div>
            </article>)}
          </div>
          <p className={s.productNote}>The images above load from Cecilia&apos;s current Shopify catalog when available. Pricing and product selection reflect the public store and may change.</p>
        </div>
      </section>

      <section className={s.editorial} id="ritual">
        <div className={s.editorialImage}>
          <EditorialImage src={SCENES.ritual}
            fallback="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1150&q=85&fit=crop"
            alt="Woman taking a quiet moment for her morning skincare routine" />
        </div>
        <div className={s.editorialCopy}>
          <span className={s.eyebrow}>A little moment, just for you</span>
          <h2 className={s.serif}>A beautiful routine.<br/><em>A beautiful feeling.</em></h2>
          <p>It&apos;s the few minutes before a busy day, or the gentle pause when the day is done. Cecilia&apos;s philosophy is about making skincare something to enjoy—not another thing on your list.</p>
          <a className={s.darkButton} href={STORE + "/products/prod12"} target="_blank" rel="noopener noreferrer">Meet the daily moisturizer <ArrowUpRight size={16}/></a>
        </div>
      </section>

      <section className={s.story} id="founder">
        <div>
          <span className={s.eyebrow}>The woman behind the formulations</span>
          <h2 className={s.serif}>Nature&apos;s wisdom.<br/><em>Cecilia&apos;s touch.</em></h2>
        </div>
        <div>
          <p>Cecilia Salvesen has spent decades studying, teaching and formulating with botanical ingredients. From her first natural health and beauty clinic in South Africa in 1990 to the products she creates today, her belief has remained simple: every ingredient should have a purpose.</p>
          <a className={s.simpleLink} href={STORE + "/pages/about-cecilia"} target="_blank" rel="noopener noreferrer">Meet Cecilia <ArrowUpRight size={16}/></a>
          <div className={s.storyStamp}><strong>1990</strong><span>Where the story began</span></div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.footerGrid}>
          <div>
            <div className={s.footerLogo}>Cecilia&apos;s<span>Natural health &amp; beauty</span></div>
            <p>Thoughtful botanical care for everyday softness, a little radiance, and the simple pleasure of feeling good in your own skin.</p>
          </div>
          <div>
            <h4>Discover</h4>
            <a href="#benefits">Shop by what you love</a>
            <a href="#shop">Featured products</a>
            <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer">Full Shopify collection ↗</a>
          </div>
          <div>
            <h4>Our world</h4>
            <a href="#founder">About Cecilia</a>
            <a href={STORE + "/pages/cecilias-formulation-philosophy"} target="_blank" rel="noopener noreferrer">Formulation philosophy ↗</a>
            <a href={STORE} target="_blank" rel="noopener noreferrer">Visit current store ↗</a>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© 2026 Cecilia&apos;s Products · Website design concept</span>
          <span>Temporary editorial lifestyle imagery is for design demonstration, not evidence of product results. Purchases take place on the existing store.</span>
        </div>
      </footer>

      <div className={s.previewNote}>BRHT concept storefront · Preview only</div>
    </main>
  );
}

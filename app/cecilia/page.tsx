
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Check, ChevronRight, Droplets, Flower2,
  Heart, Leaf, Menu, Minus, Plus, Search, ShoppingBag, Sparkles,
  Sprout, X
} from "lucide-react";
import s from "./cecilia.module.css";

const STORE = "https://ceciliasproducts.com";
type Kind = "jar" | "drop" | "lotion" | "bottle";
type Tone = "sage" | "blush" | "gold" | "clay";
type Product = {
  id: string;
  name: string;
  group: string;
  price: number;
  priceLabel: string;
  tag?: string;
  kind: Kind;
  tone: Tone;
  label: string;
  subtitle: string;
  url: string;
};
const products: Product[] = [
  {
    id: "moisturizer", name: "Day & Night Moisturizer", group: "Daily essentials",
    price: 29, priceLabel: "$29.00", tag: "Cecilia's signature",
    kind: "jar", tone: "blush", label: "Day & Night", subtitle: "Moisturizer · 50g",
    url: STORE + "/products/prod12"
  },
  {
    id: "emerald", name: "Emerald Jade Serum", group: "Botanical face oils",
    price: 20, priceLabel: "$20.00", tag: "Plant-based favorite",
    kind: "drop", tone: "sage", label: "Emerald Jade", subtitle: "Face serum",
    url: STORE + "/products/prod19"
  },
  {
    id: "blu", name: "Blu Jade Serum", group: "Botanical face oils",
    price: 20, priceLabel: "$20.00",
    kind: "drop", tone: "gold", label: "Blu Jade", subtitle: "Face serum · 1oz",
    url: STORE + "/products/prod6"
  },
  {
    id: "lotion", name: "Hand & Body Lotion", group: "Everyday body care",
    price: 22, priceLabel: "$22.00",
    kind: "lotion", tone: "clay", label: "Hand & Body", subtitle: "Lotion · 8oz",
    url: STORE + "/products/prod30"
  },
];
const getProduct = (id: string) => products.find((p) => p.id === id);
const currency = (n: number) => "$" + n.toFixed(2);

function Packshot({ product }: { product: Product }) {
  const jar = product.kind === "jar";
  return (
    <div className={jar ? s.jar : [s.bottle, product.kind === "lotion" ? s.lotion : product.kind === "drop" ? s.drop : ""].filter(Boolean).join(" ")} aria-label={"Illustrative packaging for " + product.name} role="img">
      <div className={jar ? s.jarLabel : s.bottleLabel}>
        <span className={s.packBrand}>Cecilia&apos;s</span>
        <span className={s.packTitle}>{product.label}</span>
        <span className={s.packHint}>{product.subtitle}</span>
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (id: string) => void }) {
  return (
    <article className={s.productCard}>
      <div className={[s.productMedia, s[product.tone]].join(" ")}>
        {product.tag && <span className={s.productBadge}>{product.tag}</span>}
        <Packshot product={product} />
        <button className={s.quickAdd} onClick={() => onAdd(product.id)} aria-label={"Add " + product.name + " to demo bag"}>
          <Plus size={15} strokeWidth={1.6} /> Add to demo bag
        </button>
      </div>
      <div className={s.productContent}>
        <span className={s.category}>{product.group}</span>
        <h3><a href={product.url} target="_blank" rel="noopener noreferrer">{product.name}</a></h3>
        <div className={s.productBottom}>
          <span>{product.priceLabel} USD</span>
          <a href={product.url} target="_blank" rel="noopener noreferrer">View product <ArrowUpRight size={13} /></a>
        </div>
      </div>
    </article>
  );
}

export default function CeciliaConcept() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [goal, setGoal] = useState("daily");
  const [quizResult, setQuizResult] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const cartCount = products.reduce((sum, p) => sum + (cart[p.id] || 0), 0);
  const cartTotal = products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);
  const chosen = useMemo(() => {
    if (goal === "sensitive") return [products[0], products[1]];
    if (goal === "glow") return [products[0], products[2]];
    if (goal === "body") return [products[3], products[0]];
    return [products[0], products[1]];
  }, [goal]);
  const filtered = products.filter(p => (p.name + " " + p.group).toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const opened = cartOpen || quizOpen || searchOpen;
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCartOpen(false);
        setQuizOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, quizOpen, searchOpen]);

  const addToBag = (id: string) => {
    setCart(current => ({ ...current, [id]: (current[id] || 0) + 1 }));
    setCartOpen(true);
    setQuizOpen(false);
  };
  const changeQty = (id: string, diff: number) => {
    setCart(current => {
      const next = { ...current };
      next[id] = Math.max(0, (next[id] || 0) + diff);
      if (!next[id]) delete next[id];
      return next;
    });
  };
  const closeMenu = () => setMobileMenu(false);

  return (
    <main className={s.site}>
      <div className={s.topBar}>
        <span>Botanical care, thoughtfully formulated since 1990</span><i />
        <span>Free US shipping on orders over $100 at the live store</span>
      </div>

      <header className={s.nav}>
        <button className={[s.iconButton, s.mobileMenuButton].join(" ")} onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation" aria-expanded={mobileMenu}>
          {mobileMenu ? <X size={23} strokeWidth={1.5}/> : <Menu size={23} strokeWidth={1.5}/>}
        </button>
        <a href="#top" className={s.logo} onClick={closeMenu} aria-label="Cecilia's home">
          Cecilia&apos;s<span>Natural beauty</span>
        </a>
        <nav className={s.navLinks} aria-label="Main navigation">
          <a href="#shop">Shop bestsellers</a>
          <a href="#collections">Collections</a>
          <a href="#ritual">The ritual</a>
          <a href="#story">Our story</a>
          <a href="#journal">Journal</a>
        </nav>
        <div className={s.navActions}>
          <button className={s.iconButton} onClick={() => setSearchOpen(true)} aria-label="Search products"><Search size={21} strokeWidth={1.6} /></button>
          <button className={s.iconButton} onClick={() => setCartOpen(true)} aria-label={"Open demo bag with " + cartCount + " items"}>
            <ShoppingBag size={21} strokeWidth={1.6} />
            {cartCount > 0 && <span className={s.bagNumber}>{cartCount}</span>}
          </button>
        </div>
        {mobileMenu && <nav className={s.mobileMenu} aria-label="Mobile navigation">
          <a href="#shop" onClick={closeMenu}>Shop bestsellers</a>
          <a href="#collections" onClick={closeMenu}>Collections</a>
          <a href="#ritual" onClick={closeMenu}>The ritual</a>
          <a href="#story" onClick={closeMenu}>Our story</a>
          <a href="#journal" onClick={closeMenu}>Journal</a>
          <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Visit live store ↗</a>
        </nav>}
      </header>

      <section className={s.hero} id="top" aria-labelledby="hero-title">
        <div className={s.heroCopy}>
          <span className={s.eyebrow}>Nature in its finest form · Est. 1990</span>
          <h1 id="hero-title" className={s.serif}>The art of <em>natural beauty.</em></h1>
          <p>Botanical skincare made with intention. Discover decades of formulation expertise, beautifully considered ingredients, and the simple joy of feeling good in your skin.</p>
          <div className={s.heroButtons}>
            <a href="#shop" className={s.buttonDark}>Explore the collection <ArrowRight size={16}/></a>
            <button className={s.buttonOutline} onClick={() => {setQuizResult(false);setQuizOpen(true);}}>Find your ritual <Sparkles size={15}/></button>
          </div>
        </div>
        <div className={s.heroVisual} role="img" aria-label="Natural botanical beauty editorial photography">
          <div className={s.heroSeal}>Above pure<br/>beyond natural</div>
          <div className={s.heroIndex}>Rooted in nature. Made with care.</div>
        </div>
      </section>

      <div className={s.microStrip} aria-label="Our commitments">
        <div className={s.microItem}><Leaf size={21} strokeWidth={1.25}/> Botanically inspired</div>
        <div className={s.microItem}><Flower2 size={21} strokeWidth={1.25}/> Purposeful ingredients</div>
        <div className={s.microItem}><Heart size={20} strokeWidth={1.25}/> Founder formulated</div>
        <div className={s.microItem}><Sprout size={21} strokeWidth={1.25}/> Since 1990</div>
      </div>

      <section className={s.section} id="shop">
        <div className={s.sectionHead}>
          <div>
            <span className={s.eyebrow}>The essentials edit</span>
            <h2 className={s.serif}>Meet your new<br/><em>everyday favorites.</em></h2>
          </div>
          <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer" className={s.textLink}>Explore all products <ArrowUpRight size={16}/></a>
        </div>
        <div className={s.productsGrid}>
          {products.map(p => <ProductCard key={p.id} product={p} onAdd={addToBag}/>)}
        </div>
        <p className={s.underNote}>Packaging shown is concept artwork; product names and listed base prices reflect the existing store.</p>
      </section>

      <section className={s.categorySection} id="collections">
        <div className={s.centerHead}>
          <span className={s.eyebrow}>Discover by category</span>
          <h2 className={s.serif}>A little more nature,<br/><em>every day.</em></h2>
          <p>From your morning skincare ritual to a moment of calm, find what makes you feel your best.</p>
        </div>
        <div className={s.categoryGrid}>
          <a href="#shop" className={[s.categoryTile, s.skin].join(" ")}>
            <div className={s.categoryTileContent}><div><span>01 / Glow naturally</span><h3>Face & skincare</h3></div><span className={s.roundArrow}><ArrowUpRight size={19}/></span></div>
          </a>
          <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer" className={[s.categoryTile, s.oils].join(" ")}>
            <div className={s.categoryTileContent}><div><span>02 / The botanical world</span><h3>Essential oils</h3></div><span className={s.roundArrow}><ArrowUpRight size={19}/></span></div>
          </a>
          <a href="#shop" className={[s.categoryTile, s.body].join(" ")}>
            <div className={s.categoryTileContent}><div><span>03 / Daily nourishment</span><h3>Body & bath</h3></div><span className={s.roundArrow}><ArrowUpRight size={19}/></span></div>
          </a>
        </div>
      </section>

      <section className={s.story} id="story">
        <div className={s.storyArt}>
          <div className={s.storyFrame}><span className={s.serif}>CS</span><small>Founder. Formulator. Educator.</small></div>
        </div>
        <div className={s.storyCopy}>
          <span className={s.eyebrow}>The woman behind the formulations</span>
          <h2 className={s.serif}>A lifetime of<br/><em>knowing nature.</em></h2>
          <p>For Cecilia Salvesen, natural beauty is more than a trend. Her journey began in South Africa, where she established a natural health and beauty clinic in 1990 and went on to teach and write about aromatherapy and holistic wellbeing.</p>
          <p>That same curiosity and thoughtful approach to ingredients lives in the products she makes today.</p>
          <div className={s.storyPoints}>
            <div><strong>1990</strong><span>Journey begins</span></div>
            <div><strong>3</strong><span>Books authored</span></div>
          </div>
          <a href={STORE + "/pages/about-cecilia"} target="_blank" rel="noopener noreferrer" className={s.textLink}>Get to know Cecilia <ArrowUpRight size={16}/></a>
        </div>
      </section>

      <section className={[s.section, s.ritual].join(" ")} id="ritual">
        <div className={s.ritualImage}>
          <div className={s.ritualFloating}>
            <span>Simple looks good on you</span>
            <strong>Beautiful skin starts with a thoughtful routine.</strong>
          </div>
        </div>
        <div className={s.ritualCopy}>
          <span className={s.eyebrow}>A little ritual, a lot of care</span>
          <h2 className={s.serif}>The beauty of<br/><em>keeping it simple.</em></h2>
          <p>Make space for a few mindful minutes. A gentle daily routine can be just as beautiful as the products on your shelf.</p>
          <div className={s.ritualSteps}>
            <div className={s.ritualStep}><b>01</b><div><strong>Cleanse</strong><p>Start fresh. Gently remove the day and prepare your skin.</p></div></div>
            <div className={s.ritualStep}><b>02</b><div><strong>Moisturize</strong><p>Bring softness and hydration back to your skin.</p></div></div>
            <div className={s.ritualStep}><b>03</b><div><strong>Finish with a serum</strong><p>Add a few drops of botanical care to complete your routine.</p></div></div>
          </div>
          <button className={s.buttonDark} onClick={() => {setQuizResult(false);setQuizOpen(true);}}>Build my ritual <ArrowRight size={16}/></button>
        </div>
      </section>

      <section className={s.quoteBand}>
        <span>Cecilia&apos;s formulation philosophy</span>
        <blockquote>“Every ingredient is chosen with purpose. Every blend is crafted with care.”</blockquote>
        <p>Above pure & beyond natural · Since 1990</p>
      </section>

      <section className={s.journal} id="journal">
        <div className={s.journalCopy}>
          <span className={s.eyebrow}>The botanical journal</span>
          <h2 className={s.serif}>A beautiful mind.<br/><em>A natural curiosity.</em></h2>
          <p>Go beyond the jar. Explore the thinking, ingredients, and years of knowledge behind Cecilia&apos;s approach to natural beauty.</p>
          <a href={STORE + "/pages/cecilias-formulation-philosophy"} target="_blank" rel="noopener noreferrer" className={s.textLink}>Explore the philosophy <ArrowUpRight size={16}/></a>
        </div>
        <div className={s.journalPhoto} aria-label="Botanical beauty and aromatic ingredients" role="img"/>
      </section>

      <footer className={s.footer}>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <div className={s.footerLogo}>Cecilia&apos;s<span>Natural beauty</span></div>
            <p>A thoughtful approach to skincare, inspired by nature and grounded in decades of hands-on formulation experience.</p>
          </div>
          <div><h4>Discover</h4><a href="#shop">Bestsellers</a><a href="#collections">Collections</a><a href="#ritual">Your routine</a><a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer">Shop all ↗</a></div>
          <div><h4>Our world</h4><a href="#story">Meet Cecilia</a><a href={STORE + "/pages/cecilias-formulation-philosophy"} target="_blank" rel="noopener noreferrer">Our philosophy ↗</a><a href="#journal">Journal</a><a href={STORE} target="_blank" rel="noopener noreferrer">Live store ↗</a></div>
          <div><h4>Stay inspired</h4><p>New rituals, botanical notes, and the wisdom of thoughtful care.</p><a href={STORE} target="_blank" rel="noopener noreferrer" className={s.textLink}>Visit the live store <ArrowUpRight size={15}/></a></div>
        </div>
        <div className={s.footerBottom}>
          <span>© 2026 Cecilia&apos;s Products · Concept storefront presentation</span>
          <span>Not a live checkout. Product packaging is illustrative. All purchases take place on Cecilia&apos;s existing Shopify store.</span>
        </div>
      </footer>

      <div className={s.demoTag}>✦ Interactive storefront concept · Preview only</div>

      {cartOpen && <div className={s.overlay} role="presentation" onMouseDown={() => setCartOpen(false)}>
        <aside className={s.drawer} role="dialog" aria-modal="true" aria-label="Your demo shopping bag" onMouseDown={e => e.stopPropagation()}>
          <div className={s.drawerHeader}><h2>Your bag <span style={{fontSize:15,opacity:.6}}>({cartCount})</span></h2><button onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={20}/></button></div>
          {cartCount === 0 ? <div className={s.emptyCart}><ShoppingBag size={39} strokeWidth={1.1}/><strong>Your bag is feeling a little light.</strong><p>Discover your new botanical essentials.</p><button className={s.buttonDark} onClick={() => setCartOpen(false)}>Continue exploring <ArrowRight size={16}/></button></div> : <>
            {products.filter(p => !!cart[p.id]).map(p => <div className={s.cartItem} key={p.id}>
              <div className={s.cartThumb}><Packshot product={p}/></div>
              <div className={s.cartDetails}><strong>{p.name}</strong><p>{currency(p.price)} USD</p>
                <div className={s.qty}><button aria-label={"Remove one " + p.name} onClick={() => changeQty(p.id,-1)}><Minus size={13}/></button><span>{cart[p.id]}</span><button aria-label={"Add one " + p.name} onClick={() => changeQty(p.id,1)}><Plus size={13}/></button></div>
              </div>
              <strong>{currency(p.price * cart[p.id])}</strong>
            </div>)}
            <div className={s.cartFooter}>
              <p>{cartTotal >= 100 ? "You have reached the live store's $100 free-shipping threshold (US)." : currency(Math.max(0,100-cartTotal)) + " away from the live store's $100 US free-shipping threshold."}</p>
              <div className={s.shippingBar}><span style={{width: Math.min(cartTotal,100) + "%"}}/></div>
              <div className={s.subtotal}><strong>Demo subtotal</strong><strong>{currency(cartTotal)} USD</strong></div>
              <p>This is a demonstration bag; it does not sync to Shopify. To purchase, open each product on Cecilia&apos;s live store:</p>
              <div className={s.cartLinks}>{products.filter(p => !!cart[p.id]).map(p => <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">{p.name} <ArrowUpRight size={14}/></a>)}</div>
              <a href={STORE + "/collections/all"} target="_blank" rel="noopener noreferrer" className={s.buttonDark} style={{width:"100%"}}>Continue on live store <ArrowUpRight size={16}/></a>
            </div>
          </>}
        </aside>
      </div>}

      {quizOpen && <div className={s.modalWrap} onMouseDown={() => setQuizOpen(false)}>
        <div className={s.quizModal} role="dialog" aria-modal="true" aria-label="Find your botanical skincare ritual" onMouseDown={e => e.stopPropagation()}>
          <button className={s.modalClose} onClick={() => setQuizOpen(false)} aria-label="Close routine finder"><X size={20}/></button>
          <span className={s.eyebrow}>Cecilia&apos;s ritual finder</span>
          <h2>Find your kind of <em>natural beauty.</em></h2>
          {!quizResult ? <>
            <p>What are you looking for in your everyday care? Choose the starting point that feels like you.</p>
            <div className={s.choiceGrid}>
              {[
                {id:"daily",name:"A simple daily routine"},
                {id:"glow",name:"A little extra glow"},
                {id:"sensitive",name:"Gentle, mindful care"},
                {id:"body",name:"Body-first nourishment"}
              ].map(x => <button key={x.id} className={[s.choice,goal===x.id?s.selected:""].join(" ")} onClick={() => setGoal(x.id)}>{x.name}{goal===x.id?<Check size={19}/>:<ChevronRight size={18}/>}</button>)}
            </div>
            <button className={s.buttonDark} style={{width:"100%"}} onClick={() => setQuizResult(true)}>See my suggested ritual <ArrowRight size={16}/></button>
          </> : <>
            <p>Here&apos;s a beautifully simple place to begin. These are product discovery suggestions, not personalized skincare or medical advice.</p>
            <div className={s.resultBox}>
              <span className={s.eyebrow}>Your botanical edit</span>
              <h3>{goal === "body" ? "Everyday comfort" : goal === "glow" ? "A radiant daily ritual" : goal === "sensitive" ? "A mindful daily ritual" : "The everyday essentials"}</h3>
              <p>Keep it uncomplicated: start with gentle cleansing, follow with moisturizer, and finish with a serum where appropriate. Review ingredients and patch test before use.</p>
              <div className={s.resultProducts}>{chosen.map(p => <span key={p.id}>{p.name} · {p.priceLabel}</span>)}</div>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button className={s.buttonDark} onClick={() => {chosen.forEach(p => addToBag(p.id));}}>Add both to demo bag <Plus size={15}/></button>
              <button className={s.buttonOutline} onClick={() => setQuizResult(false)}>Try another goal</button>
            </div>
          </>}
        </div>
      </div>}

      {searchOpen && <div className={s.searchLayer} role="dialog" aria-modal="true" aria-label="Search Cecilia's products">
        <div className={s.searchInner}>
          <div className={s.searchHeader}><span className={s.eyebrow}>Find your favorites</span><button className={s.iconButton} onClick={() => {setSearchOpen(false);setQuery("");}} aria-label="Close search"><X size={23}/></button></div>
          <h2>What are you looking for?</h2>
          <div className={s.searchInputWrap}><Search size={24} strokeWidth={1.4}/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search skincare, serums, body care..." aria-label="Search featured products"/></div>
          <div className={s.searchResults}>
            {(query ? filtered : products).map(p => <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"><span>{p.name} <small> · {p.group}</small></span><ArrowUpRight size={18}/></a>)}
            {query && filtered.length===0 && <p>No matches in our featured edit. <a href={STORE + "/search?q=" + encodeURIComponent(query)} target="_blank" rel="noopener noreferrer">Search the full live store ↗</a></p>}
          </div>
        </div>
      </div>}
    </main>
  );
}

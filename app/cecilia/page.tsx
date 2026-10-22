
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight,
  Droplets, Flower2, Gift, Heart, Leaf, Menu, Minus, Package,
  Plus, RefreshCcw, Search, ShoppingBag, Sparkles, Sun, X
} from "lucide-react";
import s from "./cecilia.module.css";

const STORE = "https://ceciliasproducts.com";
const productData = [
  {id:"moisturizer",name:"Day & Night Moisturizer",price:29,benefit:"Daily moisture & softness",small:"Cecilia's signature since 1990",url:STORE+"/products/prod12",tag:"Cecilia's signature"},
  {id:"emerald",name:"Emerald Jade Serum",price:20,benefit:"A botanical finishing touch",small:"With raspberry seed oil",url:STORE+"/products/prod19",tag:"Plant-based favorite"},
  {id:"blu",name:"Blu Jade Serum",price:20,benefit:"A nourished-looking glow",small:"With emu oil and essential oils",url:STORE+"/products/prod6",tag:""},
  {id:"lotion",name:"Hand & Body Lotions",price:22,benefit:"Everyday body softness",small:"Multiple scents & fragrance-free",url:STORE+"/products/prod30",tag:""}
] as const;

type ProductId = typeof productData[number]["id"];
type NeedKey = "dry"|"glow"|"simple"|"body";
const needs: Array<{id:NeedKey;label:string;sub:string;product:ProductId;details:string;icon:typeof Droplets}> = [
  {id:"dry",label:"Dry-feeling skin",sub:"Comfort, softness, daily moisture",product:"moisturizer",details:"Start with Cecilia's day-and-night moisturizer, then layer a serum if you enjoy an extra finishing step.",icon:Droplets},
  {id:"glow",label:"A radiant-looking finish",sub:"A little glow, a little ritual",product:"emerald",details:"Give your skincare routine a botanical finishing touch with raspberry seed oil and carefully blended essential oils.",icon:Sparkles},
  {id:"simple",label:"An easier routine",sub:"Less complicated, more enjoyable",product:"moisturizer",details:"One thoughtful everyday moisturizer can be a beautiful starting point. Build a routine only as you need it.",icon:Sun},
  {id:"body",label:"Body care & comfort",sub:"A soft spot for daily self-care",product:"lotion",details:"Choose an everyday hand-and-body lotion in a scent you enjoy, or pick the fragrance-free option.",icon:Heart}
];
const imageScenes = {
  hero: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1700&q=85",
  botanical: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1100&q=85",
  skin: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=85",
  ritual: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=85",
  texture: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85"
};
const USD = (v:number) => "$"+v.toFixed(2);

function ImageWithFallback({src,alt,className,backup,loading="lazy"}:{src:string;alt:string;className?:string;backup?:string;loading?:"lazy"|"eager"}) {
  const [imageSrc,setImageSrc]=useState(src);
  return <img className={className} src={imageSrc} alt={alt} loading={loading}
    onError={() => { if(backup&&imageSrc!==backup) setImageSrc(backup); }} />;
}
function ProductVisual({id,images}:{id:ProductId;images:Record<string,string>}) {
  const p=productData.find(p=>p.id===id)!;
  const [broken,setBroken]=useState(false);
  useEffect(()=>setBroken(false),[images,id]);
  return <div className={s.productImage}>
    {images[id]&&!broken ? <img src={images[id]} alt={p.name} loading="lazy" onError={()=>setBroken(true)}/> :
      <div className={s.photoPlaceholder}>
        <Flower2 size={34} strokeWidth={1}/>
        <span>Cecilia&apos;s</span><small>{p.name}</small>
      </div>}
  </div>;
}

export default function CeciliaHome() {
  const [mobile,setMobile]=useState(false);
  const [search,setSearch]=useState(false);
  const [searchTerm,setSearchTerm]=useState("");
  const [need,setNeed]=useState<NeedKey>("dry");
  const [images,setImages]=useState<Record<string,string>>({});
  const [clubTab,setClubTab]=useState<"refill"|"box">("refill");
  const [frequency,setFrequency]=useState<"monthly"|"bimonthly"|"seasonal">("bimonthly");
  const [clubOpen,setClubOpen]=useState(false);
  const [bagOpen,setBagOpen]=useState(false);
  const [bag,setBag]=useState<Record<string,number>>({});
  const [routineSerum,setRoutineSerum]=useState<ProductId>("emerald");
  const [routineExpanded,setRoutineExpanded]=useState(false);
  const selection=needs.find(x=>x.id===need)!;
  const selectedProduct=productData.find(x=>x.id===selection.product)!;
  const bagCount=Object.values(bag).reduce((x,y)=>x+y,0);
  const bagTotal=productData.reduce((sum,p)=>sum+(bag[p.id]||0)*p.price,0);
  const filtered=productData.filter(p=>(p.name+" "+p.benefit+" "+p.small).toLowerCase().includes(searchTerm.toLowerCase()));
  const routineProducts=useMemo(()=>[productData[0],productData.find(p=>p.id===routineSerum)!],[routineSerum]);
  const routineTotal=routineProducts.reduce((sum,p)=>sum+p.price,0);

  useEffect(()=>{
    let active=true;
    fetch("/cecilia/api/products")
      .then(r=>r.ok?r.json():Promise.reject())
      .then((d:{products?:{key:string;image:string|null}[]})=>{
        if(!active)return;
        const mapped:Record<string,string>={};
        (d.products||[]).forEach(p=>{
          if(p.image&&/^https?:\/\//.test(p.image))mapped[p.key]=p.image;
        });
        setImages(mapped);
      }).catch(()=>{});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(!search&&!bagOpen&&!clubOpen)return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setSearch(false);setBagOpen(false);setClubOpen(false);}};
    document.addEventListener("keydown",onKey);
    return ()=>document.removeEventListener("keydown",onKey);
  },[search,bagOpen,clubOpen]);

  const add=(ids:ProductId[])=>{
    setBag(cur=>{
      const next={...cur};
      ids.forEach(id=>next[id]=(next[id]||0)+1);
      return next;
    });
    setBagOpen(true);
  };
  const change=(id:string,delta:number)=>{
    setBag(cur=>{
      const next={...cur};
      next[id]=Math.max(0,(next[id]||0)+delta);
      if(!next[id])delete next[id];
      return next;
    });
  };
  const jump=(hash:string)=>{
    setMobile(false);
    document.querySelector(hash)?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  return <main className={s.site} id="top">
    <div className={s.promo}>ABOVE PURE. BEYOND NATURAL. <span/> BOTANICAL BEAUTY SINCE 1990 <span/> FREE US SHIPPING OVER $100 AT THE LIVE STORE</div>
    <header className={s.header}>
      <a className={s.wordmark} href="#top" onClick={()=>setMobile(false)} aria-label="Cecilia's Products home">Cecilia&apos;s <small>NATURAL HEALTH &amp; BEAUTY</small></a>
      <nav className={s.desktopNav} aria-label="Primary">
        <a href="#shop">Shop favorites</a>
        <a href="#needs">Shop by need</a>
        <a href="#ritual">Routines &amp; sets</a>
        <a href="#club">The Ritual Club</a>
        <a href="#story">Our story</a>
      </nav>
      <div className={s.headerTools}>
        <button type="button" className={s.iconButton} aria-label="Search featured products" onClick={()=>setSearch(true)}><Search size={20} strokeWidth={1.5}/></button>
        <button type="button" className={s.iconButton} aria-label={"Open demo bag with "+bagCount+" items"} onClick={()=>setBagOpen(true)}>
          <ShoppingBag size={20} strokeWidth={1.5}/>{bagCount>0&&<span className={s.count}>{bagCount}</span>}
        </button>
        <button type="button" className={[s.iconButton,s.mobileToggle].join(" ")} aria-label="Toggle navigation" aria-expanded={mobile} onClick={()=>setMobile(!mobile)}>{mobile?<X size={21}/>:<Menu size={21}/>}</button>
      </div>
      {mobile&&<nav className={s.mobileNav} aria-label="Mobile navigation">
        {[
          ["Shop favorites","#shop"],["Shop by need","#needs"],["Routines & sets","#ritual"],["The Ritual Club","#club"],["Our story","#story"]
        ].map(([label,to])=><a key={to} href={to} onClick={()=>setMobile(false)}>{label}</a>)}
        <a href={STORE+"/collections/all"} target="_blank" rel="noopener noreferrer">Visit the live store ↗</a>
      </nav>}
    </header>
    <section className={s.hero} aria-labelledby="hero-heading">
      <div className={s.heroCopy}>
        <span className={s.eyebrow}>FOUNDER-FORMULATED BOTANICAL SKINCARE</span>
        <h1 id="hero-heading" className={s.serif}>Beautiful skin.<br/><em>Beautifully</em><br/>considered.</h1>
        <p>That soft, nourished, feel-good-in-your-skin feeling. Discover natural skincare made with purposeful botanicals and more than 35 years of formulation experience.</p>
        <div className={s.heroButtons}>
          <a className={s.primary} href="#shop">Discover Cecilia&apos;s <ArrowRight size={16}/></a>
          <a className={s.textLink} href="#needs">Shop by what your skin needs <ArrowUpRight size={15}/></a>
        </div>
        <div className={s.heroTrust}><span className={s.heroLine}/><strong>EST. 1990</strong><span>Inspired by nature. Made with experience.</span></div>
      </div>
      <div className={s.heroVisual}>
        <ImageWithFallback src={imageScenes.hero} backup={imageScenes.botanical} alt="Editorial natural skincare still life in soft warm light" loading="eager"/>
        <div className={s.heroVisualBadge}>THE ART OF<br/><i>NATURAL BEAUTY</i></div>
      </div>
    </section>

    <section className={s.promiseStrip} aria-label="What makes Cecilia's special">
      <div><Leaf size={24} strokeWidth={1.3}/><span>Purposeful botanicals</span></div>
      <div><Heart size={23} strokeWidth={1.3}/><span>Formulated by Cecilia</span></div>
      <div><Sun size={23} strokeWidth={1.3}/><span>Over 35 years of know-how</span></div>
      <div><Gift size={23} strokeWidth={1.3}/><span>Everyday rituals worth keeping</span></div>
    </section>

    <section className={s.containerSection} id="needs">
      <div className={s.sectionIntro}>
        <div><span className={s.eyebrow}>PERSONAL CARE, MADE PERSONAL</span><h2 className={s.serif}>Find the care that<br/><em>feels right for you.</em></h2></div>
        <p>Start with how you want to feel—soft, radiant, comfortably cared for. We&apos;ll help you find an uncomplicated place to begin.</p>
      </div>
      <div className={s.needArea}>
        <div className={s.needGrid}>
          {needs.map(item=>{
            const Icon=item.icon;
            return <button key={item.id} type="button" className={[s.needButton,need===item.id?s.needActive:""].join(" ")} onClick={()=>setNeed(item.id)} aria-pressed={need===item.id}>
              <span className={s.needIcon}><Icon size={20} strokeWidth={1.4}/></span>
              <span className={s.needLabels}><strong>{item.label}</strong><small>{item.sub}</small></span>
              <ArrowRight size={17} className={s.needArrow}/>
            </button>;
          })}
        </div>
        <div className={s.needFeature} aria-live="polite">
          <div className={s.needFeatureVisual}><ProductVisual id={selectedProduct.id} images={images}/></div>
          <div className={s.needFeatureCopy}>
            <span className={s.tinyEyebrow}>CECILIA&apos;S PICK FOR YOU</span>
            <h3 className={s.serif}>{selectedProduct.name}</h3>
            <p>{selection.details}</p>
            <div className={s.featureMeta}><span>{USD(selectedProduct.price)} USD</span><span>{selectedProduct.small}</span></div>
            <a className={s.textLink} href={selectedProduct.url} target="_blank" rel="noopener noreferrer">See product details <ArrowUpRight size={15}/></a>
          </div>
        </div>
      </div>
    </section>

    <section className={s.shopSection} id="shop">
      <div className={s.sectionIntro}>
        <div><span className={s.eyebrow}>A FEW VERY GOOD THINGS</span><h2 className={s.serif}>Cecilia&apos;s <em>favorites.</em></h2></div>
        <a className={s.textLink} href={STORE+"/collections/all"} target="_blank" rel="noopener noreferrer">Shop the full collection <ArrowUpRight size={15}/></a>
      </div>
      <div className={s.productGrid}>
        {productData.map(p=><article className={s.productCard} key={p.id}>
          <div className={s.productMedia}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={"View "+p.name}>
              <ProductVisual id={p.id} images={images}/>
            </a>
            {p.tag&&<span className={s.productFlag}>{p.tag}</span>}
          </div>
          <div className={s.productContent}>
            <span>{p.benefit}</span>
            <a className={s.productName} href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a>
            <div className={s.productFooter}><strong>{USD(p.price)} USD</strong><button type="button" onClick={()=>add([p.id])} aria-label={"Add "+p.name+" to concept bag"}><Plus size={17}/></button></div>
          </div>
        </article>)}
      </div>
      <p className={s.microcopy}>Actual Cecilia&apos;s product photos are displayed from the live Shopify catalog where available. The concept bag is not connected to checkout.</p>
    </section>

    <section className={s.editorialRow} id="ritual">
      <div className={s.editorialPhoto}>
        <ImageWithFallback src={imageScenes.ritual} backup={imageScenes.skin} alt="Warm editorial skincare products and daily ritual" />
        <span>Everyday care, elevated.</span>
      </div>
      <div className={s.editorialText}>
        <span className={s.eyebrow}>THE BEAUTY OF A SIMPLE ROUTINE</span>
        <h2 className={s.serif}>Make a little time<br/>for <em>yourself.</em></h2>
        <p>Think of skincare as a moment you look forward to, not a long list to get through. A signature moisturizer. A finishing serum. A few minutes that are entirely yours.</p>
        <div className={s.ritualSteps}>
          <div><b>01</b><span>Cleanse</span><small>Begin with fresh, clean skin.</small></div>
          <div><b>02</b><span>Moisturize</span><small>Comfort and everyday softness.</small></div>
          <div><b>03</b><span>Finish</span><small>Complete your ritual with a serum.</small></div>
        </div>
        <button type="button" className={s.primary} onClick={()=>setRoutineExpanded(!routineExpanded)} aria-expanded={routineExpanded}>Build a simple ritual {routineExpanded?<Minus size={17}/>:<ArrowRight size={17}/>}</button>
      </div>
    </section>
    {routineExpanded&&<section className={s.routineBuilder} aria-label="Build a simple routine">
      <div>
        <span className={s.eyebrow}>YOUR EVERYDAY EDIT</span>
        <h3 className={s.serif}>Two thoughtful essentials.</h3>
        <p>Pair Cecilia&apos;s signature daily moisturizer with the finishing serum that fits your preferences. The wash or cleanser is chosen separately.</p>
      </div>
      <div className={s.routineControls}>
        <div className={s.routineChoice}>Choose your serum: <button className={routineSerum==="emerald"?s.selectedChoice:""} onClick={()=>setRoutineSerum("emerald")}>Plant-based Emerald Jade</button><button className={routineSerum==="blu"?s.selectedChoice:""} onClick={()=>setRoutineSerum("blu")}>Blu Jade with emu oil</button></div>
        <div className={s.routineBottom}><span>{routineProducts.map(p=>p.name).join(" + ")}<strong>{USD(routineTotal)} USD · Product total</strong></span><button className={s.primary} onClick={()=>add(["moisturizer",routineSerum])}>Add to concept bag <Plus size={16}/></button></div>
      </div>
    </section>}

    <section className={s.club} id="club">
      <div className={s.clubTop}>
        <div><span className={s.eyebrow}>INTRODUCING A NEW IDEA · COMING SOON</span><h2 className={s.serif}>The Cecilia <em>Ritual Club.</em></h2><p>Your favorite daily essentials, made easier to keep close. Or a beautifully curated discovery box to look forward to.</p></div>
        <span className={s.clubMonogram}>C<span>✦</span></span>
      </div>
      <div className={s.clubTabs} role="tablist" aria-label="Ritual Club concepts">
        <button role="tab" aria-selected={clubTab==="refill"} className={clubTab==="refill"?s.clubTabActive:""} onClick={()=>setClubTab("refill")}><RefreshCcw size={16}/> Your everyday refills</button>
        <button role="tab" aria-selected={clubTab==="box"} className={clubTab==="box"?s.clubTabActive:""} onClick={()=>setClubTab("box")}><Package size={16}/> The discovery box</button>
      </div>
      <div className={s.clubContent} role="tabpanel">
        <div>
          <span className={s.tinyEyebrow}>{clubTab==="refill"?"THE ESSENTIALS, ALWAYS ON HAND":"A LITTLE SOMETHING TO LOOK FORWARD TO"}</span>
          <h3 className={s.serif}>{clubTab==="refill"?"A better kind of recurring order.":"A thoughtful box of botanical care."}</h3>
          <p>{clubTab==="refill"?"Choose the everyday products you love, then select how often you’d like them replenished. Flexible refills help turn good skincare into an easy habit.":"Imagine a beautifully packed selection of Cecilia’s botanical favorites, curated for exploration, gifting, and enjoying a new ritual. Packaging and final contents are still being designed."}</p>
          <div className={s.clubPoints}>
            {(clubTab==="refill"?["Choose the products you already enjoy","Pick a convenient delivery rhythm","Skip or pause when you need to"]:["A considered selection of Cecilia’s products","A lovely treat for yourself or as a gift","Seasonal themes and discovery moments"]).map(x=><span key={x}><Check size={15}/>{x}</span>)}
          </div>
          <button className={s.clubButton} type="button" onClick={()=>setClubOpen(true)}>Explore the membership concept <ArrowUpRight size={17}/></button>
          <small className={s.clubDisclaimer}>Preview concept only. Subscriptions, pricing, savings, and fulfilment are not yet available.</small>
        </div>
        <div className={s.clubImagery}>
          <ImageWithFallback src={imageScenes.botanical} backup={imageScenes.texture} alt="Botanical essential oils and skincare arrangement"/>
          <div className={s.clubImageLabel}><strong>RITUALS</strong><span>worth keeping.</span></div>
        </div>
      </div>
    </section>

    <section className={s.story} id="story">
      <div className={s.storyLeft}>
        <span className={s.eyebrow}>THE WOMAN BEHIND THE FORMULATIONS</span>
        <h2 className={s.serif}>Not a trend.<br/><em>A lifetime of care.</em></h2>
        <p>Long before botanical skincare became a buzzword, Cecilia Salvesen was exploring the art of natural formulation. She established her first natural health and beauty clinic in South Africa in 1990 and has spent decades teaching, writing, and making products with purpose.</p>
        <div className={s.storyFact}><strong>Since 1990</strong><span>Founder-formulated with experience, knowledge and intention.</span></div>
        <a href={STORE+"/pages/about-cecilia"} target="_blank" rel="noopener noreferrer" className={s.textLink}>Meet Cecilia and her story <ArrowUpRight size={16}/></a>
      </div>
      <div className={s.storyRight}>
        <div className={s.storyMark}>CS</div>
        <div className={s.storyFrame}>Nature. Knowledge.<br/><em>Care.</em></div>
        <p>Authentic founder photography to be added here.</p>
      </div>
    </section>

    <section className={s.lastCall}>
      <span className={s.eyebrow}>ABOVE PURE. BEYOND NATURAL.</span>
      <h2 className={s.serif}>Find your everyday <em>feel-good.</em></h2>
      <a href={STORE+"/collections/all"} className={s.primary} target="_blank" rel="noopener noreferrer">Explore the collection <ArrowUpRight size={16}/></a>
    </section>

    <footer className={s.footer}>
      <div className={s.footerColumns}>
        <div><div className={s.footerLogo}>Cecilia&apos;s <small>NATURAL HEALTH &amp; BEAUTY</small></div><p>Botanical formulations, a founder&apos;s experience, and the simple pleasure of feeling good in your skin.</p></div>
        <div><h4>SHOP</h4><a href="#shop">Customer favorites</a><a href="#needs">Shop by need</a><a href="#ritual">The daily ritual</a><a href={STORE+"/collections/all"} target="_blank" rel="noopener noreferrer">All products ↗</a></div>
        <div><h4>DISCOVER</h4><a href="#club">The Ritual Club concept</a><a href="#story">Meet Cecilia</a><a href={STORE+"/pages/cecilias-formulation-philosophy"} target="_blank" rel="noopener noreferrer">Our philosophy ↗</a></div>
        <div><h4>SHOP WITH CONFIDENCE</h4><p>Purchases are handled by Cecilia&apos;s original Shopify store. Please review ingredients and use instructions on each product listing.</p></div>
      </div>
      <div className={s.footerBottom}><span>© 2026 Cecilia&apos;s Products · Brand & storefront concept by BRHT</span><span>Preview only · Product recommendations are general · No subscription service is active</span></div>
    </footer>

    <div className={s.demoPill}>✦ Cecilia&apos;s · Interactive design preview</div>

    {search&&<div className={s.searchOverlay} role="dialog" aria-modal="true" aria-label="Search featured products">
      <div className={s.searchContent}>
        <button aria-label="Close search" className={s.close} onClick={()=>{setSearch(false);setSearchTerm("");}}><X size={21}/></button>
        <span className={s.eyebrow}>FIND SOMETHING WONDERFUL</span><h2 className={s.serif}>What can we help you find?</h2>
        <div className={s.searchInput}><Search size={22}/><input autoFocus value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Try moisturizer, serum, body care…" aria-label="Search Cecilia's featured products"/></div>
        <div className={s.searchResults}>{filtered.map(p=><a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"><span>{p.name}<small>{p.benefit}</small></span><ArrowUpRight size={17}/></a>)}
        {!filtered.length&&<div className={s.noResults}>No featured products match. <a href={STORE+"/search?q="+encodeURIComponent(searchTerm)} target="_blank" rel="noopener noreferrer">Search the full Shopify store ↗</a></div>}</div>
      </div>
    </div>}

    {bagOpen&&<div className={s.drawerOverlay} onMouseDown={()=>setBagOpen(false)}>
      <aside className={s.drawer} role="dialog" aria-modal="true" aria-label="Concept shopping bag" onMouseDown={e=>e.stopPropagation()}>
        <div className={s.drawerHead}><h2 className={s.serif}>Your little bag <small>({bagCount})</small></h2><button className={s.close} aria-label="Close bag" onClick={()=>setBagOpen(false)}><X size={22}/></button></div>
        {!bagCount?<div className={s.bagEmpty}><ShoppingBag size={43} strokeWidth={1.1}/><h3 className={s.serif}>Something lovely belongs here.</h3><p>Explore Cecilia&apos;s botanical favorites and build your ritual.</p><button className={s.primary} onClick={()=>{setBagOpen(false);jump("#shop");}}>Explore products <ArrowRight size={16}/></button></div>:<>
          {productData.filter(p=>bag[p.id]).map(p=><div className={s.bagItem} key={p.id}>
            <div className={s.bagThumb}><ProductVisual id={p.id} images={images}/></div>
            <div className={s.bagItemBody}><h3>{p.name}</h3><small>{USD(p.price)} USD</small><div className={s.quantity}><button onClick={()=>change(p.id,-1)} aria-label={"Decrease "+p.name}><Minus size={14}/></button><span>{bag[p.id]}</span><button onClick={()=>change(p.id,1)} aria-label={"Increase "+p.name}><Plus size={14}/></button></div></div>
            <b>{USD(p.price*(bag[p.id]||0))}</b>
          </div>)}
          <div className={s.bagSummary}><p>{bagTotal>=100?"Your items meet the current $100 US free-shipping threshold.":USD(Math.max(0,100-bagTotal))+" away from the live store's $100 US free-shipping threshold."}</p><div className={s.progress}><span style={{width:Math.min(bagTotal,100)+"%"}}/></div><div className={s.total}><span>Demo subtotal</span><strong>{USD(bagTotal)} USD</strong></div><p>These selections are for the concept only. Open each product on Cecilia&apos;s live store to make a purchase.</p><div className={s.bagLinks}>{productData.filter(p=>bag[p.id]).map(p=><a href={p.url} target="_blank" rel="noopener noreferrer" key={p.id}>{p.name}<ArrowUpRight size={14}/></a>)}</div><a className={s.primary} href={STORE+"/collections/all"} target="_blank" rel="noopener noreferrer">Continue on the live store <ArrowUpRight size={16}/></a></div>
        </>}
      </aside>
    </div>}

    {clubOpen&&<div className={s.modalBackdrop} onMouseDown={()=>setClubOpen(false)}>
      <div className={s.modal} role="dialog" aria-modal="true" aria-label="Ritual Club preview" onMouseDown={e=>e.stopPropagation()}>
        <button className={s.close} onClick={()=>setClubOpen(false)} aria-label="Close club preview"><X size={21}/></button>
        <span className={s.eyebrow}>THE CECILIA RITUAL CLUB · PREVIEW</span>
        <h2 className={s.serif}>{clubTab==="refill"?"Your essentials, on your schedule.":"Discover something beautiful."}</h2>
        <p>{clubTab==="refill"?"Here is how flexible product replenishment could work when connected to the Shopify subscription system.":"Here is how Cecilia's discovery box could work once a collection, packaging and shipping economics have been approved."}</p>
        <div className={s.frequencyLabel}>PREFERRED DELIVERY RHYTHM</div>
        <div className={s.frequencyChoice}>
          {[["monthly","Monthly"],["bimonthly","Every 2 months"],["seasonal","Every 3 months"]].map(([id,label])=><button key={id} className={frequency===id?s.frequencySelected:""} onClick={()=>setFrequency(id as typeof frequency)}>{label}</button>)}
        </div>
        <div className={s.clubPreviewBox}><Package size={28} strokeWidth={1.2}/><div><strong>{clubTab==="refill"?"Personal care refill":"Curated discovery box"}</strong><p>{clubTab==="refill"?"Your selected everyday products would be delivered on your chosen schedule.":"A seasonal edit of suitable skincare and botanical care products, with a short guide to the collection."}</p><small>Concept only · no live price, charge or enrolment</small></div></div>
        <button className={s.primary} onClick={()=>{setClubOpen(false);jump("#shop");}}>Explore possible products <ArrowRight size={16}/></button>
      </div>
    </div>}
  </main>;
}

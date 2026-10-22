
"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,ArrowUpRight,ChevronRight,Plus,Search} from "lucide-react";
import {useRouter} from "next/navigation";
import {useCeciliaStore,usd} from "../commerce";
import type {StoreProduct} from "../lib/shopify";
import s from "../commerce.module.css";

const categories=["All products","Skincare","Essential oils","Body & bath","Hair care","Other care"] as const;
type Filter=typeof categories[number];
function group(p:StoreProduct):Filter{
  const t=(p.title+" "+p.type+" "+p.tags.join(" ")).toLowerCase();
  if(/shampoo|conditioner|hair|scalp/.test(t))return "Hair care";
  if(/essential oil|aromatherap|diffuser|oil blend|therapeutic blend/.test(t))return "Essential oils";
  if(/body|bath|hand|deodorant|foot|soap|lotion/.test(t))return "Body & bath";
  if(/face|skin|serum|moistur|cleanser|toner|jade|eye|mask|exfoliat|satori/.test(t))return "Skincare";
  return "Other care";
}
function Card({p,onAdd}:{p:StoreProduct;onAdd:(p:StoreProduct)=>void}){
  const [imageBroken,setImageBroken]=useState(false);
  return <article className={s.catalogCard}>
    <Link href={"/cecilia/products/"+p.handle} className={s.catalogPhoto}>
      {p.image&&!imageBroken?<img src={p.image} alt={p.title} loading="lazy" onError={()=>setImageBroken(true)}/>:<span className={s.imageFallback}>Cecilia&apos;s<br/>{p.title}</span>}
      {!p.available&&<span className={s.availability}>Currently unavailable</span>}
    </Link>
    <div><small>{group(p)}</small><h2><Link href={"/cecilia/products/"+p.handle}>{p.title}</Link></h2>
      <div className={s.cardBottom}><span>{usd(p.price)} USD</span>
        <button type="button" onClick={()=>onAdd(p)}>{p.variants.filter(v=>v.available).length===1?"Add to bag":"View options"} <ArrowUpRight size={14}/></button>
      </div>
    </div>
  </article>;
}
export default function CeciliaShopPage(){
  const {catalog,catalogLoading,catalogError,addItem}=useCeciliaStore();
  const router=useRouter();
  const [filter,setFilter]=useState<Filter>("All products");
  const [query,setQuery]=useState("");
  const [sort,setSort]=useState("featured");
  const [shown,setShown]=useState(24);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    setQuery(params.get("search")||"");
    const incoming=params.get("category");
    if(categories.includes(incoming as Filter))setFilter(incoming as Filter);
  },[]);
  const shownProducts=useMemo(()=>{
    let arr=catalog.filter(p=>(filter==="All products"||group(p)===filter)&&
      (!query||[p.title,p.type,p.description,...p.tags].join(" ").toLowerCase().includes(query.toLowerCase())));
    if(sort==="low")arr=[...arr].sort((a,b)=>a.price-b.price);
    if(sort==="high")arr=[...arr].sort((a,b)=>b.price-a.price);
    if(sort==="name")arr=[...arr].sort((a,b)=>a.title.localeCompare(b.title));
    return arr;
  },[catalog,filter,query,sort]);
  const add=(p:StoreProduct)=>{
    const available=p.variants.filter(v=>v.available);
    if(available.length!==1){router.push("/cecilia/products/"+p.handle);return;}
    addItem(p,available[0]);
  };
  return <div className={s.page}>
    <div className={s.breadcrumbs}><Link href="/cecilia">Home</Link><ChevronRight size={13}/> The collection</div>
    <div className={s.shopBanner}>
      <div className={s.shopBannerCopy}><span className={s.eyebrow}>DISCOVER WHAT FEELS GOOD</span><h1 className={s.serif}>The collection.</h1><p>Botanical beauty for the rituals and moments that make your everyday.</p></div>
      <div className={s.shopBannerArt}>Above pure.<br/>Beyond natural.</div>
    </div>
    <div className={s.filters} role="group" aria-label="Product categories">
      {categories.map(c=><button type="button" key={c} className={filter===c?s.filterActive:""} onClick={()=>{setFilter(c);setShown(24);}} aria-pressed={filter===c}>{c}</button>)}
    </div>
    <div className={s.toolbar}>
      <span>{catalogLoading?"Loading products…":shownProducts.length+" products"}{query?" matching “"+query+"”":""}</span>
      <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort products">
        <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A to Z</option>
      </select>
    </div>
    {catalogLoading?<div className={s.loadingPanel}>Gathering Cecilia&apos;s current products, pricing and available options...</div>:
      catalogError&&catalog.length===0?<div className={s.loadingPanel}>
        <p>{catalogError}</p><p>You can still browse the <a href="https://ceciliasproducts.com/collections/all" target="_blank" rel="noopener noreferrer">live Shopify collection ↗</a>.</p>
      </div>:
      shownProducts.length===0?<div className={s.loadingPanel}>
        <p>No products match this selection.</p>
        <button className={s.secondary} onClick={()=>{setFilter("All products");setQuery("");}}>View all products <ArrowRight size={15}/></button>
      </div>:
      <><div className={s.catalogGrid}>{shownProducts.slice(0,shown).map(p=><Card key={p.handle} p={p} onAdd={add}/>)}</div>
        {shown<shownProducts.length&&<button type="button" className={s.moreButton} onClick={()=>setShown(p=>p+24)}>Load more products</button>}
      </>}
    <div className={s.supportBanner}>
      <div><span className={s.eyebrow}>NEED A PLACE TO START?</span><h2>Shop by how you want to feel.</h2><p>Cecilia&apos;s favorites help make daily beauty a little simpler.</p></div>
      <Link href="/cecilia/#needs" className={s.secondary}>Explore by need <ArrowRight size={15}/></Link>
    </div>
  </div>;
}

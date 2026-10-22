
"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {ArrowLeft,ArrowRight,ArrowUpRight,Check,ChevronDown,ChevronRight,ChevronUp,Heart,Leaf,Minus,Plus,Truck} from "lucide-react";
import {useCeciliaStore,usd} from "../../commerce";
import type {StoreProduct} from "../../lib/shopify";
import s from "../../commerce.module.css";
const STORE="https://ceciliasproducts.com";

const benefits:Record<string,{eyebrow:string;heading:string;intro:string}>={
  prod12:{eyebrow:"EVERYDAY FACE CARE",heading:"Make softness part of your day.",intro:"Cecilia's longstanding signature moisturizer is a thoughtful place to begin a daily skincare ritual."},
  prod19:{eyebrow:"BOTANICAL SERUM",heading:"A little glow, beautifully considered.",intro:"An elegant finishing step for those who enjoy face oils and a thoughtful botanical ritual."},
  prod6:{eyebrow:"FACE SERUM",heading:"Enjoy your everyday glow.",intro:"A considered finishing touch that fits naturally into an everyday skincare routine."},
  prod30:{eyebrow:"BODY BEAUTY",heading:"Comfort for the skin you're in.",intro:"Give your hands and body a little everyday care, with a choice of scent or a fragrance-free option."}
};
function Image({src,alt}:{src:string|null;alt:string}){
  const [broken,setBroken]=useState(false);
  useEffect(()=>setBroken(false),[src]);
  return src&&!broken?<img src={src} alt={alt} onError={()=>setBroken(true)}/>:<span className={s.imageFallback}>Cecilia&apos;s<br/>{alt}</span>;
}
export default function ProductPage(){
  const params=useParams<{handle:string}>();
  const handle=String(params.handle||"");
  const {catalog,addItem}=useCeciliaStore();
  const [product,setProduct]=useState<StoreProduct|null>(null);
  const [busy,setBusy]=useState(true);
  const [err,setErr]=useState("");
  const [variantId,setVariantId]=useState("");
  const [quantity,setQuantity]=useState(1);
  const [mainImage,setMainImage]=useState<string|null>(null);
  const [expanded,setExpanded]=useState("About this formulation");
  useEffect(()=>{
    let alive=true;
    setBusy(true);
    setErr("");
    fetch("/cecilia/api/product/"+encodeURIComponent(handle))
      .then(async r=>{if(!r.ok)throw new Error("We couldn't load this product from Cecilia's live catalog.");return r.json();})
      .then((data:{product?:StoreProduct})=>{
        if(!alive)return;
        const p=data.product;
        if(!p)throw new Error("The product is currently unavailable.");
        setProduct(p);
        const best=p.variants.find(v=>v.available)||p.variants[0];
        setVariantId(best?.id||"");
        setMainImage(best?.image||p.image);
      })
      .catch(e=>{if(alive)setErr(e instanceof Error?e.message:"Unable to load product.");})
      .finally(()=>{if(alive)setBusy(false);});
    return()=>{alive=false;};
  },[handle]);
  const fallback=benefits[handle];
  const chosen=product?.variants.find(v=>v.id===variantId);
  const variantOptions=product?.variants||[];
  const images=product?.images.length ? product.images : product?.image?[product.image]:[];
  const add=()=>{if(product&&chosen&&chosen.available)addItem(product,chosen,quantity);};
  const panels=[
    {name:"About this formulation",content:product?.description||"Read the full product formulation description on Cecilia's original store."},
    {name:"How to use",content:"Please follow the individual product label and instructions on Cecilia's live product listing. Patch test first where appropriate. If you're unsure whether an ingredient is suitable for you, consult a qualified professional."},
    {name:"Shipping & returns",content:"Shipping options, applicable taxes and final totals are confirmed by Shopify at checkout. Visit the original Cecilia's store for its current shipping and returns policies."}
  ];
  return <div className={s.page}>
    <div className={s.breadcrumbs}><Link href="/cecilia">Home</Link><ChevronRight size={13}/><Link href="/cecilia/shop">Shop</Link><ChevronRight size={13}/><span>{product?.title||"Product"}</span></div>
    {busy?<div className={s.loadingPanel} style={{marginTop:32}}>Retrieving the latest product choices from Cecilia&apos;s store...</div>:
      err||!product?<div className={s.loadingPanel} style={{marginTop:32}}><p role="alert">{err||"This product isn't available right now."}</p><Link className={s.secondary} href="/cecilia/shop">Back to the collection <ArrowLeft size={15}/></Link><p><a href={STORE+"/products/"+encodeURIComponent(handle)} target="_blank" rel="noopener noreferrer">View on the live Shopify store ↗</a></p></div>:
      <section className={s.pdp}>
        <div className={s.gallery}>
          <div className={s.largePhoto}><Image src={mainImage} alt={product.title}/></div>
          {images.length>1&&<div className={s.thumbnailRow}>{images.slice(0,8).map((src,i)=><button className={[s.thumbnail,mainImage===src?s.thumbnailActive:""].join(" ")} key={src+i} onClick={()=>setMainImage(src)} aria-label={"View product image "+(i+1)}><img src={src} alt=""/></button>)}</div>}
        </div>
        <div className={s.pdpCopy}>
          <span className={s.eyebrow}>{fallback?.eyebrow||product.type||"CECILIA'S BOTANICAL BEAUTY"}</span>
          <h1 className={s.serif}>{product.title}</h1>
          <span className={s.pdpPrice}>{usd(chosen?.price||product.price)} USD</span>
          <p className={s.pdpShort}>{fallback?.intro||"Thoughtfully created botanical care from Cecilia's collection. Discover the ingredients and find the option that suits your routine."}</p>
          {variantOptions.length>1&&<>
            <span className={s.optionLabel}>Choose your {product.options[0]||"option"}</span>
            <div className={s.optionButtons}>{variantOptions.map(v=><button type="button" key={v.id} aria-pressed={variantId===v.id} className={variantId===v.id?s.optionActive:""} disabled={!v.available} onClick={()=>{setVariantId(v.id);setMainImage(v.image||product.image);}}>{v.title}{!v.available?" · Sold out":""}</button>)}</div>
          </>}
          <div className={s.pdpBuy}>
            <div className={s.qtyInput} aria-label="Quantity">
              <button aria-label="Decrease quantity" onClick={()=>setQuantity(q=>Math.max(1,q-1))}><Minus size={16}/></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={()=>setQuantity(q=>Math.min(25,q+1))}><Plus size={16}/></button>
            </div>
            <button type="button" className={s.primary} onClick={add} disabled={!chosen?.available}>{chosen?.available?"Add to bag — "+usd(chosen.price*quantity):"Currently unavailable"} <ArrowRight size={16}/></button>
          </div>
          <p className={s.availText}><Check size={16}/>{chosen?.available?"Available on Cecilia's live store":"Currently unavailable"} · Secure Shopify checkout</p>
          <div className={s.details}>{panels.map(panel=><div className={s.detailSection} key={panel.name}>
            <button type="button" aria-expanded={expanded===panel.name} onClick={()=>setExpanded(expanded===panel.name?"":panel.name)}>{panel.name}{expanded===panel.name?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
            {expanded===panel.name&&<p>{panel.content}</p>}
          </div>)}</div>
          <p style={{fontSize:11,color:"#829184",lineHeight:1.8,marginTop:25}}>Final price, selected currency, taxes and delivery costs are confirmed by Shopify during checkout.</p>
        </div>
      </section>}
    {product&&<div className={s.supportBanner}>
      <div><span className={s.eyebrow}>THOUGHTFUL CARE, EVERY DAY</span><h2>A little ritual goes a long way.</h2><p>Discover complementary products or build a beautifully simple routine.</p></div>
      <Link href="/cecilia/shop" className={s.secondary}>Keep discovering <ArrowRight size={15}/></Link>
    </div>}
  </div>;
}


"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,ArrowUpRight,Check,ChevronRight,LockKeyhole,Menu,Minus,Plus,Search,ShoppingBag,Trash2,X} from "lucide-react";
import {useCeciliaStore,usd} from "./commerce";
import s from "./commerce.module.css";

export function StoreHeader(){
  const {cartCount,setDrawerOpen}=useCeciliaStore();
  const [menu,setMenu]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [q,setQ]=useState("");
  const links=[
    {label:"Shop all",href:"/cecilia/shop"},
    {label:"Shop by need",href:"/cecilia/#needs"},
    {label:"Routines & sets",href:"/cecilia/#ritual"},
    {label:"The Ritual Club",href:"/cecilia/#club"},
    {label:"Our story",href:"/cecilia/#story"}
  ];
  return <div className={s.chrome}>
    <div className={s.promo}>BOTANICAL BEAUTY SINCE 1990 <span>✦</span> ABOVE PURE. BEYOND NATURAL. <span>✦</span> US SHIPPING OFFER ON THE LIVE STORE</div>
    <header className={s.header}>
      <Link href="/cecilia" className={s.logo} onClick={()=>setMenu(false)}>Cecilia&apos;s<small>NATURAL HEALTH & BEAUTY</small></Link>
      <nav className={s.navLinks} aria-label="Store navigation">{links.map(l=><Link href={l.href} key={l.href}>{l.label}</Link>)}</nav>
      <div className={s.headerActions}>
        <button type="button" aria-label="Search products" className={s.iconButton} onClick={()=>setSearchOpen(!searchOpen)}><Search size={21}/></button>
        <button type="button" aria-label={"Shopping bag, "+cartCount+" items"} className={s.iconButton} onClick={()=>setDrawerOpen(true)}><ShoppingBag size={21}/>{cartCount>0&&<b className={s.bagCount}>{cartCount}</b>}</button>
        <button type="button" aria-label={menu?"Close navigation":"Open navigation"} aria-expanded={menu} className={[s.iconButton,s.menuButton].join(" ")} onClick={()=>setMenu(!menu)}>{menu?<X size={21}/>:<Menu size={21}/>}</button>
      </div>
      {searchOpen&&<form className={s.searchBar} onSubmit={e=>{e.preventDefault();window.location.assign("/cecilia/shop?search="+encodeURIComponent(q));}}>
        <Search size={19}/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search moisturizer, serum, body care, essential oils..." aria-label="Search product catalog"/><button type="submit">Search <ArrowRight size={15}/></button><button type="button" aria-label="Close search" onClick={()=>setSearchOpen(false)}><X size={18}/></button>
      </form>}
      {menu&&<nav className={s.mobileNav} aria-label="Mobile store navigation">{links.map(l=><Link key={l.href} href={l.href} onClick={()=>setMenu(false)}>{l.label}<ChevronRight size={16}/></Link>)}</nav>}
    </header>
  </div>;
}
export function StoreFooter(){
  return <footer className={s.footer}>
    <div className={s.footerGrid}>
      <div><Link className={s.footerLogo} href="/cecilia">Cecilia&apos;s<small>NATURAL HEALTH & BEAUTY</small></Link><p>A considered approach to botanical beauty, founder-formulated with decades of experience.</p></div>
      <div><h4>SHOP</h4><Link href="/cecilia/shop">All products</Link><Link href="/cecilia/#needs">Shop by need</Link><Link href="/cecilia/#ritual">Your ritual</Link><Link href="/cecilia/cart">Your bag</Link></div>
      <div><h4>OUR WORLD</h4><Link href="/cecilia/#story">Meet Cecilia</Link><Link href="/cecilia/#club">Ritual Club preview</Link><a href="https://ceciliasproducts.com/pages/cecilias-formulation-philosophy" target="_blank" rel="noopener noreferrer">Formulation philosophy ↗</a></div>
      <div><h4>HERE TO HELP</h4><a href="https://ceciliasproducts.com/pages/contact" target="_blank" rel="noopener noreferrer">Contact the store ↗</a><a href="https://ceciliasproducts.com/policies/shipping-policy" target="_blank" rel="noopener noreferrer">Shipping information ↗</a><a href="https://ceciliasproducts.com/policies/refund-policy" target="_blank" rel="noopener noreferrer">Returns policy ↗</a></div>
    </div>
    <div className={s.footnote}><span>© Cecilia&apos;s Products · Brand experience prototype</span><span>Shopify handles payment, final pricing, taxes, delivery and orders. Subscription options are not live.</span></div>
  </footer>;
}
export function CartDrawer(){
  const {drawerOpen,setDrawerOpen,cart,subtotal,changeQuantity,removeItem,checkout,checkoutBusy,checkoutError}=useCeciliaStore();
  useEffect(()=>{
    if(!drawerOpen)return;
    const handler=(e:KeyboardEvent)=>{if(e.key==="Escape")setDrawerOpen(false);};
    document.addEventListener("keydown",handler);
    return ()=>document.removeEventListener("keydown",handler);
  },[drawerOpen,setDrawerOpen]);
  if(!drawerOpen)return null;
  return <div className={s.overlay} onMouseDown={()=>setDrawerOpen(false)}>
    <aside className={s.drawer} role="dialog" aria-label="Your shopping bag" aria-modal="true" onMouseDown={e=>e.stopPropagation()}>
      <div className={s.drawerTop}><div><span className={s.eyebrow}>THE GOOD THINGS</span><h2 className={s.serif}>Your bag <small>({cart.reduce((n,x)=>n+x.quantity,0)})</small></h2></div><button aria-label="Close bag" onClick={()=>setDrawerOpen(false)}><X size={22}/></button></div>
      {cart.length===0?<div className={s.emptyCart}><ShoppingBag size={45} strokeWidth={1}/><h3 className={s.serif}>A lovely place to start.</h3><p>Your bag is empty. Discover the products that feel right for you.</p><Link href="/cecilia/shop" className={s.primary} onClick={()=>setDrawerOpen(false)}>Explore the collection <ArrowRight size={16}/></Link></div>:<>
        <div className={s.drawerItems}>{cart.map(item=><div className={s.cartLine} key={item.variantId}>
          <Link href={"/cecilia/products/"+item.handle} onClick={()=>setDrawerOpen(false)} className={s.linePhoto}>{item.image?<img src={item.image} alt={item.title}/>:<span>Cecilia&apos;s</span>}</Link>
          <div className={s.lineContent}><Link href={"/cecilia/products/"+item.handle} onClick={()=>setDrawerOpen(false)}>{item.title}</Link>{item.variantTitle!=="Default Title"&&<small>{item.variantTitle}</small>}<span>{usd(item.unitPrice)} USD</span>
            <div className={s.lineQuantity}><button onClick={()=>changeQuantity(item.variantId,item.quantity-1)} aria-label={"Remove one "+item.title}><Minus size={13}/></button><span>{item.quantity}</span><button onClick={()=>changeQuantity(item.variantId,item.quantity+1)} aria-label={"Add one "+item.title}><Plus size={13}/></button></div>
          </div><button className={s.remove} aria-label={"Remove "+item.title+" from bag"} onClick={()=>removeItem(item.variantId)}><Trash2 size={16}/></button>
        </div>)}</div>
        <div className={s.drawerBottom}>
          <p className={s.shippingHint}>{subtotal>=100?"Your product subtotal meets the live store's US $100 free-shipping threshold.":"You're "+usd(Math.max(0,100-subtotal))+" away from the live store's US $100 free-shipping threshold."}</p>
          <div className={s.bar}><span style={{width:Math.min(100,subtotal)+"%"}}/></div>
          <div className={s.subtotal}><span>Estimated subtotal</span><strong>{usd(subtotal)} USD</strong></div>
          <p className={s.disclaimer}>Final prices, currency, availability, shipping and taxes are confirmed on Cecilia&apos;s secure Shopify checkout.</p>
          {checkoutError&&<p role="alert" className={s.error}>{checkoutError}</p>}
          <button className={s.primary} disabled={checkoutBusy} onClick={checkout}>{checkoutBusy?"Verifying with Shopify...":"Secure checkout"} <LockKeyhole size={15}/></button>
          <Link href="/cecilia/cart" className={s.secondary} onClick={()=>setDrawerOpen(false)}>View full bag <ArrowRight size={15}/></Link>
          <Link href="/cecilia/shop" className={s.keepShopping} onClick={()=>setDrawerOpen(false)}>Continue shopping</Link>
        </div>
      </>}
    </aside>
  </div>;
}

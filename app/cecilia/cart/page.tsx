
"use client";
import Link from "next/link";
import {ArrowLeft,ArrowRight,ChevronRight,LockKeyhole,Minus,Plus,ShoppingBag,Trash2} from "lucide-react";
import {useCeciliaStore,usd} from "../commerce";
import s from "../commerce.module.css";
export default function CartPage(){
  const {cart,subtotal,changeQuantity,removeItem,checkout,checkoutBusy,checkoutError}=useCeciliaStore();
  return <div className={s.page}>
    <div className={s.breadcrumbs}><Link href="/cecilia">Home</Link><ChevronRight size={13}/><span>Your bag</span></div>
    <h1 className={[s.pageTitle,s.serif].join(" ")}>Your little bag.</h1>
    <p className={s.pageLead}>A few good things for a beautifully simple everyday ritual. Review your selections before continuing to Cecilia&apos;s secure Shopify checkout.</p>
    {cart.length===0?<div className={s.loadingPanel}>
      <ShoppingBag size={47} strokeWidth={1.1}/><h2 className={s.serif} style={{fontSize:33}}>Your bag is waiting for something lovely.</h2>
      <p>Discover everyday favorites, botanical serums and nourishing body care.</p>
      <Link className={s.primary} href="/cecilia/shop">Explore the collection <ArrowRight size={15}/></Link>
    </div>:<div className={s.cartPage}>
      <div>{cart.map(line=><div className={s.cartFullLine} key={line.variantId}>
        <Link href={"/cecilia/products/"+line.handle} className={s.linePhoto}>{line.image?<img src={line.image} alt={line.title}/>:<span>Cecilia&apos;s</span>}</Link>
        <div className={s.lineContent}><Link href={"/cecilia/products/"+line.handle}>{line.title}</Link>
          {line.variantTitle!=="Default Title"&&<small>{line.variantTitle}</small>}<span>{usd(line.unitPrice)} USD each</span>
          <div className={s.lineQuantity}><button aria-label={"Decrease "+line.title} onClick={()=>changeQuantity(line.variantId,line.quantity-1)}><Minus size={15}/></button><span>{line.quantity}</span><button aria-label={"Increase "+line.title} onClick={()=>changeQuantity(line.variantId,line.quantity+1)}><Plus size={15}/></button></div>
          <button type="button" style={{background:"none",border:0,color:"#6e8a71",padding:0,fontSize:11,textAlign:"left",marginTop:6,display:"flex",alignItems:"center",gap:7}} onClick={()=>removeItem(line.variantId)}><Trash2 size={14}/> Remove</button>
        </div><strong>{usd(line.unitPrice*line.quantity)} USD</strong>
      </div>)}
        <Link href="/cecilia/shop" className={s.secondary} style={{marginTop:28}}>Keep exploring <ArrowLeft size={15}/></Link>
      </div>
      <aside className={s.orderSummary}>
        <span className={s.eyebrow}>READY WHEN YOU ARE</span>
        <h2 className={s.serif}>Order summary</h2>
        <div><span>Products ({cart.reduce((a,b)=>a+b.quantity,0)})</span><strong>{usd(subtotal)} USD</strong></div>
        <div><span>Shipping</span><span>Calculated at checkout</span></div>
        <div><span>Taxes</span><span>Calculated at checkout</span></div>
        <div><strong>Estimated subtotal</strong><strong>{usd(subtotal)} USD</strong></div>
        <small>{subtotal>=100?
          "Your subtotal meets the live store’s advertised US $100 free-shipping threshold. Eligibility and final delivery costs are confirmed at checkout.":
          "Add "+usd(Math.max(0,100-subtotal))+" in products to reach the live store’s advertised US $100 free-shipping threshold. Eligibility is checked at checkout."}
        </small>
        {checkoutError&&<p className={s.error} role="alert">{checkoutError}</p>}
        <button className={s.primary} disabled={checkoutBusy} onClick={checkout}>{checkoutBusy?"Verifying your bag...":"Continue to secure checkout"} <LockKeyhole size={16}/></button>
        <span className={s.cartHelp}>Shopify will verify availability, currencies and final totals before you pay.</span>
      </aside>
    </div>}
  </div>;
}

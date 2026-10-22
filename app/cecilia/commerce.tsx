
"use client";
import {createContext,useContext,useEffect,useMemo,useState} from "react";
import type {StoreProduct,Variant} from "./lib/shopify";

export type CartLine={
  handle:string;
  variantId:string;
  quantity:number;
  title:string;
  variantTitle:string;
  unitPrice:number;
  image:string|null;
};
type StoreState={
  catalog:StoreProduct[];
  catalogLoading:boolean;
  catalogError:string|null;
  cart:CartLine[];
  cartCount:number;
  subtotal:number;
  drawerOpen:boolean;
  setDrawerOpen:(open:boolean)=>void;
  checkoutBusy:boolean;
  checkoutError:string|null;
  findProduct:(handle:string)=>Promise<StoreProduct|null>;
  addItem:(product:StoreProduct,variant:Variant,quantity?:number)=>void;
  quickAdd:(handle:string)=>Promise<"added"|"options"|"unavailable">;
  changeQuantity:(variantId:string,qty:number)=>void;
  removeItem:(variantId:string)=>void;
  clearCart:()=>void;
  checkout:()=>Promise<void>;
};
const StoreContext=createContext<StoreState|null>(null);
const KEY="cecilia-cart-v2";

function sanitizeStored(lines:unknown):CartLine[]{
  if(!Array.isArray(lines))return [];
  return lines.filter((x):x is CartLine=>
    !!x&&typeof x==="object"&&
    typeof x.handle==="string"&&/^[a-z0-9][a-z0-9-]{0,99}$/.test(x.handle)&&
    typeof x.variantId==="string"&&/^\d+$/.test(x.variantId)&&
    Number.isInteger(x.quantity)&&x.quantity>=1&&x.quantity<=25&&
    typeof x.title==="string"&&typeof x.variantTitle==="string"&&
    typeof x.unitPrice==="number"&&Number.isFinite(x.unitPrice)&&x.unitPrice>=0
  ).slice(0,40).map((x:CartLine)=>({...x,image:typeof x.image==="string"?x.image:null}));
}

export function StoreProvider({children}:{children:React.ReactNode}){
  const [catalog,setCatalog]=useState<StoreProduct[]>([]);
  const [catalogLoading,setCatalogLoading]=useState(true);
  const [catalogError,setCatalogError]=useState<string|null>(null);
  const [cart,setCart]=useState<CartLine[]>([]);
  const [hydrated,setHydrated]=useState(false);
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [checkoutBusy,setCheckoutBusy]=useState(false);
  const [checkoutError,setCheckoutError]=useState<string|null>(null);
  useEffect(()=>{
    try{const previous=window.localStorage.getItem(KEY);if(previous)setCart(sanitizeStored(JSON.parse(previous)));}catch{}
    setHydrated(true);
  },[]);
  useEffect(()=>{
    if(!hydrated)return;
    try{window.localStorage.setItem(KEY,JSON.stringify(cart));}catch{}
  },[cart,hydrated]);
  useEffect(()=>{
    let alive=true;
    fetch("/cecilia/api/catalog")
      .then(async r=>{
        if(!r.ok)throw new Error("Live catalog temporarily unavailable.");
        return r.json();
      })
      .then((data:{products?:StoreProduct[]})=>{
        if(!alive)return;
        setCatalog(Array.isArray(data.products)?data.products:[]);
        setCatalogError(!data.products?.length?"We couldn't load Cecilia's current product catalog.":null);
      }).catch(()=>{if(alive)setCatalogError("The live Shopify catalog is temporarily unavailable. Please try again.");})
      .finally(()=>{if(alive)setCatalogLoading(false)});
    return()=>{alive=false;};
  },[]);
  const findProduct=async(handle:string):Promise<StoreProduct|null>=>{
    const fromList=catalog.find(p=>p.handle===handle);
    if(fromList?.variants?.length)return fromList;
    try{
      const r=await fetch("/cecilia/api/product/"+encodeURIComponent(handle),{cache:"no-store"});
      if(!r.ok)return null;
      const d:{product?:StoreProduct}=await r.json();
      return d.product||null;
    }catch{return null;}
  };
  const addItem=(product:StoreProduct,variant:Variant,quantity=1)=>{
    if(!variant.available)return;
    setCheckoutError(null);
    setCart(previous=>{
      const existing=previous.find(x=>x.variantId===variant.id);
      if(existing)return previous.map(x=>x.variantId===variant.id?
        {...x,quantity:Math.min(25,x.quantity+quantity),unitPrice:variant.price}:x);
      return [...previous,{
        handle:product.handle,variantId:variant.id,quantity:Math.max(1,Math.min(25,quantity)),
        title:product.title,variantTitle:variant.title,unitPrice:variant.price,
        image:variant.image||product.image
      }];
    });
    setDrawerOpen(true);
  };
  const quickAdd=async(handle:string)=>{
    const product=await findProduct(handle);
    if(!product||!product.available)return "unavailable" as const;
    const available=product.variants.filter(v=>v.available);
    if(available.length!==1)return "options" as const;
    addItem(product,available[0]);
    return "added" as const;
  };
  const changeQuantity=(variantId:string,qty:number)=>{
    if(qty<=0){setCart(p=>p.filter(x=>x.variantId!==variantId));return;}
    setCart(p=>p.map(x=>x.variantId===variantId?{...x,quantity:Math.min(25,Math.max(1,Math.round(qty)))}:x));
  };
  const removeItem=(variantId:string)=>setCart(p=>p.filter(x=>x.variantId!==variantId));
  const clearCart=()=>{setCart([]);setCheckoutError(null);};
  const checkout=async()=>{
    if(!cart.length||checkoutBusy)return;
    setCheckoutBusy(true);
    setCheckoutError(null);
    try{
      const r=await fetch("/cecilia/api/checkout",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({lines:cart.map(x=>({handle:x.handle,variantId:x.variantId,quantity:x.quantity}))})
      });
      const data:{url?:string;error?:string}=await r.json();
      if(!r.ok)throw new Error(data.error||"Couldn't verify your bag against the live store.");
      if(!data.url?.startsWith("https://ceciliasproducts.com/cart/"))
        throw new Error("Secure checkout handoff could not be confirmed.");
      window.location.assign(data.url);
    }catch(err){
      setCheckoutError(err instanceof Error?err.message:"Shopify checkout is currently unavailable.");
    }finally{setCheckoutBusy(false);}
  };
  const cartCount=cart.reduce((sum,line)=>sum+line.quantity,0);
  const subtotal=cart.reduce((sum,line)=>sum+line.unitPrice*line.quantity,0);
  const value=useMemo<StoreState>(()=>({
    catalog,catalogLoading,catalogError,cart,cartCount,subtotal,drawerOpen,setDrawerOpen,
    checkoutBusy,checkoutError,findProduct,addItem,quickAdd,
    changeQuantity,removeItem,clearCart,checkout
  }),[catalog,catalogLoading,catalogError,cart,cartCount,subtotal,drawerOpen,checkoutBusy,checkoutError]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useCeciliaStore(){
  const context=useContext(StoreContext);
  if(!context)throw new Error("StoreProvider missing from Cecilia's storefront.");
  return context;
}
export const usd=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);

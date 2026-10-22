
import { NextResponse } from "next/server";
import { getProduct } from "../../lib/shopify";

const STORE="https://ceciliasproducts.com";
type RequestLine={handle:string;variantId:string;quantity:number};
export async function POST(request:Request) {
  let body:unknown;
  try {body=await request.json();}catch {
    return NextResponse.json({error:"Invalid cart format"},{status:400});
  }
  const lines=(body as {lines?:unknown})?.lines;
  if(!Array.isArray(lines)||!lines.length||lines.length>40)
    return NextResponse.json({error:"Your bag must contain between 1 and 40 items"},{status:400});
  const parsed:RequestLine[]=[];
  for(const line of lines) {
    if(!line||typeof line!=="object")return NextResponse.json({error:"Invalid bag item"},{status:400});
    const x=line as Record<string,unknown>;
    if(typeof x.handle!=="string"||!/^[a-z0-9][a-z0-9-]{0,99}$/.test(x.handle)||
       typeof x.variantId!=="string"||!/^\d+$/.test(x.variantId)||
       typeof x.quantity!=="number"||!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>25)
      return NextResponse.json({error:"Invalid or excessive item quantity"},{status:400});
    parsed.push({handle:x.handle,variantId:x.variantId,quantity:x.quantity});
  }
  const handles=[...new Set(parsed.map(x=>x.handle))];
  const live=await Promise.all(handles.map(getProduct));
  const map=new Map(live.filter((p):p is NonNullable<typeof p>=>!!p).map(p=>[p.handle,p]));
  if(live.length!==map.size)
    return NextResponse.json({error:"We couldn't verify current availability. Please try again, or shop directly on Cecilia's store."},{status:503});
  const validated=new Map<string,number>();
  for(const line of parsed) {
    const product=map.get(line.handle);
    const variant=product?.variants.find(v=>v.id===line.variantId);
    if(!variant||!variant.available)
      return NextResponse.json({error:(product?.title||"A product")+" is no longer available in that variation. Please review your bag."},{status:409});
    validated.set(variant.id,(validated.get(variant.id)||0)+line.quantity);
    if(validated.get(variant.id)!>25)
      return NextResponse.json({error:"Please reduce the quantity of "+product!.title},{status:400});
  }
  const encoded=[...validated.entries()].map(([id,qty])=>id+":"+qty).join(",");
  return NextResponse.json({
    url:STORE+"/cart/"+encoded+"?ref=brht_cecilia",
    handoff:"shopify",
    message:"Shopify confirms final prices, inventory, shipping and taxes during checkout."
  },{headers:{"Cache-Control":"no-store"}});
}

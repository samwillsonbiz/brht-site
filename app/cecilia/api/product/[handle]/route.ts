
import { NextResponse } from "next/server";
import { getProduct } from "../../../lib/shopify";
export const revalidate=300;
export async function GET(_request:Request,{params}:{params:Promise<{handle:string}>}) {
  const {handle}=await params;
  if(!/^[a-z0-9][a-z0-9-]{0,99}$/.test(handle))
    return NextResponse.json({error:"Invalid product handle"},{status:400});
  const product=await getProduct(handle);
  if(!product) return NextResponse.json({error:"Product currently unavailable from live store"},{status:503});
  return NextResponse.json({product,live:true},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=900"}});
}

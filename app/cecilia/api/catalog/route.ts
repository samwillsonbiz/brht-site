
import { NextResponse } from "next/server";
import { getCatalog } from "../../lib/shopify";

export const revalidate=300;
export async function GET() {
  try {
    const products=await getCatalog();
    return NextResponse.json({
      products, live:products.length>0, fetchedAt:new Date().toISOString()
    },{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=900"}});
  } catch {
    return NextResponse.json({products:[],live:false,error:"Live catalog temporarily unavailable"},{status:503});
  }
}


const SHOP = "https://ceciliasproducts.com";

export type Variant = {
  id: string;
  title: string;
  price: number;
  available: boolean;
  options: string[];
  image: string | null;
  sku?: string;
};
export type StoreProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  type: string;
  vendor: string;
  tags: string[];
  image: string | null;
  images: string[];
  options: string[];
  variants: Variant[];
  available: boolean;
  price: number;
  currency: "USD";
};

const normalizeUrl = (value: unknown): string | null => {
  if (!value) return null;
  const raw = typeof value === "string" ? value : typeof value === "object" && value !== null ?
    (("src" in value && typeof value.src === "string") ? value.src : null) : null;
  if (!raw) return null;
  const full = raw.startsWith("//") ? "https:" + raw : raw;
  return /^https:\/\//.test(full) ? full : null;
};
const plainText = (input: unknown) => String(input || "")
  .replace(/<script[\s\S]*?<\/script>/gi,"")
  .replace(/<style[\s\S]*?<\/style>/gi,"")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/g," ")
  .replace(/&amp;/g,"&")
  .replace(/&quot;/g,'"')
  .replace(/&#39;|&apos;/g,"'")
  .replace(/\s+/g," ")
  .trim()
  .slice(0,7500);

export function normalizeProduct(raw: any, format: "ajax" | "json"): StoreProduct | null {
  if (!raw || !raw.handle || !Array.isArray(raw.variants)) return null;
  const imageList = (Array.isArray(raw.images) ? raw.images : [])
    .map(normalizeUrl).filter((x: string | null): x is string => !!x);
  const rootImage = normalizeUrl(raw.featured_image) || normalizeUrl(raw.image) || imageList[0] || null;
  const variants: Variant[] = raw.variants.map((v: any) => {
    const rawPrice = v.price;
    const numberPrice = typeof rawPrice === "number" ? rawPrice : Number.parseFloat(String(rawPrice || "0"));
    const price = format === "ajax" ? numberPrice / 100 : numberPrice;
    const maybeImage = normalizeUrl(v.featured_image) || normalizeUrl(v.image);
    return {
      id: String(v.id || ""),
      title: String(v.public_title || v.title || "Default"),
      price: Number.isFinite(price) ? Math.max(0,price) : 0,
      available: v.available !== false,
      options: Array.isArray(v.options) ? v.options.map(String) : [v.option1,v.option2,v.option3].filter(Boolean).map(String),
      image: maybeImage || rootImage,
      sku: typeof v.sku === "string" ? v.sku : undefined,
    };
  }).filter((v: Variant) => /^\d+$/.test(v.id));
  const active = variants.find(v=>v.available) || variants[0];
  if (!active) return null;
  return {
    id: String(raw.id || raw.handle),
    handle: String(raw.handle),
    title: String(raw.title || raw.handle),
    description: plainText(raw.description || raw.body_html),
    vendor: String(raw.vendor || "Cecilia's Products"),
    type: String(raw.product_type || raw.type || "Botanical care"),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : typeof raw.tags === "string" ? raw.tags.split(",").map((x:string)=>x.trim()) : [],
    image: rootImage, images: imageList.length ? imageList : rootImage ? [rootImage] : [],
    options: Array.isArray(raw.options) ? raw.options.map((o:any)=>typeof o==="string"?o:String(o.name||"Option")) : [],
    variants,
    available: variants.some(v=>v.available),
    price: active.price,
    currency:"USD"
  };
}
async function getJson(url:string) {
  const response=await fetch(url,{
    headers:{Accept:"application/json", "User-Agent":"CeciliaCommerceConcept/1.0"},
    next:{revalidate:300},
    signal:AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("Catalog HTTP "+response.status);
  return await response.json();
}
export async function getProduct(handle:string): Promise<StoreProduct|null> {
  if(!/^[a-z0-9][a-z0-9-]{0,99}$/.test(handle)) return null;
  try {
    const raw=await getJson(SHOP+"/products/"+handle+".js");
    const product=normalizeProduct(raw,"ajax");
    if(product) return product;
  } catch {}
  try {
    const data=await getJson(SHOP+"/products/"+handle+".json");
    return normalizeProduct(data.product,"json");
  } catch {return null;}
}
const featureHandles=["prod12","prod19","prod6","prod30"];
export async function getCatalog(): Promise<StoreProduct[]> {
  const pages = await Promise.allSettled([1,2].map(async page=>{
    const data=await getJson(SHOP+"/collections/all/products.json?limit=100&page="+page);
    const entries=Array.isArray(data.products)?data.products:[];
    const normalized:StoreProduct[]=entries.map((p:any)=>normalizeProduct(p,"json")).filter((p:StoreProduct|null):p is StoreProduct=>!!p);
    return normalized;
  }));
  const map=new Map<string,StoreProduct>();
  pages.forEach(result=>{
    if(result.status==="fulfilled")result.value.forEach(p=>map.set(p.handle,p));
  });
  const featured=await Promise.all(featureHandles.map(getProduct));
  featured.forEach(p=>{if(p)map.set(p.handle,p);});
  return [...map.values()];
}

import {VERSION} from './engine.mjs';
class ApiError extends Error {constructor(status,message){super(message);this.status=status;}}
function check(ok,status,message){if(!ok)throw new ApiError(status,message);}
export class MemoryRoomStore{
  constructor(){this.rows=new Map();}
  async get(id){return this.rows.has(id)?structuredClone(this.rows.get(id)):null;}
  async insert(row){if(this.rows.has(row.id))throw Error('Duplicate room.');this.rows.set(row.id,structuredClone(row));}
  async compareAndSwap(id,revision,values){const row=this.rows.get(id);if(!row||row.revision!==revision)return null;const next={...row,...structuredClone(values)};this.rows.set(id,next);return structuredClone(next);}
}

export class SupabaseRoomStore{
  constructor({url,key}){check(url&&key,503,'Online rooms are not configured.');this.url=url.replace(/\/$/,'');this.key=key;}
  async request(query,method='GET',body){
    const url=new URL(this.url+'/rest/v1/brawl_online_rooms');for(const [k,v]of Object.entries(query))url.searchParams.set(k,v);
    let response;try{response=await fetch(url,{method,cache:'no-store',headers:{apikey:this.key,Authorization:`Bearer ${this.key}`,'Content-Type':'application/json',Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});}catch{throw new ApiError(503,'Room storage is temporarily unavailable. Please try again.');}
    if(!response.ok)throw new ApiError(503,'Room storage is temporarily unavailable. Please try again.');return response.json();
  }
  async get(id){return (await this.request({id:`eq.${id}`,engine_version:`eq.${VERSION}`,limit:'1'}))[0]||null;}
  async insert(row){await this.request({},'POST',row);}
  async compareAndSwap(id,revision,values){return (await this.request({id:`eq.${id}`,revision:`eq.${revision}`,engine_version:`eq.${VERSION}`},'PATCH',values))[0]||null;}
}

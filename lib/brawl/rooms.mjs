import {randomBytes, randomInt, createHash, timingSafeEqual} from 'node:crypto';
import {Brawl} from './engine.mjs';

export const ENGINE_VERSION='brawl-v0.5-online-1';
const hash=value=>createHash('sha256').update(value).digest('hex');
const token=()=>randomBytes(32).toString('base64url');
class ApiError extends Error {constructor(status,message){super(message);this.status=status;}}
function check(condition,status,message){if(!condition)throw new ApiError(status,message);}
function matches(value,digest){if(typeof value!=='string'||!digest)return false;const actual=hash(value);return timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(digest,'hex'));}
function seatFor(row,bearer){if(matches(bearer,row.host_token_hash))return 0;if(matches(bearer,row.guest_token_hash))return 1;throw new ApiError(401,'This browser does not have a seat in that room. Open your original invite link.');}
const hiddenDeck=n=>Array.from({length:n},(_,i)=>({id:'hidden',uid:`hidden-${i}`}));

// Allowlist each public field. Never serialize the authoritative state directly to a client.
export function projectGame(game,seat){
  const s=game.s,own=s.players[seat];
  return {version:s.version,mode:'online',round:s.round,phase:s.phase,reveal:s.reveal,edge:s.edge,uid:0,rng:0,effect:0,
    left:s.left,right:s.right,shown:[...s.shown],committed:[...s.committed],shopDone:[...s.shopDone],winner:s.winner,beat:s.beat,
    log:structuredClone(s.log),queue:[],attack:null,
    lootDeck:Array(s.lootDeck.length).fill('hidden'),lootDiscard:[...s.lootDiscard],
    prompt:s.prompt?(s.prompt.player===seat?{...structuredClone(s.prompt),...(s.prompt.kind==='focus'?{cards:own.deck.slice(-2).map(c=>({...c}))}:{})}:{kind:'waiting',player:s.prompt.player,choices:[]}):null,
    plans:s.plans.map((plan,i)=>plan?.map((a,k)=>{
      const visible=i===seat||s.shown[k]||own.peek.includes(k);
      return {card:visible?{...a.card}:{id:'hidden',uid:`hidden-action-${k}`},opts:i===seat?{...a.opts}:{},loot:a.loot,lootUsed:a.lootUsed,done:a.done,speed:s.shown[k]?a.speed:0};
    })||null),
    players:s.players.map((p,i)=>({hero:p.hero,name:p.name,pos:p.pos,hp:p.hp,coins:p.coins,fury:p.fury,specialReady:p.specialReady,
      facing:p.facing,ultimate:p.ultimate,skillUnlocked:p.skillUnlocked,wardBlock:p.wardBlock,dodge:p.dodge,trait:p.trait,block:p.block,roundBlock:p.roundBlock,usedSpecial:p.usedSpecial,lootBought:p.lootBought,
      deck:hiddenDeck(p.deck.length),discard:structuredClone(p.discard),hand:i===seat?structuredClone(p.hand):[],
      loot:i===seat?[...p.loot]:Array(p.loot.length).fill('hidden'),peek:i===seat?[...p.peek]:[],scouted:i===seat?structuredClone(p.scouted):[],usedLoot:p.usedLoot}))};
}

export function createRoomService({data,store,now=()=>Date.now()}){
  function config(input){
    check(input&&typeof input==='object',400,'Choose a Hero and five Hero cards.');
    const hero=data.heroes.find(h=>h.id===input.hero),chosen=input.chosen;
    check(hero&&Array.isArray(chosen)&&chosen.length===5&&Brawl.validLoadout(chosen,5,data.cards.filter(c=>c.category==='Hero'&&c.hero===hero.name).map(c=>c.id)),400,'Choose a Hero and five Hero cards (maximum two copies each).');
    check(chosen.every(id=>data.cards.some(c=>c.id===id&&c.category==='Hero'&&c.hero===hero.name)),400,'Those cards do not belong to the chosen Hero.');
    const basics=input.basics??Brawl.defaultBasics(data);
    check(Array.isArray(basics)&&basics.length===10&&Brawl.validLoadout(basics,10,data.cards.filter(c=>c.category==='Basic').map(c=>c.id))&&basics.every(id=>data.cards.some(c=>c.id===id&&c.category==='Basic')),400,'Choose ten Basic cards (maximum two copies each).');
    return {hero:hero.id,chosen:[...chosen],basics:[...basics]};
  }
  function gameFor(row){check(row.engine_version===ENGINE_VERSION,409,'This room uses an older game version. Create a new room.');return row.game_state?Brawl.restore(data,row.game_state):null;}
  function payload(row,seat){const game=gameFor(row);return {room:{id:row.id,seat,revision:row.revision,status:game?game.s.phase==='over'?'finished':'active':'waiting',expiresAt:row.expires_at,heroes:[row.host_config.hero,row.guest_config?.hero||null]},game:game?projectGame(game,seat):null};}
  async function read(id){
    check(typeof id==='string'&&/^[A-Za-z0-9_-]{12,40}$/.test(id),400,'Invalid room link.');
    const row=await store.get(id);check(row,404,'Room not found. Ask your friend for a new invite link.');
    check(Date.parse(row.expires_at)>now(),410,'This room has expired. Create a new room.');return row;
  }
  async function save(row,next,seat,extra={}){
    const saved=await store.compareAndSwap(row.id,row.revision,{...next,revision:row.revision+1});
    if(!saved){if(extra.token)throw new ApiError(409,'Someone already joined that room. Ask for a new invite.');const latest=await read(row.id);throw Object.assign(new ApiError(409,'Your rival updated the room. Check the latest turn and try again.'),{snapshot:payload(latest,seat)});}
    return {...payload(saved,seat),...extra};
  }
  async function handle(request){
    const url=new URL(request.url),headers={'Content-Type':'application/json','Cache-Control':'no-store, private','X-Robots-Tag':'noindex, nofollow','Vary':'Authorization'};
    try{
      const origin=request.headers.get('origin');
      if(origin)check(origin===url.origin,403,'Cross-site room requests are not allowed.');
      if(request.method==='GET'){
        const id=url.searchParams.get('room');
        if(!id)return Response.json({online:true,engineVersion:ENGINE_VERSION},{headers});
        const row=await read(id),seat=seatFor(row,request.headers.get('authorization')?.replace(/^Bearer /,''));
        return Response.json(payload(row,seat),{headers});
      }
      check(request.method==='POST',405,'Use GET or POST.');
      const raw=await request.text();check(raw.length<=16000,413,'Room request is too large.');
      let body;try{body=JSON.parse(raw);}catch{throw new ApiError(400,'Invalid room request.');}
      check(body&&typeof body==='object'&&!Array.isArray(body),400,'Invalid room request.');
      check(body.engineVersion===ENGINE_VERSION,409,'The combat rules have been updated. Refresh this page to play v0.5.');
      if(body.action==='create'){
        const host=config(body.config),hostToken=token(),invite=token();
        const row={id:randomBytes(12).toString('base64url'),engine_version:ENGINE_VERSION,host_token_hash:hash(hostToken),guest_token_hash:null,invite_hash:hash(invite),host_config:host,guest_config:null,game_state:null,revision:0,commands:[],created_at:new Date(now()).toISOString(),expires_at:new Date(now()+24*60*60*1000).toISOString()};
        await store.insert(row);
        return Response.json({...payload(row,0),token:hostToken,invite},{status:201,headers});
      }
      const row=await read(body.room);
      if(body.action==='join'){
        check(matches(body.invite,row.invite_hash),403,'That invite link is not valid.');
        check(!row.guest_token_hash,409,'This room already has two players. Reconnect with the browser that joined it.');
        check(row.engine_version===ENGINE_VERSION,409,'This room uses older rules. Create a new v0.5 room.');
        const guest=config(body.config),guestToken=token();
        const game=new Brawl(data,{mode:'online',heroes:[row.host_config.hero,guest.hero],chosen:[row.host_config.chosen,guest.chosen],basics:[row.host_config.basics,guest.basics],seed:randomInt(1,2147483646)});
        const result=await save(row,{guest_config:guest,guest_token_hash:hash(guestToken),game_state:game.s,invite_hash:null},1,{token:guestToken});
        return Response.json(result,{headers});
      }
      const seat=seatFor(row,request.headers.get('authorization')?.replace(/^Bearer /,''));
      check(row.game_state,409,'Wait for your rival to join.');
      check(typeof body.requestId==='string'&&/^[a-zA-Z0-9_-]{16,80}$/.test(body.requestId),400,'A request ID is required.');
      if(row.commands.includes(body.requestId))return Response.json(payload(row,seat),{headers});
      if(body.revision!==row.revision)throw Object.assign(new ApiError(409,'The room has moved on. Check the latest turn and try again.'),{snapshot:payload(row,seat)});
      const game=gameFor(row),s=game.s;
      switch(body.action){
        case 'commit':{
          check(s.phase==='program'&&!s.committed[seat],409,'Your actions are already locked.');
          check(Array.isArray(body.choices)&&body.choices.length===2,400,'Choose exactly two cards.');
          const choices=body.choices.map(c=>{
            check(c&&typeof c.uid==='string',400,'Invalid card choice.');const opts=c.opts||{};
            check(['toward','away','left','right'].includes(opts.direction??'toward'),400,'Invalid movement direction.');
            check(Number.isInteger(opts.steps??3)&&(opts.steps??3)>=0&&(opts.steps??3)<=3,400,'Invalid movement limit.');
            check(typeof(opts.path??'')==='string'&&/^[LRT]{0,3}$/i.test(opts.path??''),400,'Movement path must be up to three L, R or T steps.');
            check(['damage','range'].includes(opts.aim??'damage')&&['block','damage','move'].includes(opts.remedy??'damage'),400,'Invalid trait option.');
            return {uid:c.uid,opts:{path:opts.path??'',direction:opts.direction??'toward',steps:opts.steps??3,aim:opts.aim??'damage',remedy:opts.remedy??'damage',trait:opts.trait!==false,coin:opts.coin!==false,push:opts.push!==false,follow:opts.follow!==false}};
          });game.commit(seat,choices);if(game.s.phase==='resolve'&&!game.s.shown[0])game.advance();break;
        }
        case 'advance':check(s.phase==='resolve'&&!s.prompt,409,'Wait for the current choice to finish.');game.advance();break;
        case 'loot':check(s.prompt?.player===seat&&s.prompt.kind==='loot',403,'This is your rival’s reaction window.');game.playLoot(body.card);break;
        case 'choose':check(s.prompt?.player===seat,403,'This is your rival’s choice.');game.choose(body.value);break;
        case 'skip':check(s.prompt?.player===seat,403,'This is your rival’s choice.');game.skipPrompt();break;
        case 'shop':check(s.phase==='shop'&&!s.shopDone[seat],409,'You have already finished your purchase.');game.shop(seat,body.buy===true);break;
        case 'next':check(s.phase==='shop'&&s.shopDone.every(Boolean),409,'Both players must finish the Loot phase.');game.nextRound();break;
        default:throw new ApiError(400,'Unknown room action.');
      }
      const result=await save(row,{game_state:game.s,commands:[...row.commands.slice(-63),body.requestId]},seat);
      return Response.json(result,{headers});
    }catch(error){
      const status=error instanceof ApiError?error.status:400;
      const message=error instanceof ApiError||!String(error.message).includes('storage')?error.message:'The room service is temporarily unavailable. Your match is saved; try again.';
      return Response.json({error:message,...(error.snapshot?{snapshot:error.snapshot}:{})},{status,headers});
    }
  }
  return {handle};
}

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
  async get(id){return (await this.request({id:`eq.${id}`,limit:'1'}))[0]||null;}
  async insert(row){await this.request({},'POST',row);}
  async compareAndSwap(id,revision,values){return (await this.request({id:`eq.${id}`,revision:`eq.${revision}`},'PATCH',values))[0]||null;}
}

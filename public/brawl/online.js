import {Brawl} from './engine.js';
export const ROOM_API='/api/brawl';
const PREFIX='fable-brawl-room-';
export function invitation(){const p=new URLSearchParams(location.hash.replace(/^#/,''));return {room:p.get('room'),invite:p.get('invite')};}
export function savedSeat(room){try{return JSON.parse(localStorage.getItem(PREFIX+room)||'null');}catch{return null;}}
export function rememberSeat(room,token,invite){try{localStorage.setItem(PREFIX+room,JSON.stringify({token,invite}));}catch{/* Active tabs still keep their seat in memory. */}}
export async function onlineSupported(){if(location.protocol==='file:'||location.hostname.endsWith('.chatgpt.site'))return false;try{const r=await fetch(ROOM_API,{cache:'no-store',signal:AbortSignal.timeout(5000)});return r.ok&&(await r.json()).online===true;}catch{return false;}}
async function api(body,{token,room,signal}={}){
  const r=await fetch(ROOM_API+(body?'':'?room='+encodeURIComponent(room)),{method:body?'POST':'GET',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify({...body,engineVersion:'brawl-v0.4-online-4'})}:{}),signal:signal||AbortSignal.timeout(15000)});
  const result=await r.json().catch(()=>({error:'The room service did not respond. Please try again.'}));
  if(!r.ok)throw Object.assign(new Error(result.error||'Room request failed.'),{snapshot:result.snapshot,status:r.status});return result;
}
export async function createOnline(config){const snapshot=await api({action:'create',config});rememberSeat(snapshot.room.id,snapshot.token,snapshot.invite);return snapshot;}
export async function joinOnline(room,invite,config){const snapshot=await api({action:'join',room,invite,config});rememberSeat(room,snapshot.token);return snapshot;}
export async function readOnline(room,token){return api(null,{room,token});}

export class OnlineGame extends Brawl{
  static connect(data,snapshot,token,{onUpdate,onConnection,onError}={}){
    const game=Brawl.restore(data,snapshot.game);Object.setPrototypeOf(game,OnlineGame.prototype);
    Object.assign(game,{room:snapshot.room,seat:snapshot.room.seat,token,onUpdate,onConnection,onError,closed:false,pending:false,timer:null});game.poll();return game;
  }
  apply(snapshot,notify=true){if(snapshot.room.revision<this.room.revision)return;const changed=snapshot.room.revision!==this.room.revision;this.room=snapshot.room;if(snapshot.game)this.s=snapshot.game;if(changed&&notify)this.onUpdate?.(this);}
  async poll(){
    if(this.closed)return;
    try{if(!this.pending){const snapshot=await readOnline(this.room.id,this.token);this.apply(snapshot);this.onConnection?.(true);}}
    catch(error){this.onConnection?.(false);if([401,404,409,410].includes(error.status)){this.closed=true;this.onError?.(error);return;}}
    if(!this.closed)this.timer=setTimeout(()=>this.poll(),document.hidden?4500:1100);
  }
  close(){this.closed=true;clearTimeout(this.timer);}
  async command(action,extra={}){
    if(this.pending)throw Error('Your previous action is still being saved.');
    this.pending=true;this.onConnection?.(true);
    const body={action,room:this.room.id,revision:this.room.revision,requestId:crypto.randomUUID(),...extra};
    try{
      let result;
      for(let attempt=0;attempt<2;attempt++){
        try{result=await api(body,{token:this.token});break;}catch(error){if(error.status||attempt===1)throw error;}
      }
      this.apply(result,false);return result;
    }catch(error){if(error.snapshot)this.apply(error.snapshot);throw error;}
    finally{this.pending=false;}
  }
  commit(i,choices){if(i!==this.seat)throw Error('You can only choose your own cards.');return this.command('commit',{choices});}
  advance(){return this.command('advance');}
  playLoot(card){return this.command('loot',{card});}
  choose(value){return this.command('choose',{value});}
  skipPrompt(){return this.command('skip');}
  shop(i,buy){if(i!==this.seat)throw Error('You can only buy your own Loot.');return this.command('shop',{buy});}
  nextRound(){return this.command('next');}
}

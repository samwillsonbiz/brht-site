import * as legacy from './legacy-tokens.mjs';
import {CORE,initTokens,tokenActions,useToken,activation,handleOp,windMove,chooseToken} from './core-tokens.mjs';
import {choosePlan,chooseReaction,choosePrompt} from './reaction-ai.mjs';
export const VERSION='brawl2-clear-powers-1';
export const PRE_TOKEN_VERSION='brawl2-core-1';
export const LEGACY_VERSION='brawl2-market-1';
export const LOOT_COST=2;
export const MAX_HEALTH=20;
export const ARENA_SIZE=8;
const copy=x=>structuredClone(x);
export class Brawl2 {
 constructor(data,{mode='solo',seed=Date.now()%2147483646+1,heroes=['SMA','ALF'],decks,furies,lootPicks}={}){
  this.data=data;
  this.s={version:VERSION,mode,rng:(seed>>>0)||1,serial:0,playSerial:0,round:1,edge:0,phase:'program',active:null,turn:null,attackIndex:0,reveal:0,order:[],passes:0,committed:[false,false],plans:[[],[]],mains:[null,null],mods:[{},{}],drawUsed:[false,false],shopDone:[true,true],players:[],queue:[],prompt:null,context:null,activeSource:null,lastReaction:null,trail:[],lastResult:null,lastRefill:[null,null],lastCoin:null,winner:null,log:[],notice:'One hand. Choose two attacks; keep your answers.',lootDeck:[],lootDiscard:[],market:[],shopTurn:null};
  this.need(Array.isArray(heroes)&&heroes.length===2,'Choose two Heroes.');
  for(let i=0;i<2;i++){
   const h=data.heroes.find(h=>h.id===heroes[i]);this.need(h,'Choose a valid Hero.');
   const deck=decks?.[i]||Brawl2.defaultDeck(data,h.id),fury=furies?.[i]||Brawl2.defaultFury(data,h.id);
   this.need(Brawl2.validDeck(data,h.id,deck),'Choose exactly 24 cards from your Hero’s pool, at most two of each.');
   this.need(h.furies.includes(fury),'Choose one of your Hero’s three Fury cards.');
   const loot=lootPicks?.[i]||h.defaultLoot;this.need(Brawl2.validLoot(data,h.id,loot),'Choose 6 different Loot from your Hero’s 12-card pool.');
   this.s.players.push({lootLoadout:[...loot],hero:h.id,name:h.name,hp:MAX_HEALTH,pos:i?6:3,coins:0,block:0,skillUnlocked:false,ultimate:false,pendingLastStand:false,pendingLastStandCard:null,pinned:false,shadowPos:null,shadowUsed:false,furyId:fury,loadout:[...deck],hand:[],deck:this.shuffle(deck.map(id=>this.instance(id))),discard:[],loot:[]});
   initTokens(this.s.players[i]);legacy.initLegacy(this.s.players[i]);this.draw(i,7);
  }
  this.s.edge=this.rand()<.5?0:1;this.s.events={};
  this.s.lootDeck=this.shuffle(this.s.players.flatMap(p=>p.lootLoadout));this.refillMarket();
 }
 static restore(data,s){if(s?.version!==VERSION)throw Error('The counterplay rules have changed. Start a new fight; your saved fighting decks are kept.');const g=Object.create(Brawl2.prototype);g.data=data;g.s=copy(s);return g;}
 static validLoadout(a,n,allowed){return Array.isArray(a)&&a.length===n&&a.every(id=>typeof id==='string'&&allowed.includes(id)&&a.filter(x=>x===id).length<=2);}
 static validLoot(data,id,loot){const h=data.heroes.find(h=>h.id===id);return !!h&&Array.isArray(loot)&&loot.length===6&&new Set(loot).size===6&&loot.every(id=>h.lootPool.includes(id));}
 static validDeck(data,id,deck){const h=data.heroes.find(h=>h.id===id);return !!h&&Brawl2.validLoadout(deck,24,h.pool);}
 static defaultBuild(data,id){return data.builds.find(b=>b.id===({SMA:'sma-wall',ALF:'alf-mobile'}[id]))||data.builds.find(b=>b.hero===id);}
 static defaultDeck(data,id){return [...Brawl2.defaultBuild(data,id).deck];}
 static defaultFury(data,id){return Brawl2.defaultBuild(data,id).fury;}
 static randomLoadout(data,id,random=Math.random){const h=data.heroes.find(h=>h.id===id),a=h.pool.flatMap(id=>[id,id]);for(let j=a.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[a[j],a[k]]=[a[k],a[j]];}return {deck:a.slice(0,24),fury:h.furies[Math.floor(random()*h.furies.length)]};}
 need(ok,msg){if(!ok)throw Error(msg);}
 def(c){return this.data.cards.find(d=>d.id===(typeof c==='string'?c:c?.id));}
 isAttack(c){return ['Attack','Dual'].includes(this.def(c)?.kind);}
 isReaction(c){return ['Reaction','Dual'].includes(this.def(c)?.kind);}
 reactionDef(c){const d=this.def(c);return d?{...d,ops:d.reactionOps||d.ops}:null;}
 instance(id){return {id,uid:'t'+(++this.s.serial)};}
 rand(){let x=this.s.rng;x^=x<<13;x^=x>>>17;x^=x<<5;this.s.rng=x>>>0;return(x>>>0)/4294967296;}
 shuffle(a){a=[...a];for(let j=a.length-1;j>0;j--){const k=Math.floor(this.rand()*(j+1));[a[j],a[k]]=[a[k],a[j]];}return a;}
 log(t){if(/activates |plays |throws |moves |stays |launches |pulls |swaps |gains .*Block|passes \(|takes .*damage/.test(t)){this.s.trail.push(t);this.s.trail=this.s.trail.slice(-5);}this.s.notice=t;this.s.log.push(t);this.s.log=this.s.log.slice(-160);}
 draw(i,n){const p=this.s.players[i];for(let k=0;k<n;k++){if(!p.deck.length){p.deck=this.shuffle(p.discard);p.discard=[];}if(!p.deck.length)break;p.hand.push(p.deck.pop());}}
 hand(i,kind){return this.s.players[i].hand.filter(c=>!kind||kind==='Attack'&&this.isAttack(c)||kind==='Reaction'&&this.isReaction(c));}
 requiredAttacks(i){return Math.min(2,this.hand(i,'Attack').length);}
 commit(i,uids){
  const s=this.s,p=s.players[i];this.need(s.phase==='program'&&!s.committed[i],'Planning is closed or your attacks are already locked.');
  const n=this.requiredAttacks(i);
  this.need(Array.isArray(uids)&&uids.length===n&&new Set(uids).size===n&&uids.every(u=>p.hand.some(c=>c.uid===u&&this.isAttack(c))),`Choose ${n} different attack-capable card${n===1?'':'s'} from your hand.`);
  s.plans[i]=uids.map(u=>copy(p.hand.find(c=>c.uid===u)));p.hand=p.hand.filter(c=>!uids.includes(c.uid));s.committed[i]=true;
  if(s.committed.every(Boolean))this.flip();
 }
 flip(){
  const s=this.s;s.speedMods=[0,0];s.tempoQueue=[];s.preparedReveal=null;s.lastReaction=null;s.trail=[];s.lastResult=null;s.lastCoin=null;s.mains=s.plans.map(a=>copy(a[s.reveal]||null));
  s.order=[0,1].filter(i=>s.mains[i]).sort((a,b)=>this.speed(b)-this.speed(a)||(a===s.edge?-1:1));
  s.attackIndex=0;s.active=null;s.turn=null;s.phase='reveal';s.passes=0;s.mods=[{},{}];
  this.log(`Pair ${s.reveal+1}: ${this.def(s.mains[0])?.name||'Pass'} versus ${this.def(s.mains[1])?.name||'Pass'}.`);
  if(!s.order.length){if(s.reveal===0){s.reveal=1;this.flip();}else this.cleanup();}else{for(const i of [s.edge,1-s.edge]){const c=this.def(s.mains[i]);if(c?.slow&&Math.abs(s.players[0].pos-s.players[1].pos)===1)s.speedMods[1-i]-=c.slow;if(c?.reveal)s.tempoQueue.push({i,...c.reveal});}this.nextTempo();}
 }
 speed(i){return Math.max(0,(this.def(this.s.mains[i])?.speed||0)+(this.s.speedMods?.[i]||0));}
 nextTempo(){const s=this.s;if(s.tokenPending?.length){s.phase='resolve';s.queue=[...s.tokenPending.splice(0),{op:'nextTempo',i:0}];this.pump();return;}while(s.tempoQueue.length){const t=s.tempoQueue.shift(),p=s.players[t.i],n=this.cost(t.i,t);if(p[t.resource]>=(t.resource==='hp'?n+1:n)){s.phase='tempo';this.ask(t.i,'tempo',`Pay ${n} ${t.resource} for +${t.speed} Speed?`,[0,1],{...t,n});return;}}s.order.sort((a,b)=>this.speed(b)-this.speed(a)||(a===s.edge?-1:1));s.phase='reveal';}
 event(k){this.s.events[k]=(this.s.events[k]||0)+1;}
 beginAttack(){
  const s=this.s;s.active=s.order[s.attackIndex];const i=s.active,c=s.mains[i],d=this.def(c);
  s.mods=[{},{}];s.playedReactions=[[],[]];s.preparedReveal=null;s.lastReaction=null;s.trail=[];s.lastCoin=null;s.lastResult={attacker:i,name:d.name,hits:[],walls:[],coin:0,attackHealthDamage:0};s.drawUsed=[false,false];s.passes=0;
  s.activeSource=`attack-${++s.playSerial}-${c.uid}`;s.context={i,card:c,source:s.activeSource,type:'attack',hit:false};
  const first=d.ops.findIndex(o=>o.op==='hit');s.queue=d.ops.slice(0,first).filter(o=>!['pay','researchPay'].includes(o.op)).map(o=>({...o,i}));s.queue.unshift(...activation(this,i));if(s.players[i].hero==='ALF'&&s.players[i].ultimate)s.queue.unshift({op:'move',i,n:1,boots:true});s.queue.push({op:'openWindow',i});s.phase='pre';
  this.log(`${s.players[i].name} activates ${d.name}.`);this.pump();
 }
 advance(){const s=this.s;if(s.phase==='reveal'){this.beginAttack();return;}if(s.phase==='result'){if(s.attackIndex+1<s.order.length){s.attackIndex++;this.beginAttack();}else if(s.reveal===0){s.reveal=1;this.flip();}else this.cleanup();return;}throw Error('Finish the current reaction or movement choice.');}
 canPlay(i,c,retained=false){
  const s=this.s,p=s.players[i],d=this.reactionDef(c);
  if(s.phase!=='reaction'||s.turn!==i||s.prompt||!d||!['Reaction','Dual','Loot'].includes(d.kind))return false;
  // A committed dual-use card is no longer in the hand. A copied UID cannot bypass that lock.
  if(d.kind!=='Loot'&&typeof c==='object'&&!p.hand.some(x=>x.uid===c.uid)&&!(retained&&p.hero==='VER'&&p.tokens>0&&s.active===i&&s.mains[i]?.uid===c.uid&&!s.mods[i].techniqueUsed))return false;
  if(d.side==='attacker'&&s.active!==i||d.side==='defender'&&s.active===i)return false;
  const distance=Math.abs(p.pos-s.players[1-i].pos);
  if(d.reactionRange&&(distance<d.reactionRange[0]||distance>d.reactionRange[1]))return false;
  if(d.cost){const n=this.cost(i,d.cost);if(p[d.cost.resource]<(d.cost.resource==='hp'?n+1:n))return false;}
  if(s.drawUsed[i]&&d.ops.some(o=>o.op==='draw')&&d.ops.every(o=>['draw','discard','scry'].includes(o.op)))return false;
  if(d.discardCost&&p.hand.filter(x=>x.uid!==c.uid).length<1)return false;
  if(d.ops.some(o=>o.op==='recover')&&!p.discard.some(x=>s.playedReactions[i].includes(x.uid)&&this.def(x).category==='Basic'))return false;
  return true;
 }
 cost(i,t){return t.n;}
 paid(i,resource){if(resource==='hp'&&this.s.players[i].hero==='SHE')legacy.healthPaid(this,i);}
 react(i,uid){const p=this.s.players[i],c=p.hand.find(c=>c.uid===uid);this.need(c&&this.isReaction(c)&&this.canPlay(i,c),'Choose a usable Reaction half from your hand on your turn.');p.hand=p.hand.filter(c=>c.uid!==uid);this.playReaction(i,c,false);}
 playLoot(i,id){const p=this.s.players[i];this.need(p.loot.includes(id)&&this.def(id)?.kind==='Loot'&&this.canPlay(i,id),'Choose usable Loot on your turn.');p.loot.splice(p.loot.indexOf(id),1);this.playReaction(i,{id,uid:'loot-'+(++this.s.playSerial)},true);}
 playReaction(i,card,loot,retained=false){
  const s=this.s,p=s.players[i],d=this.reactionDef(card);
  s.lastReaction={player:i,id:card.id};s.context={i,card,source:`reaction-${++s.playSerial}-${card.uid}`,type:'reaction',hit:false,loot,retained,...(retained&&p.hero==='VER'&&p.ultimate?{techniqueMove:true}:{}),walking:p.hero==='MAR'&&p.ultimate&&s.active!==i&&!loot};  if(d.cost){const n=this.cost(i,d.cost);p[d.cost.resource]-=n;this.paid(i,d.cost.resource);this.log(`${p.name} pays ${n} ${d.cost.resource==='hp'?'Health':d.cost.resource==='coins'?'Coins':d.cost.resource==='tokens'?legacy.NAMES[p.hero]:'Block'}.`);this.checkThresholds(i);}
s.passes=0;
  s.queue=[...(d.discardCost?[{op:'discard',n:1}]:[]),...d.ops].map(o=>({...o,i}));s.queue.push({op:'reactionEnd',i,card,loot,retained});s.phase='resolve';this.log(`${p.name} ${loot?'throws':'plays'} ${d.name}${d.kind==='Dual'?' · Reaction half':''}.`);this.pump();
 }
 pass(i){const s=this.s;this.need(s.phase==='reaction'&&s.turn===i&&!s.prompt,'It is not your reaction turn.');s.passes++;this.log(`${s.players[i].name} passes (${s.passes}/2).`);if(s.passes===2)this.strike();else s.turn=1-i;}
 strike(){
  const s=this.s,i=s.active,c=s.mains[i],d=this.def(c),first=d.ops.findIndex(o=>o.op==='hit'),m=s.mods[i];s.context={i,card:c,source:s.activeSource,type:'attack',hit:false};
  const ops=[...d.ops.slice(0,first).filter(o=>['pay','researchPay'].includes(o.op)),...d.ops.slice(first)].map(o=>({...o,i}));
  if(m.push){const at=ops.findIndex(o=>o.op==='push');if(at>=0){if(ops[at].inRange)ops[at].bonusOnHit=m.push;else ops[at].n+=m.push;}else ops.push({op:'push',i,n:m.push,onHit:true});}
  for(let n=0;n<(m.present||0);n++)ops.push({op:'selfPresent',i});ops.push({op:'attackEnd',i,card:c});s.queue=ops;s.phase='resolve';this.log('Two passes. Resolve the attack at the current distance.');this.pump();
 }
 availableMoves(i,n,toward=false){const p=this.s.players[i],o=this.s.players[1-i];if(p.pinned)return [p.pos];return Array.from({length:ARENA_SIZE},(_,k)=>k+1).filter(v=>v!==o.pos&&Math.abs(v-p.pos)<=n&&(!toward||v===p.pos||Math.abs(v-o.pos)<Math.abs(p.pos-o.pos)));}
 ask(i,kind,title,choices,task){this.s.prompt={player:i,kind,title,choices,task};}
 choose(i,value){const q=this.s.prompt;this.need(q&&q.player===i&&q.choices.includes(value),'Choose a legal option for your own fighter.');this.s.prompt=null;const t=q.task;if(legacy.choose(this,i,q,value)||chooseToken(this,i,q,value)){this.pump();return;}if(q.kind==='stash'){if(value>=0){this.s.lootDiscard.push(this.s.players[i].loot.splice(value,1)[0]);this.drawLoot(i);}this.pump();return;}if(q.kind==='tempo'){if(value){this.s.players[i][t.resource]-=t.n;this.paid(i,t.resource);this.s.speedMods[i]+=t.speed;this.checkThresholds(i);this.log(`${this.s.players[i].name} pays ${t.n} ${t.resource==='hp'?'Health':t.resource==='coins'?'Coins':'Block'}: +${t.speed} Speed.`);this.event('tempoPayments');}this.nextTempo();return;}if(q.kind==='discard'){const p=this.s.players[i],c=p.hand.find(c=>c.uid===value);p.hand=p.hand.filter(c=>c.uid!==value);p.discard.push(c);this.log(`${p.name} discards ${this.def(c).name}.`);this.event(t.forced?'forcedDiscards':'ownDiscards');this.pump();return;}if(q.kind==='scry'){const p=this.s.players[i],top=t.cards,keep=value?value.split(','):[];p.deck.splice(p.deck.length-top.length);const bottom=top.filter(c=>!keep.includes(c.uid));p.deck.unshift(...bottom);p.deck.push(...keep.map(uid=>top.find(c=>c.uid===uid)).reverse());this.log(`${p.name} scries ${top.length}: keeps ${keep.length} on top.`);this.event('scries');this.pump();return;}if(q.kind==='recover'){const p=this.s.players[i],c=p.discard.find(c=>c.uid===value);p.discard=p.discard.filter(c=>c.uid!==value);p.hand.push(c);this.log(`${p.name} recovers ${this.def(c).name}.`);this.event('recovered');this.pump();return;}if(t.op==='invest'){if(value){this.s.players[i][t.resource]-=t.cost;this.paid(i,t.resource);this.s.mods[i].damage=(this.s.mods[i].damage||0)+t.bonus;this.checkThresholds(i);this.log(`${this.s.players[i].name} pays ${t.cost} Health: +${t.bonus} damage before reactions.`);this.event('investments');}this.pump();return;}if(t.op==='adjacent')this.moveTo(i,value);else if(t.op==='move')this.moveTo(i,value);else if(t.op==='pay'){if(value===1){this.s.players[i][t.resource]-=t.cost;this.paid(i,t.resource);this.s.mods[i].damage=(this.s.mods[i].damage||0)+t.bonus;this.checkThresholds(i);}}else this.force(t,value);this.pump();}
 moveTo(i,to){const p=this.s.players[i],from=p.pos,o=this.s.players[1-i];p.pos=to;this.crossing(i,from,to,o.pos);this.log(to===from?`${p.name} stays on ${from}.`:`${p.name} moves ${from} → ${to}.`);}
 crossing(i,from,to,rival){legacy.crossing(this,i,from,to,rival);}
 heal(i,n){const p=this.s.players[i],before=p.hp;p.hp=Math.min(MAX_HEALTH,p.hp+n);this.log(`${p.name} heals ${p.hp-before} · ${p.hp} Health.`);}
 checkThresholds(i){const p=this.s.players[i];if(p.hp<=0)return;if(p.hp<=10&&!p.skillUnlocked){p.skillUnlocked=true;p.hand.push(this.instance(p.furyId));this.log(`${p.name} unlocks ${this.def(p.furyId).name}! Commit it in a future round.`);}if(p.hp<=5&&!p.ultimate&&!p.pendingLastStand){p.pendingLastStand=true;p.pendingLastStandCard=this.s.context?.card?.uid||(this.s.phase==='tempo'?this.s.mains[i]?.uid:null)||null;}}
 settleLastStands(){const s=this.s;if(s.phase==='over')return;for(let i=0;i<2;i++){const p=s.players[i];if(!p.pendingLastStand||p.ultimate||p.hp<=0||p.pendingLastStandCard!==(s.context?.card?.uid||null))continue;p.pendingLastStand=false;p.ultimate=true;if(p.hero==='RAV'){p.shadowPos=p.pos;p.shadowUsed=false;}this.log(`LAST STAND! ${p.name}: ${this.data.heroes.find(h=>h.id===p.hero).ultimate.name}.`);this.event('lastStand'+p.hero);if(p.hero==='FRA'){if(p.loot.length<2)this.drawLoot(i);else s.queue.unshift({op:'stashGift',i});}}}
 refillLootDeck(){const s=this.s;if(!s.lootDeck.length&&s.lootDiscard.length){s.lootDeck=this.shuffle(s.lootDiscard);s.lootDiscard=[];}}
 refillMarket(){const s=this.s;while(s.market.length<3){this.refillLootDeck();if(!s.lootDeck.length)break;s.market.push(s.lootDeck.pop());}}
 drawLoot(i,selection='blind'){const s=this.s,p=s.players[i];this.need(p.loot.length<2,'Hold at most two Loot.');let id;if(selection==='blind'){this.refillLootDeck();if(!s.lootDeck.length){this.log('No blind Loot remains. Choose a face-up item.');return false;}id=s.lootDeck.pop();this.log(`${p.name} draws a secret Loot.`);}else{const k=s.market.indexOf(selection);this.need(k>=0,'That Loot is no longer in the market.');id=s.market.splice(k,1)[0];this.log(`${p.name} buys ${this.def(id).name} from the market.`);this.refillMarket();}p.loot.push(id);return true;}
 shopActor(){return [this.s.edge,1-this.s.edge].find(i=>!this.s.shopDone[i])??null;}
 aiShop(i){const p=this.s.players[i],value=id=>{const c=this.def(id);return (c.lootHero===p.hero?.6:0)+c.ops.reduce((n,o)=>n+({heal:Math.min(20-p.hp,o.n||0)*.7,move:(o.n||0)*.5,block:(o.n||0)*.55,boost:(o.n||0)*.7,draw:(o.n||0)*1.1,pierce:2,reach:1.2,swap:1.5,adjacent:2,ping:(o.n||0)*.8}[o.op]||.5),0)-(c.cost?.n||0)*.45;};return [...this.s.market].sort((a,b)=>value(b)-value(a))[0]||'blind';}
 canLastStand(i){const s=this.s,p=s.players[i];if(!p.ultimate||s.phase!=='reaction'||s.turn!==i||s.prompt)return false;if(p.hero==='RAV')return !p.shadowUsed&&!p.pinned&&Number.isInteger(p.shadowPos)&&p.shadowPos!==p.pos&&p.shadowPos!==s.players[1-i].pos;if(p.hero==='FRA')return !s.mods[i].stashUsed&&p.coins>=1&&p.loot.length<2&&(s.lootSupply!==undefined?s.lootSupply+s.market.length>0:s.lootDeck.length+s.lootDiscard.length+s.market.length>0);return false;}
 useLastStand(i,selection='blind'){this.need(this.canLastStand(i),'Your Last Stand reaction is not available.');const s=this.s,p=s.players[i];if(p.hero==='RAV'){const from=p.pos,to=p.shadowPos;p.shadowPos=from;p.shadowUsed=true;const ctx=s.context;s.context={tokenMovement:true};this.moveTo(i,to);s.context=ctx;this.log(`${p.name} swaps with her shadow: ${from} → ${to}.`);this.event('shadowSwaps');}else{this.need(this.drawLoot(i,selection),'No Loot remains.');p.coins--;s.mods[i].stashUsed=true;this.log(`${p.name} buys Loot from the Emergency Stash for 1 Coin.`);this.event('stashBuys');}s.passes=0;s.turn=1-i;}
 reflect(){const s=this.s,ctx=s.context;if(!ctx?.reflectPending)return;ctx.reflectPending=false;const p=s.players[ctx.i];p.hp=Math.max(0,p.hp-1);this.log(`SPIKED SHIELD: ${p.name} takes 1 reflected damage · ${p.hp} Health.`);if(s.lastResult)s.lastResult.reflection=1;this.checkThresholds(ctx.i);}

 damage(target,n,source,{pierce=false,ignore=0,self=false}={}){
  const p=this.s.players[target];let amount=n;
  if(!pierce&&!self){const stopped=Math.min(Math.max(0,p.block-ignore),amount);p.block-=stopped;amount-=stopped;if(stopped)this.log(`${p.name} blocks ${stopped}.`);}
  if(amount<=0)return 0;if(this.s.context?.type==='attack'&&target!==this.s.context.i&&this.s.lastResult)this.s.lastResult.attackHealthDamage=(this.s.lastResult.attackHealthDamage||0)+Math.min(p.hp,amount);p.hp=Math.max(0,p.hp-amount);this.log(`${p.name} takes ${amount} damage · ${p.hp} Health.`);if(this.s.players.some(p=>p.hp<=0))this.reflect();this.checkKO();if(this.s.phase!=='over')this.checkThresholds(target);return amount;
 }
 checkKO(){const s=this.s;if(s.players.some(p=>p.hp<=0)){s.phase='over';s.winner=s.players.every(p=>p.hp<=0)?'draw':s.players[0].hp>0?0:1;
  // A lethal instant must still leave its physical card in the spent pile.
  if(s.context?.type==='reaction'){const ctx=s.context;if(ctx.loot)s.lootDiscard.push(ctx.card.id);else if(!ctx.retained&&ctx.card?.id)s.players[ctx.i].discard.push(ctx.card);s.context=null;}
  for(const p of s.players)if(p.tucked){p.discard.push(p.tucked);p.tucked=null;}s.queue=[];s.prompt=null;s.turn=null;this.log(s.winner==='draw'?'Double knockout!':`${s.players[s.winner].name} wins!`);
 }}
 force(t,n){if(!n)return;if(this.s.mods[1-t.i].armourAnchor){this.log('Armour holds: no forced movement.');return;}if(this.s.players[1-t.i].hero==='MAR'&&this.s.active===1-t.i&&this.s.mods[1-t.i].anchored){this.log('HOLD THE LINE: Marcus resists forced movement.');return;}const s=this.s,p=s.players[t.i],o=s.players[1-t.i],from=o.pos,dir=Math.sign(o.pos-p.pos)*(t.op==='pull'?-1:1),raw=from+dir*n;if(legacy.beforeWall(this,t,n,raw))return;let to=Math.max(1,Math.min(ARENA_SIZE,raw));if(t.op==='pull')to=dir>0?Math.min(to,p.pos-1):Math.max(to,p.pos+1);o.pos=to;this.log(`${p.name} ${t.op==='pull'?'pulls':'launches'} ${o.name} ${from} → ${to}.`);if(t.op==='push'&&(raw<1||raw>ARENA_SIZE)){const damage=1+(t.crunchBonus||0);this.log('WALL SLAM!');if(s.lastResult)s.lastResult.walls.push({damage,target:1-t.i});this.damage(1-t.i,damage,s.context.source,{pierce:true});}}
 attackInfo(i=this.s.active){if(i===null||i===undefined)return null;const s=this.s,c=this.def(s.mains[i]);if(!c)return null;const p=s.players[i],o=s.players[1-i],m=s.mods[i];return {name:c.name,distance:Math.abs(p.pos-o.pos),hits:c.ops.filter(t=>t.op==='hit').map((h,k)=>({damage:Math.max(0,h.n+(k===0?m.damage||0:0)),min:m.minimum??h.min,max:h.max+(p.hero==='SHE'&&p.ultimate?1:0)+(m.range||0),ignore:(h.ignore||0)+(m.ignore||0)+(p.hero==='SIB'&&p.ultimate&&m.spear?2:0),pierce:!!(h.pierce||m.pierce)})),payment:c.ops.filter(t=>['pay','researchPay'].includes(t.op)).map(t=>t.op==='researchPay'?({resource:p.tokens?'tokens':'hp',cost:p.tokens?1:t.cost,bonus:t.bonus}):({resource:t.resource,cost:this.cost(i,t),bonus:t.bonus})),block:o.block};}
 pump(){const s=this.s;let guard=0;while(['pre','resolve'].includes(s.phase)&&!s.prompt&&s.queue.length){
  if(s.tokenPending?.length)s.queue.unshift(...s.tokenPending.splice(0));if(++guard>100)throw Error('Resolution overflow.');const t=s.queue.shift(),p=s.players[t.i],o=s.players[1-t.i],m=s.mods[t.i],ctx=s.context;
  if(t.attackingOnly&&s.active!==t.i||t.onHit&&!ctx.hit||t.inRange&&!ctx.inRange||t.rangeMax&&Math.abs(p.pos-o.pos)>t.rangeMax)continue;
  if(legacy.handle(this,t)||handleOp(this,t))continue;
  switch(t.op){
   case'resumePhase':s.phase=t.phase;break;
   case'stashGift':this.ask(t.i,'stash','Emergency Stash: keep your Loot, or replace one with a free blind draw.',[-1,...p.loot.map((_,k)=>k)],t);break;
   case'coin':{const n=Math.min(t.n,8-p.coins);p.coins+=n;this.event('coinEffects');this.log(`${p.name} gains ${n} Coins.`);break;}
   case'burnCoins':{const n=Math.min(t.n,o.coins);o.coins-=n;this.log(`${o.name} loses ${n} Coins to Pinning Shot.`);this.event('coinsDenied');break;}
   case'steal':{const n=Math.min(t.n,o.coins,8-p.coins);o.coins-=n;p.coins+=n;if(n)this.event('coinStolen');this.log(`${p.name} steals ${n} Coins.`);break;}
   case'discard':case'disrupt':{const target=t.op==='disrupt'?1-t.i:t.i,hand=s.players[target].hand;if(hand.length)this.ask(target,'discard','Choose a card from your uncommitted hand to discard.',hand.map(c=>c.uid),{...t,forced:t.op==='disrupt'});break;}
   case'scry':{if(!p.deck.length){p.deck=this.shuffle(p.discard);p.discard=[];}const cards=p.deck.slice(-t.n).reverse(),choices=[''];const add=(kept,left)=>{for(const c of left){const next=[...kept,c.uid];choices.push(next.join(','));add(next,left.filter(x=>x.uid!==c.uid));}};add([],cards);if(cards.length)this.ask(t.i,'scry','Look at these cards; choose top order, bottom the others.',choices,{...t,cards});break;}
   case'forecast':{if(!p.deck.length){p.deck=this.shuffle(p.discard);p.discard=[];}const card=p.deck.pop();if(card){p.deck.unshift(card);const attack=this.isAttack(card);if(attack){m.damage=(m.damage||0)+2;m.ignore=(m.ignore||0)+2;}else{m.range=(m.range||0)+2;m.minimum=1;}s.preparedReveal={player:t.i,id:card.id,attack};this.log(`${p.name} reveals ${this.def(card).name}: ${attack?'+2 damage · ignore 2 Block':'minimum Range 1 · +2 maximum Range'}. Card goes to the bottom.`);this.event('preparedReveals');}break;}
   case'recover':{const cards=p.discard.filter(c=>s.playedReactions[t.i].includes(c.uid)&&this.def(c).category==='Basic');if(cards.length)this.ask(t.i,'recover','Return a Basic Reaction played this exchange.',cards.map(c=>c.uid),t);break;}
   case'adjacent':{const choices=p.pinned?[p.pos]:[o.pos-1,o.pos+1].filter(v=>v>=1&&v<=ARENA_SIZE);if(choices.length===1)this.moveTo(t.i,choices[0]);else this.ask(t.i,'move','Move to an empty adjacent space.',choices,t);break;}
   case'invest':{const cost=this.cost(t.i,t);if(p[t.resource]>=cost+1)this.ask(t.i,'invest','Pay before the rival reacts?',[0,1],{...t,cost});break;}
   case'defReward':m.defReward=(m.defReward||0)+1;break;
   case'openWindow':s.phase='reaction';s.turn=1-s.active;s.context=null;this.log(`${s.players[s.turn].name} reacts first. Play a card or pass.`);break;
   case'move':if(t.attackBonus){if(s.active===t.i)t.n+=t.attackBonus;delete t.attackBonus;}if(windMove(this,t))break;if(this.availableMoves(t.i,t.n,t.toward).length===1){this.moveTo(t.i,p.pos);break;}this.ask(t.i,'move',p.pinned?'Pinned: stay here until your attack finishes.':`${t.label|| (t.boots?'SPRING BOOTS · ':'')}Move up to ${t.n}${t.toward?' toward the rival':''}. Click a space; your current space means stay.`,this.availableMoves(t.i,t.n,t.toward),t);break;
   case'block':{const n=Math.min(t.n,6-p.block);p.block+=n;this.log(`${p.name} gains ${n} Block.`);break;}
   case'boost':m.damage=(m.damage||0)+t.n;this.log(`Current attack: +${t.n} damage.`);break;
   case'reach':m.range=(m.range||0)+t.n;this.log(`Current attack: +${t.n} maximum Range.`);break;
   case'minimum':m.minimum=t.n;this.log(`Current attack: minimum Range ${t.n}.`);break;
   case'ignore':m.ignore=(m.ignore||0)+t.n;this.log(`Current attack ignores ${t.n} more Block.`);break;
   case'launch':m.push=(m.push||0)+t.n;break;
   case'pierce':m.pierce=true;this.log('Current attack ignores all Block.');break;
   case'present':m.present=(m.present||0)+1;break;
   case'heal':this.heal(t.i,t.n);break;
   case'shred':o.block=Math.max(0,o.block-t.n);this.log(`${o.name} loses up to ${t.n} Block.`);break;
   case'swap':{if(p.pinned){this.log(`${p.name} is pinned: swap skipped; remaining effects still resolve.`);break;}const a=p.pos;p.pos=o.pos;o.pos=a;this.log(`${this.def(ctx.card)?.name||'The effect'} swaps the fighters!`);break;}
   case'ping':this.damage(1-t.i,t.n,ctx.source);break;
   case'draw':if(!s.drawUsed[t.i]){s.drawUsed[t.i]=true;this.event('drawEffects');const n=p.hand.length;this.draw(t.i,t.n);this.log(`${p.name} explicitly draws ${p.hand.length-n} cards.`);}break;
   case'pay':{const cost=this.cost(t.i,t);if(p[t.resource]>=(t.resource==='hp'?cost+1:cost))this.ask(t.i,'pay',`Spend ${cost} ${t.resource==='hp'?'Health':t.resource==='coins'?'Coins':'Block'} for +${t.bonus} damage?`,[0,1],{...t,cost});break;}
   case'hit':{const info=this.attackInfo(t.i),h=info.hits[0],distance=info.distance;if(distance<h.min||distance>h.max){s.lastResult.hits.push({damage:0,blocked:0,loss:0,miss:true,distance});this.log(`${this.def(ctx.card).name} misses at Range ${distance}.`);break;}
    ctx.inRange=true;if(o.hero==='HEL'&&o.ultimate&&!ctx.reflected){ctx.reflected=true;ctx.reflectPending=true;}const blocked=h.pierce?0:Math.min(Math.max(0,o.block-h.ignore),h.damage);s.lastResult.hits.push({damage:h.damage,blocked,loss:h.damage-blocked,miss:false,pierce:h.pierce,ignore:h.ignore});
    const dealt=this.damage(1-t.i,h.damage,ctx.source,{pierce:h.pierce,ignore:h.ignore});if(dealt&&p.hero==='ALF'&&distance>=3)ctx.bullseye=true;m.damage=0;if(dealt){if(p.hero==='SMA'&&!ctx.hit&&s.phase!=='over')legacy.earn(this,t.i);ctx.hit=true;if(p.hero==='SMA'&&p.ultimate&&o.hp>0){o.pinned=true;this.log(`${o.name} is PINNED until their next attack finishes.`);}}break;}
   case'push':t.n+=ctx.hit?(t.bonusOnHit||0):0;this.ask(t.i,'push',`Push up to ${t.n}. Choose a distance.`,Array.from({length:t.n+1},(_,k)=>k),t);break;
   case'pull':{const max=Math.min(t.n,Math.max(0,Math.abs(p.pos-o.pos)-1));if(max)this.ask(t.i,'pull',`Pull up to ${max}. Choose a distance.`,Array.from({length:max+1},(_,k)=>k),t);else this.log('Already adjacent: no pull.');break;}
   case'selfPresent':if(ctx.hit)this.damage(t.i,1,ctx.source,{self:true});break;
   case'reactionEnd':if(ctx.techniqueMove&&!t.techniqueMoved){t.techniqueMoved=true;s.queue.push({op:'move',i:t.i,n:1,label:'TWIN BLADES · '},t);break;}if(ctx.walking&&!t.walked){t.walked=true;s.queue.push({op:'move',i:t.i,n:1,toward:true,label:'WALKING WALL · '},t);break;}this.settleLastStands();if(s.queue.length){s.queue.push(t);break;}if(t.card&&!t.retained){s.playedReactions[t.i].push(t.card.uid);if(t.loot)s.lootDiscard.push(t.card.id);else p.discard.push(t.card);}s.phase='reaction';s.turn=1-t.i;s.context=null;this.log(`${s.players[s.turn].name}: react or pass.`);break;
   case'attackEnd':this.reflect();this.checkKO();if(s.phase==='over')break;this.settleLastStands();if(s.queue.length){s.queue.push(t);break;}p.pinned=false;if(s.mods[1-t.i].defReward&&!s.lastResult.attackHealthDamage){const earned=Math.min(8-o.coins,s.mods[1-t.i].defReward);o.coins+=earned;this.event('defRewards');this.log(`${o.name} gains ${earned} Coins from Hold Your Ground.`);}p.discard.push(t.card);if(p.tucked){p.discard.push(p.tucked);p.tucked=null;}s.plans[t.i][s.reveal].spent=true;if(this.def(t.card).category==='Basic'){const earned=Math.min(1,8-p.coins);p.coins+=earned;s.lastCoin={player:t.i,amount:earned,name:this.def(t.card).name};s.lastResult.coin=earned;this.log(`${p.name}: +${earned} Coin · Basic Attack${earned?'':' (Coin cap 8)'}.`);}if(ctx.bullseye)legacy.earn(this,t.i);s.players.forEach(p=>p.block=0);if(true){s.queue.push({op:'coreEnd',i:t.i,card:t.card},{op:'finishAttack',i:t.i,card:t.card});break;}this.finishAttack(t.card);break;
   case'finishAttack':if(!t.legacyDone){t.legacyDone=true;legacy.end(this,t);if(s.queue.length){s.queue.push(t);break;}}this.finishAttack(t.card);break;
  }
 }}
 cleanup(){const s=this.s;
  for(let i=0;i<2;i++){const p=s.players[i];p.block=0;p.shadowUsed=false;p.airUsed=false;p.dealCredit=false;p.dealRefreshed=false;const kept=p.hand.length;this.draw(i,Math.min(4,Math.max(0,7-kept)));s.lastRefill[i]={round:s.round+1,kept,drawn:p.hand.length-kept,total:p.hand.length};}
  if(s.round>=10){const n=Math.min(18,s.round-8);s.players.forEach(p=>p.hp=Math.max(0,p.hp-n));this.log(`Sudden Death: both lose ${n} Health.`);this.checkKO();if(s.phase==='over')return;s.players.forEach((_,i)=>this.checkThresholds(i));this.settleLastStands();}
  const gifts=s.queue.filter(t=>t.op==='stashGift');s.preparedReveal=null;s.lastReaction=null;s.trail=[];s.lastResult=null;s.lastCoin=null;s.round++;s.edge=1-s.edge;s.reveal=0;s.attackIndex=0;s.active=null;s.turn=null;s.passes=0;s.order=[];s.plans=[[],[]];s.mains=[null,null];s.committed=[false,false];s.mods=[{},{}];s.queue=[];s.context=null;
  s.shopDone=s.players.map(p=>(p.coins<LOOT_COST&&!(p.hero==='FRA'&&p.tokens>=2))||p.loot.length>=2);s.shopTurn=this.shopActor();s.phase=s.shopTurn===null?'program':'shop';this.log('Round complete. Keep unused cards; draw up to 4, stopping at 7.');if(gifts.length){const phase=s.phase;s.phase='resolve';s.queue=[...gifts,{op:'resumePhase',i:0,phase}];this.pump();}
 }
 shop(i,buy,selection='blind'){const s=this.s,p=s.players[i];this.need(s.phase==='shop'&&!s.shopDone[i]&&this.shopActor()===i,'Wait for your turn to buy Loot.');if(buy){this.need(p.coins>=LOOT_COST&&p.loot.length<2,'Loot costs 2 Coins; hold at most two.');this.need(this.drawLoot(i,selection),'No Loot remains.');p.coins-=LOOT_COST;this.event('lootBought');}s.shopDone[i]=true;s.shopTurn=this.shopActor();if(s.shopTurn===null)s.phase='program';}

 finishAttack(card){const s=this.s;s.phase='result';s.turn=null;s.context=null;this.log(`${this.def(card).name} finished.`);}
 tokenActions(i){return [...tokenActions(this,i),...legacy.actions(this,i)];}
 canHeroAbility(i){return this.tokenActions(i).length>0;}
 useHeroAbility(i,id){if(id?.startsWith('deal:')){legacy.deal(this,i,null,id.slice(5));return;}if(id?.startsWith('deal-refresh:')){legacy.deal(this,i,id.slice(13),null);return;}if(legacy.LEGACY.includes(this.s.players[i].hero))legacy.use(this,i,id);else useToken(this,i,id);}
 canDeal(i){return legacy.canDeal(this,i);}
 abilityReaction(i,name,ops,spent=null,effect='Move up to 2. Once per round.'){const s=this.s,p=s.players[i];s.playSerial++;s.lastReaction={player:i,id:spent?.id||s.mains[s.active]?.id,ability:name,effect};s.context={i,card:spent||{uid:'ability-'+s.playSerial},type:'reaction',source:'ability-'+s.playSerial,retained:!spent,walking:false};s.passes=0;s.phase='resolve';s.queue=[...ops.map(o=>({...o,i})),{op:'reactionEnd',i,card:spent}];this.log(`${p.name} uses ${name}.`);this.pump();}
 aiPrepare(i){}
 aiPlan(i){return choosePlan(this,i);}
 aiReact(i){return chooseReaction(this,i);}
 aiChoice(i){return choosePrompt(this,i);}
}

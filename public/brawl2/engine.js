import {choosePlan,chooseReaction,choosePrompt} from './reaction-ai.js';
export const VERSION='brawl2-one-deck-2';
export const LOOT_COST=2;
export const MAX_HEALTH=20;
const copy=x=>structuredClone(x);
export class Brawl2 {
 constructor(data,{mode='solo',seed=Date.now()%2147483646+1,heroes=['SMA','ALF'],decks,furies}={}){
  this.data=data;
  this.s={version:VERSION,mode,rng:(seed>>>0)||1,serial:0,playSerial:0,round:1,edge:0,phase:'program',active:null,turn:null,attackIndex:0,reveal:0,order:[],passes:0,committed:[false,false],plans:[[],[]],mains:[null,null],mods:[{},{}],drawUsed:[false,false],shopDone:[true,true],players:[],queue:[],prompt:null,context:null,activeSource:null,lastReaction:null,trail:[],lastResult:null,lastRefill:[null,null],lastCoin:null,winner:null,log:[],notice:'One hand. Choose two attacks; keep your answers.',lootDeck:[],lootDiscard:[]};
  this.need(Array.isArray(heroes)&&heroes.length===2,'Choose two Heroes.');
  for(let i=0;i<2;i++){
   const h=data.heroes.find(h=>h.id===heroes[i]);this.need(h,'Choose a valid Hero.');
   const deck=decks?.[i]||Brawl2.defaultDeck(data,h.id),fury=furies?.[i]||Brawl2.defaultFury(data,h.id);
   this.need(Brawl2.validDeck(data,h.id,deck),'Choose exactly 24 cards from your Hero’s pool, at most two of each.');
   this.need(h.furies.includes(fury),'Choose one of your Hero’s three Fury cards.');
   this.s.players.push({hero:h.id,name:h.name,hp:MAX_HEALTH,pos:i?5:3,coins:0,block:0,skillUnlocked:false,ultimate:false,furyId:fury,loadout:[...deck],hand:[],deck:this.shuffle(deck.map(id=>this.instance(id))),discard:[],loot:[]});
   this.draw(i,7);
  }
  this.s.edge=this.rand()<.5?0:1;
  this.s.lootDeck=this.shuffle(data.cards.filter(c=>c.category==='Loot').flatMap(c=>[c.id,c.id]));
 }
 static restore(data,s){if(s?.version!==VERSION)throw Error('Start a new One Deck match. Earlier Brawl2 saves use different rules.');const g=Object.create(Brawl2.prototype);g.data=data;g.s=copy(s);return g;}
 static validLoadout(a,n,allowed){return Array.isArray(a)&&a.length===n&&a.every(id=>typeof id==='string'&&allowed.includes(id)&&a.filter(x=>x===id).length<=2);}
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
  const s=this.s;s.lastReaction=null;s.trail=[];s.lastResult=null;s.lastCoin=null;s.mains=s.plans.map(a=>copy(a[s.reveal]||null));
  s.order=[0,1].filter(i=>s.mains[i]).sort((a,b)=>this.speed(b)-this.speed(a)||(a===s.edge?-1:1));
  s.attackIndex=0;s.active=null;s.turn=null;s.phase='reveal';s.passes=0;s.mods=[{},{}];
  this.log(`Pair ${s.reveal+1}: ${this.def(s.mains[0])?.name||'Pass'} versus ${this.def(s.mains[1])?.name||'Pass'}.`);
  if(!s.order.length){if(s.reveal===0){s.reveal=1;this.flip();}else this.cleanup();}
 }
 speed(i){return this.def(this.s.mains[i])?.speed||0;}
 beginAttack(){
  const s=this.s;s.active=s.order[s.attackIndex];const i=s.active,c=s.mains[i],d=this.def(c);
  s.mods=[{},{}];s.lastReaction=null;s.trail=[];s.lastCoin=null;s.lastResult={attacker:i,name:d.name,hits:[],walls:[],coin:0};s.drawUsed=[false,false];s.passes=0;
  s.activeSource=`attack-${++s.playSerial}-${c.uid}`;s.context={i,card:c,source:s.activeSource,type:'attack',hit:false};
  const first=d.ops.findIndex(o=>o.op==='hit');s.queue=d.ops.slice(0,first).filter(o=>o.op!=='pay').map(o=>({...o,i}));s.queue.push({op:'openWindow',i});s.phase='pre';
  this.log(`${s.players[i].name} activates ${d.name}.`);this.pump();
 }
 advance(){const s=this.s;if(s.phase==='reveal'){this.beginAttack();return;}if(s.phase==='result'){if(s.attackIndex+1<s.order.length){s.attackIndex++;this.beginAttack();}else if(s.reveal===0){s.reveal=1;this.flip();}else this.cleanup();return;}throw Error('Finish the current reaction or movement choice.');}
 canPlay(i,c){
  const s=this.s,p=s.players[i],d=this.reactionDef(c);
  if(s.phase!=='reaction'||s.turn!==i||s.prompt||!d||!['Reaction','Dual','Loot'].includes(d.kind))return false;
  // A committed dual-use card is no longer in the hand. A copied UID cannot bypass that lock.
  if(d.kind!=='Loot'&&typeof c==='object'&&!p.hand.some(x=>x.uid===c.uid))return false;
  if(d.side==='attacker'&&s.active!==i||d.side==='defender'&&s.active===i)return false;
  const distance=Math.abs(p.pos-s.players[1-i].pos);
  if(d.reactionRange&&(distance<d.reactionRange[0]||distance>d.reactionRange[1]))return false;
  if(d.cost){const n=this.cost(i,d.cost);if(p[d.cost.resource]<(d.cost.resource==='hp'?n+1:n))return false;}
  if(s.drawUsed[i]&&d.ops.every(o=>o.op==='draw'))return false;
  return true;
 }
 cost(i,t){const p=this.s.players[i];return t.resource==='hp'&&p.hero==='SHE'&&p.ultimate?Math.max(1,t.n-1):t.n;}
 react(i,uid){const p=this.s.players[i],c=p.hand.find(c=>c.uid===uid);this.need(c&&this.isReaction(c)&&this.canPlay(i,c),'Choose a usable Reaction half from your hand on your turn.');p.hand=p.hand.filter(c=>c.uid!==uid);this.playReaction(i,c,false);}
 playLoot(i,id){const p=this.s.players[i];this.need(p.loot.includes(id)&&this.def(id)?.kind==='Loot'&&this.canPlay(i,id),'Choose usable Loot on your turn.');p.loot.splice(p.loot.indexOf(id),1);this.playReaction(i,{id,uid:'loot-'+(++this.s.playSerial)},true);}
 playReaction(i,card,loot){
  const s=this.s,p=s.players[i],d=this.reactionDef(card);
  if(d.cost){const n=this.cost(i,d.cost);p[d.cost.resource]-=n;this.log(`${p.name} pays ${n} ${d.cost.resource==='hp'?'Health':'Block'}.`);this.checkThresholds(i);}
  if(p.hero==='FRA'&&s.active===i&&d.category==='Basic'&&!s.mods[i].oneTwo&&['Hero','Special'].includes(this.def(s.mains[i])?.category)){s.mods[i].oneTwo=true;s.mods[i].damage=(s.mods[i].damage||0)+(p.ultimate?2:1);this.log(`One-Two: +${p.ultimate?2:1} damage.`);}
  s.lastReaction={player:i,id:card.id};s.context={i,card,source:`reaction-${++s.playSerial}-${card.uid}`,type:'reaction',hit:false,loot};s.passes=0;
  s.queue=d.ops.map(o=>({...o,i}));s.queue.push({op:'reactionEnd',i,card,loot});s.phase='resolve';this.log(`${p.name} ${loot?'throws':'plays'} ${d.name}${d.kind==='Dual'?' · Reaction half':''}.`);this.pump();
 }
 pass(i){const s=this.s;this.need(s.phase==='reaction'&&s.turn===i&&!s.prompt,'It is not your reaction turn.');s.passes++;this.log(`${s.players[i].name} passes (${s.passes}/2).`);if(s.passes===2)this.strike();else s.turn=1-i;}
 strike(){
  const s=this.s,i=s.active,c=s.mains[i],d=this.def(c),first=d.ops.findIndex(o=>o.op==='hit'),m=s.mods[i];s.context={i,card:c,source:s.activeSource,type:'attack',hit:false};
  const ops=[...d.ops.slice(0,first).filter(o=>o.op==='pay'),...d.ops.slice(first)].map(o=>({...o,i}));
  if(m.push){const at=ops.findIndex(o=>o.op==='push');if(at>=0)ops[at].n+=m.push;else ops.push({op:'push',i,n:m.push,onHit:true});}
  if(m.present)ops.push({op:'selfPresent',i});ops.push({op:'attackEnd',i,card:c});s.queue=ops;s.phase='resolve';this.log('Two passes. Resolve the attack at the current distance.');this.pump();
 }
 availableMoves(i,n){const p=this.s.players[i],o=this.s.players[1-i];return Array.from({length:7},(_,k)=>k+1).filter(v=>v!==o.pos&&Math.abs(v-p.pos)<=n);}
 ask(i,kind,title,choices,task){this.s.prompt={player:i,kind,title,choices,task};}
 choose(i,value){const q=this.s.prompt;this.need(q&&q.player===i&&q.choices.includes(value),'Choose a legal option for your own fighter.');this.s.prompt=null;const t=q.task;if(t.op==='move')this.moveTo(i,value);else if(t.op==='pay'){if(value===1){this.s.players[i][t.resource]-=t.cost;this.s.mods[i].damage=(this.s.mods[i].damage||0)+t.bonus;this.checkThresholds(i);}}else this.force(t,value);this.pump();}
 moveTo(i,to){const p=this.s.players[i],from=p.pos,o=this.s.players[1-i];p.pos=to;this.crossing(i,from,to,o.pos);this.log(to===from?`${p.name} stays on ${from}.`:`${p.name} moves ${from} → ${to}.`);}
 crossing(i,from,to,rival){const s=this.s,p=s.players[i],m=s.mods[i];if(p.hero!=='RAV'||s.context?.type==='attack'&&s.context.hit||s.active==null||m.crossed||Math.sign(from-rival)===Math.sign(to-rival))return;m.crossed=true;const n=p.ultimate?3:2;if(s.active===i)m.damage=(m.damage||0)+n;else p.block=Math.min(6,p.block+n);this.log(`Slippery: +${n} ${s.active===i?'damage':'Block'}.`);}
 heal(i,n){const p=this.s.players[i],before=p.hp;p.hp=Math.min(MAX_HEALTH,p.hp+n+(p.hero==='SHE'?1:0));this.log(`${p.name} heals ${p.hp-before} · ${p.hp} Health.`);}
 checkThresholds(i){const p=this.s.players[i];if(p.hp<=0)return;if(p.hp<=10&&!p.skillUnlocked){p.skillUnlocked=true;p.hand.push(this.instance(p.furyId));this.log(`${p.name} unlocks ${this.def(p.furyId).name}! Commit it in a future round.`);}if(p.hp<=5&&!p.ultimate){p.ultimate=true;this.log(`${p.name} unlocks ${this.data.heroes.find(h=>h.id===p.hero).ultimate.name}!`);}}
 damage(target,n,source,{pierce=false,ignore=0,self=false}={}){
  const p=this.s.players[target];let amount=n;
  if(!pierce&&!self){const stopped=Math.min(Math.max(0,p.block-ignore),amount);p.block-=stopped;amount-=stopped;if(stopped)this.log(`${p.name} blocks ${stopped}.`);}
  if(amount<=0)return 0;p.hp=Math.max(0,p.hp-amount);this.log(`${p.name} takes ${amount} damage · ${p.hp} Health.`);this.checkKO();if(this.s.phase!=='over')this.checkThresholds(target);return amount;
 }
 checkKO(){const s=this.s;if(s.players.some(p=>p.hp<=0)){s.phase='over';s.winner=s.players.every(p=>p.hp<=0)?'draw':s.players[0].hp>0?0:1;
  // A lethal instant must still leave its physical card in the spent pile.
  if(s.context?.type==='reaction'){const ctx=s.context;if(ctx.loot)s.lootDiscard.push(ctx.card.id);else s.players[ctx.i].discard.push(ctx.card);s.context=null;}
  s.queue=[];s.prompt=null;s.turn=null;this.log(s.winner==='draw'?'Double knockout!':`${s.players[s.winner].name} wins!`);
 }}
 force(t,n){if(!n)return;const s=this.s,p=s.players[t.i],o=s.players[1-t.i],from=o.pos,dir=Math.sign(o.pos-p.pos)*(t.op==='pull'?-1:1),raw=from+dir*n;let to=Math.max(1,Math.min(7,raw));if(t.op==='pull')to=dir>0?Math.min(to,p.pos-1):Math.max(to,p.pos+1);o.pos=to;this.log(`${p.name} ${t.op==='pull'?'pulls':'launches'} ${o.name} ${from} → ${to}.`);if(t.op==='push'&&(raw<1||raw>7)){const damage=p.hero==='SMA'?(p.ultimate?3:2):1;this.log('WALL SLAM!');if(s.lastResult)s.lastResult.walls.push({damage,target:1-t.i});this.damage(1-t.i,damage,s.context.source,{pierce:true});}}
 attackInfo(i=this.s.active){if(i===null||i===undefined)return null;const s=this.s,c=this.def(s.mains[i]);if(!c)return null;const p=s.players[i],o=s.players[1-i],m=s.mods[i];return {name:c.name,distance:Math.abs(p.pos-o.pos),hits:c.ops.filter(t=>t.op==='hit').map((h,k)=>({damage:h.n+(k===0?m.damage||0:0)+(p.hero==='ALF'&&Math.abs(p.pos-o.pos)>=2?(p.ultimate?2:1):0),min:m.minimum??h.min,max:h.max+(p.hero==='ALF'&&h.min>=2?1:0)+(m.range||0),ignore:(h.ignore||0)+(m.ignore||0),pierce:!!(h.pierce||m.pierce)})),payment:c.ops.filter(t=>t.op==='pay').map(t=>({resource:t.resource,cost:this.cost(i,t),bonus:t.bonus})),block:o.block};}
 pump(){const s=this.s;let guard=0;while(['pre','resolve'].includes(s.phase)&&!s.prompt&&s.queue.length){
  if(++guard>100)throw Error('Resolution overflow.');const t=s.queue.shift(),p=s.players[t.i],o=s.players[1-t.i],m=s.mods[t.i],ctx=s.context;
  if(t.attackingOnly&&s.active!==t.i||t.onHit&&!ctx.hit||t.rangeMax&&Math.abs(p.pos-o.pos)>t.rangeMax)continue;
  switch(t.op){
   case'openWindow':s.phase='reaction';s.turn=1-s.active;s.context=null;this.log(`${s.players[s.turn].name} reacts first. Play a card or pass.`);break;
   case'move':this.ask(t.i,'move',`Move up to ${t.n}. Click a space; your current space means stay.`,this.availableMoves(t.i,t.n),t);break;
   case'block':p.block=Math.min(6,p.block+t.n);this.log(`${p.name} gains ${t.n} Block.`);break;
   case'boost':m.damage=(m.damage||0)+t.n;this.log(`Current attack: +${t.n} damage.`);break;
   case'reach':m.range=(m.range||0)+t.n;this.log(`Current attack: +${t.n} maximum Range.`);break;
   case'minimum':m.minimum=t.n;this.log(`Current attack: minimum Range ${t.n}.`);break;
   case'ignore':m.ignore=(m.ignore||0)+t.n;this.log(`Current attack ignores ${t.n} more Block.`);break;
   case'launch':m.push=(m.push||0)+t.n;break;
   case'pierce':m.pierce=true;this.log('Current attack ignores all Block.');break;
   case'present':m.present=true;break;
   case'heal':this.heal(t.i,t.n);break;
   case'shred':o.block=Math.max(0,o.block-t.n);this.log(`${o.name} loses up to ${t.n} Block.`);break;
   case'swap':{const a=p.pos;p.pos=o.pos;o.pos=a;this.log('Banana Peel swaps the fighters!');break;}
   case'ping':this.damage(1-t.i,t.n,ctx.source);break;
   case'draw':if(!s.drawUsed[t.i]){s.drawUsed[t.i]=true;const n=p.hand.length;this.draw(t.i,t.n);this.log(`${p.name} explicitly draws ${p.hand.length-n} cards.`);}break;
   case'pay':{const cost=this.cost(t.i,t);if(p[t.resource]>=(t.resource==='hp'?cost+1:cost))this.ask(t.i,'pay',`Spend ${cost} ${t.resource==='hp'?'Health':'Block'} for +${t.bonus} damage?`,[0,1],{...t,cost});break;}
   case'hit':{const info=this.attackInfo(t.i),h=info.hits[0],distance=info.distance;if(distance<h.min||distance>h.max){s.lastResult.hits.push({damage:0,blocked:0,loss:0,miss:true,distance});this.log(`${this.def(ctx.card).name} misses at Range ${distance}.`);break;}
    const blocked=h.pierce?0:Math.min(Math.max(0,o.block-h.ignore),h.damage);s.lastResult.hits.push({damage:h.damage,blocked,loss:h.damage-blocked,miss:false,pierce:h.pierce,ignore:h.ignore});
    const dealt=this.damage(1-t.i,h.damage,ctx.source,{pierce:h.pierce,ignore:h.ignore});m.damage=0;if(dealt)ctx.hit=true;break;}
   case'push':this.ask(t.i,'push',`Push up to ${t.n}. Choose a distance.`,Array.from({length:t.n+1},(_,k)=>k),t);break;
   case'pull':{const max=Math.min(t.n,Math.max(0,Math.abs(p.pos-o.pos)-1));if(max)this.ask(t.i,'pull',`Pull up to ${max}. Choose a distance.`,Array.from({length:max+1},(_,k)=>k),t);else this.log('Already adjacent: no pull.');break;}
   case'selfPresent':if(ctx.hit)this.damage(t.i,1,ctx.source,{self:true});break;
   case'reactionEnd':if(t.loot)s.lootDiscard.push(t.card.id);else p.discard.push(t.card);s.phase='reaction';s.turn=1-t.i;s.context=null;this.log(`${s.players[s.turn].name}: react or pass.`);break;
   case'attackEnd':p.discard.push(t.card);s.plans[t.i][s.reveal].spent=true;if(this.def(t.card).category==='Basic'){const earned=Math.min(1,8-p.coins);p.coins+=earned;s.lastCoin={player:t.i,amount:earned,name:this.def(t.card).name};s.lastResult.coin=earned;this.log(`${p.name}: +${earned} Coin · Basic Attack${earned?'':' (Coin cap 8)'}.`);}s.players.forEach(p=>p.block=p.hero==='HEL'?Math.min(p.block,p.ultimate?4:2):0);s.phase='result';s.turn=null;s.context=null;this.log(`${this.def(t.card).name} finished. No cards are drawn.`);break;
  }
 }}
 cleanup(){const s=this.s;
  for(let i=0;i<2;i++){const p=s.players[i];p.block=0;const kept=p.hand.length;this.draw(i,Math.min(4,Math.max(0,7-kept)));s.lastRefill[i]={round:s.round+1,kept,drawn:p.hand.length-kept,total:p.hand.length};}
  if(s.round>=10){const n=Math.min(18,s.round-8);s.players.forEach(p=>p.hp=Math.max(0,p.hp-n));this.log(`Sudden Death: both lose ${n} Health.`);this.checkKO();if(s.phase==='over')return;s.players.forEach((_,i)=>this.checkThresholds(i));}
  s.lastReaction=null;s.trail=[];s.lastResult=null;s.lastCoin=null;s.round++;s.edge=1-s.edge;s.reveal=0;s.attackIndex=0;s.active=null;s.turn=null;s.passes=0;s.order=[];s.plans=[[],[]];s.mains=[null,null];s.committed=[false,false];s.mods=[{},{}];s.queue=[];s.context=null;
  s.shopDone=s.players.map(p=>p.coins<LOOT_COST||p.loot.length>=2);s.phase=s.shopDone.every(Boolean)?'program':'shop';this.log('Round complete. Keep unused cards; draw up to 4, stopping at 7.');
 }
 shop(i,buy){const s=this.s,p=s.players[i];this.need(s.phase==='shop'&&!s.shopDone[i],'Your purchase window is closed.');if(buy){this.need(p.coins>=LOOT_COST&&p.loot.length<2,'Loot costs 2 Coins; hold at most two.');if(!s.lootDeck.length){s.lootDeck=this.shuffle(s.lootDiscard);s.lootDiscard=[];}this.need(s.lootDeck.length,'No Loot remains.');p.coins-=LOOT_COST;p.loot.push(s.lootDeck.pop());this.log(`${p.name} buys a secret Loot.`);}s.shopDone[i]=true;if(s.shopDone.every(Boolean))s.phase='program';}
 aiPlan(i){return choosePlan(this,i);}
 aiReact(i){return chooseReaction(this,i);}
 aiChoice(i){return choosePrompt(this,i);}
}

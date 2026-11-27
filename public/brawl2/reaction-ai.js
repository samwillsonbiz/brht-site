// Public positions/resources and this player's own cards only; never rival hands or deck order.
const clone=x=>structuredClone(x);
const distance=w=>Math.abs(w.players[0].pos-w.players[1].pos);
export const movementAllowance=(t,attacking)=>t.n+(attacking?t.attackBonus||0:0);
export function world(g){return {bounds:g.bounds(),spikes:g.s.spikeWalls||[],players:g.s.players.map(p=>({hero:p.hero,hp:p.hp,pos:p.pos,block:p.block,coins:p.coins,ultimate:p.ultimate,pinned:p.pinned,shadowPos:p.shadowPos,shadowUsed:p.shadowUsed,tokens:p.tokens,wind:p.wind})),mods:clone(g.s.mods),draw:0};}
function cost(p,t){return t.n;}
function crossed(w,i,from,active){const p=w.players[i],o=w.players[1-i],m=w.mods[i];if(p.hero==='RAV'&&!m.trickCrossed&&Math.sign(from-o.pos)!==Math.sign(p.pos-o.pos)){m.trickCrossed=true;p.tokens=Math.min(2,p.tokens+1);}}
export function attackEstimate(g,w,i=g.s.active,card=g.s.mains[i],payments=true){const c=g.def(card),p=w.players[i],o=w.players[1-i],m=w.mods[i],h=c?.ops.find(t=>t.op==='hit');if(!h)return {loss:0,hit:false,payment:0};const d=distance(w),min=m.minimum??h.min,max=h.max+(p.hero==='SHE'&&p.ultimate?1:0)+(m.range||0);if(d<min||d>max)return {loss:0,hit:false,payment:0};let damage=h.n+(m.damage||0),paid=0;if(payments)for(const t of c.ops.filter(t=>t.op==='researchPay'||t.op==='pay'||t.op==='invest'&&card?.uid!==g.s.mains[g.s.active]?.uid)){const n=cost(p,t);if(t.op==='researchPay'){if(p.tokens||p.hp>t.cost){damage+=t.bonus;paid+=p.tokens?.7:t.cost;}continue;}if(p[t.resource]>=(t.resource==='hp'?n+1:n)){damage+=t.bonus;if(t.resource==='hp')paid+=n;else if(t.resource==='coins')paid+=n*.9;}}
 const blocked=h.pierce||m.pierce?0:Math.min(damage,Math.max(0,o.block-(h.ignore||0)-(m.ignore||0)-(p.hero==='SIB'&&p.ultimate&&m.spear?2:0)));let loss=Math.max(0,damage-blocked);
 if(loss>0){const push=(c.ops.find(t=>t.op==='push')?.n||0)+(m.push||0),raw=o.pos+Math.sign(o.pos-p.pos)*push;if(push&&(raw<w.bounds[0]||raw>w.bounds[1]))loss+=!g.simpleImpact()&&p.hero==='SMA'&&p.tokens>0&&!m.impactLaunch?3:w.spikes.some(t=>t.space===(raw<w.bounds[0]?1:8))?2:1;}
 if(g.simpleImpact()&&p.hero==='SMA'&&p.tokens+(loss>0?1:0)>0&&!w.mods[1-i].armourAnchor&&!w.mods[1-i].anchored){const push=loss>0?(c.ops.find(t=>t.op==='push')?.n||0)+(m.push||0):0;const pos=Math.max(w.bounds[0],Math.min(w.bounds[1],o.pos+Math.sign(o.pos-p.pos)*push));{const raw=pos+Math.sign(pos-p.pos);if(raw<w.bounds[0]||raw>w.bounds[1])loss+=w.spikes.some(t=>t.space===(raw<w.bounds[0]?1:8))?2:1;}}
 return {loss,blocked,hit:true,payment:paid};}
function ownFuture(g,i,w){const s=g.s;let c=null;if(s.order.indexOf(i)>s.attackIndex)c=s.mains[i];else if(s.reveal===0)c=s.plans[i]?.[1];if(!c||!g.def(c))return 0;const d=g.def(c),h=d.ops.find(t=>t.op==='hit'),p=w.players[i],o=w.players[1-i],n=d.ops.filter(t=>t.op==='move').reduce((a,t)=>a+t.n,0);let value=0;for(let to=g.bounds()[0];to<=g.bounds()[1];to++)if(to!==o.pos&&Math.abs(to-p.pos)<=n){const space=Math.abs(to-o.pos),max=h.max+(p.hero==='SHE'&&p.ultimate?1:0);if(space>=h.min&&space<=max)value=h.n;}return value;}
function utility(g,i,before,after){const attacking=g.s.active===i,style=g.aiStyle||'tactical',a=attackEstimate(g,before),b=attackEstimate(g,after);const resolved=g.s.context?.type==='attack'&&g.s.context.hit;let value=(resolved?0:attacking?b.loss-a.loss:a.loss-b.loss)*(attacking&&style==='aggressive'?1.15:!attacking&&style==='guarded'?1.2:1);
 value+=(after.players[i].hp-before.players[i].hp)*.85+(before.players[1-i].hp-after.players[1-i].hp)*1.1+after.draw*1.1;
 value+=((after.players[i].tokens||0)-(before.players[i].tokens||0))*.65;
 value+=(after.players[i].coins-before.players[i].coins)*1.1+(before.players[1-i].coins-after.players[1-i].coins)*.6;
 const defender=after.players[1-g.s.active];if(defender.hero==='HEL'&&defender.ultimate&&!resolved){value+=(attacking?-1:1)*(Number(b.hit)-Number(a.hit));if(attacking&&b.hit&&after.players[i].hp<=1)value-=30;}if(attacking&&!resolved)value-=(b.payment-a.payment)*.7;
 if(after.players[1-i].hp<=0)value+=30;if(after.players[i].hp<=0)value-=40;
 if(!resolved&&attacking&&b.loss>=after.players[1-i].hp&&a.loss<before.players[1-i].hp)value+=15;
 if(!resolved&&!attacking&&a.loss>=before.players[i].hp&&b.loss<after.players[i].hp)value+=18;
 if(attacking&&g.s.plans[1-i]?.some(c=>!c.spent)){value+=(after.players[i].block-before.players[i].block)*.4;}if(style!=='aggressive')value+=(ownFuture(g,i,after)-ownFuture(g,i,before))*.18;

 return value;
}
function force(w,i,n,op){const p=w.players[i],o=w.players[1-i],raw=o.pos+Math.sign(o.pos-p.pos)*(op==='pull'?-1:1)*n;o.pos=Math.max(w.bounds[0],Math.min(w.bounds[1],raw));if(op==='push'&&(raw<w.bounds[0]||raw>w.bounds[1]))o.hp-=w.spikes.some(t=>t.space===(raw<w.bounds[0]?1:8))?2:1;}
export function reactionWorlds(g,i,card,before,includeWalking=true){const d=g.reactionDef(card),start=clone(before),ends=[];if(d.discardCost)start.draw-=.65;if(d.cost){start.players[i][d.cost.resource]-=cost(start.players[i],d.cost);}
 function visit(k,w){if(k===d.ops.length){if(includeWalking&&card&&g.def(card)?.kind!=='Loot'&&w.players[i].hero==='MAR'&&w.players[i].ultimate&&g.s.active!==i&&!g.s.mods[i].walkingWallUsed){const p=w.players[i],o=w.players[1-i];for(let to=g.bounds()[0];to<=g.bounds()[1];to++)if(to!==o.pos&&Math.abs(to-p.pos)<=(p.pinned?0:1)){const next=clone(w);next.players[i].pos=to;ends.push(next);}}else ends.push(w);return;}const t=d.ops[k],p=w.players[i],o=w.players[1-i],m=w.mods[i];if(t.attackingOnly&&g.s.active!==i||t.rangeMax&&distance(w)>t.rangeMax){visit(k+1,w);return;}
  if(t.op==='guardChoice'){for(const op of [{op:'move',n:2},{op:'ignore',n:3}]){const proxy=Object.create(g);proxy.reactionDef=()=>({...d,discardCost:false,cost:null,ops:[op,...d.ops.slice(k+1)]});ends.push(...reactionWorlds(proxy,i,card,w,includeWalking));}return;}if(t.op==='move'||t.op==='trickMove'||t.op==='adjacent'){if(p.pinned){visit(k+1,w);return;}for(let to=g.bounds()[0];to<=g.bounds()[1];to++)if(to!==o.pos&&(t.op==='adjacent'?Math.abs(to-o.pos)===1:(t.op==='trickMove'?(Math.abs(to-p.pos)<=1||Math.abs(p.pos-o.pos)===1&&to===o.pos+Math.sign(o.pos-p.pos)):Math.abs(to-p.pos)<=movementAllowance(t,g.s.active===i)))){const n=clone(w);n.players[i].pos=to;if(t.op!=='trickMove')crossed(n,i,p.pos,g.s.active);visit(k+1,n);}return;}
  if(t.op==='push'||t.op==='pull'){const max=t.op==='pull'?Math.min(t.n,distance(w)-1):t.n;for(let n=0;n<=max;n++){const x=clone(w);force(x,i,n,t.op);visit(k+1,x);}return;}
  switch(t.op){case'impactPrep':case'legacyGain':p.tokens=Math.min(3,p.tokens+1);break;case'escapeAim':if(distance(w)>=3)p.tokens=Math.min(2,p.tokens+1);break;case'aimDraw':case'crossDraw':if(p.tokens&&!g.s.drawUsed[i])w.draw+=.6;break;case'antidote':w.mods[g.s.active].damage=(w.mods[g.s.active].damage||0)-4;break;case'armourAnchor':m.armourAnchor=true;break;case'disrupt':w.draw+=1.2;break;case'steal':{const n=Math.min(t.n,o.coins,8-p.coins);p.coins+=n;o.coins-=n;break;}case'coin':p.coins=Math.min(8,p.coins+t.n);break;case'scry':w.draw+=.75;break;case'discard':w.draw-=.6;break;case'recover':w.draw+=2;break;case'defReward':w.draw+=g.s.active===i?.5:attackEstimate(g,w).loss===0?.9:.1;break;case'forecast':m.damage=(m.damage||0)+1.5;m.ignore=(m.ignore||0)+1.5;m.range=(m.range||0)+.5;break;case'block':p.block=Math.min(6,p.block+t.n);break;case'boost':m.damage=(m.damage||0)+t.n;break;case'reach':m.range=(m.range||0)+t.n;break;case'minimum':m.minimum=t.n;break;case'ignore':m.ignore=(m.ignore||0)+t.n;break;case'pierce':m.pierce=true;break;case'heal':p.hp=Math.min(20,p.hp+t.n);break;case'shred':o.block=Math.max(0,o.block-t.n);break;case'swap':{if(p.pinned)break;const pos=p.pos;p.pos=o.pos;o.pos=pos;break;}case'ping':{const hit=Math.max(0,t.n-o.block);o.block=Math.max(0,o.block-t.n);o.hp-=hit;break;}case'draw':if(!g.s.drawUsed[i])w.draw+=t.n;break;case'launch':m.push=(m.push||0)+t.n;break;case'present':m.present=(m.present||0)+1;break;}
  visit(k+1,w);
 }visit(0,start);return ends;
}
export function reactionScore(g,i,card){const before=world(g);return Math.max(...reactionWorlds(g,i,card,before).map(w=>utility(g,i,before,w)))-.65-(g.s.players[i].hand.length<=2?.35:0);}
export function chooseReaction(g,i){let best={action:'pass'},score=.05;for(const c of g.hand(i,'Reaction'))if(g.canPlay(i,c)){const n=reactionScore(g,i,c);if(n>score){score=n;best={action:'react',uid:c.uid};}}for(const id of g.s.players[i].loot)if(g.canPlay(i,id)){const n=reactionScore(g,i,id)-.1;if(n>score){score=n;best={action:'loot',card:id};}}for(const action of g.tokenActions(i)){const before=world(g);let n=-Infinity;if(action.id==='technique')n=reactionScore(g,i,g.s.mains[i])+.35;else if(action.ops){const proxy=Object.create(g);proxy.reactionDef=()=>({ops:action.ops,cost:{resource:'tokens',n:action.cost}});n=Math.max(...reactionWorlds(proxy,i,null,before).map(w=>utility(g,i,before,w)))-.1;}else if(action.id==='breakthrough'){const after=clone(before);after.mods[i].damage=(after.mods[i].damage||0)+2;after.mods[i].push=(after.mods[i].push||0)+2;n=utility(g,i,before,after)-.8;}else n=Math.max(...g.availableMoves(i,1,true).map(pos=>{const after=clone(before);after.players[i].pos=pos;return utility(g,i,before,after);}))-.25;if(n>score){score=n;best={action:'ability',uid:action.id};}}if(g.canLastStand(i)){const p=g.s.players[i];let n=.35;if(p.hero==='SMA'&&g.spikeMode())n=1;else if(p.hero==='RAV'){const before=world(g),after=clone(before);after.players[i].pos=p.shadowPos;n=utility(g,i,before,after)-.25;}if(p.hero==='VER')n=reactionScore(g,i,g.s.mains[i])+.65;if(p.hero==='MEI'){const before=world(g);n=Math.max(...g.availableMoves(i,2).map(pos=>{const after=clone(before);after.players[i].pos=pos;return utility(g,i,before,after);}));}if(n>score)best={action:'last-stand'};}return best;}

export function preWorlds(g,i,card,w){let list=[clone(w)];for(const t of [...(w.players[i].hero==='ALF'&&w.players[i].ultimate?[{op:'move',n:1}]:[]),...g.def(card).ops]){if(t.op==='hit')break;if(t.op==='move'){list=list.flatMap(v=>Array.from({length:8},(_,k)=>k+1).filter(to=>g.legalSpace(to)&&to!==v.players[1-i].pos&&Math.abs(to-v.players[i].pos)<=(v.players[i].pinned?0:movementAllowance(t,true))).map(to=>{const x=clone(v),from=x.players[i].pos;x.players[i].pos=to;crossed(x,i,from,i);return x;}));}else for(const v of list){const p=v.players[i];if(t.op==='block')p.block=Math.min(6,p.block+t.n);if(t.op==='heal')p.hp=Math.min(20,p.hp+t.n);}}return list;}
export function choosePlan(g,i){const cards=g.hand(i,'Attack');if(cards.length<2)return cards.map(c=>c.uid);const p=g.s.players[i],o=g.s.players[1-i];let best,score=-Infinity;const start=world(g);
 for(const a of cards)for(const b of cards){if(a.uid===b.uid)continue;const answers=g.hand(i,'Reaction').filter(c=>c.uid!==a.uid&&c.uid!==b.uid);let w=clone(start),total=0;
  for(const card of [a,b]){const d=g.def(card),h=d.ops.find(t=>t.op==='hit');let value=-Infinity,chosen;w.mods[i]={};for(const x of preWorlds(g,i,card,w)){const e=attackEstimate(g,x,i,card),gap=Math.max(0,(x.mods[i].minimum??h.min)-distance(x),distance(x)-(h.max+(p.hero==='SHE'&&p.ultimate?1:0)));let v=e.loss-e.payment*.7;if(!e.hit){const bridge=answers.some(c=>{const r=g.reactionDef(c);return r.side!=='defender'&&r.ops.some(t=>t.op==='move'&&!x.players[i].pinned&&movementAllowance(t,true)>=gap||t.op==='reach'&&distance(x)>h.max&&t.n>=gap||t.op==='minimum'&&distance(x)<h.min);});v=bridge?h.n*.45:0;}
    v+=(x.players[i].hp-w.players[i].hp)*.65+(x.players[i].block-w.players[i].block)*.12;
    const onHeal=d.ops.filter(t=>t.op==='heal'&&t.onHit).reduce((n,t)=>n+t.n,0);if(e.hit&&e.loss>0&&p.hero==='ALF'&&distance(x)>=3)v+=1; if(e.hit){v+=Math.min(20-x.players[i].hp,onHeal)*.65;for(const t of d.ops){if(t.op==='burnCoins')v+=Math.min(o.coins,t.n)*1.1;if(t.op==='steal')v+=Math.min(o.coins,t.n)*1.4;if(t.op==='coin')v+=t.n*.9;if(t.op==='disrupt')v+=1.2;if(t.op==='draw')v+=t.n;} }if(d.ops.some(t=>t.op==='scry'))v+=.4;
    if(v>value){value=v;chosen=x;}}
   w=chosen;w.players[1-i].block=0;total+=value+d.speed*.1+(d.category==='Basic'?(p.coins<2?1.05:.6)*(p.hero==='FRA'?1.3:1):0);
  }
  const moveAnswers=answers.filter(c=>g.reactionDef(c).ops.some(t=>t.op==='move')).length;total+=Math.min(2,moveAnswers)*.75+Math.min(3,answers.length)*.3;
  if(total>score){score=total;best=[a.uid,b.uid];}
 }return best;}
export function choosePrompt(g,i){const s=g.s,q=s.prompt,p=s.players[i],before=world(g);const legacy=legacyPrompt(g,i,q,before);if(legacy!==undefined)return legacy;const token=tokenPrompt(g,i,q,before);if(token!==undefined)return token;if(q.kind==='stash')return -1;if(q.kind==='discard'){const values=p.hand.map(c=>{const d=g.def(c);return {uid:c.uid,v:cardValue(g,i,c)};});return values.sort((a,b)=>a.v-b.v)[0].uid;}
 if(q.kind==='recover')return [...q.choices].sort((a,b)=>cardValue(g,i,p.discard.find(c=>c.uid===b))-cardValue(g,i,p.discard.find(c=>c.uid===a)))[0];
 if(q.kind==='scry'){const cards=(q.cards||q.task?.cards);let best='',score=0;for(const option of q.choices){const ids=option?option.split(','):[];let val=0;for(let k=0;k<ids.length;k++){const c=cards.find(c=>c.uid===ids[k]);val+=(cardValue(g,i,c)-1.8)/(k+1);if((g.s.queue||[]).some(t=>t.op==='forecast')&&k===0)val+=g.isAttack(c)?1:-.5;}if(val>score){score=val;best=option;}}return best;}
 if(q.kind==='tempo'){const t=(q.task||q),c=g.def(s.mains[i]),other=g.def(s.mains[1-i]);if(!other)return 0;const now=g.speed(i)-g.speed(1-i),after=now+t.speed;return Number((now<0||now===0&&s.edge!==i)&&(after>0||after===0&&s.edge===i)&&!(t.resource==='hp'&&p.hp<=4));}
 if(q.kind==='invest'){const h=g.def(s.mains[i]).ops.find(t=>t.op==='hit');const gap=Math.abs(p.pos-s.players[1-i].pos);return Number(gap>=h.min&&gap<=h.max&&p.hp>(q.task||q).cost+3);}
 if(q.kind==='pay'){const info=g.attackInfo();if(!info.hits.some(h=>info.distance>=h.min&&info.distance<=h.max))return 0;const h=info.hits[0],o=s.players[1-i],base=Math.max(0,h.damage-(h.pierce?0:Math.max(0,o.block-h.ignore)));if(base>=o.hp)return 0;return 1;}
 let best=q.choices[0],score=-Infinity;
 for(const v of q.choices){const w=clone(before);if(q.kind==='move'){w.players[i].pos=v;if(!s.context?.tokenMovement)crossed(w,i,p.pos,s.active);}else force(w,i,v,q.kind);let value=utility(g,i,before,w);if(s.phase==='pre')value+=attackEstimate(g,w).loss*.3;
  const target=['ALF','MEI'].includes(p.hero)?3:1;value-=Math.abs(distance(w)-target)*.025;
  if(q.kind==='push'&&s.context?.type==='attack')value+=(before.players[1-i].hp-w.players[1-i].hp)*2;
  if(value>score){score=value;best=v;}}
 return best;}

function cardValue(g,i,c){const d=g.def(c),p=g.s.players[i],distance=Math.abs(p.pos-g.s.players[1-i].pos),h=d.ops.find(t=>t.op==='hit');let v=0;if(h)v=h.n*.25+(distance>=h.min&&distance<=h.max?1:0)+(d.category==='Basic'?.6:0);if(g.isReaction(c))v+=1.5+(g.hand(i,'Reaction').length<=2?1:0);if(d.kind==='Attack'&&g.hand(i,'Attack').length>3)v-=.8;return v;}

function tokenPrompt(g,i,q,before){const s=g.s,p=s.players[i],t=q.task||q;
 if(q.kind==='wind-place')return q.choices.includes(p.pos)?p.pos:[...q.choices].filter(x=>x).sort((a,b)=>Math.abs(a-p.pos)-Math.abs(b-p.pos))[0]||0;
 if(q.kind==='wind-replace')return [...q.choices].sort((a,b)=>Math.abs(b-p.pos)-Math.abs(a-p.pos))[0];
 if(q.kind!=='token')return undefined;
 const change=fn=>{const after=clone(before);fn(after);return utility(g,i,before,after);};
 const moveValue=n=>Math.max(...g.availableMoves(i,n,t.move?.toward||t.key==='guardChoice'||t.key==='march').map(pos=>change(w=>{w.players[i].pos=pos;})));
 if(t.key==='windMove')return moveValue(t.move.n+2)>moveValue(t.move.n)+.25?'spend':'skip';
 if(t.key==='march'){const n=s.queue?.find(o=>o.op==='move')?.n||g.def(s.mains[i])?.ops.find(o=>o.op==='move')?.n||1;return moveValue(n+1)>moveValue(n)+.3?'spend':'skip';}
 if(t.key==='guard')return change(w=>{w.players[i].block=Math.min(6,w.players[i].block+2);})>.3?'spend':'skip';
 if(t.key==='guardChoice')return moveValue(2)>change(w=>{w.mods[i].ignore=(w.mods[i].ignore||0)+3;})?'move':'ignore';
 if(t.key==='pierce')return change(w=>{w.mods[i].pierce=true;})>.6?'spend':'skip';
 if(t.key==='windMinimum')return change(w=>{w.mods[i].minimum=1;})>.3?'spend':'skip';
 if(t.key==='windDamage')return change(w=>{w.mods[i].damage=(w.mods[i].damage||0)+2;})>.4?'spend':'skip';
 if(t.key==='spear'){let best='skip',score=.7;for(const v of q.choices.filter(v=>v!=='skip')){let n=-Infinity;const card=s.mains[i];for(const w of preWorlds(g,i,card,before)){const prior=attackEstimate(g,w);w.mods[i].spear=true;if(v==='damage')w.mods[i].damage=(w.mods[i].damage||0)+2;else w.mods[i].range=(w.mods[i].range||0)+2;const after=attackEstimate(g,w);n=Math.max(n,after.loss-prior.loss);}if(n>score){score=n;best=v;}}return best;}
 return q.choices[0];
}

function legacyPrompt(g,i,q,w){if(q.kind!=='legacy-token')return;const t=q.task||q,p=g.s.players[i],o=g.s.players[1-i],info=g.attackInfo(),h=info?.hits[0],inRange=!!h&&info.distance>=h.min&&info.distance<=h.max;const choose=v=>q.choices.includes(v)?v:q.choices[0];switch(t.key){
case 'crunch':return choose('spend');
case 'researchDraw':return choose(g.aiStyle!=='aggressive'&&(p.hp<=14&&p.hand.length>=2||p.hand.some(c=>c.id==='D08')&&g.s.active!==i)&&p.tokens<=2?'keep':'draw');
case 'aimDraw':case 'crossDraw':return choose(p.hand.length<5?'draw':'keep');
case 'cash':return choose(p.coins<2&&p.tokens<2?'cash':'keep');
case 'impactPierce':return choose(o.block>1&&Math.abs(p.pos-o.pos)<=2?'spend':'keep');
case 'plateStrike':return choose(p.tokens>=2||o.hp<=7?'spend':'keep');
case 'researchPay':return choose(!inRange?'keep':p.tokens?'research':p.hp>t.cost+2||o.hp<=(h?.damage||0)+t.bonus?'hp':'keep');
case 'trickTheft':return choose(o.coins>0&&p.coins<2?'coin':'trick');
}return q.choices[0];}

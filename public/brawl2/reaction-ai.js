// Public positions/resources and this player's own cards only; never rival hands or deck order.
const clone=x=>structuredClone(x);
const distance=w=>Math.abs(w.players[0].pos-w.players[1].pos);
function world(g){return {players:g.s.players.map(p=>({hero:p.hero,hp:p.hp,pos:p.pos,block:p.block,ultimate:p.ultimate})),mods:clone(g.s.mods),draw:0};}
function cost(p,t){return t.resource==='hp'&&p.hero==='SHE'&&p.ultimate?Math.max(1,t.n-1):t.n;}
function crossed(w,i,from,active){const p=w.players[i],o=w.players[1-i],m=w.mods[i];if(p.hero==='RAV'&&!m.crossed&&Math.sign(from-o.pos)!==Math.sign(p.pos-o.pos)){m.crossed=true;if(active===i)m.damage=(m.damage||0)+(p.ultimate?3:2);else p.block=Math.min(6,p.block+(p.ultimate?3:2));}}
function attackEstimate(g,w,i=g.s.active,card=g.s.mains[i],payments=true){const c=g.def(card),p=w.players[i],o=w.players[1-i],m=w.mods[i],h=c?.ops.find(t=>t.op==='hit');if(!h)return {loss:0,hit:false,payment:0};const d=distance(w),min=m.minimum??h.min,max=h.max+(p.hero==='ALF'&&h.min>=2?1:0)+(m.range||0);if(d<min||d>max)return {loss:0,hit:false,payment:0};let damage=h.n+(m.damage||0)+(p.hero==='ALF'&&d>=2?(p.ultimate?2:1):0),paid=0;if(payments)for(const t of c.ops.filter(t=>t.op==='pay')){const n=cost(p,t);if(p[t.resource]>=(t.resource==='hp'?n+1:n)){damage+=t.bonus;if(t.resource==='hp')paid+=n;}}
 const blocked=h.pierce||m.pierce?0:Math.min(damage,Math.max(0,o.block-(h.ignore||0)-(m.ignore||0)));let loss=damage-blocked;
 if(loss>0){const push=(c.ops.find(t=>t.op==='push')?.n||0)+(m.push||0),raw=o.pos+Math.sign(o.pos-p.pos)*push;if(push&&(raw<1||raw>7))loss+=p.hero==='SMA'?(p.ultimate?3:2):1;}
 return {loss,hit:true,payment:paid};}
function ownFuture(g,i,w){const s=g.s;let c=null;if(s.order.indexOf(i)>s.attackIndex)c=s.mains[i];else if(s.reveal===0)c=s.plans[i]?.[1];if(!c||!g.def(c))return 0;const d=g.def(c),h=d.ops.find(t=>t.op==='hit'),p=w.players[i],o=w.players[1-i],n=d.ops.filter(t=>t.op==='move').reduce((a,t)=>a+t.n,0);let value=0;for(let to=1;to<=7;to++)if(to!==o.pos&&Math.abs(to-p.pos)<=n){const space=Math.abs(to-o.pos),max=h.max+(p.hero==='ALF'&&h.min>=2?1:0);if(space>=h.min&&space<=max)value=h.n;}return value;}
function utility(g,i,before,after){const attacking=g.s.active===i,style=g.aiStyle||'tactical',a=attackEstimate(g,before),b=attackEstimate(g,after);const resolved=g.s.context?.type==='attack'&&g.s.context.hit;let value=(resolved?0:attacking?b.loss-a.loss:a.loss-b.loss)*(attacking&&style==='aggressive'?1.15:!attacking&&style==='guarded'?1.2:1);
 value+=(after.players[i].hp-before.players[i].hp)*.85+(before.players[1-i].hp-after.players[1-i].hp)*1.1+after.draw*.9;
 if(attacking&&!resolved)value-=(b.payment-a.payment)*.7;
 if(after.players[1-i].hp<=0)value+=30;if(after.players[i].hp<=0)value-=40;
 if(!resolved&&attacking&&b.loss>=after.players[1-i].hp&&a.loss<before.players[1-i].hp)value+=15;
 if(!resolved&&!attacking&&a.loss>=before.players[i].hp&&b.loss<after.players[i].hp)value+=18;
 if(style!=='aggressive')value+=(ownFuture(g,i,after)-ownFuture(g,i,before))*.18;
 if(after.players[i].hero==='HEL')value+=(Math.min(after.players[i].block,after.players[i].ultimate?4:2)-Math.min(before.players[i].block,before.players[i].ultimate?4:2))*.25;
 return value;
}
function force(w,i,n,op){const p=w.players[i],o=w.players[1-i],raw=o.pos+Math.sign(o.pos-p.pos)*(op==='pull'?-1:1)*n;o.pos=Math.max(1,Math.min(7,raw));if(op==='push'&&(raw<1||raw>7))o.hp-=p.hero==='SMA'?(p.ultimate?3:2):1;}
function reactionWorlds(g,i,card,before){const d=g.reactionDef(card),start=clone(before),ends=[];if(d.cost)start.players[i][d.cost.resource]-=cost(start.players[i],d.cost);
 if(start.players[i].hero==='FRA'&&g.s.active===i&&d.category==='Basic'&&!start.mods[i].oneTwo&&['Hero','Special'].includes(g.def(g.s.mains[i])?.category)){start.mods[i].damage=(start.mods[i].damage||0)+(start.players[i].ultimate?2:1);start.mods[i].oneTwo=true;}
 function visit(k,w){if(k===d.ops.length){ends.push(w);return;}const t=d.ops[k],p=w.players[i],o=w.players[1-i],m=w.mods[i];if(t.attackingOnly&&g.s.active!==i||t.rangeMax&&distance(w)>t.rangeMax){visit(k+1,w);return;}
  if(t.op==='move'){for(let to=1;to<=7;to++)if(to!==o.pos&&Math.abs(to-p.pos)<=t.n){const n=clone(w);n.players[i].pos=to;crossed(n,i,p.pos,g.s.active);visit(k+1,n);}return;}
  if(t.op==='push'||t.op==='pull'){const max=t.op==='pull'?Math.min(t.n,distance(w)-1):t.n;for(let n=0;n<=max;n++){const x=clone(w);force(x,i,n,t.op);visit(k+1,x);}return;}
  switch(t.op){case'block':p.block=Math.min(6,p.block+t.n);break;case'boost':m.damage=(m.damage||0)+t.n;break;case'reach':m.range=(m.range||0)+t.n;break;case'minimum':m.minimum=t.n;break;case'ignore':m.ignore=(m.ignore||0)+t.n;break;case'pierce':m.pierce=true;break;case'heal':p.hp=Math.min(20,p.hp+t.n+(p.hero==='SHE'?1:0));break;case'shred':o.block=Math.max(0,o.block-t.n);break;case'swap':{const pos=p.pos;p.pos=o.pos;o.pos=pos;break;}case'ping':{const hit=Math.max(0,t.n-o.block);o.block=Math.max(0,o.block-t.n);o.hp-=hit;break;}case'draw':if(!g.s.drawUsed[i])w.draw+=t.n;break;case'launch':m.push=(m.push||0)+t.n;break;case'present':m.present=true;break;}
  visit(k+1,w);
 }visit(0,start);return ends;
}
export function reactionScore(g,i,card){const before=world(g);return Math.max(...reactionWorlds(g,i,card,before).map(w=>utility(g,i,before,w)))-.65-(g.s.players[i].hand.length<=2?.35:0);}
export function chooseReaction(g,i){let best={action:'pass'},score=.05;for(const c of g.hand(i,'Reaction'))if(g.canPlay(i,c)){const n=reactionScore(g,i,c);if(n>score){score=n;best={action:'react',uid:c.uid};}}for(const id of g.s.players[i].loot)if(g.canPlay(i,id)){const n=reactionScore(g,i,id)-.1;if(n>score){score=n;best={action:'loot',card:id};}}return best;}
function preWorlds(g,i,card,w){let list=[clone(w)];for(const t of g.def(card).ops){if(t.op==='hit')break;if(t.op==='move'){list=list.flatMap(v=>Array.from({length:7},(_,k)=>k+1).filter(to=>to!==v.players[1-i].pos&&Math.abs(to-v.players[i].pos)<=t.n).map(to=>{const x=clone(v),from=x.players[i].pos;x.players[i].pos=to;crossed(x,i,from,i);return x;}));}else for(const v of list){const p=v.players[i];if(t.op==='block')p.block=Math.min(6,p.block+t.n);if(t.op==='heal')p.hp=Math.min(20,p.hp+t.n+(p.hero==='SHE'?1:0));}}return list;}
export function choosePlan(g,i){const cards=g.hand(i,'Attack');if(cards.length<2)return cards.map(c=>c.uid);const p=g.s.players[i],o=g.s.players[1-i];let best,score=-Infinity;const start=world(g);
 for(const a of cards)for(const b of cards){if(a.uid===b.uid)continue;const answers=g.hand(i,'Reaction').filter(c=>c.uid!==a.uid&&c.uid!==b.uid);let w=clone(start),total=0;
  for(const card of [a,b]){const d=g.def(card),h=d.ops.find(t=>t.op==='hit');let value=-Infinity,chosen;w.mods[i]={};for(const x of preWorlds(g,i,card,w)){const e=attackEstimate(g,x,i,card),gap=Math.max(0,(x.mods[i].minimum??h.min)-distance(x),distance(x)-(h.max+(p.hero==='ALF'&&h.min>=2?1:0)));let v=e.loss-e.payment*.7;if(!e.hit){const bridge=answers.some(c=>{const r=g.reactionDef(c);return r.side!=='defender'&&r.ops.some(t=>t.op==='move'&&t.n>=gap||t.op==='reach'&&distance(x)>h.max&&t.n>=gap||t.op==='minimum'&&distance(x)<h.min);});v=bridge?h.n*.45:0;}
    v+=(x.players[i].hp-w.players[i].hp)*.65+(x.players[i].block-w.players[i].block)*.12;
    const onHeal=d.ops.filter(t=>t.op==='heal'&&t.onHit).reduce((n,t)=>n+t.n+(p.hero==='SHE'?1:0),0);if(e.hit)v+=Math.min(20-x.players[i].hp,onHeal)*.65;
    if(v>value){value=v;chosen=x;}}
   w=chosen;total+=value+d.speed*.1+(d.category==='Basic'?(p.coins<2?1.05:.6):0);
  }
  const moveAnswers=answers.filter(c=>g.reactionDef(c).ops.some(t=>t.op==='move')).length;total+=Math.min(2,moveAnswers)*.75+Math.min(3,answers.length)*.3;
  if(total>score){score=total;best=[a.uid,b.uid];}
 }return best;}
export function choosePrompt(g,i){const s=g.s,q=s.prompt,p=s.players[i],before=world(g);if(q.kind==='pay'){const info=g.attackInfo();if(!info.hits.some(h=>info.distance>=h.min&&info.distance<=h.max))return 0;const h=info.hits[0],o=s.players[1-i],base=Math.max(0,h.damage-(h.pierce?0:Math.max(0,o.block-h.ignore)));if(base>=o.hp)return 0;return 1;}
 let best=q.choices[0],score=-Infinity;
 for(const v of q.choices){const w=clone(before);if(q.kind==='move'){w.players[i].pos=v;crossed(w,i,p.pos,s.active);}else force(w,i,v,q.kind);let value=utility(g,i,before,w);if(s.phase==='pre')value+=attackEstimate(g,w).loss*.3;
  const target=p.hero==='ALF'?3:1;value-=Math.abs(distance(w)-target)*.025;
  if(q.kind==='push'&&s.context?.type==='attack')value+=(before.players[1-i].hp-w.players[1-i].hp)*2;
  if(value>score){score=value;best=v;}}
 return best;}

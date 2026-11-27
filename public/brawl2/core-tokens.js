// Core-four mechanics. Original six heroes never enter these branches.
export const CORE=['MAR','SIB','VER','MEI'];
export function initTokens(p){if(CORE.includes(p.hero)){p.tokens={MAR:0,SIB:3,VER:1,MEI:3}[p.hero];p.wind=[];}}
export function gain(g,i,n=1){const p=g.s.players[i],added=Math.min(n,3-p.tokens);p.tokens+=added;if(added){g.event('tokenGained'+p.hero);g.log(`${p.name} readies ${added} ${p.hero==='MAR'?'Formation':p.hero==='SIB'?'War Spear':'Technique'} · ${p.tokens}/3.`);}}
function spend(g,i,n){const p=g.s.players[i];g.need(p.tokens>=n,'Not enough ready tokens.');p.tokens-=n;g.event('tokenSpent'+p.hero);}
export function tokenActions(g,i){const s=g.s,p=s.players[i];if(!p||s.phase!=='reaction'||s.turn!==i||s.prompt)return [];
 if(p.hero==='MAR'&&s.active===i)return [...(p.tokens>=1&&!p.pinned&&!s.mods[i].formationAdvanced?[{id:'advance',label:'Advance · 1 Formation',text:'Move up to 1 toward your rival. Once per attack.'}]:[])];
 if(p.hero==='MEI'&&!p.pinned&&p.wind.includes(p.pos)&&p.windStepRound!==s.round)return [{id:'wind-step',label:'Ride the Wind · 1 marker',text:'Consume the Wind beneath you. Move up to 1. Once per round.',cost:0,ops:[{op:'move',n:1}]}];
 if(p.hero==='VER'&&p.tokens>0&&s.active===i&&!s.mods[i].techniqueUsed&&g.def(s.mains[i])?.kind==='Dual'&&g.canPlay(i,s.mains[i],true))return [{id:'technique',label:'Technique · 1 token',text:'Use your active attack’s Reaction half. Pay its normal costs.'}];return [];
}
export function useToken(g,i,id){const a=tokenActions(g,i).find(a=>a.id===id);g.need(a,'That token action is not available.');const s=g.s,p=s.players[i];if(id==='wind-step'){consumeWind(g,i);p.windStepRound=s.round;g.abilityReaction(i,'Ride the Wind',[{op:'move',n:1}],null,a.text);return;}spend(g,i,1);
 if(id==='technique'){s.mods[i].techniqueUsed=true;g.playReaction(i,s.mains[i],false,true);return;}
 s.mods[i].formationAdvanced=true;
 g.abilityReaction(i,'Formation Advance',[{op:'move',n:1,toward:true}],null,a.text);
}
function prompt(g,i,key,title,options,task={}){g.ask(i,'token',title,options.map(x=>x[0]),{op:'token',key,labels:Object.fromEntries(options),...task});}
function windPlacement(g,i,early=false){const s=g.s,p=s.players[i];s.mods[i].windPlaced=true;p.windEarnedRound=s.round;if(p.wind.includes(p.pos))return;if(p.wind.length<3){p.wind.push(p.pos);p.tokens=3-p.wind.length;g.event('windPlaced');g.log(`${p.name} places Wind on space ${p.pos}.`);}else g.ask(i,'wind-replace','Choose a Wind to relocate beneath you.',[...p.wind],{op:'token',key:'replace',to:p.pos});}

export function activation(g,i){return CORE.includes(g.s.players[i].hero)?[{op:'coreActivate',i}]:[];}
export function handleOp(g,t){const s=g.s,p=s.players[t.i],i=t.i,m=s.mods[i],c=g.def(s.mains[i]);
 switch(t.op){
 case'spearRecover':if(!s.mods[i].spear)gain(g,i,t.n||1);break;
 case'coreActivate':
  if(p.hero==='SIB'&&p.tokens)prompt(g,i,'spear','Commit a War Spear now? It is spent even if this attack misses.',[['skip','Keep spear'],['damage','Commit spear · +1 damage'],...(c.id==='Z04'?[['range','Commit spear · +2 maximum Range instead']]:[])]);
  if(p.hero==='MAR'&&c.id==='M01'&&p.tokens>=2)prompt(g,i,'pierce','Arena’s End · spend 2 Formation to ignore all Block?',[['skip','Keep Formation'],['spend','Spend 2 · ignore all Block']]);
  if(p.hero==='MAR'&&c.id==='M02'&&p.tokens)prompt(g,i,'march','Shield March · upgrade its printed movement?',[['skip',`Move up to ${c.ops.find(o=>o.op==='move').n} toward`],['spend',`Spend 1 · move up to ${c.ops.find(o=>o.op==='move').n+1} toward`]]);
  if(p.hero==='MEI'&&p.ultimate&&p.windEarnedRound!==s.round)windPlacement(g,i,true);
  break;
 case'windCard':if(p.wind.includes(p.pos))prompt(g,i,t.effect,'Consume the Wind beneath your feet?',[['skip','Keep Wind'],['spend',t.effect==='windDamage'?'+2 damage':'Minimum Range becomes 1']]);break;
 case'formation':gain(g,i,t.n);break;
 case'anchor':m.anchored=true;g.log('HOLD THE LINE: Marcus cannot be pushed or pulled during this attack.');break;
 case'spearGuard':if(p.tokens)prompt(g,i,'guard','Spear Guard · spend a War Spear for 2 more Block?',[['skip','Keep spear'],['spend','Spend spear · +2 Block']]);break;
 case'guardChoice':prompt(g,i,'guardChoice','Through the Guard · choose one.',[['move','Move up to 2 toward'],['ignore','Ignore 3 Block']]);break;
 case'coreEnd':{
  const d=g.def(t.card),hit=s.context.hit;
  if(s.players[1-i].hero==='MAR'&&s.lastResult.hits.some(h=>h.blocked>0))gain(g,1-i);
  
  if(p.hero==='VER'&&hit)gain(g,i);
  if(p.hero==='MEI'&&hit&&!m.windPlaced&&p.windEarnedRound!==s.round)windPlacement(g,i);
  break;}
 default:return false;
 }return true;
}
export function windMove(g,t){return false;}
function consumeWind(g,i){const p=g.s.players[i];g.need(p.wind.includes(p.pos),'No Wind beneath your feet.');p.wind.splice(p.wind.indexOf(p.pos),1);p.tokens=3-p.wind.length;g.event('windConsumed');g.log(`${p.name} consumes Wind on space ${p.pos}.`);}
export function chooseToken(g,i,q,v){const s=g.s,p=s.players[i],t=q.task,m=s.mods[i];if(!['token','wind-place','wind-replace'].includes(q.kind))return false;
 if(q.kind==='wind-place'){if(!v)return true;if(p.wind.length<3){p.wind.push(v);p.tokens=3-p.wind.length;m.windPlaced=true;g.event('windPlaced');g.log(`${p.name} places Wind on space ${v}.`);}else g.ask(i,'wind-replace','Choose an existing Wind to relocate.',[...p.wind],{op:'token',key:'replace',to:v});return true;}
 if(q.kind==='wind-replace'){p.wind[p.wind.indexOf(v)]=t.to;m.windPlaced=true;g.event('windPlaced');g.log(`${p.name} shifts Wind ${v} → ${t.to}.`);return true;}
 switch(t.key){
 case'spear':if(v!=='skip'){spend(g,i,1);m.spear=true;if(v==='damage')m.damage=(m.damage||0)+1;else m.range=(m.range||0)+2;g.log(`WAR SPEAR: ${v==='damage'?'+1 damage':'+2 maximum Range'} committed before reactions.`);}break;
 case'pierce':if(v==='spend'){spend(g,i,2);m.pierce=true;}break;
 case'march':if(v==='spend'){spend(g,i,1);const move=s.queue.find(o=>o.op==='move');move.n+=1;}break;
 case'guard':if(v==='spend'){spend(g,i,1);s.queue.unshift({op:'block',i,n:2});}break;
 case'guardChoice':s.queue.unshift(v==='move'?{op:'move',i,n:2,toward:true}:{op:'ignore',i,n:3});break;
 case'windMove':if(v==='spend')consumeWind(g,i);s.queue.unshift({...t.move,n:t.move.n+(v==='spend'?2:0),windChecked:true});break;
 case'windDamage':case'windMinimum':if(v==='spend'){consumeWind(g,i);if(t.key==='windDamage')m.damage=(m.damage||0)+2;else m.minimum=1;}break;
 }return true;
}

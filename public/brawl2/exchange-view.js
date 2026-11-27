// Read only the public battle log. One decision owns its subsequent effects.
export function exchangeDecisions(log,players,cards,limit=4){
 const rows=[];let current=null;
 for(const line of log){
  if(/^Pair \d|^Round \d|^All four attacks|^Two passes\./.test(line)){current=null;continue;}
  const actor=players.find(p=>line.startsWith(p.name+' '));
  const rest=actor?line.slice(actor.name.length+1):'';
  const start=rest.match(/^(activates|plays|throws|uses) (.+?)(?: · Reaction half)?\.$/);
  const pass=/^passes \(/.test(rest);
  if(start||pass){const verb=start?.[1],name=pass?'Pass':start[2];const card=cards.find(c=>c.name===name);current={actor:actor.name,kind:pass?'Pass':verb==='activates'?'Attack':verb==='throws'?'Loot':verb==='uses'?'Ability':'Reaction',name,id:card?.id,effects:[]};rows.push(current);}
  else if(current&&!/reacts first|react or pass|finished\. No cards|^Paid |^Pair /.test(line))current.effects.push(line);
 }
 return rows.slice(-limit);
}
export function attackResultSummary(s){
 if(!['result','over'].includes(s.phase)||!s.lastResult)return null;
 const r=s.lastResult,hits=r.hits||[],target=s.players[1-r.attacker]?.name||'Rival';
 if(!hits.length)return {name:r.name,text:'Fight ended before this strike resolved.'};
 const blocked=hits.reduce((n,h)=>n+(h.blocked||0),0),loss=hits.reduce((n,h)=>n+(h.loss||0),0);
 const allMiss=hits.every(h=>h.miss),distance=hits.find(h=>h.miss)?.distance;
 return {name:r.name,text:allMiss?`Missed${distance!==undefined?' at distance '+distance:''}.`:loss===0?`${target} blocked the strike (${blocked} Block).`:`${target} took ${loss} strike damage${blocked?' · '+blocked+' blocked':''}.`};
}

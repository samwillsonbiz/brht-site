// Printed movement limits, shared by the planner UI and offline audit.
export function movementLimit(card){
 const matches=[...(card?.text||'').matchAll(/\bMove\s+(up to\s+)?(\d+)/g)];
 if(!matches.length)return null;
 const max=Math.max(...matches.map(m=>Number(m[2])));
 const optional=matches.some(m=>m[1]||/may\s+$/.test(card.text.slice(Math.max(0,m.index-5),m.index)));
 return {max,min:optional?0:1,optional};
}
export function movementSummary(card,opts){
 const limit=movementLimit(card);if(!limit)return '';
 const steps=Math.max(limit.min,Math.min(limit.max,Number(opts.steps??limit.max)));
 if(opts.path==='T')return 'Turn in place';
 if(opts.path)return `Path ${opts.path.toUpperCase()} · ${Math.min(steps,opts.path.length)} movement point${Math.min(steps,opts.path.length)===1?'':'s'}`;
 if(!steps)return 'Stay put';
 const labels={left:'left',right:'right',toward:'toward your rival',away:'away from your rival'};
 return `${steps} space${steps===1?'':'s'} ${labels[opts.direction]||'toward your rival'}`;
}
// A programming choice belongs to a card instance, never to a slot's old occupant.
export function pendingMovement(selections,approved,hand,defs){return selections.findIndex((uid,k)=>{const card=hand.find(c=>c.uid===uid);return card&&movementLimit(defs(card.id))&&approved[k]!==uid;});}
export function movementOptions(card){const limit=movementLimit(card);if(!limit)return[];const out=[];if(limit.optional)out.push({key:'stay',label:'Stay put',direction:'left',steps:0,path:''});for(let n=1;n<=limit.max;n++)for(const direction of ['left','right'])out.push({key:direction+n,label:`${direction==='left'?'← Left':'Right →'} ${n}`,direction,steps:n,path:''});out.push({key:'turn',label:'Turn in place',direction:'left',steps:1,path:'T'});return out;}

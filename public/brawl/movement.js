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
 if(opts.path)return `Path ${opts.path.toUpperCase()} · ${Math.min(steps,opts.path.length)} movement point${Math.min(steps,opts.path.length)===1?'':'s'}`;
 if(!steps)return 'Stay put';
 const labels={left:'left',right:'right',toward:'toward your rival',away:'away from your rival'};
 return `${steps} space${steps===1?'':'s'} ${labels[opts.direction]||'toward your rival'}`;
}

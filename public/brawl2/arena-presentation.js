// Public-state presentation only. No movement, timing or damage rules live here.
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ARENA_ART={wall:'assets/arena-pieces/spike-wall.webp',wind:'assets/arena-pieces/wind-current.webp'};
export function historyPanel(content,expanded=false){return `<details class="stage-history"${expanded?' open':''}><summary aria-label="Battle history"><span>Battle history</span><span class="history-disclosure" aria-hidden="true">⌄</span></summary><div class="stage-history-body">${content}</div></details>`;}
export function arenaPieces(s){
 const walls=(s.spikeWalls||[]).filter(w=>w.space===1||w.space===8).map(w=>`<div class="arena-piece arena-piece-wall owner-${w.owner}" style="left:${(w.space-.5)/8*100}%" role="img" aria-label="Spike Wall occupies space ${w.space}; closed to movement" data-terrain-space="${w.space}"><img src="${ARENA_ART.wall}" alt="" draggable="false"><span class="arena-piece-label">SPIKE WALL · ${w.space}</span></div>`);
 const winds=s.players.flatMap((p,i)=>(p.wind||[]).filter(v=>Number.isInteger(v)&&v>=1&&v<=8&&!s.spikeWalls?.some(w=>w.space===v)).map(v=>`<div class="arena-piece arena-piece-wind owner-${i}" style="left:${(v-.5)/8*100}%" role="img" aria-label="${escape(p.name)} Wind Current on space ${v}" data-wind-space="${v}" data-wind-owner="${i}"><img src="${ARENA_ART.wind}" alt="" draggable="false"></div>`));
 return `<div class="arena-pieces" aria-label="Placed arena pieces">${winds.join('')}${walls.join('')}</div>`;
}

// Public-state presentation only. No movement, timing or damage rules live here.
export const ARENA_ART={wall:'assets/arena-pieces/spike-wall.webp'};
export function historyPanel(content,expanded=false){return `<details class="stage-history"${expanded?' open':''}><summary aria-label="Battle history"><span>Battle history</span><span class="history-disclosure" aria-hidden="true">⌄</span></summary><div class="stage-history-body">${content}</div></details>`;}
export function arenaPieces(s){
 const walls=(s.spikeWalls||[]).filter(w=>w.space===1||w.space===8).map(w=>`<div class="arena-piece arena-piece-wall owner-${w.owner}" style="left:${(w.space-.5)/8*100}%" role="img" aria-label="Spike Wall occupies space ${w.space}; closed to movement" data-terrain-space="${w.space}"><img src="${ARENA_ART.wall}" alt="" draggable="false"><span class="arena-piece-label">SPIKE WALL · ${w.space}</span></div>`);
 return `<div class="arena-pieces" aria-label="Placed arena pieces">${walls.join('')}</div>`;
}

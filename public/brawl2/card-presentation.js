// Presentation only: printed rules and the simulation remain authoritative.
export function attackSummary(card){
 return (card.attackText||'').replace(/Hit for \d+ at Range \d+(?:[–-]\d+)?(?:, ignoring (\d+) Block|, ignoring all Block)?\.\s*/g,(whole,ignore)=>whole.includes('ignoring all')?'Ignore all Block. ':ignore?`Ignore ${ignore} Block. `:'').replace(/On hit, /g,'On hit: ').replace(/steal up to (\d+) Coin/g,'steal $1 Coin').trim();
}
export function artLayout(card){
 const cols=card.artCols||1,rows=card.artRows||1;
 return {x:cols>1?(card.artIndex%cols)/(cols-1)*100:0,y:rows>1?Math.floor(card.artIndex/cols)/(rows-1)*100:0,cols,rows,ratio:card.artRatio||(card.art?.includes('hero-atlas-')?1672/941:1)};
}
export function fanStyle(index,count){const offset=index-(count-1)/2;return `--fan-angle:${Math.max(-9,Math.min(9,offset*2.1))}deg;--fan-drop:${Math.min(24,offset*offset*2.3)}px;--fan-z:${index+1}`;}

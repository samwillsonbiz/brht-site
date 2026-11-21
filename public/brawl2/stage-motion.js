// Presentation snapshots contain only public DOM positions and public game results.
let previous=null;
export function captureStage(root){return [...root.querySelectorAll('.r-fighter[data-player],.od-hand-card,.r-revealed')].map(el=>({key:el.dataset.player!==undefined?'hero-'+el.dataset.player:el.dataset.revealPlayer!==undefined?'reveal-'+el.dataset.revealPlayer:el.querySelector('[data-card]')?.dataset.card,rect:el.getBoundingClientRect()}));}
export function animateStage(root,before,state,active){
 if(!active||!state){previous=null;return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!before.length)previous=null;
 const old=new Map(before.map(e=>[e.key,e.rect]));
 for(const el of root.querySelectorAll('.r-fighter[data-player],.od-hand-card,.r-revealed')){
  const key=el.dataset.player!==undefined?'hero-'+el.dataset.player:el.dataset.revealPlayer!==undefined?'reveal-'+el.dataset.revealPlayer:el.querySelector('[data-card]')?.dataset.card,from=old.get(key),to=el.getBoundingClientRect();
  if(!reduced&&from&&(Math.abs(from.x-to.x)>2||Math.abs(from.y-to.y)>2))el.animate([{translate:`${from.x-to.x}px ${from.y-to.y}px`},{translate:'0px 0px'}],{duration:key.startsWith('hero')?430:220,easing:'cubic-bezier(.2,.75,.3,1)'});
  else if(!reduced&&!from)el.animate([{opacity:0,translate:'0px 18px'},{opacity:1,translate:'0px 0px'}],{duration:300,easing:'ease-out'});
 }
 const result=state.lastResult,resultKey=result?JSON.stringify(result):null;
 if(!reduced&&previous&&state.phase==='result'&&resultKey&&resultKey!==previous.resultKey&&state.active!==null){
  const actor=root.querySelector(`.r-fighter[data-player="${state.active}"]`),target=root.querySelector(`.r-fighter[data-player="${1-state.active}"]`);
  if(actor&&target){const a=actor.getBoundingClientRect(),b=target.getBoundingClientRect(),direction=b.x>a.x?1:-1;actor.animate([{translate:'0 0'},{translate:`${direction*24}px -6px`,offset:.35},{translate:'0 0'}],{duration:440,easing:'ease-out'});
   const fx=document.createElement('span');fx.className='stage-strike '+(state.players[state.active].hero==='ALF'?'arrow':'');fx.style.left=(a.x+a.width/2)+'px';fx.style.top=(a.y+a.height*.45)+'px';fx.textContent=state.players[state.active].hero==='ALF'?'➶':'✦';root.append(fx);fx.animate([{translate:'0 0',opacity:0},{opacity:1,offset:.15},{translate:`${b.x+b.width/2-a.x-a.width/2}px ${b.y+b.height*.45-a.y-a.height*.45}px`,opacity:1,offset:.75},{translate:`${b.x+b.width/2-a.x-a.width/2}px ${b.y+b.height*.45-a.y-a.height*.45}px`,opacity:0,scale:1.8}],{duration:500,easing:'ease-out',fill:'forwards'});setTimeout(()=>fx.remove(),550);
  }
 }
 if(previous&&previous.round<=state.round){state.players.forEach((p,i)=>{
  const delta=p.hp-previous.hp[i],shield=p.block-previous.block[i],coins=p.coins-previous.coins[i];
  const fighter=root.querySelector(`.r-fighter[data-player="${i}"]`);if(!fighter)return;
  if(delta||shield>0||coins>0){const text=document.createElement('span');text.className='stage-float '+(delta<0?'hurt':delta>0?'heal':shield>0?'shield':'coin');text.textContent=delta?`${delta>0?'+':''}${delta}`:shield>0?`◇ +${shield}`:`● +${coins}`;fighter.append(text);if(!reduced){text.animate([{opacity:0,translate:'0 12px'},{opacity:1,offset:.15},{opacity:1,offset:.7},{opacity:0,translate:'0 -45px'}],{duration:1450,fill:'forwards'});if(delta<0)fighter.querySelector('img')?.animate([{filter:'brightness(2)'},{filter:'brightness(1)',offset:.3},{filter:'brightness(1)'}],{duration:550});}setTimeout(()=>text.remove(),1500);}
 });}
 previous={resultKey,round:state.round,hp:state.players.map(p=>p.hp),block:state.players.map(p=>p.block),coins:state.players.map(p=>p.coins)};
}

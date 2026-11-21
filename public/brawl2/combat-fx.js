import {choreography,playHeroPose} from './hero-animation.js';
// Choreography follows public card data and resolved outcomes; it never decides combat.
export function attackStyle(card,hero){
 const hits=card?.ops?.filter(o=>o.op==='hit')||[],ranged=hits.some(h=>h.max>1);
 if(/rock/i.test(card?.name||''))return 'stone';
 if(ranged)return hero==='ALF'?'arrow':'arcane';
 return {SMA:'hammer',ALF:'arrow',SHE:'arcane',HEL:'shield',RAV:'slash',FRA:'palm'}[hero]||'jab';
}
export function impactOutcome(result){const hits=result?.hits||[];if(!hits.length)return null;if(hits.every(h=>h.miss))return 'miss';return hits.some(h=>h.loss>0)?'hit':'block';}
const SVG='http://www.w3.org/2000/svg';
function node(tag,attrs={}){const el=document.createElementNS(SVG,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,String(value));return el;}
export function playAttack(root,state,card,sound){
 const outcome=impactOutcome(state.lastResult);if(!outcome||state.active===null)return;
 const actor=root.querySelector(`.r-fighter[data-player="${state.active}"]`),target=root.querySelector(`.r-fighter[data-player="${1-state.active}"]`);if(!actor||!target)return;
 const hero=state.players[state.active].hero;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,style=attackStyle(card,state.players[state.active].hero),a=actor.getBoundingClientRect(),b=target.getBoundingClientRect(),ax=a.x+a.width*.5,ay=a.y+a.height*.48,bx=b.x+b.width*.5,by=b.y+b.height*.5,dir=Math.sign(bx-ax)||1;
 const overlay=document.createElement('div');overlay.className='combat-fx-layer';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);
 const badge=document.createElement('span');badge.className='combat-outcome '+outcome;badge.style.left=bx+'px';badge.style.top=(b.y+b.height*.2)+'px';badge.textContent=outcome==='miss'?'MISS':outcome==='block'?'BLOCKED':state.lastResult.hits.reduce((n,h)=>n+h.loss,0)+' DAMAGE';overlay.append(badge);
 if(reduced){sound?.(outcome==='block'?'block':outcome==='hit'?'damage':'move');setTimeout(()=>overlay.remove(),1100);return;}
 const profile=choreography(hero,style),impactAt=profile.impact;
 badge.style.opacity=0;badge.animate([{opacity:0,translate:'-50% 5px'},{opacity:1,translate:'-50% -7px',offset:.2},{opacity:1,offset:.75},{opacity:0,translate:'-50% -35px'}],{duration:1000,delay:impactAt,fill:'forwards'});
 const svg=node('svg',{width:innerWidth,height:innerHeight,viewBox:`0 0 ${innerWidth} ${innerHeight}`});overlay.append(svg);
 const projectile=['arrow','stone','arcane'].includes(style),reach=Math.min(Math.abs(bx-ax)*.38,projectile?18:86);
 // Anticipation and recovery are separate from facing: crossing never rotates a fighter.
 if(!playHeroPose(actor,hero,state.players[state.active].ultimate,dir,profile,bx-ax))actor.animate([{translate:'0 0',scale:'1 1'},{translate:`${-dir*12}px 3px`,scale:'.97 1.02',offset:.22},{translate:`${dir*reach}px -4px`,scale:'1.04 .98',offset:.42},{translate:`${dir*reach}px -4px`,offset:.5},{translate:'0 0',scale:'1 1'}],{duration:760,easing:'cubic-bezier(.2,.75,.3,1)'});
 const color=profile.color||{hammer:'#ffe2a0',arrow:'#f3f6bf',slash:'#d9b9ff',shield:'#b4e9f0',palm:'#ffe7b8',arcane:'#a5efdb',stone:'#ded6bb',jab:'#ffe5be'}[style];
 if(hero==='SHE'){
  const halo=node('circle',{cx:ax+dir*25,cy:ay,r:28,fill:'none',stroke:color,'stroke-width':2,'stroke-dasharray':'10 5 2 5'});svg.append(halo);halo.style.transformOrigin=`${ax+dir*25}px ${ay}px`;halo.animate([{scale:'.3',opacity:0,rotate:'-40deg'},{scale:'1',opacity:.9,rotate:'0deg',offset:.65},{scale:'1.4',opacity:0,rotate:'30deg'}],{duration:profile.release+100,fill:'both'});
 }
 if(projectile){
  const group=node('g'),angle=Math.atan2(by-ay,bx-ax)*180/Math.PI;group.style.transformOrigin='0 0';group.style.transform=`translate(${ax}px,${ay}px) rotate(${angle}deg)`;svg.append(group);
  if(style==='arrow'){group.append(node('path',{d:'M -74 0 L 10 0 M 0 -6 L 14 0 L 0 6 M -60 0 L -73 -7 M -60 0 L -73 7',fill:'none',stroke:color,'stroke-width':3,'stroke-linecap':'round'}));}
  else if(style==='stone'){group.append(node('path',{d:'M -12 -7 L 0 -13 L 13 -4 L 9 10 L -5 13 L -14 3 Z',fill:'#9e9783',stroke:'#f0e2bd','stroke-width':2}));}
  else{group.append(node('ellipse',{rx:19,ry:5,fill:color}));group.append(node('path',{d:'M -75 0 Q -30 -15 15 0 Q -30 15 -75 0',fill:color,opacity:.35}));}
  const dx=bx-ax+(outcome==='miss'?dir*65:0),dy=by-ay+(outcome==='miss'?-35:0);group.animate([{translate:'0 0',opacity:0},{opacity:1,offset:.08},{translate:`${dx}px ${dy}px`,opacity:1,offset:.85},{translate:`${dx}px ${dy}px`,opacity:0}],{duration:profile.travel,delay:profile.release,fill:'both',easing:'cubic-bezier(.4,0,1,1)'});
 }else if(style==='shield'||style==='palm'){
  for(let i=0;i<2;i++){const wave=node('path',{d:`M ${bx-dir*20} ${by-55} Q ${bx+dir*55} ${by} ${bx-dir*20} ${by+55}`,fill:'none',stroke:color,'stroke-width':style==='shield'?8:4,'stroke-linecap':'round'});svg.append(wave);wave.animate([{opacity:0,translate:`${-dir*35}px 0`},{opacity:.85,offset:.25},{opacity:0,translate:`${dir*25}px 0`}],{duration:280,delay:profile.release+i*65,fill:'both'});}
 }else{
  const slash=node('path',{d:style==='hammer'?`M ${bx-dir*80} ${by-105} Q ${bx+dir*90} ${by-70} ${bx} ${by+65}`:`M ${bx-dir*85} ${by-50} Q ${bx+dir*85} ${by-70} ${bx+dir*40} ${by+50}`,fill:'none',stroke:color,'stroke-width':style==='hammer'?18:8,'stroke-linecap':'round'});svg.append(slash);const len=slash.getTotalLength();slash.style.strokeDasharray=String(len);slash.animate([{strokeDashoffset:len,opacity:0},{opacity:.9,offset:.2},{strokeDashoffset:0,opacity:.8,offset:.65},{strokeDashoffset:-len,opacity:0}],{duration:260,delay:Math.max(0,profile.release-90),fill:'forwards'});
 }
 const timer=setTimeout(()=>{
  if(!overlay.isConnected)return;
  sound?.(outcome==='miss'?'move':outcome==='block'?'block':style==='hammer'||style==='shield'?'heavy':'damage');
  if(outcome==='miss'){target.animate([{translate:'0 0'},{translate:`${dir*22}px -5px`,offset:.4},{translate:'0 0'}],{duration:380});return;}
  if(outcome==='block'){
   const shield=node('path',{d:`M ${bx-40} ${by-52} Q ${bx} ${by-70} ${bx+40} ${by-52} L ${bx+34} ${by+15} Q ${bx} ${by+60} ${bx-34} ${by+15} Z`,fill:'#83daed22',stroke:'#c2f4ff','stroke-width':4});svg.append(shield);shield.animate([{opacity:0,scale:'.7'},{opacity:1,scale:'1.1',offset:.2},{opacity:0,scale:'1.25'}],{duration:430,fill:'forwards'});shield.style.transformOrigin=`${bx}px ${by}px`;
  }else{
   target.animate([{translate:'0 0',filter:'brightness(1.6)'},{translate:`${dir*18}px 0`,filter:'brightness(1.3)',offset:.15},{translate:`${dir*18}px 0`,offset:.3},{translate:'0 0',filter:'brightness(1)'}],{duration:440,easing:'ease-out'});
   if(style==='hammer'||style==='shield')root.querySelector('.r-arena')?.animate([{translate:'0 0'},{translate:'3px 2px',offset:.18},{translate:'-2px -1px',offset:.4},{translate:'0 0'}],{duration:240});
  }
  for(let i=0;i<9;i++){const angle=i*Math.PI*2/9,dx=Math.cos(angle)*(28+i%3*14),dy=Math.sin(angle)*(24+i%2*14),spark=node('path',{d:`M ${bx} ${by} l ${Math.cos(angle)*12} ${Math.sin(angle)*12}`,stroke:outcome==='block'?'#c2f4ff':color,'stroke-width':2.5,'stroke-linecap':'round'});svg.append(spark);spark.animate([{translate:'0 0',opacity:1},{translate:`${dx}px ${dy}px`,opacity:0}],{duration:360,fill:'forwards'});}
  if(style==='hammer'||style==='palm'||style==='shield'){const ring=node('ellipse',{cx:bx,cy:b.bottom-12,rx:20,ry:6,fill:'none',stroke:color,'stroke-width':3});svg.append(ring);ring.style.transformOrigin=`${bx}px ${b.bottom-12}px`;ring.animate([{scale:'1',opacity:.8},{scale:'6 3',opacity:0}],{duration:550,fill:'forwards'});}
 },impactAt);
 setTimeout(()=>{clearTimeout(timer);overlay.remove();},Math.max(1600,impactAt+1050));
}

// Cosmetic choreography only. The engine remains the sole authority on outcomes.
export const HERO_MOTION = Object.freeze({
 SMA:{beats:[0,170,410,610],duration:1020,release:410,travel:0,reach:76,back:18,lift:0,size:1.38,color:'#ffd88c',style:'hammer'},
 ALF:{beats:[0,130,320,480],duration:790,release:320,travel:170,reach:8,back:7,lift:0,size:1.18,color:'#f9edab',style:'arrow'},
 SHE:{beats:[0,160,390,610],duration:1010,release:390,travel:190,reach:12,back:5,lift:9,size:1.16,color:'#fff2cb',style:'arcane'},
 HEL:{beats:[0,140,340,530],duration:880,release:340,travel:0,reach:64,back:15,lift:0,size:1.12,color:'#a9e6f2',style:'shield'},
 RAV:{beats:[0,85,205,360],duration:670,release:205,travel:0,reach:100,back:10,lift:6,size:1.19,color:'#d4a5ff',style:'slash'},
 FRA:{beats:[0,140,330,520],duration:880,release:330,travel:0,reach:48,back:13,lift:0,size:1.15,color:'#ffe0a1',style:'palm'}
});
const cache=new Map();
export function animationAsset(hero,lastStand=false){return `assets/animation/${hero}${lastStand&&hero!=='RAV'?'-last':''}.webp`;}
export function preloadHeroAnimations(players=[]){
 return Promise.all(players.flatMap(p=>[false,true].map(last=>{
  if(!HERO_MOTION[p.hero])return Promise.resolve(null);
  const url=animationAsset(p.hero,last);if(cache.has(url))return cache.get(url).ready;
  const image=new Image(),entry={image,loaded:false};
  entry.ready=new Promise(resolve=>{image.onload=()=>{entry.loaded=true;resolve(image);};image.onerror=()=>resolve(null);});
  cache.set(url,entry);image.src=new URL(url,import.meta.url).href;return entry.ready;
 })));
}
export function choreography(hero,style){
 const core={MAR:{...HERO_MOTION.HEL,color:'#e9b978'},SIB:{...HERO_MOTION.SMA,color:'#ffd37a',release:440},VER:{...HERO_MOTION.RAV,color:'#ffe866',release:230},MEI:{...HERO_MOTION.SHE,color:'#88e6ce',release:280}};const p=core[hero]||HERO_MOTION[hero]||HERO_MOTION.SMA;
 const travel=['arrow','stone','arcane'].includes(style)?(p.travel||170):0;
 return {...p,travel,impact:p.release+travel};
}
export function playHeroPose(actor,hero,lastStand,dir,profile,distance){
 const entry=cache.get(animationAsset(hero,lastStand));
 if(!entry?.loaded)return false; // Keep existing artwork visible if downloading fails.
 const idle=actor.querySelector(':scope > img');if(!idle)return false;
 const canvas=document.createElement('canvas');canvas.className='hero-pose';canvas.setAttribute('aria-hidden','true');
 canvas.width=640;canvas.height=640;
 const size=actor.getBoundingClientRect().height*profile.size;
 Object.assign(canvas.style,{position:'absolute',width:size+'px',height:size+'px',left:'50%',bottom:'0',transform:`translateX(-50%) scaleX(${dir})`,pointerEvents:'none',zIndex:'2'});
 const ctx=canvas.getContext('2d');if(!ctx)return false;
 const img=entry.image,w=img.naturalWidth/2,h=img.naturalHeight/2;
 const frame=n=>{ctx.clearRect(0,0,640,640);ctx.drawImage(img,(n%2)*w,Math.floor(n/2)*h,w,h,0,0,640,640);canvas.dataset.pose=String(n);};
 frame(0);actor.append(canvas);const visibility=idle.style.visibility;idle.style.visibility='hidden';
 const timers=profile.beats.slice(1).map((at,i)=>setTimeout(()=>frame(i+1),at));
 const reach=Math.min(Math.abs(distance)*.38,profile.travel?16:profile.reach),hit=profile.release/profile.duration;
 const motion=canvas.animate([
  {translate:'0 0'},
  {translate:`${-dir*profile.back}px 3px`,offset:Math.max(.06,hit-.17)},
  {translate:`${dir*reach}px ${-profile.lift}px`,offset:hit},
  {translate:`${dir*reach}px ${-profile.lift}px`,offset:Math.min(.8,hit+.12)},
  {translate:'0 0'}
 ],{duration:profile.duration,easing:'cubic-bezier(.2,.7,.3,1)'});
 const cleanup=()=>{timers.forEach(clearTimeout);canvas.remove();idle.style.visibility=visibility;};
 motion.finished.then(cleanup,cleanup);return true;
}

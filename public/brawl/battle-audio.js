const AUDIO_PREFS='fable-brawl-audio-v1';
const audioAsset=name=>typeof BRAWL_ASSETS==='undefined'?'assets/audio/'+name:BRAWL_ASSETS['assets/audio/'+name];
const FX={click:['book-page-01.wav','book-page-02.wav'],card:['tube-plastic-whoosh-01.wav'],damage:['apple-cut-01.wav','wood-bowl-spoon-01.wav'],heavy:['metal-hammer-hit-01.wav'],block:['sword-clash-01.wav','sword-clash-02.wav'],move:['boots-leather-step-01.wav'],reveal:['book-page-02.wav'],loot:['coins-shake-01.wav'],heal:['vial-glass-uncork-01.wav'],fury:['chimes-wood-rattle.wav'],victory:['chimes-wood-rattle.wav']};
export class BattleAudio{
 constructor(){
  this.enabled=false;this.musicVolume=.28;this.effectsVolume=.65;this.inBattle=false;this.unlocked=false;this.music=null;this.voices=new Set();this.lastPlayed=new Map();
  try{const p=JSON.parse(localStorage.getItem(AUDIO_PREFS)||'null');if(p){this.enabled=p.enabled===true;for(const key of ['musicVolume','effectsVolume'])if(Number.isFinite(p[key]))this[key]=Math.max(0,Math.min(1,p[key]));}}catch{}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stopEffects();this.sync();});
  window.addEventListener('pagehide',()=>{this.music?.pause();this.stopEffects();});
 }
 save(){try{localStorage.setItem(AUDIO_PREFS,JSON.stringify({enabled:this.enabled,musicVolume:this.musicVolume,effectsVolume:this.effectsVolume}));}catch{}}
 unlock(){this.unlocked=true;this.sync();}
 setEnabled(value){this.enabled=value;this.save();if(!value)this.stopEffects();this.unlock();}
 setVolume(kind,value){this[kind==='music'?'musicVolume':'effectsVolume']=Math.max(0,Math.min(1,value));this.save();this.sync();}
 setBattle(value){if(this.inBattle===value)return;this.inBattle=value;this.sync();}
 sync(){
  if(!this.enabled||!this.unlocked||!this.inBattle||document.hidden||this.musicVolume===0){this.music?.pause();return;}
  if(!this.music){this.music=document.createElement('audio');this.music.src=audioAsset('the-final-battle.ogg');this.music.loop=true;this.music.preload='none';this.music.dataset.battleMusic='';this.music.hidden=true;document.body.append(this.music);}
  this.music.volume=this.musicVolume;if(this.music.paused)this.music.play().catch(()=>{});
 }
 stopEffects(){for(const a of this.voices){a.pause();a.remove();}this.voices.clear();}
 play(kind){
  if(!this.enabled||!this.unlocked||document.hidden||!this.effectsVolume)return;
  const now=performance.now();if(now-(this.lastPlayed.get(kind)??-Infinity)<90)return;this.lastPlayed.set(kind,now);
  const files=FX[kind]||FX.click,name=files[Math.floor(Math.random()*files.length)];
  const a=document.createElement('audio');a.src=audioAsset(name);a.hidden=true;a.dataset.battleEffect=kind;a.volume=this.effectsVolume*(kind==='click'?.30:kind==='move'?.45:.8);a.playbackRate=.96+Math.random()*.08;
  if(this.voices.size>=10){const oldest=this.voices.values().next().value;oldest.pause();oldest.remove();this.voices.delete(oldest);}
  document.body.append(a);this.voices.add(a);const clean=()=>{this.voices.delete(a);a.remove();};a.addEventListener('ended',clean,{once:true});a.addEventListener('error',clean,{once:true});a.play().catch(clean);
 }
}

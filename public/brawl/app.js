import {Brawl} from './engine.js';
import {BattleAudio} from './battle-audio.js';
import {movementLimit,movementSummary} from './movement.js';
import {OnlineGame,onlineSupported,invitation,savedSeat,createOnline,joinOnline,readOnline} from './online.js';

const app=document.querySelector('#app'), dialog=document.querySelector('#dialog'), content=document.querySelector('#dialog-content');
const COLORS={SMA:'#b65c3b',RAV:'#78579c',ALF:'#6a833d',FRA:'#ad8c32',HEL:'#397b8b',SHE:'#ae5477'};
const SHORT={SMA:'Smasherton',RAV:'Raven',ALF:'Alf',FRA:'Franc',HEL:'Helga',SHE:'Shealer'};
const GLYPHS={'Step':'➜','Quick Step':'➜','Dash':'➜','Pivot':'⇄','Quick Strike':'⚔','Heavy Strike':'⚒','Counter Stance':'↩','Dodge Roll':'↶','Quick Jab':'⚔','Heavy Blow':'⚒','Lunge':'➜','Sweep':'↝','Shove':'⇥','Advance':'➜','Backstep':'↶','Guard':'◇','Throwing Stone':'◆','Counter':'↩','Feint':'⇄','Brace':'⬡','Smoke Bomb':'☁','Fury Flask':'♨','Teleport Scroll':'✧','Grappling Hook':'⚓','Crystal Ball':'◉'};
const SAVE='fable-fury-brawl-v4';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data, game=null, screen='setup', editPlayer=0, mode='solo', heroes=['SMA','RAV'], chosen=[[],[]], basics=[[],[]], selections=[null,null], viewer=0, ready=false, showLog=false, winnerShown=false, lastLog=0, toastTimer;
const defaultStrategies=()=>[0,1].map(()=>({direction:'toward',steps:3,path:'',aim:'damage',trait:true,remedy:'damage',coin:true,push:true,follow:true}));
let strategies=defaultStrategies();
let targetSlot=null, previousBattle=null,lastAudioLog=null,handWasOpen=false;
let lootUI={context:'',open:false,purchased:null};
const battleAudio=new BattleAudio();
let canOnline=false,onlineLobby=null,lobbyTimer=null,onlineRound=0,networkConnected=true,onlineBusy=false;
const symbol=(name)=>{const paths={speed:'M13 2 4 14h7l-1 8 10-13h-7z',damage:'m5 3 13 13m-3-13L4 14m-1 4 5-5m8 3 5 5',range:'M3 12h18M6 8l-4 4 4 4m12-8 4 4-4 4',shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z',coin:'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M12 7v10m-3-8h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m10-3a3 3 0 1 0 0 6 3 3 0 1 0 0-6',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(paths[name]||paths.spark).split('|').map(d=>`<path d="${d}"/>`).join('')}</svg>`;};
const $=(sel,root=document)=>root.querySelector(sel);
const hero=id=>data.heroes.find(h=>h.id===id);
const def=id=>data.cards.find(c=>c.id===id);
const heroForCard=d=>data.heroes.find(h=>h.name===d.hero);
const portrait=id=>`assets/${hero(id).slug}.webp`;

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function playTone(kind){battleAudio.play(kind);}
function audioSettings(){modal(`<h2>Battle audio</h2><p class="rules-copy">Epic music and combat effects. Audio pauses when this tab is hidden.</p><div class="audio-mixer"><label>Music <input type="range" min="0" max="100" value="${Math.round(battleAudio.musicVolume*100)}" data-audio-volume="music" aria-label="Music volume"><output>${Math.round(battleAudio.musicVolume*100)}%</output></label><label>Combat sounds <input type="range" min="0" max="100" value="${Math.round(battleAudio.effectsVolume*100)}" data-audio-volume="effects" aria-label="Combat sounds volume"><output>${Math.round(battleAudio.effectsVolume*100)}%</output></label></div><button class="primary" data-action="toggle-audio">${battleAudio.enabled?'Mute all audio':'Enable audio'}</button><p class="audio-credits">Music: “The Final Battle” — skrjablin.<br>Fantasy sound effects — Vehicle / Jan Schupke.<br>Both released under CC0 (public domain). <a href="AUDIO_CREDITS.txt" target="_blank" rel="noopener">Audio credits & licenses ↗</a></p>`);}
function syncAudioButton(){const b=$('#sound-btn');b.textContent=battleAudio.enabled?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(battleAudio.enabled));}
function modal(html){content.innerHTML=html;if(!dialog.open)dialog.showModal();}
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
$('#sound-btn').addEventListener('click',()=>{battleAudio.setEnabled(!battleAudio.enabled);syncAudioButton();playTone('click');});
$('#audio-settings-btn').addEventListener('click',audioSettings);
syncAudioButton();
document.addEventListener('pointerdown',()=>battleAudio.unlock(),{once:true});
document.addEventListener('keydown',()=>battleAudio.unlock(),{once:true});
document.addEventListener('input',e=>{const slider=e.target.closest('[data-audio-volume]');if(!slider)return;battleAudio.setVolume(slider.dataset.audioVolume,Number(slider.value)/100);slider.nextElementSibling.textContent=slider.value+'%';});
$('#fullscreen-btn').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>toast('Fullscreen is unavailable in this browser.'));});
$('.brand').addEventListener('click',e=>{e.preventDefault();if(!game||screen==='setup'){screen='setup';render();return;}modal(`<h2>Leave the Arena?</h2><p class="rules-copy" style="margin:18px 0">Your match is saved on this device. You can resume it from the Hero selection screen.</p><button class="primary" data-action="home">Choose Heroes</button>`);});
$('#rules-btn').addEventListener('click',()=>rules('rules'));
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('arena-paused',document.hidden));

function art(d){
  const h=heroForCard(d);
  if(h)return `<img src="${portrait(h.id)}" alt="" loading="lazy">`;
  if(d.category==='Loot'&&![11,12,13,17,19].includes(Number(d.id.slice(-3))))return `<img src="assets/${d.id}.webp" alt="" loading="lazy">`;
  return `<span class="glyph" aria-hidden="true">${GLYPHS[d.name]||'✦'}</span>`;
}
function cardHTML(d,{uid='',selected=false,loot=false,inspect=true,button=true,fanIndex=null,fanTotal=5,selectionNumber=null,lootUsable=false,lootBlocked=false,newLoot=false}={}){
  const h=heroForCard(d),color=h?COLORS[h.id]:d.category==='Loot'?'#85649b':'#4b8185';
  const offset=fanIndex===null?0:fanIndex-(fanTotal-1)/2;
  return `<${button?'button':'div'} class="game-card ${loot?'loot':''} ${lootUsable?'usable-loot':''} ${lootBlocked?'unavailable-loot':''} ${newLoot?'new-loot':''} ${selected?'selected':''} ${d.category==='Special'?'special-card':''} ${d.text.length>130?'dense-card':''}" style="--accent:${color};--fan-angle:${offset*2.3}deg;--fan-y:${Math.pow(offset,2)*3}px;--card-order:${fanIndex??0}" ${button?`data-card="${esc(uid||d.id)}" ${loot?`data-loot-card="${d.id}"`:""} aria-pressed="${selected}" aria-label="${lootUsable?'Use ':''}${esc(d.name)}, ${d.category}${d.speed?', Speed '+d.speed:''}"`:''}>
    ${loot?`<span class="loot-card-label">${newLoot?'NEW LOOT':lootUsable?'CLICK TO USE':lootBlocked?'NOT USABLE NOW':'ACTION LOOT'}</span>`:''}${selectionNumber?`<span class="assignment" aria-label="Action ${selectionNumber}">${selectionNumber}</span>`:''}<span class="card-head"><span>${esc(d.name)}</span>${d.speed?`<b title="Speed">${symbol('speed')}${d.speed}</b>`:''}</span>
    <span class="card-art">${art(d)}</span>
    <span class="card-stats"><span>${d.damage?symbol('damage')+d.damage+' damage':d.category==='Loot'?'SECRET LOOT':d.block?symbol('shield')+'Defense':'Movement / skill'}</span><span>${d.range?symbol('range')+'Range '+d.range:d.category==='Loot'?symbol('coin')+'4':''}</span></span>
    <span class="card-text">${esc(d.text)}</span><span class="card-foot">${d.category==='Basic'?'+1 COIN':d.category==='Loot'?(lootUsable?'USE NOW':lootBlocked?'INSPECT · NOT USABLE NOW':'ATTACH AFTER REVEAL'):d.category==='Special'?'FURY SPECIAL':d.starter?'STARTER · 0 COINS':'HERO · 0 COINS'}</span>
    ${inspect?`<span class="inspect" data-inspect="${d.id}" title="Read full card">${symbol('eye')}</span>`:''}</${button?'button':'div'}>`;
}
function cardDetail(id){const d=def(id);if(!d)return;modal(`<div class="detail-layout">${cardHTML(d,{button:false,inspect:false})}<div><p class="eyebrow">${esc(d.id)} / ${esc(d.category)}</p><h2>${esc(d.name)}</h2>${d.timing?`<p class="timing"><b>Play timing</b><br>${esc(d.timing)}</p>`:''}<p>${esc(d.text)}</p><p class="muted">${d.category==='Basic'?'Gain 1 Coin after this card resolves, even if its Attack misses.':d.category==='Loot'?'Pay 4 Coins at the start of a round. Hold at most 2. After each reveal, attach up to 1 Loot to your Action; it resolves with that Action.':d.category==='Special'?'Unlocked once at 3 Fury and added to your hand. After its first use, discard and shuffle it normally for the rest of the match.':'Choose 5 Hero cards from 8 designs, up to 2 copies each. Hero cards generate 0 Coins.'}</p>${d.hero?`<p class="small muted">${esc(d.hero)}${d.starter?' · Recommended starter':''}</p>`:''}</div></div>`);}

function poolHTML(d,selection,limit,kind){
 const n=selection.filter(id=>id===d.id).length;
 return `<div class="pool-card quantity-card ${n?'chosen':''}"><button class="info" data-inspect="${d.id}" aria-label="Read ${esc(d.name)}">i</button><span>${esc(d.name)}</span><div class="copy-controls"><button data-${kind}="${d.id}" data-delta="-1" ${!n?'disabled':''} aria-label="Remove one ${esc(d.name)}">−</button><b aria-label="${n} copies">${n}/2</b><button data-${kind}="${d.id}" data-delta="1" ${n===2||selection.length===limit?'disabled':''} aria-label="Add one ${esc(d.name)}">+</button></div></div>`;
}
function renderSetup(){
  const basicPool=data.cards.filter(c=>c.category==='Basic');
  const h=hero(heroes[editPlayer]),pool=data.cards.filter(c=>c.category==='Hero'&&c.hero===h.name);
  let saved=false;try{saved=Boolean(localStorage.getItem(SAVE));}catch{}
  app.innerHTML=`<section class="setup" style="--accent:${COLORS[h.id]}"><div class="setup-intro"><div><p class="eyebrow" style="margin-bottom:10px">A DUEL OF READS, RANGE & RIDICULOUS LOOT</p><h1>Two cards. One big read.</h1></div><p>Choose your Hero. Secretly program two actions. Outsmart your rival across seven spaces — then unleash your Fury.</p></div>
    <div class="setup-layout"><div><div class="hero-stage"><span class="hero-number">0${data.heroes.indexOf(h)+1}</span><img src="${portrait(h.id)}" alt="${esc(h.name)}"><div class="stage-label"><h2>${esc(h.name)}</h2><p>${esc(h.archetype)}</p></div></div><div class="roster" aria-label="Choose Hero">${data.heroes.map(x=>`<button class="hero-thumb ${x.id===h.id?'selected':''}" data-hero="${x.id}" aria-pressed="${x.id===h.id}"><img src="${portrait(x.id)}" alt=""><span>${SHORT[x.id].toUpperCase()}</span></button>`).join('')}</div></div>
    <div class="setup-side"><div><div class="segment" aria-label="Play mode"><button data-mode="solo" class="${mode==='solo'?'active':''}">Solo vs computer</button><button data-mode="hotseat" class="${mode==='hotseat'?'active':''}">Local two-player</button>${canOnline?`<button data-mode="online" class="${mode==='online'?'active':''}">Online 1v1</button>`:''}</div><div class="setup-players">${(mode==='online'?[heroes[0]]:heroes).map((id,i)=>`<button data-edit-player="${i}" class="${editPlayer===i?'active':''}"><b>${mode==='online'?'YOUR HERO':i===0?'PLAYER 1':mode==='solo'?'COMPUTER':'PLAYER 2'}</b><small>${esc(hero(id).name)}</small></button>`).join('')}</div>${mode==='online'?`<p class="online-setup-note">${invitation().invite?'You have a private invite. Choose your Hero and five cards, then join.':'Create a private room and send its invite link to a friend. Each player chooses their own Hero.'}</p>`:''}</div>
    <section class="panel trait-panel"><p class="eyebrow" style="margin-bottom:6px">HERO TRAIT</p><h3>${esc(h.trait)}</h3><p>${esc(h.traitText)}</p></section>
    <section class="panel"><div class="deck-header"><h3>Choose your five</h3><span class="small ${chosen[editPlayer].length===5?'coins':'muted'}">${chosen[editPlayer].length} / 5</span><button class="quiet small" data-action="starters" style="padding:0">Use starters</button></div><div class="deck-pool">${pool.map(d=>poolHTML(d,chosen[editPlayer],5,'pool')).join('')}</div><p class="setup-rule">Choose 5 Hero cards from 8 designs, with up to 2 copies each. Add 10 Basics for a 15-card deck. Your Fury Skill joins the cycle after its first use.</p><details class="basic-loadout"><summary>Basic loadout · ${basics[editPlayer].length}/10 selected</summary><p class="small muted">Choose 10 Basics, with up to 2 copies of each design. Double down on your strategy or spread your options.</p><div class="deck-pool">${basicPool.map(d=>poolHTML(d,basics[editPlayer],10,'basic')).join('')}</div></details></section></div></div>
    <footer class="setup-footer"><p>2 fighters · 18 starting HP · 15-card decks<br>${mode==='online'?'Two computers. Private hands. One shared battlefield.':mode==='hotseat'?'Pass the device behind a privacy screen to keep your choices secret.':'The computer commits its cards without seeing your hand or choices.'}</p><div class="start-actions">${saved&&mode!=='online'?'<button data-action="resume">Resume match</button>':''}<button class="primary" data-action="start" ${(mode==='online'?chosen[0].length!==5||basics[0].length!==10:chosen.some(a=>a.length!==5)||basics.some(a=>a.length!==10))||onlineBusy?'disabled':''}>${onlineBusy?'Connecting…':mode==='online'?invitation().invite?'Join your friend’s Brawl →':'Create private room →':'Enter the Arena →'}</button></div></footer></section>`;
}
function inviteLink(){const u=new URL(document.baseURI);u.hash=new URLSearchParams({room:onlineLobby.room.id,invite:onlineLobby.invite||''}).toString();return u.href;}
function renderLobby(){app.innerHTML=`<section class="privacy online-lobby"><span class="seal">✦</span><p class="eyebrow">ONLINE 1v1 · PRIVATE ROOM</p><h1>Your battlefield is ready.</h1><p>Send this invite link to your friend. They can join from another computer and choose their own Hero. The match starts when they join.</p><div class="invite-box"><input readonly aria-label="Private invite link" value="${esc(inviteLink())}"><button class="primary" data-action="copy-invite">Copy invite link</button></div><p class="online-lobby-status"><span class="spinner"></span> ${networkConnected?'Waiting for your rival…':'Reconnecting to your room…'}</p><p class="small muted">Keep this tab open, or reopen the room in this browser to reconnect. Rooms last 24 hours.</p><button class="quiet" data-action="leave-online">Back to Hero selection</button></section>`;}
function onlineConnection(value){if(networkConnected===value)return;networkConnected=value;if(screen==='lobby')renderLobby();else{const indicator=$('.online-connection');if(indicator)indicator.textContent=value?'Room connected':'Reconnecting…';}}
function enterOnline(snapshot,token){
  clearTimeout(lobbyTimer);game?.close?.();viewer=snapshot.room.seat;onlineRound=snapshot.game.round;selections=[null,null];targetSlot=null;previousBattle=null;winnerShown=false;lastLog=snapshot.game.log.length;screen='game';mode='online';
  game=OnlineGame.connect(data,snapshot,token,{onUpdate:g=>{if(g.s.round!==onlineRound||g.s.committed[g.seat]){selections=[null,null];targetSlot=null;}onlineRound=g.s.round;viewer=g.seat;render();},onConnection:onlineConnection,onError:error=>toast(error.message)});render();
}
async function pollLobby(){if(screen!=='lobby'||!onlineLobby)return;try{const snapshot=await readOnline(onlineLobby.room.id,onlineLobby.token);networkConnected=true;if(snapshot.game){enterOnline(snapshot,onlineLobby.token);return;}onlineLobby={...onlineLobby,...snapshot};}catch(error){networkConnected=false;if([401,404,409,410].includes(error.status)){toast(error.message);screen='setup';render();return;}}renderLobby();lobbyTimer=setTimeout(pollLobby,1500);}
async function startOnline(){
  if(onlineBusy)return;onlineBusy=true;render();
  try{const link=invitation();let snapshot,token;
    const existing=link.room&&savedSeat(link.room);
    if(existing){snapshot=await readOnline(link.room,existing.token);token=existing.token;onlineLobby={...snapshot,token,invite:existing.invite};}
    else if(link.room&&link.invite){snapshot=await joinOnline(link.room,link.invite,{hero:heroes[0],chosen:chosen[0],basics:basics[0]});token=snapshot.token;}
    else{snapshot=await createOnline({hero:heroes[0],chosen:chosen[0],basics:basics[0]});token=snapshot.token;onlineLobby={...snapshot,token};}
    history.replaceState(null,'','#'+new URLSearchParams({room:snapshot.room.id}).toString());
    if(snapshot.game)enterOnline(snapshot,token);else{screen='lobby';renderLobby();pollLobby();}
  }finally{onlineBusy=false;if(screen==='setup')render();}
}
function desiredViewer(){
  const s=game.s;
  if(s.prompt&&!game.bot(s.prompt.player))return s.prompt.player;
  if(s.phase==='program')return s.committed[0]?1:0;
  if(s.phase==='shop'){const i=s.shopDone.findIndex((v,i)=>!v&&!game.bot(i));if(i>=0)return i;}
  return viewer;
}
function renderPrivacy(){const i=desiredViewer();app.innerHTML=`<section class="privacy"><span class="seal" aria-hidden="true">✦</span><p class="eyebrow">PASS THE DEVICE</p><h1>${esc(hero(game.s.players[i].hero).name)},<br>your turn.</h1><p>The next screen contains your private cards.${game.s.phase==='program'?' Your opponent should look away while you program your actions.':''}</p><button class="primary" data-action="ready">I’m ready — show my cards</button><button class="quiet small" data-action="rules">Review the rules</button></section>`;}
function hud(i){
  const s=game.s,p=s.players[i],h=hero(p.hero),block=p.block+p.roundBlock+(p.wardBlock||0);
  return `<section class="hero-hud ${i?'right':''}" style="--accent:${COLORS[p.hero]}"><div class="hud-portrait"><img src="${portrait(p.hero)}" alt=""><span class="portrait-frame"></span></div><div class="hud-body"><div class="hud-title"><span class="player-tag">${s.mode==='online'?i===viewer?'YOUR HERO':'ONLINE RIVAL':i?s.mode==='solo'?'OPPONENT · CPU':'PLAYER 2':s.mode==='hotseat'?'PLAYER 1':'YOUR HERO'}</span><h2>${esc(h.name)}</h2></div><div class="hp-line"><span class="health" role="meter" aria-label="${esc(h.name)} Health" aria-valuemin="0" aria-valuemax="${Math.max(18,p.hp)}" aria-valuenow="${p.hp}"><span style="width:${Math.min(100,p.hp/18*100)}%"></span></span><span class="hp-count">${p.hp}<small> HP</small></span></div><div class="resources"><span class="coins" title="Coins: Basics earn 1. Loot costs 4. Hold up to 8.">${symbol('coin')}<b>${p.coins}</b><span>Coins</span></span><span class="fury ${p.specialReady?'ready':''}" title="3 Fury unlocks your Skill once. 5 Fury activates your Ultimate. Fury is never spent.">${symbol('spark')}<span class="fury-pips">${[0,1,2,3,4].map(n=>`<i class="${p.fury>n?'lit':''}"></i>`).join('')}</span><span>${p.ultimate?'Ultimate active':p.fury+' / 5 Fury'}</span></span>${h.id==='FRA'?'':`<span class="trait-resource" title="${esc(h.traitText)}">${esc(h.trait)} <b>${p.trait}</b></span>`}${block?`<span class="block-resource">${symbol('shield')}<b>${block}</b></span>`:''}</div></div><button class="hero-guide-hit" data-hero-guide="${h.id}" data-guide-seat="${i}" aria-label="View ${esc(h.name)} abilities" aria-haspopup="dialog" title="Hero trait & Fury Special"><span aria-hidden="true">ⓘ</span></button></section>`;
}
function heroGuide(id,seat){
 const h=hero(id),special=def(id+'-SP1');if(!h||!special)return;
 const player=Number.isInteger(seat)&&game?.s.players[seat]?.hero===id?game.s.players[seat]:null;
 modal(`<article class="hero-quick-guide" style="--accent:${COLORS[id]}"><header class="guide-hero-header"><img src="${portrait(id)}" alt="${esc(h.name)}"><div><p class="eyebrow">HERO FIELD GUIDE</p><h2>${esc(h.name)}</h2><p>${esc(h.archetype)}</p>${player?`<span class="guide-fury-state">${symbol('spark')} ${player.fury+' / 5 Fury'+(player.ultimate?' · Ultimate active':'')}</span>`:''}</div></header><div class="hero-guide-grid"><section><p class="eyebrow">HERO TRAIT</p><h3>${esc(h.trait)}</h3><p>${esc(h.traitText)}</p></section><section class="guide-special"><p class="eyebrow">FURY SPECIAL</p><h3>${esc(special.name)}</h3><div class="guide-special-stats"><span>${symbol('speed')} Speed ${special.speed}</span>${special.damage?`<span>${symbol('damage')} ${special.damage} damage</span>`:''}${special.range?`<span>${symbol('range')} Range ${special.range}</span>`:''}</div><p>${esc(special.text)}</p><p class="guide-unlock">Unlock once at 3 Fury; added directly to hand. After use it cycles through your deck. Fury persists up to 5.</p></section><section class="guide-special"><p class="eyebrow">5 FURY ULTIMATE</p><h3>${esc(h.ultimate.name)}</h3><p>${esc(h.ultimate.text)}</p></section></div></article>`);
}
function planHTML(i){
  const s=game.s,own=i===viewer;
  const plan=s.plans[i];
  return `<div class="program-pair" aria-label="${esc(s.players[i].name)} programmed cards">${[0,1].map(k=>{
    const visible=s.shown[k] || own&&(s.phase==='program'||s.mode==='online');
    const card=plan?.[k]?.card || (own&&s.phase==='program'&&selections[k]?game.available(i).find(c=>c.uid===selections[k]):null);
    const d=card&&def(card.id),shown=visible&&d;
    const canChoose=own&&s.phase==='program'&&!s.committed[i],isNext=canChoose&&(targetSlot===k||targetSlot===null&&selections.indexOf(null)===k);
    return `<div class="program-card ${shown?'filled':''} ${isNext?'next-slot':''} ${s.shown[k]?'revealed':''} ${plan?.[k]?.done?'done':''}" ${d?`style="--accent:${COLORS[heroForCard(d)?.id]||'#4b8185'}"`:''}><span class="slot-label">${canChoose?`<button class="slot-select" data-target-slot="${k}" aria-label="Choose card for Action ${k+1}"><b>0${k+1}</b> ${k?'SECOND ACTION':'FIRST ACTION'}</button>`:`<b>0${k+1}</b> ${k?'SECOND ACTION':'FIRST ACTION'}`}</span>${shown?`<span class="program-art">${art(d)}</span><span class="program-copy"><span class="display">${esc(d.name)}</span><span class="card-type">${d.category}${d.damage?' · '+d.damage+' damage':''}${d.range?' · Range '+d.range:''}</span></span><span class="speed">${symbol('speed')}${s.shown[k]?plan?.[k]?.speed??d.speed:d.speed}</span>${canChoose?`<button class="clear-slot" data-clear="${k}" aria-label="Remove Action ${k+1}">×</button>`:''}`:card||s.committed[i]?'<span class="hidden-mark">✦</span><span class="card-type">Locked in · hidden</span>':`<span class="empty-slot-note">${own?'<span class="empty-plus">+</span> '+(isNext?'Choose a card below':'Then choose another card'):'Waiting for opponent'}</span>`}</div>`;
  }).join('')}</div>`;
}
function phaseControl(){
  const s=game.s,allShop=s.shopDone.every(Boolean);
  if(s.mode==='online'&&(s.phase==='program'&&s.committed[viewer]||s.phase==='shop'&&!allShop&&s.shopDone[viewer]||s.prompt?.kind==='waiting'))return `<div class="phase-control"><span class="control-step">ONLINE MATCH</span><h3>Waiting for your rival.</h3><p>${s.phase==='program'?'Your two actions are locked and private. The reveal opens when both players are ready.':s.phase==='shop'?'Your purchase phase is complete. Your rival is finishing theirs.':'Your rival is making a private choice. The battlefield updates automatically.'}</p><span class="online-connection">${networkConnected?'Room connected':'Reconnecting…'}</span></div>`;
  if(s.prompt?.kind==='loot'&&s.prompt.player===viewer)return `<div class="phase-control"><span class="control-step">OPTIONAL LOOT ATTACHMENT</span><h3>${lootUI.open?'Use Loot or pass.':'Loot is available.'}</h3><button data-action="skip-prompt" class="primary">Pass without Loot →</button></div>`;
  if(s.phase==='program'){const n=selections.filter(Boolean).length;return `<div class="phase-control"><span class="control-step">${n}/2 ACTIONS CHOSEN</span><h3 aria-live="polite">${n===0?'Choose your first card.':n===1?'Now choose your second.':'Your plan is ready.'}</h3><p>${n===2?'Check movement below, then confirm your hidden plan.':'Pick from your hand below. Your first card plays first.'}</p><div class="control-buttons"><button class="swap" data-action="swap" ${n<2?'disabled':''} aria-label="Swap programmed cards">⇄ Swap</button><button class="primary" data-action="lock" ${n<2?'disabled':''}>${n===2?'Confirm 2 actions':'Choose '+(2-n)+' card'+(n?'':'s')} <span>→</span></button></div></div>`;}
  if(s.phase==='shop') {
    if(lootUI.purchased)return `<div class="phase-control"><span class="control-step">ADDED TO YOUR HAND</span><h3>New Loot acquired.</h3><button class="primary" data-action="close-loot">Done →</button></div>`;
    if(allShop)return `<div class="phase-control"><h3>Ready to plan.</h3><p>Start-round purchases are complete.</p><button class="primary" data-action="next-round">Choose your actions →</button></div>`;
    const p=s.players[viewer],can=p.coins>=4&&p.loot.length<2;
    return `<div class="phase-control"><h3>A little retail therapy.</h3><p>Random secret Loot costs 4 Coins. You hold ${p.loot.length}/2.</p><div style="display:flex;gap:8px"><button class="primary" data-action="buy" ${!can?'disabled':''}>Buy Loot · 4 ●</button><button data-action="skip-buy">Skip</button></div></div>`;
  }
  if(s.phase==='over')return `<div class="phase-control"><h3>${s.winner==='draw'?'Double knockout!':esc(s.players[s.winner].name)+' wins!'}</h3><button class="primary" data-action="results">View results</button></div>`;
  const label={'Reveal Action 1':'Reveal first actions','Resolve Action 1':'Resolve faster card','Resolve the slower card':'Resolve remaining card','Between reveals':'Reveal second actions','Resolve Action 2':'Resolve faster card','Finish the round':'Finish round'}[s.beat]||s.beat;
  return `<div class="phase-control"><span class="control-step">${s.prompt?'YOUR CHOICE':'ACTION '+(s.reveal+1)+' / 2'}</span><h3 aria-live="polite">${esc(s.prompt?'A trick up your sleeve?':s.beat.startsWith('Reveal')?'Time to show your cards.':s.beat==='Between reveals'?'One action down. One to go.':'Watch the order of play.')}</h3><p>${s.prompt?'Use an eligible Loot card, or continue.':'Higher Speed acts first. Initiative wins ties.'}</p><button class="primary" data-action="advance" ${s.prompt?'disabled':''}>${esc(label)} <span>→</span></button></div>`;
}
const WINDOW_LABELS={scout:'Before Action 1 is revealed',between:'Between the two reveals',revealed:'After cards are revealed',beforeCard:'Before your card resolves',beforeRange:'Before your Attack checks Range',beforeDamage:'Before your Range 1 Attack deals damage',reaction:'When you would take Attack damage',force:'When you would be pushed or pulled',afterBasic:'After your Basic card resolves'};
function reactionHTML(){
  const q=game.s.prompt;if(!q)return '';
  if(q.kind==='waiting')return '<section class="reaction waiting-reaction"><h3>Your rival is choosing.</h3><p>Their private hand and choices stay hidden. Your game will update automatically.</p></section>';
  const p=game.s.players[q.player];
  if(q.kind==='loot')return '';
  if(q.kind==='space')return `<section class="reaction"><div><h3>Choose your destination.</h3><p>Teleport to any unoccupied Arena space. Select a highlighted space above.</p></div><button data-action="skip-prompt">Choose a free space for me</button></section>`;
  if(q.kind==='peek'||q.kind==='replace') {
    const p=game.s.players[q.player];
    const peek=[...p.peek.map(k=>game.s.plans[1-q.player][k]),...(p.scouted||[]).map(card=>({card}))];
    return `<section class="reaction"><div><h3>${q.kind==='replace'?'Crystal Ball: rewrite Action 2.':'A peek behind the curtain.'}</h3><p>Only ${esc(p.name)} should see this. ${q.kind==='replace'?'Choose a replacement from your hand below, or keep your current Action 2.':'Your opponent’s programmed card'+(peek.length>1?'s':'')+':'}</p></div><div class="peek-cards">${peek.map(a=>cardHTML(def(a.card.id),{button:false})).join('')}</div><button data-action="skip-prompt">${q.kind==='replace'?'Keep my Action 2':'Done — continue'} →</button></section>`;
  }
  if(q.kind==='focus'){const cards=q.cards||p.deck.slice(-2);return `<section class="reaction"><h3>Focus: choose the card to keep on top.</h3><div class="reaction-choices">${cards.map(c=>`<button data-choice="${c.uid}">${esc(def(c.id).name)}</button>`).join('')}</div></section>`;}
  if(q.kind==='discard')return `<section class="reaction"><div><h3>Diagnosis: discard one card.</h3><p>You drew one card. Choose a card from your hand below to discard.</p></div></section>`;
  if(q.kind==='retrieve')return `<section class="reaction"><div><h3>Gum & String: retrieve Loot.</h3><p>Choose one card from the Loot discard pile.</p></div><div class="reaction-choices">${q.choices.map(id=>`<button data-choice="${id}">${esc(def(id).name)}</button>`).join('')}</div></section>`;
  return '';
}
function movementChoicesHTML(){
 if(game.s.phase!=='program'||game.s.committed[viewer])return '';
 const p=game.s.players[viewer],op=game.s.players[1-viewer];
 const rows=selections.flatMap((uid,k)=>{
  const c=game.available(viewer).find(c=>c.uid===uid),d=c&&def(c.id),limit=movementLimit(d);if(!limit)return [];
  const o=strategies[k],steps=Math.max(limit.min,Math.min(limit.max,o.steps)),cross=Math.abs(p.pos-op.pos)+1,dir=op.pos>p.pos?'right':'left',target=op.pos+(op.pos>p.pos?1:-1),canCross=cross<=limit.max&&target>=game.s.left&&target<=game.s.right;
  return [`<section class="movement-choice" aria-label="Action ${k+1} movement"><div class="movement-choice-title"><span>${k+1}</span><b>${esc(d.name)}</b><output aria-live="polite">${esc(movementSummary(d,o))}</output></div><div class="movement-controls"><div class="movement-direction" role="group" aria-label="Action ${k+1} direction">${[['left','← Left'],['right','Right →']].map(([value,label])=>`<button data-move-direction="${value}" data-slot="${k}" aria-pressed="${!o.path&&o.direction===value}">${label}</button>`).join('')}</div><div class="movement-distance" role="group" aria-label="Action ${k+1} distance"><small>${limit.optional?'Up to':'Move'}</small>${Array.from({length:limit.max-limit.min+1},(_,n)=>n+limit.min).map(n=>`<button data-move-distance="${n}" data-slot="${k}" aria-label="Action ${k+1}: ${n===0?'stay put':n+' space'+(n===1?'':'s')}" aria-pressed="${!o.path&&steps===n}">${n===0?'Stay':n}</button>`).join('')}</div><button data-move-turn="true" data-slot="${k}" aria-pressed="${o.path==='T'}">↶ Turn</button>${canCross?`<button data-move-cross="${dir}" data-move-count="${cross}" data-slot="${k}">Cross rival · ${cross}</button>`:''}</div></section>`];
 });
 return rows.length?`<div class="movement-choices"><p>Choose movement for your hidden plan. Crossing uses one point per space; you cannot finish on your rival.</p>${rows.join('')}</div>`:'';
}
function optionsHTML(){
  const p=game.s.players[viewer];
  return `<details class="options-row"><summary>Advanced paths & trait choices <span class="muted">· optional</span></summary><div class="option-grid">${strategies.map((o,k)=>`<div class="option-group"><b>Action ${k+1}</b><label>Free movement <select data-option="direction" data-slot="${k}">${['toward','away','left','right'].map(v=>`<option value="${v}" ${o.direction===v?'selected':''}>${v}</option>`).join('')}</select></label><label>Movement path (optional)<input data-option="path" data-slot="${k}" value="${esc(o.path||'')}" maxlength="3" pattern="[LRTlrt]{0,3}" placeholder="e.g. RT or LL" aria-label="Action ${k+1} movement path"></label><label>Move up to <select data-option="steps" data-slot="${k}">${[0,1,2,3].map(v=>`<option ${o.steps===v?'selected':''} value="${v}">${v===3?'card maximum':v}</option>`).join('')}</select></label><label><input type="checkbox" data-option="trait" data-slot="${k}" ${o.trait?'checked':''}> Spend trait</label><label><input type="checkbox" data-option="push" data-slot="${k}" ${o.push?'checked':''}> Use optional Push</label>${['SMA','HEL'].includes(p.hero)?`<label><input type="checkbox" data-option="follow" data-slot="${k}" ${o.follow?'checked':''}> Follow charge / check</label>`:''}${p.hero==='ALF'?`<label>Aim <select data-option="aim" data-slot="${k}"><option value="damage" ${o.aim==='damage'?'selected':''}>+2 damage at Range 3+</option><option value="range" ${o.aim==='range'?'selected':''}>+1 max Range</option></select></label>`:''}${p.hero==='SHE'?`<label>Remedy <select data-option="remedy" data-slot="${k}">${['damage','move','block'].map(v=>`<option ${o.remedy===v?'selected':''}>${v==='damage'?'+2 attack damage':v==='block'?'+1 Block':'Move 1'}</option>`).join('')}</select></label>`:''}${p.hero==='FRA'?`<label><input type="checkbox" data-option="coin" data-slot="${k}" ${o.coin?'checked':''}> Spend Coin on Coin Toss</label>`:''}</div>`).join('')}</div><p class="small muted" style="margin-top:10px">Movement path: L moves left, R moves right, T turns in place; each uses 1 printed movement point. Leave blank to use your direction choice. A custom path ends after its last letter; unused movement is skipped. Each movement effect follows the same path. Attacks automatically face their target; Backstab checks Behind first. Dodge and Resolve are spent automatically when enabled. The step limit applies to printed “up to” moves, including Grappling Hook’s pull. Mandatory Move 1 still resolves. Optional Push applies to Sweep, Shove and Palm Strike. Follow applies to Shoulder Charge and Body Check.</p></details>`;
}
function revealedCardsHTML(){
  const s=game.s,k=s.reveal;
  if(s.phase!=='resolve'||!s.shown[k])return '';
  return `<section class="reveal-stage" aria-label="Both revealed Action ${k+1} cards"><div class="reveal-caption">ACTION ${k+1} <span>Higher Speed acts first · Initiative breaks ties</span></div><div class="reveal-pair">${[viewer,1-viewer].map(i=>{const a=s.plans[i]?.[k],d=a&&def(a.card.id);if(!d)return '';return `<article class="revealed-action ${a.done?'resolved':''}"><div class="reveal-owner">${s.mode==='hotseat'?esc(SHORT[s.players[i].hero]):i===viewer?'YOU':'RIVAL'} · ${esc(SHORT[s.players[i].hero])}<b>${a.done?'RESOLVED':a.speed?a.speed+' SPEED':'LOOT WINDOW'}</b></div>${cardHTML(d,{button:false})}${a.loot?`<div class="attached-loot">✦ ${esc(def(a.loot).name)}${a.lootUsed?' · USED':' · ATTACHED'}</div>`:''}</article>`;}).join('')}</div></section>`;
}
function lootContext(){const s=game.s;return JSON.stringify([s.round,s.phase,viewer,s.prompt]);}
function openLoot(purchased=null){lootUI={context:lootContext(),open:true,purchased};render();($('.hand .usable-loot')||$('.hand [data-loot-card]'))?.focus({preventScroll:true});}
function handCardsHTML(combatCards,lootCards,lootWindow){
 const cards=[...combatCards.map(c=>({...c,isLoot:false})),...lootCards.map(id=>({id,uid:'loot-'+id,isLoot:true}))];
 return cards.map((c,k)=>cardHTML(def(c.id),{uid:c.uid,loot:c.isLoot,selected:!c.isLoot&&selections.includes(c.uid),fanIndex:k,fanTotal:cards.length,selectionNumber:!c.isLoot&&selections.includes(c.uid)?selections.indexOf(c.uid)+1:null,lootUsable:c.isLoot&&lootWindow&&game.s.prompt.choices.includes(c.id),lootBlocked:c.isLoot&&lootWindow&&!game.s.prompt.choices.includes(c.id),newLoot:c.id===lootUI.purchased})).join('')||'<p class="muted small">Your hand is empty.</p>';
}
function renderTable(){
  const s=game.s;
  if(lootUI.context!==lootContext())lootUI={context:lootContext(),open:false,purchased:null};
  const purchaseReveal=Boolean(lootUI.open&&lootUI.purchased);
  if(s.mode==='hotseat'&&s.phase!=='over'&&!purchaseReveal){
    const desired=desiredViewer(),privatePhase=s.phase==='program'||s.phase==='shop'&&!s.shopDone.every(Boolean)||Boolean(s.prompt);
    if(privatePhase&&(!ready||viewer!==desired)){ready=false;return renderPrivacy();}
  }
  const p=s.players[viewer],publicPhase=!purchaseReveal&&s.mode==='hotseat'&&(s.phase==='resolve'&&!s.prompt||s.phase==='shop'&&s.shopDone.every(Boolean)||s.phase==='over');
  const hand=game.available(viewer),last=[...s.log].reverse().find(l=>!['coin','info'].includes(l.kind))||s.log.at(-1);
  const step=s.phase==='shop'?0:s.phase==='program'?1:s.shown[1]?3:2;
  const privateChoice=s.prompt&&['replace','discard'].includes(s.prompt.kind);
  const lootWindow=s.prompt?.kind==='loot'&&s.prompt.player===viewer,lootOnly=lootUI.open&&s.phase!=='program'&&!privateChoice;
  const handOpen=Boolean(privateChoice||s.phase==='program'&&!s.committed[viewer]||lootUI.open),handEntering=handOpen&&!handWasOpen;handWasOpen=handOpen;
  app.innerHTML=`<section class="table battlefield phase-${s.phase} ${privateChoice?'has-private-choice':''} ${handOpen?'hand-open':''} ${handEntering?'hand-entering':''} ${lootOnly?'loot-only':''}" style="--hero-accent:${COLORS[p.hero]}">
    <div class="hud">${hud(0)}<div class="round-title"><span class="eyebrow">BRIARWOOD RUINS</span><span class="display">ROUND ${s.round}</span><span class="edge">✦ ${SHORT[s.players[s.edge].hero]} holds Initiative</span><ol class="phase-track" aria-label="Round progress">${['Purchase','Plan','Reveal 1','Reveal 2'].map((label,k)=>`<li class="${step===k?'current':step>k?'complete':''}" ${step===k?'aria-current="step"':''}><span>${step>k?'✓':k+1}</span><small>${label}</small></li>`).join('')}</ol></div>${hud(1)}</div>
    <div class="arena" aria-label="Seven-space Arena"><div class="ambient" aria-hidden="true">${Array.from({length:12},(_,k)=>`<i style="--mote-x:${8+(k*23)%85}%;--mote-y:${10+(k*17)%70}%;--mote-delay:${k*.7}s"></i>`).join('')}</div>
      <div class="arena-location"><span>THE OLD DUELING GROUND</span><small>Win by reducing your rival to 0 HP</small></div>
      <div class="rival-status">${s.committed[1-viewer]?'✓ Rival ready':'Rival choosing…'}</div>
      ${revealedCardsHTML()}
      <div class="range-badge"><small>CURRENT DISTANCE</small><span>${symbol('range')}<b>${game.range()}</b><em>spaces</em></span></div>
      ${last?`<div class="battle-callout ${last.kind}" aria-live="polite"><span class="callout-icon">${symbol(['damage','slam'].includes(last.kind)?'damage':last.kind==='block'?'shield':last.kind==='move'?'range':'spark')}</span>${esc(last.message)}</div>`:''}
      <div class="fighters">${s.players.map((p,i)=>`<div class="fighter p${i+1} ${p.hp<=0?'ko':''}" style="left:${(p.pos-1)*100/7}%;--facing:${p.facing}" aria-label="${esc(p.name)} on space ${p.pos}"><button class="fighter-guide-hit" data-hero-guide="${p.hero}" data-guide-seat="${i}" aria-label="View ${esc(p.name)} abilities" aria-haspopup="dialog" title="Hero trait & Fury Special"></button><span class="fighter-aura" aria-hidden="true"></span><span class="fighter-shadow" aria-hidden="true"></span><img class="fighter-art" src="${portrait(p.hero)}" alt="${esc(p.name)}"><span class="fighter-marker">${p.facing===1?'FACING →':'← FACING'}</span></div>`).join('')}</div>
      <div class="arena-lane">${[1,2,3,4,5,6,7].map(n=>`<button class="space ${n<s.left||n>s.right?'closed-space':''} ${s.players.some(p=>p.pos===n)?'occupied':''} ${s.prompt?.kind==='space'&&s.prompt.choices.includes(n)?'target':''}" data-space="${n}" ${s.prompt?.kind!=='space'||!s.prompt.choices.includes(n)?'disabled':''} aria-label="Arena space ${n}"><span>${n}</span>${[s.left,s.right].includes(n)?'<small>WALL</small>':''}</button>`).join('')}</div><div class="arena-front" aria-hidden="true"></div></div>
    ${reactionHTML()}
    ${lootWindow&&!lootUI.open?`<button class="loot-alert" data-action="view-loot" aria-label="Loot available: open your Loot hand" aria-expanded="false">${symbol('spark')}<span>Loot ready</span><b>${s.prompt.choices.length}</b></button>`:''}
    <section class="hand-zone"><div class="hand-toolbar"><div class="zone-header"><span class="hand-rule"></span><div><h3>${s.mode==='hotseat'?esc(SHORT[p.hero])+'’s':'Your'} hand <span>${hand.length}</span></h3><p>${privateChoice?'Choose a card below to '+(s.prompt.kind==='replace'?'replace Action 2.':'discard.') :s.phase==='program'?'Click two cards in order. Click again to put one back.':'Your remaining cards are safe until the next round.'}</p></div><span class="hand-rule"></span></div><div class="turn-dock">${phaseControl()}</div></div>
    ${publicPhase?'<div class="public-note">'+symbol('eye')+' Both players can watch. Private hands and Loot are concealed.</div>':`<div class="hand-and-loot"><div class="hand-center"><div class="tray-caption"><b>${lootUI.purchased?'LOOT ACQUIRED':lootOnly?'YOUR LOOT':privateChoice?'CHOOSE A CARD':'CHOOSE TWO ACTIONS'}</b><span>${lootUI.purchased?esc(def(lootUI.purchased).name)+' added to your hand':lootWindow?esc(WINDOW_LABELS[s.prompt.window])+' · Click a glowing card to use it':lootOnly?'Your secret Loot · Click a card to inspect it':privateChoice?'Select a card from your hand':'Choose two actions · Purple Loot attaches after a reveal'}</span>${lootUI.open&&!lootUI.purchased?'<button class="close-loot-tray" data-action="close-loot">'+(lootUI.purchased?'Done':'Close')+'</button>':''}</div><div class="hand ${p.loot.length?'with-loot':''}" aria-label="${lootOnly?'Your Loot hand':'Choose cards from your hand'}">${handCardsHTML(lootOnly?[]:hand,privateChoice?[]:p.loot,lootWindow)}</div>${s.phase==='program'?movementChoicesHTML()+optionsHTML():''}</div><aside class="pile-area"><div class="draw-pile" aria-label="Combat deck: ${p.deck.length} cards"><div class="pile-back"><span>FABLE FURY</span><b>✦</b><strong>BRAWL</strong></div><span class="pile-count">${p.deck.length}</span></div><span class="pile-label">DRAW PILE</span><button class="discard-pile" data-action="view-discard">${p.discard.length}<span>Discard pile</span></button></aside></div>`}</section>
    <footer class="table-footer"><button data-action="toggle-log">${showLog?'Hide':'Show'} battle log</button><button data-action="rules">Rules & card library</button>${!publicPhase?`<button data-action="view-loot" class="loot-inventory">${symbol('spark')} Loot ${p.loot.length}/2</button>`:''}<span class="save-indicator ${s.mode==='online'?'online-connection':''}"><i></i> ${s.mode==='online'?(networkConnected?'Room connected':'Reconnecting…'):'Match saved'}</span><span class="table-tip">${symbol('speed')} Higher Speed acts first · Initiative wins ties</span><button class="right-link" data-action="new-match">New match</button></footer>${showLog?`<section class="battle-log" aria-label="Battle log">${s.log.slice(-45).map(l=>`<p class="${l.kind}"><span class="log-round">R${l.round}</span>${esc(l.message)}</p>`).join('')}</section>`:''}</section>`;
  audioFeedback(previousBattle);
  battleFeedback(previousBattle);
  previousBattle=s.players.map(p=>({pos:p.pos,hp:p.hp}));
  lastLog=s.log.length;
  if(showLog){const log=$('.battle-log');if(log)log.scrollTop=log.scrollHeight;}
  if(s.phase==='over'&&!winnerShown){winnerShown=true;results();}
}
function audioFeedback(previous){
 const logs=game.s.log,marker=logs.at(-1),key=x=>JSON.stringify(x);
 const index=lastAudioLog?logs.findLastIndex(l=>key(l)===lastAudioLog):-1;
 const recent=lastAudioLog?logs.slice(index+1):[];lastAudioLog=key(marker);
 if(!previous)return;
 const damage=game.s.players.some((p,i)=>p.hp<previous[i].hp),moved=game.s.players.some((p,i)=>p.pos!==previous[i].pos);
 if(recent.some(l=>l.kind==='reveal'))playTone('reveal');
 if(recent.some(l=>l.kind==='card'))playTone('card');
 if(damage){playTone('damage');if(game.s.players.some((p,i)=>previous[i].hp-p.hp>=3))playTone('heavy');}
 else if(recent.some(l=>['block','dodge'].includes(l.kind)))playTone('block');
 if(moved)playTone('move');
 for(const kind of ['fury','heal','loot'])if(recent.some(l=>l.kind===kind))playTone(kind);
}
function battleFeedback(previous){
  if(!previous||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const width=$('.fighters')?.getBoundingClientRect().width||0;
  game.s.players.forEach((p,i)=>{
    const fighter=$(`.fighter.p${i+1}`);if(!fighter)return;
    if(p.pos!==previous[i].pos)fighter.animate([{transform:`translateX(${(previous[i].pos-p.pos)*width/7}px)`},{transform:'translateX(0)'}],{duration:550,easing:'cubic-bezier(.2,.8,.2,1)'});
    const change=p.hp-previous[i].hp;
    if(change){const number=document.createElement('span');number.className='combat-float '+(change>0?'healing':'loss');number.textContent=(change>0?'+':'−')+Math.abs(change);fighter.append(number);if(change<0)fighter.classList.add('hit');}
  });
  const recent=game.s.log.slice(lastLog),attack=recent.findLast(l=>l.kind==='card');
  if(attack?.player!==null&&attack?.player!==undefined)$(`.fighter.p${attack.player+1}`)?.classList.add('attack');
}
function render(){if(!data)return;document.body.classList.toggle('in-battle',screen==='game');document.body.classList.toggle('arena-paused',document.hidden);if(screen!=='game')handWasOpen=false;battleAudio.setBattle(screen==='game');if(screen==='setup')renderSetup();else if(screen==='lobby')renderLobby();else renderTable();}
function persist(){if(game.s.mode==='online')return;try{localStorage.setItem(SAVE,JSON.stringify(game.s));}catch{toast('Browser storage is unavailable; keep this tab open to retain your match.');}}
function update(){if(game.s.mode==='online'&&game.s.round!==onlineRound){onlineRound=game.s.round;selections=[null,null];targetSlot=null;}persist();render();}
function start(){
  game=new Brawl(data,{mode,heroes,chosen,basics});screen='game';viewer=0;ready=mode==='solo';selections=[null,null];winnerShown=false;lastLog=0;previousBattle=null;targetSlot=null;dialog.close();update();playTone('reveal');
}
async function nextRound(){await game.nextRound();selections=[null,null];targetSlot=null;ready=game.s.mode==='solo';viewer=game.s.mode==='online'?game.seat:0;update();}
function results(){
  const s=game.s,w=s.winner==='draw'?null:s.players[s.winner];
  modal(`<section class="winner"><p class="eyebrow">THE ARENA HAS SPOKEN</p>${w?`<img src="${portrait(w.hero)}" alt="${esc(w.name)}">`:''}<h1>${w?esc(w.name)+' wins!':'Double knockout!'}</h1><p>${w?'A fine display of questionable tactics.':'Two Heroes. Zero survivors. Incredible.'}</p><div class="stats"><div class="stat"><b>${s.round}</b><span>ROUNDS FOUGHT</span></div><div class="stat"><b>${w?.hp??0}</b><span>WINNER HP</span></div><div class="stat"><b>${s.players.reduce((n,p)=>n+p.lootBought,0)}</b><span>LOOT PURCHASED</span></div></div><div class="winner-actions"><button class="primary" data-action="rematch">Rematch</button><button data-action="home">Choose Heroes</button><button data-action="export">Save battle log</button></div></section>`);playTone('victory');
}
function rules(tab='rules',query=''){
  const tabs=`<h2>Field guide to a good Brawl.</h2><div class="rules-tabs"><button data-rules-tab="rules" class="${tab==='rules'?'active':''}">How to play</button><button data-rules-tab="heroes" class="${tab==='heroes'?'active':''}">Heroes</button><button data-rules-tab="cards" class="${tab==='cards'?'active':''}">All ${data.cards.length} cards</button></div>`;
  let body='';
  if(tab==='rules')body=`<div class="rules-copy"><h3>Build your fighter</h3><p>Choose 10 Basic cards and 5 Hero cards. Up to two copies of any named card. Each hero has 8 designs. Start at 18 HP, 2 Coins, spaces 2 and 6, facing each other. Draw 5.</p><h3>Purchase. Program. Reveal. Resolve.</h3><ol><li>At round start, optionally buy 1 random secret Loot for 4 Coins. Hold at most 2.</li><li>Secretly choose two cards in order. Both Action 1 cards reveal together.</li><li>Initiative player may attach 1 Loot, then the opponent may attach 1. Attachments are public; effects wait for their package.</li><li>Compare effective Speed, including Loot modifiers. Higher acts first; Initiative breaks ties. Resolve the entire Action plus Loot package before the other. A KO cancels the slower package and discards its attached Loot.</li><li>Repeat for Action 2. At cleanup discard Actions and used Loot, refill to 5, expire effects and alternate Initiative.</li></ol><h3>Resources and damage</h3><p>Basics earn 1 Coin on resolution, including a miss. Battle Cry earns 2 total. Coin cap 8. Hero cards and Skills give no automatic Coins. Each opponent Action card or Loot card causing actual HP loss gives 1 Fury total, even with multiple hits or Wall Slam. Fury is never spent. At 3, add your Skill to hand once. After use it joins your discard and deck cycle. At 5, your Ultimate activates after the resolving effect finishes, provided you survive.</p><p>Block is consumed point for point and expires at its printed duration. Bypassed Block remains. Dodge cancels one Attack and all on-hit effects, without undoing earlier movement. On-hit requires actual HP loss. Card-wide bonuses affect only the first Attack unless explicitly stated. Healing cannot exceed 18 HP.</p><h3>Position and Facing</h3><p>Move points can go left, right or turn in place. You may cross, but cannot finish on the opponent. Movement preserves facing. Immediately before an Attack, check Behind against the defender’s facing, then turn the attacker toward the target. Backstab is Raven-specific. Forced movement beyond an active edge causes 1 direct HP loss, at most once per effect. Closing Walls relocates fighters without damage or changing facing.</p><h3>Loot and information</h3><p>Loot is attached only after a reveal, once per player per slot. Non-Speed effects happen in the owner’s package. Defensive Loot lasts until that owner’s next package starts, including across round boundaries. Inspect your hero portrait for the trait, Skill and Ultimate. Information and replacement choices are private; local players pass the device at the privacy screen.</p><p>v0.4 is a new playtest ruleset. Start a new match or online room; older matches use incompatible rules.</p></div>`;
  if(tab==='heroes')body=`<div class="rules-copy">${data.heroes.map(h=>`<section class="panel" style="margin-bottom:12px;border-left:3px solid ${COLORS[h.id]}"><h3 style="margin-top:0">${esc(h.name)} · ${esc(h.trait)}</h3><p>${esc(h.traitText)}</p><p class="small muted">Fury Special: ${esc(def(h.id+'-SP1').name)}</p></section>`).join('')}</div>`;
  if(tab==='cards')body=`<input class="library-search" aria-label="Search card library" placeholder="Search name, Hero, effect, or card ID…" value="${esc(query)}"><div class="library-grid">${data.cards.filter(c=>JSON.stringify([c.name,c.hero,c.category,c.id,c.text]).toLowerCase().includes(query.toLowerCase())).map(d=>cardHTML(d)).join('')}</div>`;
  modal(tabs+body);
  if(tab==='cards')$('.library-search',content).addEventListener('input',e=>{const val=e.target.value;$('.library-grid',content).innerHTML=data.cards.filter(c=>JSON.stringify([c.name,c.hero,c.category,c.id,c.text]).toLowerCase().includes(val.toLowerCase())).map(d=>cardHTML(d)).join('');});
}

document.addEventListener('click',async e=>{
  try{
    const movement=e.target.closest('[data-move-direction],[data-move-distance],[data-move-turn],[data-move-cross]');
    if(movement){const k=Number(movement.dataset.slot),o=strategies[k];if(!game||game.s.phase!=='program'||game.s.committed[viewer])return;
      const selected=game.available(viewer).find(c=>c.uid===selections[k]),limit=movementLimit(selected&&def(selected.id));if(!limit)return;
      if(movement.dataset.moveDirection){o.direction=movement.dataset.moveDirection;o.path='';o.steps=Math.max(limit.min,Math.min(limit.max,o.steps));}
      if(movement.dataset.moveDistance!==undefined){o.steps=Number(movement.dataset.moveDistance);o.path='';if(!['left','right'].includes(o.direction))o.direction=game.s.players[viewer].pos<game.s.players[1-viewer].pos?'right':'left';}
      if(movement.dataset.moveTurn){o.path='T';o.steps=1;}
      if(movement.dataset.moveCross){o.direction=movement.dataset.moveCross;o.steps=Number(movement.dataset.moveCount);o.path='';}
      render();return;
    }
    const guide=e.target.closest('[data-hero-guide]');if(guide){heroGuide(guide.dataset.heroGuide,Number(guide.dataset.guideSeat));return;}
    const inspect=e.target.closest('[data-inspect]');if(inspect){e.stopPropagation();cardDetail(inspect.dataset.inspect);return;}
    const modeBtn=e.target.closest('[data-mode]');if(modeBtn){mode=modeBtn.dataset.mode;if(mode==='online')editPlayer=0;render();return;}
    const ep=e.target.closest('[data-edit-player]');if(ep){editPlayer=Number(ep.dataset.editPlayer);render();return;}
    const hb=e.target.closest('[data-hero]');if(hb){heroes[editPlayer]=hb.dataset.hero;chosen[editPlayer]=data.cards.filter(c=>c.hero===hero(hb.dataset.hero).name&&c.category==='Hero'&&c.starter).map(c=>c.id);render();playTone('click');return;}
    const basic=e.target.closest('[data-basic]');if(basic){const a=basics[editPlayer],id=basic.dataset.basic;if(Number(basic.dataset.delta)<0){if(a.includes(id))a.splice(a.indexOf(id),1);}else if(a.length<10&&a.filter(x=>x===id).length<2)a.push(id);render();$('.basic-loadout').open=true;return;}
    const pool=e.target.closest('[data-pool]');if(pool){const a=chosen[editPlayer],id=pool.dataset.pool;if(Number(pool.dataset.delta)<0){if(a.includes(id))a.splice(a.indexOf(id),1);}else if(a.length<5&&a.filter(x=>x===id).length<2)a.push(id);render();return;}
    const rt=e.target.closest('[data-rules-tab]');if(rt){rules(rt.dataset.rulesTab);return;}
    const use=e.target.closest('[data-use-loot]');if(use){await game.playLoot(use.dataset.useLoot);update();return;}
    const space=e.target.closest('[data-space]');if(space&&game?.s.prompt?.kind==='space'){await game.choose(Number(space.dataset.space));update();return;}
    const choice=e.target.closest('[data-choice]');if(choice){await game.choose(choice.dataset.choice);update();return;}
    const target=e.target.closest('[data-target-slot]');if(target){targetSlot=Number(target.dataset.targetSlot);render();return;}
    const clear=e.target.closest('[data-clear]');if(clear){targetSlot=Number(clear.dataset.clear);selections[targetSlot]=null;render();return;}
    const card=e.target.closest('[data-card]');if(card){
      const uid=card.dataset.card;
      if(dialog.open){cardDetail(uid);return;}
      if(screen!=='game')return;
      const q=game.s.prompt;
      if(card.dataset.lootCard){const id=card.dataset.lootCard;if(q?.kind==='loot'&&q.player===viewer&&q.choices.includes(id)&&lootUI.open){await game.playLoot(id);lootUI.open=false;update();}else cardDetail(id);return;}
      if(q&&['discard','replace'].includes(q.kind)&&q.choices.includes(uid)){await game.choose(uid);update();return;}
      if(game.s.phase==='program'&&!game.s.committed[viewer]&&game.available(viewer).some(c=>c.uid===uid)){
        if(selections.includes(uid)){const index=selections.indexOf(uid);selections.splice(index,1);selections.push(null);strategies.splice(index,1);strategies.push(defaultStrategies()[0]);}
        else {const index=selections.indexOf(null);if(index>=0)selections[index]=uid;else toast('Two cards chosen. Click one again to return it to your hand.');}targetSlot=null;
        playTone('click');render();return;
      }
      const id=game.available(viewer).find(c=>c.uid===uid)?.id||uid;cardDetail(id);return;
    }
    const btn=e.target.closest('[data-action]');if(!btn||btn.disabled)return;
    switch(btn.dataset.action){
      case 'view-loot':openLoot();break;
      case 'close-loot':lootUI.open=false;lootUI.purchased=null;if(game.s.mode==='hotseat'&&game.s.phase==='shop')ready=false;render();($('.loot-alert')||$('.loot-inventory'))?.focus({preventScroll:true});break;
      case 'toggle-audio':battleAudio.setEnabled(!battleAudio.enabled);syncAudioButton();audioSettings();break;
      case 'start':if(mode==='online')await startOnline();else{game?.close?.();start();}break;
      case 'starters':chosen[editPlayer]=data.cards.filter(c=>c.hero===hero(heroes[editPlayer]).name&&c.category==='Hero'&&c.starter).map(c=>c.id);render();break;
      case 'resume':{
        try{game=Brawl.restore(data,JSON.parse(localStorage.getItem(SAVE)));screen='game';mode=game.s.mode;heroes=game.s.players.map(p=>p.hero);viewer=0;ready=mode==='solo';selections=[null,null];winnerShown=false;lastLog=game.s.log.length;render();}catch{toast('That saved match could not be loaded. Start a new Brawl.');}break;
      }
      case 'ready':viewer=desiredViewer();ready=true;selections=[null,null];targetSlot=null;if(game.s.phase==='program')strategies=defaultStrategies();render();break;
      case 'lock':{
        await game.commit(viewer,selections.map((uid,k)=>({uid,opts:strategies[k]})));if(game.s.mode!=='online'&&game.s.phase==='resolve'&&!game.s.shown[0])await game.advance();selections=[null,null];targetSlot=null;if(game.s.mode==='hotseat')ready=false;update();playTone('reveal');break;
      }
      case 'swap':[selections[0],selections[1]]=[selections[1],selections[0]];[strategies[0],strategies[1]]=[strategies[1],strategies[0]];render();break;
      case 'advance':await game.advance();update();break;
      case 'next-round':await nextRound();break;
      case 'buy':{const before=[...game.s.players[viewer].loot];await game.shop(viewer,true);const bought=game.s.players[viewer].loot.find(id=>!before.includes(id));if(bought){lootUI={context:lootContext(),open:true,purchased:bought};}else if(game.s.mode==='hotseat')ready=false;update();playTone('loot');break;}
      case 'skip-buy':await game.shop(viewer,false);if(game.s.mode==='hotseat')ready=false;update();break;
      case 'skip-prompt':await game.skipPrompt();update();break;
      case 'toggle-log':showLog=!showLog;render();break;
      case 'rules':rules();break;
      case 'results':results();break;
      case 'view-discard':modal(`<h2>Your discard pile <span class="muted">${game.s.players[viewer].discard.length}</span></h2><p class="rules-copy" style="margin:12px 0 20px">These cards have already been played. They shuffle back into your deck when it runs out.</p><div class="library-grid">${game.s.players[viewer].discard.map(c=>cardHTML(def(c.id))).join('')||'<p class="muted">No cards have been discarded yet.</p>'}</div>`);break;
      case 'rematch':if(game.s.mode==='online'){dialog.close();game.close();screen='setup';history.replaceState(null,'',location.pathname);render();}else{basics=heroes.map(()=>Brawl.defaultBasics(data));
  chosen=heroes.map(id=>data.cards.filter(c=>c.hero===hero(id).name&&c.category==='Hero'&&c.starter).map(c=>c.id));start();}break;
      case 'home':game?.close?.();dialog.close();screen='setup';history.replaceState(null,'',location.pathname);render();break;
      case 'leave-online':clearTimeout(lobbyTimer);game?.close?.();screen='setup';history.replaceState(null,'',location.pathname);render();break;
      case 'copy-invite':try{await navigator.clipboard.writeText(inviteLink());toast('Invite copied. Send it to your friend.');}catch{$('.invite-box input').select();toast('Select and copy the invite link above.');}break;
      case 'new-match':modal('<h2>Start a new Brawl?</h2><p class="rules-copy" style="margin:18px 0">Your current match stays saved until you start another match.</p><button class="primary" data-action="home">Choose Heroes</button>');break;
      case 'export':{
        const blob=new Blob([game.s.log.map(l=>`[Round ${l.round}, Action ${l.reveal}] ${l.message}`).join('\n')],{type:'text/plain'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Fable-Fury-Brawl-battle-log.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;
      }
    }
  }catch(error){console.error(error);toast(error.message||'That action could not be completed.');}
});
document.addEventListener('change',e=>{const el=e.target.closest('[data-option]');if(!el)return;const key=el.dataset.option,expanded=$('.options-row')?.open;strategies[Number(el.dataset.slot)][key]=el.type==='checkbox'?el.checked:key==='steps'?Number(el.value):el.value;render();if(expanded&&$('.options-row'))$('.options-row').open=true;});
document.addEventListener('keydown',async e=>{if(e.key===' '&&screen==='game'&&!dialog.open&&!['INPUT','SELECT','BUTTON','TEXTAREA'].includes(e.target.tagName)&&!game.s.prompt&&game.s.phase==='resolve'){e.preventDefault();try{await game.advance();update();}catch(error){toast(error.message);}}});

try{
  const response=await fetch('data.json');if(!response.ok)throw Error('Could not load the card database.');data=await response.json();
  basics=heroes.map(()=>Brawl.defaultBasics(data));
  chosen=heroes.map(id=>data.cards.filter(c=>c.hero===hero(id).name&&c.category==='Hero'&&c.starter).map(c=>c.id));render();
  canOnline=await onlineSupported();const link=invitation();
  if(canOnline){if(link.room||location.hostname==='brht.ai'||location.hostname==='www.brht.ai'){mode='online';editPlayer=0;}if(link.room&&savedSeat(link.room)){try{await startOnline();}catch(error){history.replaceState(null,'',location.pathname);screen='setup';render();toast(error.message);}}else render();}
}catch(error){app.innerHTML=`<section class="error-page"><h1>The Arena is closed.</h1><p>${esc(error.message)}</p><p class="muted">Run the included local server to load the game.</p><button class="primary" onclick="location.reload()">Try again</button></section>`;}

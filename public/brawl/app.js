import {Brawl} from './engine.js';
import {OnlineGame,onlineSupported,invitation,savedSeat,createOnline,joinOnline,readOnline} from './online.js';

const app=document.querySelector('#app'), dialog=document.querySelector('#dialog'), content=document.querySelector('#dialog-content');
const COLORS={SMA:'#b65c3b',RAV:'#78579c',ALF:'#6a833d',FRA:'#ad8c32',HEL:'#397b8b',SHE:'#ae5477'};
const SHORT={SMA:'Smasherton',RAV:'Raven',ALF:'Alf',FRA:'Franc',HEL:'Helga',SHE:'Shealer'};
const GLYPHS={'Quick Jab':'⚔','Heavy Blow':'⚒','Lunge':'➜','Sweep':'↝','Shove':'⇥','Advance':'➜','Backstep':'↶','Guard':'◇','Throwing Stone':'◆','Counter':'↩','Feint':'⇄','Brace':'⬡','Smoke Bomb':'☁','Fury Flask':'♨','Teleport Scroll':'✧','Grappling Hook':'⚓','Crystal Ball':'◉'};
const SAVE='fable-fury-brawl-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data, game=null, screen='setup', editPlayer=0, mode='solo', heroes=['SMA','RAV'], chosen=[[],[]], selections=[null,null], viewer=0, ready=false, showLog=false, sound=false, audio=null, winnerShown=false, lastLog=0, toastTimer;
const defaultStrategies=()=>[0,1].map(()=>({direction:'toward',steps:3,aim:'damage',trait:true,remedy:'block',coin:true}));
let strategies=defaultStrategies();
let targetSlot=null, previousBattle=null;
let canOnline=false,onlineLobby=null,lobbyTimer=null,onlineRound=0,networkConnected=true,onlineBusy=false;
const symbol=(name)=>{const paths={speed:'M13 2 4 14h7l-1 8 10-13h-7z',damage:'m5 3 13 13m-3-13L4 14m-1 4 5-5m8 3 5 5',range:'M3 12h18M6 8l-4 4 4 4m12-8 4 4-4 4',shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z',coin:'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M12 7v10m-3-8h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m10-3a3 3 0 1 0 0 6 3 3 0 1 0 0-6',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(paths[name]||paths.spark).split('|').map(d=>`<path d="${d}"/>`).join('')}</svg>`;};
const $=(sel,root=document)=>root.querySelector(sel);
const hero=id=>data.heroes.find(h=>h.id===id);
const def=id=>data.cards.find(c=>c.id===id);
const heroForCard=d=>data.heroes.find(h=>h.name===d.hero);
const portrait=id=>`assets/${hero(id).slug}.webp`;

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
function playTone(kind){
  if(!sound)return;
  try{audio ||= new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);
    const t=audio.currentTime;const f={click:340,damage:90,move:230,fury:620,heal:520,victory:740,card:300,reveal:420,loot:570}[kind]||300;
    o.type=kind==='damage'?'triangle':'sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(kind==='damage'?45:f*1.5,t+.13);
    g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.start(t);o.stop(t+.22);
  }catch{sound=false;}
}
function modal(html){content.innerHTML=html;if(!dialog.open)dialog.showModal();}
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
$('#sound-btn').addEventListener('click',()=>{sound=!sound;$('#sound-btn').textContent=sound?'Sound on':'Sound off';$('#sound-btn').setAttribute('aria-pressed',String(sound));playTone('click');});
$('#fullscreen-btn').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>toast('Fullscreen is unavailable in this browser.'));});
$('.brand').addEventListener('click',e=>{e.preventDefault();if(!game||screen==='setup'){screen='setup';render();return;}modal(`<h2>Leave the Arena?</h2><p class="rules-copy" style="margin:18px 0">Your match is saved on this device. You can resume it from the Hero selection screen.</p><button class="primary" data-action="home">Choose Heroes</button>`);});
$('#rules-btn').addEventListener('click',()=>rules('rules'));

function art(d){
  const h=heroForCard(d);
  if(h)return `<img src="${portrait(h.id)}" alt="" loading="lazy">`;
  if(d.category==='Loot'&&![11,12,13,17,19].includes(Number(d.id.slice(-3))))return `<img src="assets/${d.id}.webp" alt="" loading="lazy">`;
  return `<span class="glyph" aria-hidden="true">${GLYPHS[d.name]||'✦'}</span>`;
}
function cardHTML(d,{uid='',selected=false,loot=false,inspect=true,button=true,fanIndex=null,fanTotal=5,selectionNumber=null}={}){
  const h=heroForCard(d),color=h?COLORS[h.id]:d.category==='Loot'?'#85649b':'#4b8185';
  const offset=fanIndex===null?0:fanIndex-(fanTotal-1)/2;
  return `<${button?'button':'div'} class="game-card ${loot?'loot':''} ${selected?'selected':''} ${d.category==='Special'?'special-card':''}" style="--accent:${color};--fan-angle:${offset*2.3}deg;--fan-y:${Math.pow(offset,2)*3}px;--card-order:${fanIndex??0}" ${button?`data-card="${esc(uid||d.id)}" aria-label="${esc(d.name)}, ${d.category}${d.speed?', Speed '+d.speed:''}"`:''}>
    ${selectionNumber?`<span class="assignment">ACTION ${selectionNumber}</span>`:''}<span class="card-head"><span>${esc(d.name)}</span>${d.speed?`<b title="Speed">${symbol('speed')}${d.speed}</b>`:''}</span>
    <span class="card-art">${art(d)}</span>
    <span class="card-stats"><span>${d.damage?symbol('damage')+d.damage+' damage':d.category==='Loot'?'SECRET LOOT':d.block?symbol('shield')+'Defense':'Movement / skill'}</span><span>${d.range?symbol('range')+'Range '+d.range:d.category==='Loot'?symbol('coin')+'4':''}</span></span>
    <span class="card-text">${esc(d.text)}</span><span class="card-foot">${d.category==='Basic'?'+1 COIN':d.category==='Loot'?'SECRET LOOT':d.category==='Special'?'FURY SPECIAL':d.starter?'STARTER · 0 COINS':'HERO · 0 COINS'}</span>
    ${inspect?`<span class="inspect" data-inspect="${d.id}" title="Read full card">${symbol('eye')}</span>`:''}</${button?'button':'div'}>`;
}
function cardDetail(id){const d=def(id);if(!d)return;modal(`<div class="detail-layout">${cardHTML(d,{button:false,inspect:false})}<div><p class="eyebrow">${esc(d.id)} / ${esc(d.category)}</p><h2>${esc(d.name)}</h2>${d.timing?`<p class="timing"><b>Play timing</b><br>${esc(d.timing)}</p>`:''}<p>${esc(d.text)}</p><p class="muted">${d.category==='Basic'?'Gain 1 Coin after this card resolves, even if its Attack misses.':d.category==='Loot'?'Pay 4 Coins to draw random Loot after Action 2. Hold at most 2; use at most 1 per reveal.':d.category==='Special'?'Earned at 3 Fury. Kept outside the combat deck. Returns beside your mat after use.':'Choose 5 of your Hero’s 8 cards before the match. Hero cards generate 0 Coins.'}</p>${d.hero?`<p class="small muted">${esc(d.hero)}${d.starter?' · Recommended starter':''}</p>`:''}</div></div>`);}

function renderSetup(){
  const h=hero(heroes[editPlayer]),pool=data.cards.filter(c=>c.category==='Hero'&&c.hero===h.name);
  let saved=false;try{saved=Boolean(localStorage.getItem(SAVE));}catch{}
  app.innerHTML=`<section class="setup" style="--accent:${COLORS[h.id]}"><div class="setup-intro"><div><p class="eyebrow" style="margin-bottom:10px">A DUEL OF READS, RANGE & RIDICULOUS LOOT</p><h1>Two cards. One big read.</h1></div><p>Choose your Hero. Secretly program two actions. Outsmart your rival across seven spaces — then unleash your Fury.</p></div>
    <div class="setup-layout"><div><div class="hero-stage"><span class="hero-number">0${data.heroes.indexOf(h)+1}</span><img src="${portrait(h.id)}" alt="${esc(h.name)}"><div class="stage-label"><h2>${esc(h.name)}</h2><p>${esc(h.archetype)}</p></div></div><div class="roster" aria-label="Choose Hero">${data.heroes.map(x=>`<button class="hero-thumb ${x.id===h.id?'selected':''}" data-hero="${x.id}" aria-pressed="${x.id===h.id}"><img src="${portrait(x.id)}" alt=""><span>${SHORT[x.id].toUpperCase()}</span></button>`).join('')}</div></div>
    <div class="setup-side"><div><div class="segment" aria-label="Play mode"><button data-mode="solo" class="${mode==='solo'?'active':''}">Solo vs computer</button><button data-mode="hotseat" class="${mode==='hotseat'?'active':''}">Local two-player</button>${canOnline?`<button data-mode="online" class="${mode==='online'?'active':''}">Online 1v1</button>`:''}</div><div class="setup-players">${(mode==='online'?[heroes[0]]:heroes).map((id,i)=>`<button data-edit-player="${i}" class="${editPlayer===i?'active':''}"><b>${mode==='online'?'YOUR HERO':i===0?'PLAYER 1':mode==='solo'?'COMPUTER':'PLAYER 2'}</b><small>${esc(hero(id).name)}</small></button>`).join('')}</div>${mode==='online'?`<p class="online-setup-note">${invitation().invite?'You have a private invite. Choose your Hero and five cards, then join.':'Create a private room and send its invite link to a friend. Each player chooses their own Hero.'}</p>`:''}</div>
    <section class="panel trait-panel"><p class="eyebrow" style="margin-bottom:6px">HERO TRAIT</p><h3>${esc(h.trait)}</h3><p>${esc(h.traitText)}</p></section>
    <section class="panel"><div class="deck-header"><h3>Choose your five</h3><span class="small ${chosen[editPlayer].length===5?'coins':'muted'}">${chosen[editPlayer].length} / 5</span><button class="quiet small" data-action="starters" style="padding:0">Use starters</button></div><div class="deck-pool">${pool.map(d=>`<button class="pool-card ${chosen[editPlayer].includes(d.id)?'chosen':''}" data-pool="${d.id}" aria-pressed="${chosen[editPlayer].includes(d.id)}"><span class="check">${chosen[editPlayer].includes(d.id)?'✓':''}</span><span>${esc(d.name)}</span><span class="info" data-inspect="${d.id}" title="Read card">i</span></button>`).join('')}</div><p class="setup-rule">Your 5 Hero cards join the universal 20-card Basic deck. Fury Specials stay outside the deck.</p></section></div></div>
    <footer class="setup-footer"><p>2 fighters · 18 starting HP · 15–30 minutes<br>${mode==='online'?'Two computers. Private hands. One shared battlefield.':mode==='hotseat'?'Pass the device behind a privacy screen to keep your choices secret.':'The computer commits its cards without seeing your hand or choices.'}</p><div class="start-actions">${saved&&mode!=='online'?'<button data-action="resume">Resume match</button>':''}<button class="primary" data-action="start" ${(mode==='online'?chosen[0].length!==5:chosen.some(a=>a.length!==5))||onlineBusy?'disabled':''}>${onlineBusy?'Connecting…':mode==='online'?invitation().invite?'Join your friend’s Brawl →':'Create private room →':'Enter the Arena →'}</button></div></footer></section>`;
}
function inviteLink(){const u=new URL(document.baseURI);u.hash=new URLSearchParams({room:onlineLobby.room.id,invite:onlineLobby.invite||''}).toString();return u.href;}
function renderLobby(){app.innerHTML=`<section class="privacy online-lobby"><span class="seal">✦</span><p class="eyebrow">ONLINE 1v1 · PRIVATE ROOM</p><h1>Your battlefield is ready.</h1><p>Send this invite link to your friend. They can join from another computer and choose their own Hero. The match starts when they join.</p><div class="invite-box"><input readonly aria-label="Private invite link" value="${esc(inviteLink())}"><button class="primary" data-action="copy-invite">Copy invite link</button></div><p class="online-lobby-status"><span class="spinner"></span> ${networkConnected?'Waiting for your rival…':'Reconnecting to your room…'}</p><p class="small muted">Keep this tab open, or reopen the room in this browser to reconnect. Rooms last 24 hours.</p><button class="quiet" data-action="leave-online">Back to Hero selection</button></section>`;}
function onlineConnection(value){if(networkConnected===value)return;networkConnected=value;if(screen==='lobby')renderLobby();else{const indicator=$('.online-connection');if(indicator)indicator.textContent=value?'Room connected':'Reconnecting…';}}
function enterOnline(snapshot,token){
  clearTimeout(lobbyTimer);game?.close?.();viewer=snapshot.room.seat;onlineRound=snapshot.game.round;selections=[null,null];targetSlot=null;previousBattle=null;winnerShown=false;lastLog=snapshot.game.log.length;screen='game';mode='online';
  game=OnlineGame.connect(data,snapshot,token,{onUpdate:g=>{if(g.s.round!==onlineRound||g.s.committed[g.seat]){selections=[null,null];targetSlot=null;}onlineRound=g.s.round;viewer=g.seat;render();},onConnection:onlineConnection,onError:error=>toast(error.message)});render();
}
async function pollLobby(){if(screen!=='lobby'||!onlineLobby)return;try{const snapshot=await readOnline(onlineLobby.room.id,onlineLobby.token);networkConnected=true;if(snapshot.game){enterOnline(snapshot,onlineLobby.token);return;}onlineLobby={...onlineLobby,...snapshot};}catch(error){networkConnected=false;if([401,404,410].includes(error.status)){toast(error.message);screen='setup';render();return;}}renderLobby();lobbyTimer=setTimeout(pollLobby,1500);}
async function startOnline(){
  if(onlineBusy)return;onlineBusy=true;render();
  try{const link=invitation();let snapshot,token;
    const existing=link.room&&savedSeat(link.room);
    if(existing){snapshot=await readOnline(link.room,existing.token);token=existing.token;onlineLobby={...snapshot,token,invite:existing.invite};}
    else if(link.room&&link.invite){snapshot=await joinOnline(link.room,link.invite,{hero:heroes[0],chosen:chosen[0]});token=snapshot.token;}
    else{snapshot=await createOnline({hero:heroes[0],chosen:chosen[0]});token=snapshot.token;onlineLobby={...snapshot,token};}
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
  const s=game.s,p=s.players[i],h=hero(p.hero),block=p.block+p.roundBlock;
  return `<section class="hero-hud ${i?'right':''}" style="--accent:${COLORS[p.hero]}"><div class="hud-portrait"><img src="${portrait(p.hero)}" alt=""><span class="portrait-frame"></span></div><div class="hud-body"><div class="hud-title"><span class="player-tag">${s.mode==='online'?i===viewer?'YOUR HERO':'ONLINE RIVAL':i?s.mode==='solo'?'OPPONENT · CPU':'PLAYER 2':s.mode==='hotseat'?'PLAYER 1':'YOUR HERO'}</span><h2>${esc(h.name)}</h2></div><div class="hp-line"><span class="health" role="meter" aria-label="${esc(h.name)} Health" aria-valuemin="0" aria-valuemax="${Math.max(18,p.hp)}" aria-valuenow="${p.hp}"><span style="width:${Math.min(100,p.hp/18*100)}%"></span></span><span class="hp-count">${p.hp}<small> HP</small></span></div><div class="resources"><span class="coins" title="Coins: Basics earn 1. Loot costs 4. Hold up to 8.">${symbol('coin')}<b>${p.coins}</b><span>Coins</span></span><span class="fury ${p.specialReady?'ready':''}" title="At 3 Fury, your Special is ready.">${symbol('spark')}<span class="fury-pips">${[0,1,2].map(n=>`<i class="${p.specialReady||p.fury>n?'lit':''}"></i>`).join('')}</span><span>${p.specialReady?'Special ready':'Fury'}</span></span>${h.id==='FRA'?'':`<span class="trait-resource" title="${esc(h.traitText)}">${esc(h.trait)} <b>${p.trait}</b></span>`}${block?`<span class="block-resource">${symbol('shield')}<b>${block}</b></span>`:''}</div></div></section>`;
}
function planHTML(i){
  const s=game.s,own=i===viewer;
  const plan=s.plans[i];
  return `<div class="program-pair" aria-label="${esc(s.players[i].name)} programmed cards">${[0,1].map(k=>{
    const visible=s.shown[k] || own&&s.phase==='program';
    const card=plan?.[k]?.card || (own&&s.phase==='program'&&selections[k]?game.available(i).find(c=>c.uid===selections[k]):null);
    const d=card&&def(card.id),shown=visible&&d;
    const canChoose=own&&s.phase==='program'&&!s.committed[i],isNext=canChoose&&(targetSlot===k||targetSlot===null&&selections.indexOf(null)===k);
    return `<div class="program-card ${shown?'filled':''} ${isNext?'next-slot':''} ${s.shown[k]?'revealed':''} ${plan?.[k]?.done?'done':''}" ${d?`style="--accent:${COLORS[heroForCard(d)?.id]||'#4b8185'}"`:''}><span class="slot-label">${canChoose?`<button class="slot-select" data-target-slot="${k}" aria-label="Choose card for Action ${k+1}"><b>0${k+1}</b> ${k?'SECOND ACTION':'FIRST ACTION'}</button>`:`<b>0${k+1}</b> ${k?'SECOND ACTION':'FIRST ACTION'}`}</span>${shown?`<span class="program-art">${art(d)}</span><span class="program-copy"><span class="display">${esc(d.name)}</span><span class="card-type">${d.category}${d.damage?' · '+d.damage+' damage':''}${d.range?' · Range '+d.range:''}</span></span><span class="speed">${symbol('speed')}${s.shown[k]?plan?.[k]?.speed??d.speed:d.speed}</span>${canChoose?`<button class="clear-slot" data-clear="${k}" aria-label="Remove Action ${k+1}">×</button>`:''}`:card||s.committed[i]?'<span class="hidden-mark">✦</span><span class="card-type">Locked in · hidden</span>':`<span class="empty-slot-note">${own?'<span class="empty-plus">+</span> '+(isNext?'Choose a card below':'Then choose another card'):'Waiting for opponent'}</span>`}</div>`;
  }).join('')}</div>`;
}
function phaseControl(){
  const s=game.s,allShop=s.shopDone.every(Boolean);
  if(s.mode==='online'&&(s.phase==='program'&&s.committed[viewer]||s.phase==='shop'&&!allShop&&s.shopDone[viewer]||s.prompt?.kind==='waiting'))return `<div class="phase-control"><span class="control-step">ONLINE MATCH</span><h3>Waiting for your rival.</h3><p>${s.phase==='program'?'Your two actions are locked and private. The reveal opens when both players are ready.':s.phase==='shop'?'Your purchase phase is complete. Your rival is finishing theirs.':'Your rival is making a private choice. The battlefield updates automatically.'}</p><span class="online-connection">${networkConnected?'Room connected':'Reconnecting…'}</span></div>`;
  if(s.phase==='program'){const n=selections.filter(Boolean).length;return `<div class="phase-control"><span class="control-step">${n}/2 ACTIONS CHOSEN</span><h3 aria-live="polite">${n===0?'Choose your first card.':n===1?'Now choose your second.':'Your plan is ready.'}</h3><p>${n===2?'Both cards stay hidden until the reveal.':'Pick from your hand below. Your first card plays first.'}</p><div class="control-buttons"><button class="swap" data-action="swap" ${n<2?'disabled':''} aria-label="Swap programmed cards">⇄ Swap</button><button class="primary" data-action="lock" ${n<2?'disabled':''}>${n===2?'Lock in 2 actions':'Choose '+(2-n)+' card'+(n?'':'s')} <span>→</span></button></div></div>`;}
  if(s.phase==='shop') {
    if(allShop)return `<div class="phase-control"><h3>Round complete.</h3><p>Draw back to 5 cards, clear round effects, and pass Edge.</p><button class="primary" data-action="next-round">Next round →</button></div>`;
    const p=s.players[viewer],can=p.coins>=4&&p.loot.length<2;
    return `<div class="phase-control"><h3>A little retail therapy.</h3><p>Random secret Loot costs 4 Coins. You hold ${p.loot.length}/2.</p><div style="display:flex;gap:8px"><button class="primary" data-action="buy" ${!can?'disabled':''}>Buy Loot · 4 ●</button><button data-action="skip-buy">Skip</button></div></div>`;
  }
  if(s.phase==='over')return `<div class="phase-control"><h3>${s.winner==='draw'?'Double knockout!':esc(s.players[s.winner].name)+' wins!'}</h3><button class="primary" data-action="results">View results</button></div>`;
  const label={'Reveal Action 1':'Reveal first actions','Resolve Action 1':'Resolve faster card','Resolve the slower card':'Resolve remaining card','Between reveals':'Reveal second actions','Resolve Action 2':'Resolve faster card','Finish the round':'Finish round'}[s.beat]||s.beat;
  return `<div class="phase-control"><span class="control-step">${s.prompt?'YOUR REACTION WINDOW':'ACTION '+(s.reveal+1)+' / 2'}</span><h3 aria-live="polite">${esc(s.prompt?'A trick up your sleeve?':s.beat.startsWith('Reveal')?'Time to show your cards.':s.beat==='Between reveals'?'One action down. One to go.':'Watch the order of play.')}</h3><p>${s.prompt?'Use an eligible Loot card, or continue.':'Higher Speed acts first. Edge wins ties.'}</p><button class="primary" data-action="advance" ${s.prompt?'disabled':''}>${esc(label)} <span>→</span></button></div>`;
}
const WINDOW_LABELS={scout:'Before Action 1 is revealed',between:'Between the two reveals',revealed:'After cards are revealed',beforeCard:'Before your card resolves',beforeRange:'Before your Attack checks Range',beforeDamage:'Before your Range 1 Attack deals damage',reaction:'When you would take Attack damage',force:'When you would be pushed or pulled',afterBasic:'After your Basic card resolves'};
function reactionHTML(){
  const q=game.s.prompt;if(!q)return '';
  if(q.kind==='waiting')return '<section class="reaction waiting-reaction"><h3>Your rival is choosing.</h3><p>Their private hand and choices stay hidden. Your game will update automatically.</p></section>';
  const p=game.s.players[q.player];
  if(q.kind==='loot')return `<section class="reaction"><div><h3>${esc(p.name)}: Loot window</h3><p>${esc(WINDOW_LABELS[q.window])}. You may use one eligible Loot card. Using Loot is optional.</p></div><div class="reaction-choices">${q.choices.map(id=>`<button data-use-loot="${id}">${esc(def(id).name)} <span data-inspect="${id}" title="Read card">ⓘ</span></button>`).join('')}<button data-action="skip-prompt">Continue without Loot →</button></div></section>`;
  if(q.kind==='space')return `<section class="reaction"><div><h3>Choose your destination.</h3><p>Teleport to any unoccupied Arena space. Select a highlighted space above.</p></div><button data-action="skip-prompt">Choose a free space for me</button></section>`;
  if(q.kind==='peek'||q.kind==='replace') {
    const p=game.s.players[q.player];
    const peek=p.peek.map(k=>game.s.plans[1-q.player][k]);
    return `<section class="reaction"><div><h3>${q.kind==='replace'?'Crystal Ball: rewrite Action 2.':'A peek behind the curtain.'}</h3><p>Only ${esc(p.name)} should see this. ${q.kind==='replace'?'Choose a replacement from your hand below, or keep your current Action 2.':'Your opponent’s programmed card'+(peek.length>1?'s':'')+':'}</p></div><div class="peek-cards">${peek.map(a=>cardHTML(def(a.card.id),{button:false})).join('')}</div><button data-action="skip-prompt">${q.kind==='replace'?'Keep my Action 2':'Done — continue'} →</button></section>`;
  }
  if(q.kind==='discard')return `<section class="reaction"><div><h3>Diagnosis: discard one card.</h3><p>You drew one card. Choose a card from your hand below to discard.</p></div></section>`;
  if(q.kind==='retrieve')return `<section class="reaction"><div><h3>Gum & String: retrieve Loot.</h3><p>Choose one card from the Loot discard pile.</p></div><div class="reaction-choices">${q.choices.map(id=>`<button data-choice="${id}">${esc(def(id).name)}</button>`).join('')}</div></section>`;
  return '';
}
function optionsHTML(){
  const p=game.s.players[viewer];
  return `<details class="options-row"><summary>Movement & trait choices <span class="muted">· default: move toward, spend traits when useful</span></summary><div class="option-grid">${strategies.map((o,k)=>`<div class="option-group"><b>Action ${k+1}</b><label>Free movement <select data-option="direction" data-slot="${k}">${['toward','away','left','right'].map(v=>`<option value="${v}" ${o.direction===v?'selected':''}>${v}</option>`).join('')}</select></label><label>Move up to <select data-option="steps" data-slot="${k}">${[0,1,2,3].map(v=>`<option ${o.steps===v?'selected':''} value="${v}">${v===3?'card maximum':v}</option>`).join('')}</select></label><label><input type="checkbox" data-option="trait" data-slot="${k}" ${o.trait?'checked':''}> Spend trait</label>${p.hero==='ALF'?`<label>Aim <select data-option="aim" data-slot="${k}"><option value="damage" ${o.aim==='damage'?'selected':''}>+1 damage at Range 3+</option><option value="range" ${o.aim==='range'?'selected':''}>+1 max Range</option></select></label>`:''}${p.hero==='SHE'?`<label>Remedy <select data-option="remedy" data-slot="${k}">${['move','block','heal'].map(v=>`<option ${o.remedy===v?'selected':''}>${v}</option>`).join('')}</select></label>`:''}${p.hero==='FRA'?`<label><input type="checkbox" data-option="coin" data-slot="${k}" ${o.coin?'checked':''}> Spend Coin on Bribe / Coin Toss</label>`:''}</div>`).join('')}</div><p class="small muted" style="margin-top:10px">Printed “toward” / “away” directions are enforced. Free movement follows this choice. Dodge and Resolve are spent automatically when enabled. The step limit applies only to printed ‘up to’ moves; mandatory Move 1 still resolves.</p></details>`;
}
function renderTable(){
  const s=game.s;
  if(s.mode==='hotseat'&&s.phase!=='over'){
    const desired=desiredViewer(),privatePhase=s.phase==='program'||s.phase==='shop'&&!s.shopDone.every(Boolean)||Boolean(s.prompt);
    if(privatePhase&&(!ready||viewer!==desired)){ready=false;return renderPrivacy();}
  }
  const p=s.players[viewer],publicPhase=s.mode==='hotseat'&&(s.phase==='resolve'&&!s.prompt||s.phase==='shop'&&s.shopDone.every(Boolean)||s.phase==='over');
  const hand=game.available(viewer),last=[...s.log].reverse().find(l=>!['coin','info'].includes(l.kind))||s.log.at(-1);
  const step=s.phase==='program'?0:s.phase==='shop'||s.phase==='over'?3:s.shown[1]?2:1;
  const privateChoice=s.prompt&&['replace','discard'].includes(s.prompt.kind);
  app.innerHTML=`<section class="table battlefield" style="--hero-accent:${COLORS[p.hero]}"><div class="battle-backdrop" aria-hidden="true"></div><div class="battle-vignette" aria-hidden="true"></div>
    <div class="hud">${hud(0)}<div class="round-title"><span class="eyebrow">BRIARWOOD RUINS</span><span class="display">ROUND ${s.round}</span><span class="edge">✦ ${SHORT[s.players[s.edge].hero]} holds Edge</span><ol class="phase-track" aria-label="Round progress">${['Plan','Reveal 1','Reveal 2','Loot'].map((label,k)=>`<li class="${step===k?'current':step>k?'complete':''}" ${step===k?'aria-current="step"':''}><span>${step>k?'✓':k+1}</span><small>${label}</small></li>`).join('')}</ol></div>${hud(1)}</div>
    <div class="arena" aria-label="Seven-space Arena"><div class="ambient" aria-hidden="true">${Array.from({length:12},(_,k)=>`<i style="--mote-x:${8+(k*23)%85}%;--mote-y:${10+(k*17)%70}%;--mote-delay:${k*.7}s"></i>`).join('')}</div>
      <div class="arena-location"><span>THE OLD DUELING GROUND</span><small>Win by reducing your rival to 0 HP</small></div>
      <div class="rival-plan"><span class="plan-caption">${s.mode==='hotseat'?'RIVAL':'OPPONENT'}’S PLAN ${s.committed[1-viewer]?'<b>LOCKED IN</b>':''}</span>${planHTML(1-viewer)}</div>
      <div class="range-badge"><small>CURRENT DISTANCE</small><span>${symbol('range')}<b>${game.range()}</b><em>spaces</em></span></div>
      ${last?`<div class="battle-callout ${last.kind}" aria-live="polite"><span class="callout-icon">${symbol(['damage','slam'].includes(last.kind)?'damage':last.kind==='block'?'shield':last.kind==='move'?'range':'spark')}</span>${esc(last.message)}</div>`:''}
      <div class="fighters">${s.players.map((p,i)=>`<div class="fighter p${i+1} ${p.hp<=0?'ko':''}" style="left:${(p.pos-1)*100/7}%;--facing:${p.pos<s.players[1-i].pos?1:-1}" aria-label="${esc(p.name)} on space ${p.pos}"><span class="fighter-aura" aria-hidden="true"></span><span class="fighter-shadow" aria-hidden="true"></span><img class="fighter-art" src="${portrait(p.hero)}" alt="${esc(p.name)}"><span class="fighter-marker">${i?'II':'I'}</span></div>`).join('')}</div>
      <div class="arena-lane">${[1,2,3,4,5,6,7].map(n=>`<button class="space ${s.players.some(p=>p.pos===n)?'occupied':''} ${s.prompt?.kind==='space'&&s.prompt.choices.includes(n)?'target':''}" data-space="${n}" ${s.prompt?.kind!=='space'||!s.prompt.choices.includes(n)?'disabled':''} aria-label="Arena space ${n}"><span>${n}</span>${[1,7].includes(n)?'<small>WALL</small>':''}</button>`).join('')}</div><div class="arena-front" aria-hidden="true"></div></div>
    <div class="actions-strip"><div class="your-plan"><div class="plan-caption"><span>YOUR PLAN</span><small>First action → second action</small></div>${planHTML(viewer)}</div>${phaseControl()}</div>${reactionHTML()}
    <section class="hand-zone"><div class="zone-header"><span class="hand-rule"></span><div><h3>${s.mode==='hotseat'?esc(SHORT[p.hero])+'’s':'Your'} hand <span>${hand.length}</span></h3><p>${privateChoice?'Choose a card below to '+(s.prompt.kind==='replace'?'replace Action 2.':'discard.') :s.phase==='program'?'Choose two cards. Read your rival. Make your move.':'Your remaining cards are safe until the next round.'}</p></div><span class="hand-rule"></span></div>
    ${publicPhase?'<div class="public-note">'+symbol('eye')+' Both players can watch. Private hands and Loot are concealed.</div>':`<div class="hand-and-loot"><aside class="loot-area"><h3>${symbol('spark')} Secret Loot <span>${p.loot.length}/2</span></h3><div class="loot-hand">${p.loot.map(id=>cardHTML(def(id),{uid:id,loot:true})).join('')||'<div class="loot-empty"><span class="empty-loot-seal">✦</span><b>A trick up your sleeve.</b><span>Buy secret Loot for <strong>4 Coins</strong><br>after both actions resolve.</span></div>'}</div></aside><div class="hand-center"><div class="hand" aria-label="Choose cards from your hand">${hand.map((c,k)=>cardHTML(def(c.id),{uid:c.uid,selected:selections.includes(c.uid),fanIndex:k,fanTotal:hand.length,selectionNumber:selections.includes(c.uid)?selections.indexOf(c.uid)+1:null})).join('')||'<p class="muted small">Your programmed cards are on the table.</p>'}</div>${s.phase==='program'?optionsHTML():''}</div><aside class="pile-area"><div class="draw-pile" aria-label="Combat deck: ${p.deck.length} cards"><div class="pile-back"><span>FABLE FURY</span><b>✦</b><strong>BRAWL</strong></div><span class="pile-count">${p.deck.length}</span></div><span class="pile-label">DRAW PILE</span><button class="discard-pile" data-action="view-discard">${p.discard.length}<span>Discard pile</span></button></aside></div>`}</section>
    <footer class="table-footer"><button data-action="toggle-log">${showLog?'Hide':'Show'} battle log</button><button data-action="rules">Rules & card library</button><span class="save-indicator"><i></i> Match saved</span><span class="table-tip">${symbol('speed')} Higher Speed acts first · Edge wins ties</span><button class="right-link" data-action="new-match">New match</button></footer>${showLog?`<section class="battle-log" aria-label="Battle log">${s.log.slice(-45).map(l=>`<p class="${l.kind}"><span class="log-round">R${l.round}</span>${esc(l.message)}</p>`).join('')}</section>`:''}</section>`;
  battleFeedback(previousBattle);
  previousBattle=s.players.map(p=>({pos:p.pos,hp:p.hp}));
  if(s.log.length>lastLog){const entries=s.log.slice(lastLog);const effect=entries.findLast(e=>['damage','fury','heal','card','move'].includes(e.kind));if(effect)playTone(effect.kind);lastLog=s.log.length;}
  if(showLog){const log=$('.battle-log');if(log)log.scrollTop=log.scrollHeight;}
  if(s.phase==='over'&&!winnerShown){winnerShown=true;results();}
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
function render(){if(!data)return;if(screen==='setup')renderSetup();else if(screen==='lobby')renderLobby();else renderTable();}
function persist(){if(game.s.mode==='online')return;try{localStorage.setItem(SAVE,JSON.stringify(game.s));}catch{toast('Browser storage is unavailable; keep this tab open to retain your match.');}}
function update(){if(game.s.mode==='online'&&game.s.round!==onlineRound){onlineRound=game.s.round;selections=[null,null];targetSlot=null;}persist();render();}
function start(){
  game=new Brawl(data,{mode,heroes,chosen});screen='game';viewer=0;ready=mode==='solo';selections=[null,null];winnerShown=false;lastLog=0;previousBattle=null;targetSlot=null;dialog.close();update();playTone('reveal');
}
async function nextRound(){await game.nextRound();selections=[null,null];targetSlot=null;ready=game.s.mode==='solo';viewer=game.s.mode==='online'?game.seat:0;update();}
function results(){
  const s=game.s,w=s.winner==='draw'?null:s.players[s.winner];
  modal(`<section class="winner"><p class="eyebrow">THE ARENA HAS SPOKEN</p>${w?`<img src="${portrait(w.hero)}" alt="${esc(w.name)}">`:''}<h1>${w?esc(w.name)+' wins!':'Double knockout!'}</h1><p>${w?'A fine display of questionable tactics.':'Two Heroes. Zero survivors. Incredible.'}</p><div class="stats"><div class="stat"><b>${s.round}</b><span>ROUNDS FOUGHT</span></div><div class="stat"><b>${w?.hp??0}</b><span>WINNER HP</span></div><div class="stat"><b>${s.players.reduce((n,p)=>n+p.lootBought,0)}</b><span>LOOT PURCHASED</span></div></div><div class="winner-actions"><button class="primary" data-action="rematch">Rematch</button><button data-action="home">Choose Heroes</button><button data-action="export">Save battle log</button></div></section>`);playTone('victory');
}
function rules(tab='rules',query=''){
  const tabs=`<h2>Field guide to a good Brawl.</h2><div class="rules-tabs"><button data-rules-tab="rules" class="${tab==='rules'?'active':''}">How to play</button><button data-rules-tab="heroes" class="${tab==='heroes'?'active':''}">Heroes</button><button data-rules-tab="cards" class="${tab==='cards'?'active':''}">All 90 cards</button></div>`;
  let body='';
  if(tab==='rules')body=`<div class="rules-copy"><div class="help-grid"><section><h3>Program. Reveal. Outplay.</h3><ol><li><b>Program two cards</b> from your hand. Action 1 resolves before Action 2. Each player reveals the corresponding action together.</li><li><b>Higher Speed acts first.</b> Ties go to the Hero holding Edge. Range is checked when an Attack resolves, so faster movement can make a slower attack miss.</li><li><b>Buy secret Loot.</b> After Action 2, pay 4 Coins to draw random Loot. Hold at most 2; buy at most 1 per round.</li><li><b>Clean up.</b> Discard programmed cards, draw back to 5, clear round effects and pass Edge. Reduce your opponent to 0 HP to win.</li></ol></section><section><h3>Know your resources.</h3><p><b>Coins:</b> every Basic card earns 1 Coin after resolving, even on a miss. Hero cards and Specials give no Coins. Maximum 8.</p><p><b>Fury:</b> lose HP to an opponent-controlled card or Loot effect and gain 1 Fury, at most 1 per effect. At 3, take your Special and clear Fury. No Fury while holding a Special.</p><p><b>Block:</b> reduces Attack damage to a minimum of 0. It lasts for the reveal unless a card says “until end of round.”</p><p><b>Movement:</b> comes only from cards. Heroes can cross each other but can’t end on the same space. Forced past a wall? Lose 1 HP, at most 1 per effect.</p></section></div><h3>Using the controls</h3><p>Click a hand card to put it into the next empty action slot. Click again to remove it, or use Swap. Open “Movement & trait choices” before locking in to set free movement direction, step limit, and trait use. Printed movement directions are always enforced. After revealing, advance one beat at a time. The game stops at legal Loot and information windows so you can choose.</p><h3>Local two-player privacy</h3><p>Both players use this device. Pass it at the privacy screen. During the public reveal, private hands are concealed; pass the device again for private reaction windows and Loot purchases.</p><h3>v0.2 rules interpretations</h3><p>“On hit” effects require at least 1 HP loss. Block stacks for its printed duration and is not consumed by a hit. The source specifies 18 starting HP but no Healing cap, so Healing can exceed 18. Between-reveal Loot is offered after Action 1 and counts toward the one-Loot limit for Action 2. Pinwheel reverses up to two spaces of the forced movement. These choices are documented for playtest feedback.</p><p class="muted">Solo, local play and online 1v1 are included. Online play uses a private invite link; reopen the room in the same browser to reconnect. Rooms last 24 hours. Game rules follow the supplied Fable Fury: Brawl v0.2 database.</p></div>`;
  if(tab==='heroes')body=`<div class="rules-copy">${data.heroes.map(h=>`<section class="panel" style="margin-bottom:12px;border-left:3px solid ${COLORS[h.id]}"><h3 style="margin-top:0">${esc(h.name)} · ${esc(h.trait)}</h3><p>${esc(h.traitText)}</p><p class="small muted">Fury Special: ${esc(h.special)}</p></section>`).join('')}</div>`;
  if(tab==='cards')body=`<input class="library-search" aria-label="Search card library" placeholder="Search name, Hero, effect, or card ID…" value="${esc(query)}"><div class="library-grid">${data.cards.filter(c=>JSON.stringify([c.name,c.hero,c.category,c.id,c.text]).toLowerCase().includes(query.toLowerCase())).map(d=>cardHTML(d)).join('')}</div>`;
  modal(tabs+body);
  if(tab==='cards')$('.library-search',content).addEventListener('input',e=>{const val=e.target.value;$('.library-grid',content).innerHTML=data.cards.filter(c=>JSON.stringify([c.name,c.hero,c.category,c.id,c.text]).toLowerCase().includes(val.toLowerCase())).map(d=>cardHTML(d)).join('');});
}

document.addEventListener('click',async e=>{
  try{
    const inspect=e.target.closest('[data-inspect]');if(inspect){e.stopPropagation();cardDetail(inspect.dataset.inspect);return;}
    const modeBtn=e.target.closest('[data-mode]');if(modeBtn){mode=modeBtn.dataset.mode;if(mode==='online')editPlayer=0;render();return;}
    const ep=e.target.closest('[data-edit-player]');if(ep){editPlayer=Number(ep.dataset.editPlayer);render();return;}
    const hb=e.target.closest('[data-hero]');if(hb){heroes[editPlayer]=hb.dataset.hero;chosen[editPlayer]=data.cards.filter(c=>c.hero===hero(hb.dataset.hero).name&&c.category==='Hero'&&c.starter).map(c=>c.id);render();playTone('click');return;}
    const pool=e.target.closest('[data-pool]');if(pool){const a=chosen[editPlayer],id=pool.dataset.pool;if(a.includes(id))a.splice(a.indexOf(id),1);else if(a.length<5)a.push(id);else toast('Remove one selected Hero card before choosing another.');render();return;}
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
      if(q&&['discard','replace'].includes(q.kind)&&q.choices.includes(uid)){await game.choose(uid);update();return;}
      if(game.s.phase==='program'&&!game.s.committed[viewer]&&game.available(viewer).some(c=>c.uid===uid)){
        if(selections.includes(uid)){targetSlot=selections.indexOf(uid);selections[targetSlot]=null;}
        else {const index=targetSlot??selections.indexOf(null);if(index>=0){selections[index]=uid;targetSlot=selections.indexOf(null);if(targetSlot<0)targetSlot=null;}else toast('Both actions are filled. Remove a card or swap their order.');}
        playTone('click');render();return;
      }
      const id=game.available(viewer).find(c=>c.uid===uid)?.id||uid;cardDetail(id);return;
    }
    const btn=e.target.closest('[data-action]');if(!btn||btn.disabled)return;
    switch(btn.dataset.action){
      case 'start':if(mode==='online')await startOnline();else{game?.close?.();start();}break;
      case 'starters':chosen[editPlayer]=data.cards.filter(c=>c.hero===hero(heroes[editPlayer]).name&&c.category==='Hero'&&c.starter).map(c=>c.id);render();break;
      case 'resume':{
        try{game=Brawl.restore(data,JSON.parse(localStorage.getItem(SAVE)));screen='game';mode=game.s.mode;heroes=game.s.players.map(p=>p.hero);viewer=0;ready=mode==='solo';selections=[null,null];winnerShown=false;lastLog=game.s.log.length;render();}catch{toast('That saved match could not be loaded. Start a new Brawl.');}break;
      }
      case 'ready':viewer=desiredViewer();ready=true;selections=[null,null];targetSlot=null;if(game.s.phase==='program')strategies=defaultStrategies();render();break;
      case 'lock':{
        await game.commit(viewer,selections.map((uid,k)=>({uid,opts:strategies[k]})));selections=[null,null];targetSlot=null;if(game.s.mode==='hotseat')ready=false;update();playTone('reveal');break;
      }
      case 'swap':[selections[0],selections[1]]=[selections[1],selections[0]];[strategies[0],strategies[1]]=[strategies[1],strategies[0]];render();break;
      case 'advance':await game.advance();update();break;
      case 'next-round':await nextRound();break;
      case 'buy':await game.shop(viewer,true);if(game.s.mode==='hotseat')ready=false;update();playTone('loot');break;
      case 'skip-buy':await game.shop(viewer,false);if(game.s.mode==='hotseat')ready=false;update();break;
      case 'skip-prompt':await game.skipPrompt();update();break;
      case 'toggle-log':showLog=!showLog;render();break;
      case 'rules':rules();break;
      case 'results':results();break;
      case 'view-discard':modal(`<h2>Your discard pile <span class="muted">${game.s.players[viewer].discard.length}</span></h2><p class="rules-copy" style="margin:12px 0 20px">These cards have already been played. They shuffle back into your deck when it runs out.</p><div class="library-grid">${game.s.players[viewer].discard.map(c=>cardHTML(def(c.id))).join('')||'<p class="muted">No cards have been discarded yet.</p>'}</div>`);break;
      case 'rematch':if(game.s.mode==='online'){dialog.close();game.close();screen='setup';history.replaceState(null,'',location.pathname);render();}else{chosen=heroes.map(id=>data.cards.filter(c=>c.hero===hero(id).name&&c.category==='Hero'&&c.starter).map(c=>c.id));start();}break;
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
document.addEventListener('change',e=>{const el=e.target.closest('[data-option]');if(!el)return;const key=el.dataset.option;strategies[Number(el.dataset.slot)][key]=el.type==='checkbox'?el.checked:key==='steps'?Number(el.value):el.value;});
document.addEventListener('keydown',async e=>{if(e.key===' '&&screen==='game'&&!dialog.open&&!['INPUT','SELECT','BUTTON','TEXTAREA'].includes(e.target.tagName)&&!game.s.prompt&&game.s.phase==='resolve'){e.preventDefault();try{await game.advance();update();}catch(error){toast(error.message);}}});

try{
  const response=await fetch('data.json');if(!response.ok)throw Error('Could not load the card database.');data=await response.json();
  chosen=heroes.map(id=>data.cards.filter(c=>c.hero===hero(id).name&&c.category==='Hero'&&c.starter).map(c=>c.id));render();
  canOnline=await onlineSupported();const link=invitation();
  if(canOnline){if(link.room||location.hostname==='brht.ai'||location.hostname==='www.brht.ai'){mode='online';editPlayer=0;}if(link.room&&savedSeat(link.room)){try{await startOnline();}catch(error){history.replaceState(null,'',location.pathname);screen='setup';render();toast(error.message);}}else render();}
}catch(error){app.innerHTML=`<section class="error-page"><h1>The Arena is closed.</h1><p>${esc(error.message)}</p><p class="muted">Run the included local server to load the game.</p><button class="primary" onclick="location.reload()">Try again</button></section>`;}

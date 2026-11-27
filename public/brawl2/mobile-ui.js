// Phone presentation only. All committed actions still use the existing game API.
import {forecast, unavailableReason, combatStep} from './combat-view.js';
import {HERO_POWER_VIEW} from './hero-power-view.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function phonePresentation({coarse,shortSide,force=false}) {
  return force || (coarse && shortSide<=600);
}
export const MOBILE=typeof window!=='undefined' && phonePresentation({
  coarse:window.matchMedia('(any-pointer: coarse)').matches,
  shortSide:Math.min(window.screen.width,window.screen.height),
  force:new URLSearchParams(window.location.search).get('mobile')==='1'
});
if(MOBILE){
  document.documentElement.classList.add('brawl-mobile');
  document.querySelector('meta[name="viewport"]')?.setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover');
  for(const [rel,href] of [['manifest','manifest.webmanifest'],['apple-touch-icon','assets/mobile-icon-180.png']]){
    const link=document.createElement('link');link.rel=rel;link.href=href;document.head.append(link);
  }
  const meta=document.createElement('meta');meta.name='apple-mobile-web-app-title';meta.content='Fable Fury Brawl';document.head.append(meta);
}

// Includes only state already available to this viewer. Changes invalidate pending UI choices.
export function mobileStateKey(game,viewer){
  if(!game)return '';
  const s=game.s;
  return JSON.stringify([game.room?.id,game.room?.revision,viewer,s.phase,s.round,s.reveal,s.attackIndex,s.active,s.turn,s.passes,s.shopTurn,s.prompt,s.committed,s.mods,s.mains,s.log.length,s.players.map(p=>[p.hero,p.pos,p.hp,p.block,p.tokens,p.hand.map(c=>c.uid),p.loot,p.wind,p.shadowPos,p.ultimate,p.coins])]);
}

export function assignAttackSlot(selected,uid,slot,required){
  if(slot<0||slot>=required)return [...selected];
  const next=[...selected],previous=next.indexOf(uid);
  if(previous===slot)return next;
  if(previous>=0){[next[previous],next[slot]]=[next[slot],next[previous]];}
  else next[slot]=uid;
  // The second slot becomes available once the first is filled; never submit holes.
  return next.filter(Boolean).slice(0,required);
}

export function movementDescription(game,space){
  const q=game.s.prompt,p=game.s.players[q?.player??0];
  if(q?.kind==='wind-replace')return `Relocate Wind from space ${space} to space ${(q.task||q).to??p.pos}. Your fighter stays put.`;
  if(q?.kind==='wind-place')return `Place Wind on space ${space}. Your fighter stays put.`;
  const distance=Math.abs(space-game.s.players[1-q.player].pos),info=game.attackInfo();
  let text=`${space===p.pos?'Stay on':'Move to'} space ${space} · distance ${distance}.`;
  if(info?.hits.length)text+=` ${info.hits.some(h=>distance>=h.min&&distance<=h.max)?'Within':'Outside'} the current attack’s Range.`;
  return text;
}

export function createMobileUI({getContext,def,card,modal,closeModal,toast,render,run,setSelected,getScry,setScry}){
  let observed='',selection=null,inspector=null,handScroll=0,pending=false;
  const ctx=()=>getContext();
  const key=()=>mobileStateKey(ctx().game,ctx().viewer);
  const close=()=>{inspector=null;closeModal();};
  const contextText=()=>{
    const {game:g,viewer}=ctx();if(!g)return '';
    const s=g.s,c=s.active===null?null:def(s.mains[s.active]);
    if(s.prompt)return s.prompt.player===viewer?s.prompt.title:'Your rival is choosing.';
    if(s.phase==='program')return 'Plan your attacks in order. The other cards stay in your hand.';
    if(s.phase==='reaction'){
      const f=forecast(g);
      return `${s.turn===viewer?'Your reaction':'Rival’s reaction'} · ${c?.name||'Attack'} · ${f?.miss?'If both pass: out of range':f?'If both pass: '+(f.loss===f.maxLoss?f.loss:f.loss+'–'+f.maxLoss)+' Health damage':''}`;
    }
    return combatStep(g,viewer).title;
  };
  function sheet(c,body,actions,title=c?.name){
    const context=contextText();
    modal(`<section class="mobile-card-sheet" aria-label="${esc(title)}"><div class="mobile-card-art">${c?card(c):''}</div><div class="mobile-card-copy"><div class="mobile-card-description"><p class="mobile-inspector-context">${esc(context)}</p><h2>${esc(title)}</h2>${body}</div><div class="mobile-sheet-actions">${actions}<button class="quiet" data-mobile="close">Back to battle</button></div></div></section>`);
  }
  function showHand(uid){
    const {game:g,viewer,selected}=ctx();if(!g)return;
    const loot=uid.startsWith('loot-'),item=loot?g.s.players[viewer].loot[Number(uid.slice(5))]:g.s.players[viewer].hand.find(c=>c.uid===uid),c=def(item);
    if(!c)return;
    inspector={kind:'hand',uid,id:c.id,key:key()};
    const s=g.s,planning=s.phase==='program',canPlan=planning&&!s.prompt&&!s.committed[viewer]&&!loot&&g.isAttack(item),canReact=s.phase==='reaction'&&g.canPlay(viewer,loot?c.id:item),required=g.requiredAttacks(viewer);
    let actions='';
    if(canPlan){
      actions=Array.from({length:required},(_,slot)=>`<button class="primary" data-mobile="assign" data-slot="${slot}" ${slot>selected.length?'disabled':''}>${selected[slot]===uid?'Keep as':selected[slot]?'Replace':'Assign'} Attack ${slot+1}</button>`).join('');
      if(selected.includes(uid))actions+='<button data-mobile="remove-card">Return to hand</button>';
    }else if(canReact)actions=`<button class="primary" data-mobile="play-card">${loot?'Use Loot':'Play reaction'}</button>`;
    const reason=canPlan||canReact?'':planning?loot?'Use Loot during a reaction window.':s.prompt?'Finish the current choice first.':s.committed[viewer]?'Your attacks are locked.':g.isAttack(item)?'Waiting for your planning turn.':'Reaction only. Keep this card as an answer.':s.phase==='shop'?'Ready for next round.':unavailableReason(g,viewer,loot?c.id:item);
    const body=`${c.attackText?`<section class="mobile-rule-block ${planning?'is-current':''}"><h3>Attack${c.speed?' · Speed '+c.speed:''}</h3><p>${esc(c.attackText)}</p></section>`:''}${c.reactionText?`<section class="mobile-rule-block ${s.phase==='reaction'?'is-current':''}"><h3>${loot?'Loot':'Reaction'} · ${c.side==='attacker'?'your attack':c.side==='defender'?'defending':'either turn'}</h3><p>${esc(c.reactionText)}</p></section>`:''}${reason?`<p class="mobile-unavailable" role="status">${esc(reason)}</p>`:''}${canPlan&&c.reactionText?'<p class="mobile-card-note">Committing this card uses its Attack half. Keep other cards for reactions.</p>':''}`;
    sheet(c,body,actions);
  }
  function showAbility(id){
    const {game:g,viewer}=ctx(),a=g.tokenActions(viewer).find(a=>a.id===id);if(!a)return;
    const p=g.s.players[viewer],view=HERO_POWER_VIEW[p.hero];
    inspector={kind:'ability',id,key:key()};
    sheet(null,`<p class="power-supply">${p.tokens} ready · maximum ${view.cap}</p><section class="mobile-rule-block"><h3>How to gain</h3><p>${esc(view.gain)}</p></section><section class="mobile-rule-block is-current"><h3>Use now</h3><p>${esc(a.text)}</p></section>`,`<button class="primary" data-mobile="use-ability">${esc(a.label)}</button>`,a.label);
  }
  function showPromptChoice(value){
    const {game:g,viewer}=ctx(),q=g.s.prompt;
    if(!q||q.player!==viewer)return;
    let c,label;
    if(q.kind==='stash'){c=def(g.s.players[viewer].loot[value]);label='Replace this Loot';}
    else {c=def((q.kind==='recover'?g.s.players[viewer].discard:g.s.players[viewer].hand).find(c=>c.uid===value));label=q.kind==='recover'?'Return to hand':'Discard this card';}
    if(!c)return;
    inspector={kind:'choice',value,key:key()};
    sheet(c,`<p>${esc(q.title)}</p><section class="mobile-rule-block"><p>${esc(c.attackText||'')}</p><p>${esc(c.reactionText||'')}</p></section>`,`<button class="primary" data-mobile="choose-card">${label}</button>`);
  }
  function showScry(uid){
    const {game:g,viewer}=ctx(),q=g.s.prompt;if(q?.kind!=='scry'||q.player!==viewer)return;
    const c=def((q.cards||q.task?.cards||[]).find(c=>c.uid===uid));if(!c)return;
    inspector={kind:'scry',uid,key:key()};
    const n=getScry().indexOf(uid);
    sheet(c,`<p>${n>=0?'Currently draw position '+(n+1)+'.':'Currently going to the bottom.'} This does not draw a card.</p><section class="mobile-rule-block"><p>${esc(c.attackText||'')}</p><p>${esc(c.reactionText||'')}</p></section>`,`<button class="primary" data-mobile="scry-card">${n>=0?'Send to bottom':'Keep as draw '+(getScry().length+1)}</button>`);
  }
  function decision(controls,result=''){
    const {game:g,viewer,selected}=ctx(),s=g.s,q=s.prompt,step=combatStep(g,viewer);
    let title=step.title,detail=step.detail,extra='',actionHtml=controls;
    if(s.phase==='reaction'&&!q&&s.players[viewer].hero==='SMA'&&g.canLastStand(viewer)){
      actionHtml=actionHtml.replace(/<button class="ls-action" data-spike-wall="[^"]+">.*?<\/button>/g,'');
      actionHtml+='<button class="ls-action" data-mobile="wall-mode">Place Spike Wall</button>';
    }
    if(s.phase==='program'&&!q){
      const n=s.committed[viewer]?s.plans[viewer].length:g.requiredAttacks(viewer);
      title=s.committed[viewer]?'Attacks locked':n?'Plan your attacks':'No attacks in hand';
      detail=s.committed[viewer]?'Waiting for your rival.':n?'Tap a card, then assign its place.':'Lock your plan to continue.';
      extra=`<div class="mobile-plan-slots">${Array.from({length:n},(_,slot)=>{
        const item=s.plans[viewer]?.[slot]||s.players[viewer].hand.find(c=>c.uid===selected[slot]);
        return `<button class="mobile-plan-slot ${item?'filled':''}" data-mobile="plan-slot" data-slot="${slot}" ${s.committed[viewer]?'disabled':''}><small>ATTACK ${slot+1}</small><b>${item?esc(def(item)?.name):'Choose a card'}</b></button>`;
      }).join('')}</div>`;
      actionHtml=controls.replace('>Ready <small>','>Lock attacks <small>').replace('⇄ Swap','Swap order');
    }
    if(s.phase==='reaction'&&!q){
      const c=def(s.mains[s.active]),info=g.attackInfo();
      title=s.turn===viewer?'Your reaction':'Rival’s reaction';
      detail=s.passes===1?'One pass. The next pass resolves this attack.':'Play a reaction or pass priority.';
      extra=`<button class="mobile-active-attack" data-inspect="${c.id}"><small>${esc(s.players[s.active].name)} · ATTACK</small><b>${esc(c.name)}</b><span>${info.hits.map(h=>`${h.damage} damage · Range ${h.min}–${h.max}`).join(' / ')}</span></button>`;
    }
    if(s.phase==='reveal'&&!q){
      extra=`<div class="mobile-revealed-pair">${s.mains.map((item,i)=>item?`<button class="mobile-active-attack" data-inspect="${item.id}"><small>${esc(s.players[i].name)} · SPEED ${g.speed(i)}</small><b>${esc(def(item).name)}</b></button>`:'').join('')}</div>`;
    }
    if(['result','over'].includes(s.phase)&&result){extra+=result;actionHtml=actionHtml.replace(result,'');}
    if(q){
      title=q.player!==viewer?'Rival is choosing':q.kind==='move'?'Choose your destination':q.kind==='wind-place'?'Place Wind':q.kind==='wind-replace'?'Relocate Wind':'Make your choice';
      detail=q.player===viewer?q.title:'Your choices will return when they finish.';
      if(q.player===viewer&&['move','wind-place','wind-replace'].includes(q.kind)){
        extra=moveConfirmation();
        actionHtml=spaceControls()+(q.kind==='wind-place'?controls:'');
      }
    }
    if(selection?.kind==='wall'&&!q){title='Place Spike Wall';detail='Choose an empty end of the arena.';extra=moveConfirmation();actionHtml=spaceControls()+'<button data-mobile="cancel-space">Cancel placement</button>';}
    const f=s.phase==='reaction'&&!q?forecast(g):null;
    return `<aside class="mobile-decision" aria-label="Current decision"><div class="mobile-decision-info"><div class="stage-cue" role="status" aria-live="polite"><span>${s.phase==='program'?'MAKE YOUR PLAN':s.phase==='shop'?'BETWEEN ROUNDS':s.phase==='over'?'FIGHT FINISHED':'PAIR '+(s.reveal+1)}</span><strong>${esc(title)}</strong><small>${esc(detail)}</small></div>${extra}${f?`<div class="stage-forecast ${f.miss?'safe':''}"><span>IF BOTH PASS NOW</span><b>${f.miss?'Out of range':(f.loss===f.maxLoss?f.loss:f.loss+'–'+f.maxLoss)+' damage'}</b><small>${esc(s.players[1-s.active].name)}${f.reflection?' · reflects 1':''}${f.lethalNote?' · '+esc(f.lethalNote):''}</small></div>`:''}</div><div class="stage-controls">${actionHtml}</div><span class="mobile-pending" role="status" ${pending?'':'hidden'}>Saving action…</span></aside>`;
  }
  function spaceControls(){
    const {game:g}=ctx(),q=g.s.prompt,valid=selection&&Number.isInteger(selection.space)&&selection.key===key();
    return `<button class="primary" data-mobile="confirm-space" ${valid?'':'disabled'}>${selection?.kind==='wall'?'Place wall':q?.kind==='move'?(selection?.space===g.s.players[q.player].pos?'Stay here':'Move here'):'Confirm Wind'}</button>`;
  }
  function moveConfirmation(){
    const {game:g}=ctx(),valid=selection&&Number.isInteger(selection.space)&&selection.key===key();
    return `<div class="mobile-move-confirm"><p>${valid?esc(selection.kind==='wall'?`Place Spike Wall on space ${selection.space}. This closes that end of the arena.`:movementDescription(g,selection.space)):'Tap a highlighted arena space to preview it.'}</p></div>`;
  }
  async function handleClick(e,t){
    const {game:g,viewer,selected,screen,busy}=ctx();
    if(screen!=='game'||!g)return false;
    if(busy||pending){if(t.dataset.card||t.dataset.space||t.dataset.choiceIndex!==undefined||t.dataset.abilityCard||t.dataset.spikeWall||t.dataset.mobile||['commit','pass','advance','save-coins','last-stand'].includes(t.dataset.action))return true;}
    if(t.dataset.card){showHand(t.dataset.card);return true;}
    if(t.dataset.inspect&&t.closest('.od-hand-card')){showHand(t.closest('.od-hand-card').querySelector('[data-card]').dataset.card);return true;}
    if(t.dataset.abilityCard&&!t.dataset.abilityCard.startsWith('deal')){showAbility(t.dataset.abilityCard);return true;}
    if(t.dataset.space||t.dataset.spikeWall){
      const wall=!!t.dataset.spikeWall,space=Number(t.dataset.spikeWall||t.dataset.space),q=g.s.prompt;
      if(wall?g.canLastStand(viewer)&&g.wallChoices().includes(space):q?.player===viewer&&q.choices.includes(space))selection={kind:wall?'wall':q.kind,space,key:key()};
      render();return true;
    }
    if(t.dataset.choiceIndex!==undefined&&g.s.prompt?.player===viewer&&['discard','recover','stash'].includes(g.s.prompt.kind)){
      const value=g.s.prompt.choices[Number(t.dataset.choiceIndex)];
      if(g.s.prompt.kind==='stash'&&value<0)return false;
      showPromptChoice(value);return true;
    }
    if(t.dataset.scryUid){showScry(t.dataset.scryUid);return true;}
    if(!t.dataset.mobile)return false;
    const action=t.dataset.mobile;
    if(action==='close'){close();return true;}
    if(action==='wall-mode'){selection={kind:'wall',space:null,key:key()};render();return true;}
    if(action==='cancel-space'){selection=null;render();return true;}
    if(action==='plan-slot'){
      const uid=selected[Number(t.dataset.slot)];if(uid)showHand(uid);else toast('Tap a card in your hand to assign this attack.');return true;
    }
    if(action==='confirm-space'){
      if(!selection||!Number.isInteger(selection.space)||selection.key!==key()){selection=null;render();return true;}
      const choice=selection;selection=null;
      if(choice.kind==='wall'){if(g.canLastStand(viewer)&&g.wallChoices().includes(choice.space))await run(()=>g.useLastStand(viewer,choice.space));}
      else if(g.s.prompt?.player===viewer&&g.s.prompt.choices.includes(choice.space))await run(()=>g.choose(viewer,choice.space));
      return true;
    }
    if(!inspector||inspector.key!==key()){close();toast('The fight moved on. Choose again from the current state.');return true;}
    const picked=inspector;
    if(action==='assign'||action==='remove-card'){
      const item=g.s.players[viewer].hand.find(c=>c.uid===picked.uid);
      if(g.s.phase==='program'&&!g.s.prompt&&!g.s.committed[viewer]&&item&&g.isAttack(item)){
        setSelected(action==='remove-card'?selected.filter(uid=>uid!==picked.uid):assignAttackSlot(selected,picked.uid,Number(t.dataset.slot),g.requiredAttacks(viewer)));
        close();render();
      }return true;
    }
    if(action==='play-card'){
      const loot=picked.uid.startsWith('loot-'),item=loot?g.s.players[viewer].loot[Number(picked.uid.slice(5))]:g.s.players[viewer].hand.find(c=>c.uid===picked.uid);
      if(def(item)?.id===picked.id&&g.canPlay(viewer,item)){close();await run(()=>loot?g.playLoot(viewer,item):g.react(viewer,picked.uid));}
      return true;
    }
    if(action==='use-ability'){if(g.tokenActions(viewer).some(a=>a.id===picked.id)){close();await run(()=>g.useHeroAbility(viewer,picked.id));}return true;}
    if(action==='choose-card'){if(g.s.prompt?.player===viewer&&g.s.prompt.choices.includes(picked.value)){close();await run(()=>g.choose(viewer,picked.value));}return true;}
    if(action==='scry-card'){
      const next=[...getScry()],n=next.indexOf(picked.uid);if(n>=0)next.splice(n,1);else next.push(picked.uid);setScry(next);close();render();return true;
    }
    return true;
  }
  function beforeRender(){
    handScroll=document.querySelector('.r-hand')?.scrollLeft||handScroll;
    const current=key();
    if(current!==observed){
      selection=null;
      if(inspector){close();}
      observed=current;
    }
  }
  function afterRender(){
    const hand=document.querySelector('.r-hand');if(hand)hand.scrollLeft=handScroll;
    document.querySelectorAll('[data-space], [data-spike-wall]').forEach(b=>{
      const chosen=selection?.space===Number(b.dataset.space||b.dataset.spikeWall);
      b.classList.toggle('mobile-space-selected',!!chosen);
      if(!b.disabled)b.setAttribute('aria-pressed',String(!!chosen));
    });
    if(!document.querySelector('.mobile-rotate')){
      const rotate=document.createElement('div');rotate.className='mobile-rotate';rotate.innerHTML='<div><span>FABLE FURY · BRAWL</span><h2>Turn your phone sideways</h2><p>The arena is ready in landscape. Your fight stays here while you rotate.</p></div>';document.body.append(rotate);
    }
  }
  return {decision,handleClick,beforeRender,afterRender,clear(){selection=null;if(inspector)close();},setPending(value){pending=value;const el=document.querySelector('.mobile-pending');if(el)el.hidden=!value;document.querySelector('.mobile-decision')?.setAttribute('aria-busy',String(value));}};
}
